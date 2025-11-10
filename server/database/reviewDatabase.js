const { getClient } = require('./databaseClient'); // Replace with your database client setup

async function createReview({ review, DestID, userID, isPublic, date, rating }) {
    const client = getClient(); // Initialize DB connection
    await client.connect();

    try {
        const query = `
            INSERT INTO reviews (review, DestID, userID, public, date, rating)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;

        const values = [review, DestID, userID, isPublic, date, rating];
        const result = await client.query(query, values);
        return result.rows[0]; // Return the inserted review
    } catch (error) {
        console.error('Error inserting review into database:', error);
        throw error;
    } finally {
        await client.end(); // Close connection
    }
}

module.exports = {
    createReview,
};
