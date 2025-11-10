const {getClient} = require('./databaseClient');

async function createUser({ name, id }) {
    const client = getClient();
    await client.connect();
    try {
        const query = `
            INSERT INTO users (name, restricted, admin, id)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const result = await client.query(query, [name, false, false, id]);
        return result.rows[0];
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    } finally {
        await client.end();
    }
}

async function getUserById(id) {
    const client = getClient();
    await client.connect();
    const result = await client.query(
        `SELECT *
         FROM users
         WHERE id = $1;`,
        [id]
    );
    await client.end();
    return result.rows;
}

async function getAllUsers() {
    const client = getClient();
    await client.connect();
    const result = await client.query(
        `SELECT *
         FROM users;`,
        []
    );
    await client.end();
    return result.rows;
}

async function updateUser(userDetails) {

}

async function restrictUser(id) {
    const client = getClient();
    await client.connect();
    const result = await client.query(
        `UPDATE users
         SET restricted = true
         WHERE id = $1;`,
        [id]
    );
    await client.end();
    return result.rows;
}

async function unRestrictUser(id) {
    const client = getClient();
    await client.connect();
    const result = await client.query(
        `UPDATE users
         SET restricted = false
         WHERE id = $1;`,
        [id]
    );
    await client.end();
    return result.rows;
}

async function checkRestriction(id) {
    const client = getClient();
    await client.connect();

    try {
        const query = `
            SELECT restricted
            FROM users
            WHERE id = $1;
        `;
        const result = await client.query(query, [id]);

        if (result.rows.length === 0) {
            return null; // User not found
        }

        return { isRestricted: result.rows[0].restricted };
    } finally {
        await client.end();
    }
}

async function updateUserAdminStatus(id, isAdmin) {
    const client = getClient();
    await client.connect();

    try {
        const result = await client.query(
            `UPDATE users
            SET admin = $1
            WHERE id = $2
            RETURNING *;`,
            [isAdmin, id]
        );
        return result.rows[0];
    } catch (error) {
        console.error("Error updating admin status:", error);
        throw error;
    } finally {
        await client.end();
    }
}

async function updateUserVerification(id) {
    const client = getClient();
    await client.connect();
    try {
        const query = `
            UPDATE users
            SET verified = true
            WHERE id = $1
            RETURNING *;
        `;
        const result = await client.query(query, [id]);
        return result.rows[0];
    } catch (error) {
        console.error("Error updating verification:", error);
        throw error;
    } finally {
        await client.end();
    }
}

module.exports = {
    createUser,
    getUserById,
    getAllUsers,
    updateUser,
    restrictUser,
    unRestrictUser,
    checkRestriction,
    updateUserAdminStatus,
    updateUserVerification
}