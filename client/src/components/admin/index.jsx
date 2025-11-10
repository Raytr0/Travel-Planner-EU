import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/authContext';
import { useNavigate } from 'react-router-dom';

const host = `http://${location.host.split(':')[0]}:5000`;

const AdminDashboard = () => {
    const { currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser || !currentUser.isAdmin) {
            navigate('/home'); // Redirect if not an admin
        } else {
            fetch(`${host}/api/users`) // Fetch all users
                .then(response => response.json())
                .then(data => setUsers(data))
                .catch(error => console.error('Error fetching users:', error));
        }
    }, [currentUser, navigate]);

    const handleGrantAdmin = (userId) => {
        fetch(`${host}/api/users/grantAdmin/${userId}`, {
            method: 'POST',
        })
            .then(response => response.json())
            .then(data => {
                console.log('Admin privileges granted:', data);
                setUsers(prevUsers => prevUsers.map(user =>
                    user.id === userId ? { ...user, admin: true } : user
                ));
            })
            .catch(error => console.error('Error granting admin privileges:', error));
    };

    const handleToggleDisable = (userId, currentDisabledState) => {
        fetch(`${host}/api/users/toggleDisable/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ disabled: !currentDisabledState }),
        })
            .then(response => response.json())
            .then(data => {
                console.log('User disabled state toggled:', data);
                setUsers(prevUsers => prevUsers.map(user =>
                    user.id === userId ? { ...user, disabled: !currentDisabledState } : user
                ));
            })
            .catch(error => console.error('Error toggling user disabled state:', error));
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto bg-white shadow-md rounded-lg p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Manage Users</h2>
                <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                    <table className="min-w-full table-auto">
                        <thead>
                        <tr className="bg-gray-100">
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Name</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Email</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Admin</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="border-b border-gray-200">
                                <td className="px-6 py-4 text-sm font-medium text-gray-700">{user.name}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-700">{user.email}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-700">{user.admin ? 'Yes' : 'No'}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-700">
                                    {user.disabled ? 'Disabled' : 'Active'}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium">
                                    {!user.admin && (
                                        <button
                                            onClick={() => handleGrantAdmin(user.id)}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mr-2"
                                        >
                                            Grant Admin
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleToggleDisable(user.id, user.disabled)}
                                        className={`px-4 py-2 ${user.disabled ? 'bg-green-500' : 'bg-red-500'} text-white rounded-md hover:shadow-lg focus:outline-none focus:ring-2 ${user.disabled ? 'hover:bg-green-600 focus:ring-green-500' : 'hover:bg-red-600 focus:ring-red-500'}`}
                                    >
                                        {user.disabled ? 'Enable' : 'Disable'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
