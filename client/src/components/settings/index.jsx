import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { doPasswordChange } from '../../firebase/auth';
import { useAuth } from '../../contexts/authContext';
const host = `http://${location.host.split(':')[0]}:5000`;

const Settings = () => {
    const { userLoggedIn } = useAuth();

    const [password, setPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const onSubmit = async (e) => {
        e.preventDefault();
        setIsChangingPassword(true);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            await doPasswordChange(password);
            setSuccessMessage('Password changed successfully!');
        } catch (err) {
            setErrorMessage('Failed to change password. Please try again.');
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <div>
            {!userLoggedIn && <Navigate to={'/login'} replace={true} />}

            <main className="w-full h-screen flex self-center place-content-center place-items-center">
                <div className="w-96 text-gray-600 space-y-5 p-4 shadow-xl border rounded-xl">
                    <div className="text-center">
                        <div className="mt-2">
                            <h3 className="text-gray-800 text-xl font-semibold sm:text-2xl">Change Password</h3>
                        </div>
                    </div>
                    <form onSubmit={onSubmit} className="space-y-5">
                        <div>
                            <label className="text-sm text-gray-600 font-bold">
                                New Password
                            </label>
                            <input
                                type="password"
                                autoComplete="new-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg transition duration-300"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isChangingPassword}
                            className={`w-full px-4 py-2 text-white font-medium rounded-lg ${
                                isChangingPassword
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl transition duration-300'
                            }`}
                        >
                            {isChangingPassword ? 'Changing...' : 'Change'}
                        </button>
                    </form>
                    {successMessage && (
                        <p className="text-green-600 text-sm mt-3">{successMessage}</p>
                    )}
                    {errorMessage && (
                        <p className="text-red-600 text-sm mt-3">{errorMessage}</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Settings;
