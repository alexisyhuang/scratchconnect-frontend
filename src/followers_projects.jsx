import React, { useState } from 'react';
import axios from 'axios';

function ScratchUserFavorites() {
  const [username, setUsername] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFavorites([]);

    try {
        console.log("hi")
        const test_response = await axios.get(`http://localhost:8081/?m=${username}`)
        console.log(test_response)
        /*
        const followingResponse = await axios.get(`https://api.scratch.mit.edu/users/${username}/following/`);
        const usernames = followingResponse.data.map(user => user.username);
        const favoritesPromises = usernames.map(user =>
        axios.get(`https://api.scratch.mit.edu/users/${user}/favorites/`)
        );
        const results = await Promise.all(favoritesPromises);
        const aggregatedFavorites = results.map(result => result.data).flat();
        */
      setFavorites(test_response.data);
    } catch (error) {
      console.error('There was an error fetching the data:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchKeyword.trim()) {
      setFavorites([]);
      return;
    }

    const uniqueProjectIds = new Set();
    const filteredFavorites = favorites.filter(favorite => {
    if (!uniqueProjectIds.has(favorite.id)) {
        uniqueProjectIds.add(favorite.id);
        return favorite.title.toLowerCase().includes(searchKeyword.toLowerCase());
    }
    return false;
    });
    setFavorites(filteredFavorites);
  };

  const handleClearSearch = () => {
    setSearchKeyword('');
    setFavorites([]);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Enter a Scratch username:</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
      <div>
        <label htmlFor="search">Search for Scratch projects:</label>
        <input
          id="search"
          type="text"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
        <button onClick={handleSearch}>
          <span role="img" aria-label="Search">🔍</span>
        </button>
        <button onClick={handleClearSearch}>Clear</button>
      </div>

      {loading && <p>Loading...</p>}
      {!loading && favorites.length > 0 && (
        <div>
          <h2>Favorites</h2>
          <ul>
            {favorites.map((favorite, index) => (
              <li key={index}>{favorite.title}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ScratchUserFavorites;
