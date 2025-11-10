import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/authContext';
const host = `http://${location.host.split(':')[0]}:5000`;

const Review = () => {
    const { currentUser, userLoggedIn } = useAuth();
    const [lists, setLists] = useState([]);
    const [selectedList, setSelectedList] = useState('');
    const [rating, setRating] = useState(1);
    const [comment, setComment] = useState('');
    const [confirmationMessage, setConfirmationMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (userLoggedIn && currentUser) {
            // Fetch the user's lists from the backend
            fetch(`${host}/api/list`)
                .then(response => response.json())
                .then(data => setLists(data))
                .catch(error => console.error('Error fetching lists:', error));
        }
    }, [userLoggedIn, currentUser]);

    const handleSaveReview = (e) => {
        e.preventDefault();

        if (!selectedList) {
            setErrorMessage('Please select a list.');
            return;
        }

        if (rating < 1 || rating > 5) {
            setErrorMessage('Rating must be between 1 and 5.');
            return;
        }

        if (!comment.trim()) {
            setErrorMessage('Please enter a comment.');
            return;
        }

        const reviewData = {
            review: comment,
            DestID: selectedList,
            userID: currentUser.uid,
            public: true, // Default to public, modify if needed
            date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
            rating,
        };

        fetch(`${host}/api/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reviewData),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    setConfirmationMessage('Your review has been saved successfully!');
                    setSelectedList('');
                    setRating(1);
                    setComment('');
                    setErrorMessage('');
                } else {
                    setErrorMessage('Failed to save your review. Please try again.');
                }
            })
            .catch((error) => {
                console.error('Error saving review:', error);
                setErrorMessage('An unexpected error occurred. Please try again later.');
            });
    };


    if (!userLoggedIn) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-700">You must be logged in to submit a review.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Submit a Review</h1>

                {errorMessage && (
                    <div className="mb-4 text-red-600 font-semibold">
                        {errorMessage}
                    </div>
                )}

                {confirmationMessage && (
                    <div className="mb-4 text-green-600 font-semibold">
                        {confirmationMessage}
                    </div>
                )}

                <form onSubmit={handleSaveReview} className="space-y-4">
                    <div>
                        <label htmlFor="listSelect" className="block text-sm font-medium text-gray-700 mb-1">
                            Select a List
                        </label>
                        <select
                            id="listSelect"
                            value={selectedList}
                            onChange={(e) => setSelectedList(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        >
                            <option value="" disabled>
                                -- Choose a List --
                            </option>
                            {lists.map(list => (
                                <option key={list.list_id} value={list.list_id}>
                                    {list.list_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                            Rating (1-5)
                        </label>
                        <input
                            id="rating"
                            type="number"
                            min="1"
                            max="5"
                            value={rating}
                            onChange={(e) => setRating(Number(e.target.value))}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                            Comment
                        </label>
                        <textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            rows="4"
                            placeholder="Write your review here..."
                            required
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-300"
                    >
                        Save Review
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Review;
