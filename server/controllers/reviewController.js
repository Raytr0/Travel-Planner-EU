const db = require('../database/reviewDatabase'); // Database connection file

exports.createReview = async (req, res) => {
    const { review, DestID, userID, public: isPublic, date, rating } = req.body;

    // Validation
    if (!review || !DestID || !userID || isPublic === undefined || !date || !rating) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required: review, DestID, userID, public, date, rating.',
        });
    }

    try {
        const newReview = await db.createReview({ review, DestID, userID, isPublic, date, rating });
        res.status(201).json({ success: true, review: newReview });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};
