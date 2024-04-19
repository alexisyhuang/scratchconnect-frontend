import React, { useState, useEffect } from 'react';
import OpenAI from 'openai';
import axios from 'axios';
import seeinside from './images/see_inside.png';
import scratchcatrec1 from './images/scratchcatrec1.png';
import scratchcatrec2 from './images/scratchcatrec2.png';


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

  const [userBio, setUserBio] = useState('');
  const [workingon, setWorkingon] = useState('');
  const [userProjects, setUserProjects] = useState([]);
  const [projectsList, setProjectsList] = useState([]);

  /* useEffect(() => {
    // Check if username is not empty before calling handleUsernameSubmit
    if (username !== '') {
      handleUsernameSubmit();
    }
  }, [username]); */

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
    console.log(username);
    if (e) e.preventDefault();
    try {
      const response = await axios.get(`${hostname}/?m=${username}`);
      console.log(response.data.bio);
      // if this returns an error, then use this random response data object that i will specify
      // create an if else statement, checking to see if it fails and if it does just set keywords to a preset list
      setUserProjects(response.data.projects);
      setUserBio(response.data.bio);
      setWorkingon(response.data.workingon);
      console.log(workingon);
      setProjects(userProjects);

      /* const selectedEntries = [];
      if (selectedSettings.bio) selectedEntries.push(`this user has this bio: ${userBio}`);
      if (selectedSettings.workingOn) selectedEntries.push(`is currently working on ${workingon}`);
      if (selectedSettings.projectsList) {
        setProjectsList(userProjects.map((project) => `title: ${project.title}, description: ${project.description}, instructions: ${project.instructions}`).join('\n'));

        selectedEntries.push(`and created these projects: ${projectsList}`);
      }

      const openai = new OpenAI({
        apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
        dangerouslyAllowBrowser: true,
      });
      let promptEnding = '';
      if (crazyMode) {
        promptEnding = 'Among the 5-8 comma separated keywords, make sure to include some keywords that are NOT directly related to the user\'s interests but you still think they might enjoy.';
      }

      const messages = [
        {
          role: 'user',
          content: `Given that ${selectedEntries.join(', ')}, please return a list of 5-8 comma separated keywords that represent the user's interests. ${promptEnding} Please do not include the keywords "scratch", "project","exploration", or "explore". Please remember to ONLY return 5-8 keywords in a comma-separated list, in this format: keyword1, keyword2, keyword3, ....`,
        },
      ];
      const chatGptResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages,
      });
      const keywordResponse = chatGptResponse.choices[0].message.content;
      // keywords = keywordResponse.split(',').map((keyword) => keyword.trim());
      setKeywords(keywordResponse.split(',').map((keyword) => keyword.trim()));
    */
    } catch (error) {
      console.error('Error fetching user projects and generating keywords:', error);
    }
  };

  useEffect(() => {
    console.log(userProjects);
    console.log(userBio);
    console.log(workingon);
    if (userBio === '' && workingon === '' && userProjects.length === 0) {
      return; // Exit useEffect without executing further code
    }
    const generateKeywords = async () => {
      const selectedEntries = [];
      if (selectedSettings.bio) selectedEntries.push(`this user has this bio: ${userBio}`);
      if (selectedSettings.workingOn) selectedEntries.push(`is currently working on ${workingon}`);
      if (selectedSettings.projectsList) {
        setProjectsList(userProjects.map((project) => `title: ${project.title}, description: ${project.description}, instructions: ${project.instructions}`).join('\n'));
        selectedEntries.push(`and created these projects: ${projectsList}`);
      }
  
      const openai = new OpenAI({
        apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
        dangerouslyAllowBrowser: true,
      });
      let promptEnding = '';
      if (crazyMode) {
        promptEnding = 'Among the 5-8 comma separated keywords, make sure to include some keywords that are NOT directly related to the user\'s interests but you still think they might enjoy.';
      }
  
      const messages = [
        {
          role: 'user',
          content: `Given that ${selectedEntries.join(', ')}, please return a list of 5-8 comma separated keywords that represent the user's interests. ${promptEnding} Please do not include the keywords "scratch", "project","exploration", or "explore". Please remember to ONLY return 5-8 keywords in a comma-separated list, in this format: keyword1, keyword2, keyword3, ....`,
        },
      ];
      try {
        const chatGptResponse = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: messages,
        });
        const keywordResponse = chatGptResponse.choices[0].message.content;
        setKeywords(keywordResponse.split(',').map((keyword) => keyword.trim()));
      } catch (error) {
        console.error('Error generating keywords:', error);
      }
    };
  
    generateKeywords(); // Call the function to generate keywords
  
  }, [userProjects, userBio, workingon]);

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

  const handleSeeInsideClick = () => {
    setShowSettingsPanel(!showSettingsPanel);
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
      <div className="connect-header">
        <h2>Connect</h2>
      </div>
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
              {/*<button className="purple-button" onClick={handleSettingsClick}>
                Settings
              </button>*/}
              <button className="seeinside-button" onClick={handleSeeInsideClick}>
                <img src={seeinside} alt="See Inside" style={{ height: '40px', width: 'auto', verticalAlign: 'middle'}} />
              </button>
            </div>
          )}
        </div>
      </div>

      {showSettingsPanel && (
  <div>
    <div className="settings-overlay" onClick={handleSeeInsideClick}></div>
    <div className="settings-popup">
      <h6>Select what information you want to use to generate keywords:</h6>
      <div className="checklist-item">
        <label>
          <input
            type="checkbox"
            checked={selectedSettings.bio}
            onChange={() => handleSettingToggle('bio')}
          />
          My Bio
          <span className="info-icon" title={userBio}>﹖</span>
        </label>
      </div>
      <div className="checklist-item">
        <label>
          <input
            type="checkbox"
            checked={selectedSettings.workingOn}
            onChange={() => handleSettingToggle('workingOn')}
          />
          What I'm Working On
          <span className="info-icon" title={workingon}>﹖</span>
        </label>
      </div>
      <div className="checklist-item">
        <label>
          <input
            type="checkbox"
            checked={selectedSettings.projectsList}
            onChange={() => handleSettingToggle('projectsList')}
          />
          Projects I've Created
          <span className="info-icon" title={JSON.stringify(projectsList)}>﹖</span>
        </label>
      </div>
      <h6>Select the checkbox below to enable crazy mode!</h6>
      <div className="checklist-item">
        <label>
          <input
            type="checkbox"
            checked={crazyMode}
            onChange={handleCrazyModeToggle}
          />
          Crazy Mode
          <span className="info-icon" title="This mode is intended to give you suggestions to explore new things!">﹖</span>
        </label>
      </div>
      <div className="crazy-mode-image-container">
          <a href="https://en.wikipedia.org/wiki/Recommender_system" target="_blank" rel="noopener noreferrer">
            <img
              className="crazy-mode-image"
              src={scratchcatrec1}
              alt="Scratch Cat"
              onMouseOver={e => (e.currentTarget.src = scratchcatrec2)}
              onMouseOut={e => (e.currentTarget.src = scratchcatrec1)}
              style={{ width: '300px'}} // Adjust width and height here
            />
          </a>
        </div>
      <button className="purple-button" onClick={handleSaveSettingsClick}>
        Save changes
      </button>
    </div>
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
