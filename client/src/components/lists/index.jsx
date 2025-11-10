import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/authContext";
const host = `http://${location.host.split(':')[0]}:5000`;

function ListMaker() {
    const { currentUser } = useAuth();
    const [lists, setLists] = useState([]);
    const [newListName, setNewListName] = useState("");
    const [newListDescription, setNewListDescription] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [error, setError] = useState("");
    const [editingList, setEditingList] = useState(null);
    const [confirmationDialog, setConfirmationDialog] = useState(null);
    const [availableDestinations, setAvailableDestinations] = useState([]);
    const [selectedDestinations, setSelectedDestinations] = useState([]);

    // Fetch the user's lists on mount
    useEffect(() => {
        const fetchUserLists = async () => {
            try {
                const response = await fetch(`${host}/api/list/${currentUser.uid}`);
                const data = await response.json();
                setLists(data);
            } catch (error) {
                console.error("Error fetching user's lists:", error);
            }
        };
        if (currentUser) {
            fetchUserLists();
        }
    }, [currentUser]);

    // Fetch available destinations on mount
    useEffect(() => {
        const fetchDestinations = async () => {
            try {
                const response = await fetch(`${host}/api/locations`);
                const data = await response.json();
                setAvailableDestinations(data);
            } catch (error) {
                console.error("Error fetching destinations:", error);
            }
        };
        fetchDestinations();
    }, []);

    // Handle creating or updating a list
    const handleSaveList = async () => {
        if (newListName.trim() === "") {
            setError("List name is required.");
            return;
        }
        if (editingList === null && lists.some(list => list.list_name.toLowerCase() === newListName.toLowerCase())) {
            setError("A list with this name already exists.");
            return;
        }
        if (lists.length >= 20 && editingList === null) {
            setError("You cannot create more than 20 lists.");
            return;
        }

        try {
            const method = editingList ? "PUT" : "POST";
            const url = editingList ? `${host}/api/list/${editingList.list_id}` : `${host}/api/list`
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    listName: newListName,
                    userID: currentUser.uid,
                    locations: editingList ? selectedDestinations : selectedDestinations,
                    description: newListDescription,
                    visible: isPublic,
                }),
            });
            if (!response.ok) {
                throw new Error("Failed to save list.");
            }
            const updatedList = await response.json();
            if (editingList) {
                setLists(lists.map(list => list.list_id === updatedList.list_id ? updatedList : list));
            } else {
                setLists([...lists, updatedList]);
            }
            resetForm();
        } catch (error) {
            console.error("Error saving list:", error);
            setError("Failed to save list.");
        }
    };

    // Handle deleting a list
    const handleDeleteList = async (listId) => {
        if (confirmationDialog !== listId) {
            setConfirmationDialog(listId);
            return;
        }

        try {
            const response = await fetch(`${host}/api/list`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    listID: listId
                }),
            });
            if (!response.ok) {
                throw new Error("Failed to delete list.");
            }
            setLists(lists.filter(list => list.list_id !== listId));
            setConfirmationDialog(null);
        } catch (error) {
            console.error("Error deleting list:", error);
            console.log(listId)
            setError("Failed to delete list.");
        }
    };

    // Handle editing a list
    const handleEditList = (list) => {
        setEditingList(list);
        setNewListName(list.list_name);
        setNewListDescription(list.description);
        setIsPublic(list.visible);
        setSelectedDestinations(list.locations);
    };

    // Reset form
    const resetForm = () => {
        setNewListName("");
        setNewListDescription("");
        setIsPublic(false);
        setEditingList(null);
        setSelectedDestinations([]);
        setError("");
    };

    // Handle adding or removing destinations from the list
    const handleToggleDestination = (destinationId) => {
        setSelectedDestinations(prev => {
            if (prev.includes(destinationId)) {
                return prev.filter(id => id !== destinationId);
            } else {
                return [...prev, destinationId];
            }
        });
    };

    return (
        <div className="container mx-auto pt-14">
            <h1 className="text-3xl font-bold mb-6">{editingList ? "Edit List" : "Create a New List"}</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="mb-4">
                <label className="block mb-2 font-bold">List Name:</label>
                <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    className="border p-2 w-full"
                />
            </div>
            <div className="mb-4">
                <label className="block mb-2 font-bold">Description (optional):</label>
                <textarea
                    value={newListDescription}
                    onChange={(e) => setNewListDescription(e.target.value)}
                    className="border p-2 w-full"
                />
            </div>
            <div className="mb-4">
                <label className="inline-flex items-center">
                    <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="mr-2"
                    />
                    Set list as public
                </label>
            </div>
            <div className="mb-4">
                <h3 className="font-bold mb-2">Add Destinations:</h3>
                {availableDestinations.length === 0 ? (
                    <p>Loading destinations...</p>
                ) : (
                    availableDestinations.map(destination => (
                        <div key={destination.DestID} className="flex items-center mb-2">
                            <input
                                type="checkbox"
                                checked={selectedDestinations.includes(destination.DestID)}
                                onChange={() => handleToggleDestination(destination.DestID)}
                                className="mr-2"
                            />
                            <label htmlFor={`destination-${destination.DestID}`}>{destination.Destination} - {destination.Country}</label>
                        </div>
                    ))
                )}
            </div>
            <button
                onClick={handleSaveList}
                className="bg-blue-500 text-white px-4 py-2"
            >
                {editingList ? "Save Changes" : "Save List"}
            </button>
            {editingList && (
                <button
                    onClick={resetForm}
                    className="ml-4 bg-gray-500 text-white px-4 py-2"
                >
                    Cancel Edit
                </button>
            )}
            <div className="mt-10">
                <h2 className="text-2xl font-bold mb-4">Your Lists</h2>
                {lists.length === 0 ? (
                    <p>No lists created yet.</p>
                ) : (
                    lists.map((list) => (
                        <div key={list.list_id} className="border p-4 mb-4">
                            <h3 className="text-xl font-bold">{list.list_name}</h3>
                            <p><strong>Description:</strong> {list.description || "No description"}</p>
                            <p><strong>Visibility:</strong> {list.visible ? "Public" : "Private"}</p>
                            <div className="mt-4">
                                <button
                                    onClick={() => handleEditList(list)}
                                    className="bg-yellow-500 text-white px-4 py-2 mr-2"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteList(list.list_id)}
                                    className="bg-red-500 text-white px-4 py-2"
                                >
                                    {confirmationDialog === list.list_id ? "Confirm Delete" : "Delete"}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ListMaker;
