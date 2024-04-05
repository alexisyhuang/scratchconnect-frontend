import React from 'react';
import './App.css';
import ScratchUserFavorites from './followers_projects';
import UserKeywords from './userkeywords';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <UserKeywords />
      </header>
    </div>
  );
}

export default App;