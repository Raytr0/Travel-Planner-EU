const {getClient} = require('./databaseClient');

async function listToggleVisibility(list_id, visibility) {
    const client = getClient();
    await client.connect();
    try {
        const query = `
            UPDATE created_list
            SET visible = $2
            WHERE list_id = $1
            RETURNING *;  -- Return the updated list data
        `;
        const result = await client.query(query, [list_id, visibility]);
        if (result.rowCount === 0) {
            throw new Error(`List with listID '${list_id}' not found.`);
        }
        return result.rows[0];  // Return the updated list
    } catch (error) {
        console.error("Error updating list visibility:", error);
        throw error;
    } finally {
        await client.end();
    }
}

async function createList(list_name, user_id, locations) {
    const client = getClient();
    await client.connect();
    try {
        const query = `
            INSERT INTO created_list (list_name, user_id, locations, date, visible)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP, true)
            RETURNING *;`
        const result = await client.query(query, [list_name, user_id, locations]);
        return result.rows[0]; // Return the created list
    } catch (error) {
        console.error("Error creating list:", error);
        throw error;
    } finally {
        await client.end();
    }
}

// Update an existing list (update the date and locations)
async function updateList(list_id, list_name, locations, visible) {
    const client = getClient();
    await client.connect();
    try {
        const query = `
            UPDATE created_list
            SET list_name = $1, locations = $2, visible = $4, date = CURRENT_TIMESTAMP
            WHERE list_id = $3
            RETURNING *;  -- Return the updated list data
        `;
        const result = await client.query(query, [list_name, locations, list_id, visible]);
        if (result.rowCount === 0) {
            throw new Error(`List with listID '${list_id}' not found.`);
        }
        return result.rows[0];  // Return the updated list
    } catch (error) {
        console.error("Error updating list:", error);
        throw error;
    } finally {
        await client.end();
    }
}

async function deleteList(list_id) {
    const client = getClient();
    await client.connect();
    try {
        const query = `
            DELETE FROM created_list
            WHERE list_id = $1
            RETURNING *;  -- Return the deleted list data
        `;
        const result = await client.query(query, [list_id]);
        if (result.rowCount === 0) {
            throw new Error(`List with listID '${list_id}' not found.`);
        }
        return result.rows[0];  // Return the deleted list
    } catch (error) {
        console.error("Error deleting list:", error);
        throw error;
    } finally {
        await client.end();
    }
}

async function getListsUser(id) {
    const client = getClient();
    await client.connect();
    try {
        const query = `
            SELECT * FROM created_list
            WHERE user_id = $1;
        `;
        const result = await client.query(query, [id]);
        return result.rows;
    } catch (error) {
        console.error("Error getting lists:", error);
        throw error;
    } finally {
        await client.end();
    }
}

async function getAllLists() {
    const client = getClient();
    await client.connect();
    try {
        const query = `
            SELECT * FROM created_list;
        `;
        const result = await client.query(query);
        return result.rows;
    } catch (error) {
        console.error("Error getting lists:", error);
        throw error;
    } finally {
        await client.end();
    }
}

module.exports = {
    createList,
    updateList,
    deleteList,
    listToggleVisibility,
    getListsUser,
    getAllLists
}
