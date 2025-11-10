import React, { useContext, useState, useEffect } from "react";
import { auth } from "../../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = React.createContext();
const host = `http://${location.host.split(':')[0]}:5000`;

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [isEmailUser, setIsEmailUser] = useState(false);
    const [isGoogleUser, setIsGoogleUser] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isRestricted, setIsRestricted] = useState(false);
    const [isVerified, setIsVerified] = useState(null); // Added to store verification status

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, initializeUser);
        return unsubscribe;
    }, []);

    async function initializeUser(user) {
        if (user) {
            setCurrentUser({ ...user });

            // Check if provider is email and password login
            const isEmail = user.providerData.some(
                (provider) => provider.providerId === "password"
            );
            setIsEmailUser(isEmail);

            // Fetch restriction status from the backend using fetch API
            try {
                const response = await fetch(`${host}/api/checkRestriction/${user.uid}`);
                if (response.ok) {
                    const data = await response.json();
                    setIsRestricted(data.restricted);
                } else {
                    console.error("Failed to fetch restriction status:", response.statusText);
                    setIsRestricted(false); // Default to unrestricted on error
                }

                // Fetch user verification status from the backend
                const verificationResponse = await fetch(`${host}/api/users/${user.uid}`);
                if (verificationResponse.ok) {
                    const verificationData = await verificationResponse.json();
                    console.log(verificationData[0].verified)
                    setIsVerified(verificationData[0].verified); // Set verification status
                } else {
                    console.error("Failed to fetch verification status:", verificationResponse.statusText);
                    setIsVerified(false); // Default to false on error
                }

            } catch (error) {
                console.error("Error fetching status:", error);
                setIsRestricted(false); // Default to unrestricted on error
                setIsVerified(false); // Default to false on error
            }

            setUserLoggedIn(true);

        } else {
            setCurrentUser(null);
            setUserLoggedIn(false);
            setIsRestricted(false);
            setIsVerified(false); // Reset verified status when no user is logged in
        }

        setLoading(false);
    }

    const value = {
        userLoggedIn,
        isEmailUser,
        isGoogleUser,
        currentUser,
        setCurrentUser,
        isRestricted,
        isVerified,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
