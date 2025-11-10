const db = require('../database/listsDatabase.js');

exports.createList = async (req, res) => {
    const { listName, userID, locations } = req.body;
    try {
        if (!listName || !userID || !Array.isArray(locations)) {
            return res.status(400).json({ error: "Invalid input. Ensure listName, userID, and locations are provided." });
        }
        const newList = await db.createList(listName, userID, locations);
        res.status(201).json(newList);  // Return the created list with listID
    } catch (error) {
        console.error("Error creating list:", error);
        res.status(500).json({ error: "Failed to create list." });
    }
};

exports.updateList = async (req, res) => {
    const { listID, listName, locations, visible } = req.body;
    try {
        if (!listName || !listID || !Array.isArray(locations)) {
            return res.status(400).json({ error: "Invalid input. Ensure listID, listName, and locations are provided." });
        }
        const updatedList = await db.updateList(listID, listName, locations, visible);
        res.status(200).json(updatedList);  // Return the updated list
    } catch (error) {
        console.error("Error updating list:", error);
        res.status(500).json({ error: "Failed to update list." });
    }
};

exports.deleteList = async (req, res) => {
    const { listID } = req.body;
    try {
        if (!listID) {
            return res.status(400).json({ error: "Invalid input. Ensure listID is provided." });
        }
        const deletedList = await db.deleteList(listID);
        res.status(200).json(deletedList);  // Return the deleted list
    } catch (error) {
        console.error("Error deleting list:", error);
        res.status(500).json({ error: "Failed to delete list." });
    }
}

exports.listToggleVisibility = async (req, res) => {
    const { listID, visibility } = req.body;
    try {
        if (!listID || visibility === undefined) {
            return res.status(400).json({ error: "Invalid input. Ensure listID and visibility are provided." });
        }
        const updatedList = await db.listToggleVisibility(listID, visibility);
        res.status(200).json(updatedList);  // Return the updated list
    } catch (error) {
        console.error("Error updating list visibility:", error);
        res.status(500).json({ error: "Failed to update list visibility." });
    }
}

exports.getListsUser = async (req, res) => {
    const id = req.params.id;
    try {
        if (!id) {
            return res.status(400).json({ error: "Invalid input. Ensure userID is provided." });
        }
        const lists = await db.getListsUser(id);
        res.status(200).json(lists);  // Return the lists
    } catch (error) {
        console.error("Error getting lists:", error);
        res.status(500).json({ error: "Failed to get lists." });
    }
}

exports.getAllLists = async (req, res) => {
    try {
        const lists = await db.getAllLists();
        res.status(200).json(lists);  // Return all lists
    } catch (error) {
        console.error("Error getting all lists:", error);
        res.status(500).json({ error: "Failed to get all lists." });
    }
}