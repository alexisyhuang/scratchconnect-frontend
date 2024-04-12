import React, { useState, useEffect } from 'react';
import OpenAI from 'openai';
import axios from 'axios';

function UserKeywords() {
  const [username, setUsername] = useState('');
  const [projects, setProjects] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [searchprojects, setSearchProjects] = useState([]);
  const [activeKeyword, setActiveKeyword] = useState(null);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [selectedSettings, setSelectedSettings] = useState({
    bio: true,
    workingOn: true,
    projectsList: true,
  });
  const [crazyMode, setCrazyMode] = useState(false);
  // const hostname = "http://localhost:8081";
  const hostname = "https://scratchconnect-server.vercel.app";

  useEffect(() => {
    handleUsernameSubmit();
  }, []);

  const handleRefreshClick = async (e) => {
    e.preventDefault();
    await handleUsernameSubmit();
  };

  const handleSettingsClick = () => {
    setShowSettingsPanel(!showSettingsPanel);
  };

  const handleSaveSettingsClick = async () => {
    if (!(selectedSettings.bio || selectedSettings.workingOn || selectedSettings.projectsList)) {
      alert('Please select at least one setting.');
      return;
    }

    setShowSettingsPanel(false);
    await handleUsernameSubmit();
  };

  const handleUsernameSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      const response = await axios.get(`${hostname}/?m=${username}`);
      // if this returns an error, then use this random response data object that i will specify
      // create an if else statement, checking to see if it fails and if it does just set keywords to a preset list
      const userProjects = response.data.projects;
      const userBio = response.data.bio;
      const workingon = response.data.workingon;
      console.log(workingon);
      setProjects(userProjects);

      const selectedEntries = [];
      if (selectedSettings.bio) selectedEntries.push(`this user has this bio: ${userBio}`);
      if (selectedSettings.workingOn) selectedEntries.push(`is currently working on ${workingon}`);
      if (selectedSettings.projectsList) {
        const projectsList = userProjects.map((project) => project.title).join(', ');
        selectedEntries.push(`and created these projects: ${projectsList}`);
      }

      const openai = new OpenAI({
        apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
        dangerouslyAllowBrowser: true,
      });
      let promptEnding = '';
      if (crazyMode) {
        promptEnding = 'Among the 5-8 comma separated keywords, include some keywords that are are not really related to the user\'s interests which might help them explore something new.';
      }

      const messages = [
        {
          role: 'user',
          content: `Given that ${selectedEntries.join(', ')}, please return a list of 5-8 comma separated keywords that represent the user's interests. Please do not include the keywords "scratch" or "project". ${promptEnding}`,
        },
      ];
      const chatGptResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages,
      });
      const keywords = chatGptResponse.choices[0].message.content;
      const keywordList = keywords.split(',').map((keyword) => keyword.trim());
      setKeywords(keywordList);
    } catch (error) {
      console.error('Error fetching user projects and generating keywords:', error);
    }
  };

  const handleKeywordClick = async (keyword) => {
    try {
      const response = await axios.get(`${hostname}/search?keyword=${keyword}`);
      const keywordProjects = response.data;
      setSearchProjects(keywordProjects);

      if (activeKeyword !== keyword) {
        setActiveKeyword(keyword);
      }
    } catch (error) {
      console.error('Error fetching projects for keyword:', error);
    }
  };

  const handleSettingToggle = (setting) => {
    setSelectedSettings({ ...selectedSettings, [setting]: !selectedSettings[setting] });
  };

  const handleCrazyModeToggle = () => {
    setCrazyMode(!crazyMode);
  };

  return (
    <div>
      <form onSubmit={handleUsernameSubmit}>
        <label htmlFor="username">Enter your Scratch username:</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <button type="submit">Submit</button>
      </form>

      <div>
        <h2>Scratch Connect</h2>
        <div>
          {keywords.length > 0 && (
            <div>
              {keywords.map((keyword, index) => (
                <button
                  className={activeKeyword === keyword ? 'keyword-button-active' : 'keyword-button'}
                  key={index}
                  onClick={() => handleKeywordClick(keyword)}
                >
                  {keyword}
                </button>
              ))}
              <button className="refresh-button" onClick={handleRefreshClick}>
                Refresh
              </button>
              <button className="purple-button" onClick={handleSettingsClick}>
                Settings
              </button>
            </div>
          )}
        </div>
      </div>

      {showSettingsPanel && (
        <div className="settings-panel">
          <h2>Settings</h2>
          <h6>Select what data you want to use to generate keywords:</h6>
          <div>
            <label>
              <input
                type="checkbox"
                checked={selectedSettings.bio}
                onChange={() => handleSettingToggle('bio')}
              />
              My Bio
            </label>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                checked={selectedSettings.workingOn}
                onChange={() => handleSettingToggle('workingOn')}
              />
              What I'm Working On
            </label>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                checked={selectedSettings.projectsList}
                onChange={() => handleSettingToggle('projectsList')}
              />
              Projects I've Created
            </label>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                checked={crazyMode}
                onChange={handleCrazyModeToggle}
              />
              Crazy Mode
            </label>
          </div>
          <button className="purple-button" onClick={handleSaveSettingsClick}>
            Save changes
          </button>
        </div>
      )}

      <div>
        <h2>Projects</h2>
        <div className="project-grid">
          {searchprojects.map((project, index) => (
            <div key={index} className="project-card">
              <a href={`https://scratch.mit.edu/projects/${project.id}`} target="_blank" rel="noopener noreferrer">
                <img src={project.image} alt={project.title} style={{ width: '150px', height: 'auto' }} />
              </a>
              <div className="project-details">
                <a href={`https://scratch.mit.edu/projects/${project.id}`} target="_blank" rel="noopener noreferrer">
                  {project.title}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserKeywords;
