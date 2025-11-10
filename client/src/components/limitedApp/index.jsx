import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/authContext";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import levenshtein from 'fast-levenshtein';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
const host = `http://${location.host.split(':')[0]}:5000`;

// Fix broken marker images
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

function LimitedApp() {
    const [destinations, setDestinations] = useState([]);
    const [filteredDestinations, setFilteredDestinations] = useState([]);
    const [query, setQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [resultsPerPage, setResultsPerPage] = useState(5);
    const [loading, setLoading] = useState(true);
    const [expandedDestinations, setExpandedDestinations] = useState({});
    const [publicLists, setPublicLists] = useState([]);
    const [expandedLists, setExpandedLists] = useState({});

    // Fetch destinations on mount
    useEffect(() => {
        const fetchDestinations = async () => {
            try {
                const response = await fetch(`${host}/api/locations`);
                const data = await response.json();
                setDestinations(data);
                setFilteredDestinations(data);
            } catch (error) {
                console.error("Error fetching destinations:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDestinations();
    }, []);

    // Fetch public lists on mount
    useEffect(() => {
        const fetchPublicLists = async () => {
            try {
                const response = await fetch(`${host}/api/list`);
                const data = await response.json();

                const publicListsData = await Promise.all(
                    data
                        .filter(list => list.visible) // Only show public lists
                        .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by last-modified date
                        .slice(0, 10) // Limit to 10 lists
                        .map(async (list) => {
                            // Fetch the creator's name based on user_id
                            const userResponse = await fetch(`${host}/api/users/${list.user_id}`);
                            const userData = await userResponse.json();
                            console.log(list.user_id)
                            return {
                                ...list,
                                creatorName: userData[0]?.name || "Unknown"
                            };
                        })
                );

                setPublicLists(publicListsData);
            } catch (error) {
                console.error("Error fetching public lists:", error);
            }
        };
        fetchPublicLists();
    }, []);

    // Search destinations
    const handleSearch = () => {
        if (query.trim() === "") {
            setFilteredDestinations(destinations);
        } else {
            const lowerQuery = query.replace(/\s+/g, '').toLowerCase();
            const filtered = destinations.filter((dest) => {
                const targetStrings = [
                    dest.Destination.replace(/\s+/g, '').toLowerCase(),
                    dest.Region.replace(/\s+/g, '').toLowerCase(),
                    dest.Country.replace(/\s+/g, '').toLowerCase(),
                ];

                return targetStrings.some(target => {
                    const distance = levenshtein.get(lowerQuery, target);
                    return distance <= 2; // Allow up to 2 character differences
                });
            });
            setFilteredDestinations(filtered);
        }
        setCurrentPage(1);
    };

    // Pagination
    const displayDestinations = () => {
        const startIndex = (currentPage - 1) * resultsPerPage;
        const endIndex = startIndex + resultsPerPage;
        return filteredDestinations.slice(startIndex, endIndex);
    };

    // Next/Previous navigation
    const navigateToNext = () => {
        if (currentPage * resultsPerPage < filteredDestinations.length) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const navigateToPrevious = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    // Toggle dropdown for destination details
    const toggleDetails = (id) => {
        setExpandedDestinations((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    // Toggle dropdown for list details
    const toggleListDetails = async (id) => {
        setExpandedLists((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));

        if (!expandedLists[id]) { // If expanding, fetch the destination details
            try {
                const list = publicLists.find(list => list.list_id === id);
                if (list) {
                    const destinationIds = list.locations;
                    const destinationsDetails = await Promise.all(
                        destinationIds.map(async (destinationId) => {
                            const response = await fetch(`${host}/api/locations/${destinationId}`);
                            return response.json();
                        })
                    );
                    setPublicLists((prevLists) => prevLists.map(l => {
                        if (l.list_id === id) {
                            return {
                                ...l,
                                destinationsDetails
                            };
                        }
                        return l;
                    }));
                }
            } catch (error) {
                console.error("Error fetching destination details:", error);
            }
        }
    };

    return (
        <div className="container mx-auto pt-14">
            <div className="grid items-start grid-cols-1 md:grid-cols-2 gap-6">
                <div className="map-container">
                    <MapContainer center={[51.505, -0.09]} zoom={4} style={{ height: "500px", width: "100%" }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            maxZoom={15}
                        />
                        {displayDestinations().map((dest) => (
                            <Marker position={[dest.Latitude, dest.Longitude]} key={dest.ID}>
                                <Popup>
                                    <b>{dest.Destination}</b>
                                    <br />
                                    {dest.Country}
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
                <div className="text-2xl font-bold pt-14 ml-3">
                    <h1>Destinations</h1>
                    <input
                        type="text"
                        placeholder="Search destinations"
                        onChange={(e) => setQuery(e.target.value)}
                        className="border p-2 mr-2"
                    />
                    <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2">Search</button>
                    <div className="mt-4">
                        <label>Results per page: </label>
                        <select
                            value={resultsPerPage}
                            onChange={(e) => setResultsPerPage(parseInt(e.target.value))}
                            className="border p-2 ml-2"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                        </select>
                    </div>
                    <div className="mt-6">
                        {displayDestinations().map((dest) => (
                            <div key={dest.ID} className="border p-4 mb-4">
                                <h3 className="text-xl font-bold cursor-pointer" onClick={() => toggleDetails(dest.ID)}>{dest.Destination}</h3>
                                <p><strong>Country:</strong> {dest.Country}</p>
                                <p><strong>Region:</strong> {dest.Region}</p>
                                {expandedDestinations[dest.ID] && (
                                    <div className="mt-4">
                                        <p><strong>Category:</strong> {dest.Category}</p>
                                        <p><strong>Latitude:</strong> {dest.Latitude}</p>
                                        <p><strong>Longitude:</strong> {dest.Longitude}</p>
                                        <p><strong>Approximate Annual Tourists:</strong> {dest['Approximate Annual Tourists']}</p>
                                        <p><strong>Currency:</strong> {dest.Currency}</p>
                                        <p><strong>Majority Religion:</strong> {dest['Majority Religion']}</p>
                                        <p><strong>Famous Foods:</strong> {dest['Famous Foods']}</p>
                                        <p><strong>Language:</strong> {dest.Language}</p>
                                        <p><strong>Best Time to Visit:</strong> {dest['Best Time to Visit']}</p>
                                        <p><strong>Cost of Living:</strong> {dest['Cost of Living']}</p>
                                        <p><strong>Safety:</strong> {dest.Safety}</p>
                                        <p><strong>Cultural Significance:</strong> {dest['Cultural Significance']}</p>
                                        <p><strong>Description:</strong> {dest.Description}</p>
                                    </div>
                                )}
                                <button className="mt-2 bg-green-500 text-white px-4 py-2">Add to Favorites</button>
                                <button
                                    onClick={() => window.open(`https://duckduckgo.com/?q=${encodeURIComponent(dest.Destination + ' ' + dest.Country)}`, '_blank')}
                                    className="mt-2 ml-2 bg-yellow-500 text-white px-4 py-2"
                                >
                                    Search on DDG
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 flex justify-between">
                        <button onClick={navigateToPrevious} disabled={currentPage === 1} className="bg-gray-300 px-4 py-2">
                            Previous
                        </button>
                        <button
                            onClick={navigateToNext}
                            disabled={currentPage * resultsPerPage >= filteredDestinations.length}
                            className="bg-gray-300 px-4 py-2"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
            <div className="mt-10">
                <h2 className="text-3xl font-bold">Public Lists</h2>
                {publicLists.map((list) => (
                    <div key={list.list_id} className="border p-4 mb-4">
                        <h3 className="text-xl font-bold cursor-pointer" onClick={() => toggleListDetails(list.list_id)}>{list.list_name}</h3>
                        <p><strong>Creator:</strong> {list.creatorName}</p>
                        <p><strong>Number of Destinations:</strong> {list.locations.length}</p>
                        <p><strong>Average Rating:</strong> {list.average_rating || "N/A"}</p>
                        {expandedLists[list.list_id] && (
                            <div className="mt-4">
                                <p><strong>Description:</strong> {list.description || "No description available"}</p>
                                <p><strong>Destinations:</strong></p>
                                <ul className="list-disc ml-5">
                                    {list.destinationsDetails && list.destinationsDetails.map((dest, index) => (
                                        <li key={index}>
                                            <strong>{dest.Destination}</strong> - {dest.Country}, {dest.Region}
                                            <button onClick={() => toggleDetails(dest.ID)} className="ml-2 text-blue-500">More Details</button>
                                            {expandedDestinations[dest.ID] && (
                                                <div className="mt-2">
                                                    <p><strong>Category:</strong> {dest.Category}</p>
                                                    <p><strong>Latitude:</strong> {dest.Latitude}</p>
                                                    <p><strong>Longitude:</strong> {dest.Longitude}</p>
                                                    <p><strong>Approximate Annual Tourists:</strong> {dest['Approximate Annual Tourists']}</p>
                                                    <p><strong>Currency:</strong> {dest.Currency}</p>
                                                    <p><strong>Majority Religion:</strong> {dest['Majority Religion']}</p>
                                                    <p><strong>Famous Foods:</strong> {dest['Famous Foods']}</p>
                                                    <p><strong>Language:</strong> {dest.Language}</p>
                                                    <p><strong>Best Time to Visit:</strong> {dest['Best Time to Visit']}</p>
                                                    <p><strong>Cost of Living:</strong> {dest['Cost of Living']}</p>
                                                    <p><strong>Safety:</strong> {dest.Safety}</p>
                                                    <p><strong>Cultural Significance:</strong> {dest['Cultural Significance']}</p>
                                                    <p><strong>Description:</strong> {dest.Description}</p>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default LimitedApp;
