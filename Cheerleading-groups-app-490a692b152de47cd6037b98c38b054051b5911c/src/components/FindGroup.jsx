import React, { useEffect, useState } from "react";
import "../css/findMeetup.css";
import { Input, Link, Spinner } from "@nextui-org/react"; // Make sure to import a loading component or use your custom one
import ShowLocalGroups from "./showLocalGroups";

function FindGroup() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // New state for loading

  // Fetch groups from the backend when the component mounts
  useEffect(() => {
    fetch(`https://cheer-client-app-backend.onrender.com/groups`)
      .then((response) => response.json())
      .then((data) => setGroups(data))
      .catch((err) => {
        setError("Error fetching group data.");
        console.error("Error fetching group data:", err);
      });
  }, []);

  const handleSearch = () => {
    setLoading(true); // Set loading to true when search starts
    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&limit=1&addressdetails=1`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.length > 0) {
          const { lat, lon } = data[0];
          filterGroups(lat, lon);
        } else {
          setError("No results found for the provided location.");
        }
      })
      .catch((error) => {
        setError("Error fetching search results.");
        console.error("Error fetching search results:", error);
      })
      .finally(() => {
        setLoading(false); // Set loading to false when search ends
      });
  };

  // Filter groups based on the search location
  const filterGroups = (lat, lng) => {
    const radius = 50; // Radius in miles
    const filtered = groups.filter((group) => {
      const distance = getDistance(lat, lng, group.latitude, group.longitude);
      return distance < radius;
    });
    setFilteredGroups(filtered);
  };

  // Calculate distance between two geographic points
  function getDistance(lat1, lon1, lat2, lon2) {
    const R = 3958.8; // Radius of the Earth in miles
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }

  return (
    <>
      <div className="find-meetup-background">
        <div className="find-meetup-div">
          <h2 className="find-group-header">Find a Group Near You</h2>
          <p className="find-group-today">Find a group in your area today!</p>
          <Input
            type="text"
            variant="bordered"
            label="Search for a location (City, State)"
            className="w-10/12 sm:w-8/12 md:w-6/12 m-auto mt-20 p-3 text-lg"
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
          <button className="search-button" onClick={handleSearch}>
            SEARCH
          </button>
          {loading ? (
            <div className="loading-animation">
              <Spinner size="lg">Loading...</Spinner>{" "}
              {/* Replace with your own animation if needed */}
            </div>
          ) : (
            <>
              {error && <p>{error}</p>}
              <ShowLocalGroups groups={filteredGroups} />
            </>
          )}
          <div className="create-meetup-container">
            <p className="create-meetup-label">
              Can't find a meet up near you?
            </p>
            <Link href="/create-group">
              <button className="create-meetup-button">START ONE TODAY</button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default FindGroup;
