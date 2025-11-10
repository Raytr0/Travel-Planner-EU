const db = require('../database/userDatabase');

exports.create = async (req, res) => {
    const userDetails = req.body;

    const user = await db.createUser(userDetails)

    res.json(user);
};

exports.findOne = async (req, res) => {
    const id = req.params.id;

    const user = await db.getUserById(id);

    res.json(user);
};

exports.findAll = async (req, res) => {
    const users = await db.getAllUsers();

    res.json(users);
};

exports.update = async (req, res) => {
    const userDetails = req.body;

    await db.updateUser(userDetails);

    res.end();
};

exports.restrict = async (req, res) => {
    const id = req.params.id;

    await db.restrictUser(id);

    res.end();
};

exports.unRestrict = async (req, res) => {
    const id = req.params.id;

    await db.unRestrictUser(id);

    res.end();
}

exports.checkRestriction = async (req, res) => {
    const id = req.params.id;

    try {
        const restrictionStatus = await db.checkRestriction(id);

        if (!restrictionStatus) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ isRestricted: restrictionStatus.isRestricted });
    } catch (error) {
        console.error("Error checking restriction:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.syncUser = async (req, res) => {
    const { uid, displayName } = req.body;

    if (!uid || !displayName) {
        return res.status(400).json({ error: "Missing required fields: uid or displayName" });
    }

    try {
        // Check if user already exists
        const existingUser = await db.getUserById(uid);

        if (!existingUser) {
            // If user does not exist, create the user
            const newUser = await db.createUser({ name: displayName, id: uid });
            return res.status(201).json({ success: true, user: newUser });
        }

        // User exists; return existing user
        res.status(200).json({ success: true, user: existingUser });
    } catch (error) {
        console.error("Error syncing user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.grantAdmin = async (req, res) => {
    const { id } = req.params;
    const currentUser = req.user;  // Assuming `req.user` is set after authentication

    // Check if the current user is an admin
    if (!currentUser || !currentUser.admin) {
        return res.status(403).json({ error: "You are not authorized to grant admin privileges." });
    }

    try {
        const updatedUser = await db.updateUserAdminStatus(id, true);  // Assuming this function will update the 'admin' field
        res.json(updatedUser);
    } catch (error) {
        console.error("Error granting admin privilege:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.verifyUser = async (req, res) => {
    const { uid } = req.params;

    try {
        // Update the user status to verified
        const result = await db.updateUserVerification(uid);

        if (result) {
            res.json({ success: true });
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (error) {
        console.error("Error verifying user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

