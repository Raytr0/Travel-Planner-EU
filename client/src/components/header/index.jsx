import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/authContext'
import { doSignOut } from '../../firebase/auth'
const host = `http://${location.host.split(':')[0]}:5000`;

const Header = () => {
    const navigate = useNavigate()
    const { userLoggedIn, currentUser, setCurrentUser } = useAuth()
    const [isVerified, setIsVerified] = useState(false) // State to track the user's verification status

    useEffect(() => {
        if (userLoggedIn && currentUser?.uid) {
            fetch(`${host}/api/users/${currentUser.uid}`)
                .then((response) => response.json())
                .then((data) => {
                    console.log(data)
                    setCurrentUser({ ...currentUser, isAdmin: data[0].admin, verified: data[0].verified });
                    setIsVerified(data[0].verified); // Set the verification status
                })
                .catch((error) => console.error("Error fetching user permissions:", error));
        }
    }, [userLoggedIn, currentUser?.uid, setCurrentUser]);

    // When the user is logged in but unverified, only show Logout and Policies
    if (userLoggedIn && !isVerified) {
        return (
            <nav className="flex flex-row items-center w-full h-12 bg-gray-200 border-b fixed top-0 left-0 z-20">
                <div className="text-lg font-bold text-gray-800 pl-4">
                    EUROPAPA
                </div>

                {/* Only show Logout and Policies for unverified users */}
                <div className="flex flex-row gap-x-2 ml-auto pr-4">
                    <button
                        onClick={() => {
                            doSignOut().then(() => {
                                navigate('/login');
                            });
                        }}
                        className="text-sm text-blue-600 underline"
                    >
                        Logout
                    </button>
                    <Link className="text-sm text-blue-600 underline" to={'/policies'}>
                        Policies
                    </Link>
                </div>
            </nav>
        );
    }

    // Render regular nav links when the user is logged in and verified
    return (
        <nav className="flex flex-row items-center w-full h-12 bg-gray-200 border-b fixed top-0 left-0 z-20">
            <div className="text-lg font-bold text-gray-800 pl-4">
                EUROPAPA
            </div>

            {/* Buttons on the Right */}
            <div className="flex flex-row gap-x-2 ml-auto pr-4">
                {userLoggedIn ? (
                    <>
                        <Link className="text-sm text-blue-600 underline" to={'/home'}>
                            Home
                        </Link>
                        <Link className="text-sm text-blue-600 underline" to={'/lists'}>
                            Lists
                        </Link>
                        <Link className="text-sm text-blue-600 underline" to={'/reviews'}>
                            Review
                        </Link>
                        <button
                            onClick={() => {
                                doSignOut().then(() => {
                                    navigate('/login');
                                });
                            }}
                            className="text-sm text-blue-600 underline"
                        >
                            Logout
                        </button>
                        <Link className="text-sm text-blue-600 underline" to={'/policies'}>
                            Policies
                        </Link>
                        <Link className="text-sm text-blue-600 underline" to={'/settings'}>
                            Settings
                        </Link>
                        {currentUser?.isAdmin && (
                            <>
                                <Link className="text-sm text-blue-600 underline" to={'/admin'}>
                                    Admin Dashboard
                                </Link>
                                <div className="text-sm font-bold text-red-600 mt">
                                    Currently logged in as Admin
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        <Link className="text-sm text-blue-600 underline" to={'/limitedApp'}>
                            Try out our App!
                        </Link>
                        <Link className="text-sm text-blue-600 underline" to={'/login'}>
                            Login
                        </Link>
                        <Link className="text-sm text-blue-600 underline" to={'/register'}>
                            Register New Account
                        </Link>
                        <Link className="text-sm text-blue-600 underline" to={'/policies'}>
                            Policies
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Header;
