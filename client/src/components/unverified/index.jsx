import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/authContext'; // Assuming you are using a custom auth context
import { useNavigate } from 'react-router-dom';
const host = `http://${location.host.split(':')[0]}:5000`;

const EmailVerifyPage = () => {
    const { currentUser, userLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        if (!userLoggedIn) {
            // If the user is not logged in, redirect to login page
            navigate('/login');
        }
    }, [userLoggedIn, navigate]);

    const handleVerify = () => {
        if (currentUser) {
            fetch(`${host}/api/users/verify/${currentUser.uid}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        setIsVerified(true);
                    }
                })
                .catch((error) => {
                    console.error("Error verifying user:", error);
                });
        }
    };

    const handleResendEmail = () => {
        // Show an alert when the resend email button is clicked
        alert('Email Sent');
    };

    return (
        <div className="max-w-md mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Email Verification</h1>
            {!isVerified ? (
                <div>
                    <p className="mb-4">Click the button below to verify your email address.</p>
                    <button
                        onClick={handleVerify}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
                    >
                        Verify Email
                    </button>
                    <button
                        onClick={handleResendEmail}
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    >
                        Resend Email
                    </button>
                </div>
            ) : (
                <p className="text-green-600">Your email has been verified!</p>
            )}
        </div>
    );
};

export default EmailVerifyPage;
