const {getClient} = require('./databaseClient');

async function replaceAllData(data) {
    const client = getClient();
    await client.connect();
    await client.query('TRUNCATE europelocations CASCADE;', []);

    const ids = [];
    for (const location of data) {
        const res = await client.query(
            `INSERT INTO europelocations (DestID,Destination,Region,Country,Category,Latitude,Longitude,"Approximate Annual Tourists",Currency,"Majority Religion","Famous Foods",language,"Best Time to Visit","Cost of Living",safety,"Cultural Significance",Description)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
             RETURNING id;`,
            [
                location.Destination,
                location.Region,
                location.Country,
                location.Category,
                location.Latitude,
                location.Longitude,
                location['Approximate Annual Tourists'],
                location.Currency,
                location['Majority Religion'],
                location['Famous Foods'],
                location.Language,
                location['Best Time to Visit'],
                location['Cost of Living'],
                location.Safety,
                location['Cultural Significance'],
                location.Description
            ]
        );
        ids.push(res.rows[0].id);
    }
    await client.end();

    return ids;
}

async function getDestinations() {
    const client = getClient();
    await client.connect();
    const result = await client.query('SELECT * FROM europelocations;');
    return result.rows;
}

async function searchDestinations(query) {
    const client = getClient();
    await client.connect();
    const result = await client.query(
        `SELECT *
         FROM europelocations
         WHERE "Destination" ILIKE $1 OR "Region" ILIKE $1 OR "Country" ILIKE $1;`,
        [`%${query}%`]
    );
    return result.rows;
}

async function getDestinationById(id) {
    const client = getClient();
    await client.connect();
    const result = await client.query(
        `SELECT *
         FROM europelocations
         WHERE "DestID" = $1;`,
        [id]
    );
    return result.rows[0];
}

module.exports = {
    replaceAllData,
    getDestinations,
    searchDestinations,
    getDestinationById
}
