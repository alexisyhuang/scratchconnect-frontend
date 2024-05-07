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
    favorites: true,
  });
  const [crazyMode, setCrazyMode] = useState(false);
  // const hostname = "http://localhost:8081";
  const hostname = "https://scratchconnect-server.vercel.app";

  const [userBio, setUserBio] = useState('');
  const [workingon, setWorkingon] = useState('');
  const [userProjects, setUserProjects] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [favoritesList, setFavoritesList] = useState([]);
  const [messageHistory, setMessageHistory] = useState([]);
  const [keywordExplanations, setKeywordExplanations] = useState([]);

  const [activeKeywordExplanation, setActiveKeywordExplanation] = useState('');

  // Function to handle hovering over a keyword button
  const handleKeywordHover = (explanation) => {
    setActiveKeywordExplanation(explanation);
  };

  const handleRefreshClick = async (e) => {
    e.preventDefault();
    try {
      let morekeywordsmessage;
      if (crazyMode) {
        morekeywordsmessage = "Based on the data about the user, generate a diverse set of 5-8 more comma separated fun, interesting, exciting, and creative keywords that are the INVERSE or OPPOSITE of topics that the user is interested in for new projects to create. Return them as structured JSON data of two keys: the first key should be 'keywords' with the value of that key being an array of these comma-separated string keywords. DO NOT number the list of keywords and ensure that the keys are all lower case. The second key should be 'explanations' with the value of that key being an array of empty strings, with the number of empty strings equal to the number of keywords being returned. Don't include any other text besides the full json object. Please make sure to return 5-8 keywords.";
      } else {
        morekeywordsmessage = "Based on the data about the user, generate 5-8 more keywords and return them as structured JSON data of two keys: the first key should be 'keywords' with the value of that key being an array of these comma-separated string keywords. DO NOT number the list of keywords and ensure that the keys are all lower case. The second key should be 'explanations' with the value of that key being an array of strings, which are explanations for why each keyword was selected. There should be an explanation corresponding to each selected keyword. In these explanations, please be specific with what information was used and inferences that were made to generate the keyword. Don't include any other text besides the full json object.";
      }
      // Append the specified message to messageHistory
      setMessageHistory([...messageHistory, { content: morekeywordsmessage, role: "user" }]);
      
      // Feed the combined messageHistory as a prompt to chatGPT
      const openai = new OpenAI({
        apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
        dangerouslyAllowBrowser: true,
      });
  
      const chatPrompt = [...messageHistory, { content: morekeywordsmessage, role: "user" }];
      console.log(chatPrompt);
      const chatGptResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: chatPrompt,
        presence_penalty: 0.8,
        temperature: 1.3,
        response_format: { "type": "json_object" },
      });
  
      // Append chatGptResponse to messageHistory
      setMessageHistory([...messageHistory, chatGptResponse.choices[0].message]);
  
      // Extract and set the keywords from the chatGptResponse
      const keywordResponse = JSON.parse(chatGptResponse.choices[0].message.content).keywords;
      // console.log(keywordResponse);
      setKeywords(keywordResponse);
      setKeywordExplanations(JSON.parse(chatGptResponse.choices[0].message.content).explanations);
      console.log(JSON.parse(chatGptResponse.choices[0].message.content).explanations);
    } catch (error) {
      console.error('Error generating keywords:', error);
    }
  };
  

  const handleSettingsClick = () => {
    setShowSettingsPanel(!showSettingsPanel);
  };

  const handleSaveSettingsClick = async () => {
    if (!(selectedSettings.bio || selectedSettings.workingOn || selectedSettings.projectsList || selectedSettings.favorites)) {
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
      setFavorites(response.data.favorites);
      console.log(workingon);
      setProjects(userProjects);
    } catch (error) {
      console.error('Error fetching user projects and generating keywords:', error);
    }
  };

  useEffect(() => {
    console.log(userProjects);
    console.log(userBio);
    console.log(workingon);
    if (userBio === '' && workingon === '' && userProjects.length === 0 && favorites.length === 0) {
      return; // Exit useEffect without executing further code
    }
    const generateKeywords = async () => {
      const selectedEntries = [];
      if (selectedSettings.bio) selectedEntries.push(`this user has this bio: ${userBio}`);
      if (selectedSettings.workingOn) selectedEntries.push(`is currently working on ${workingon}`);
      if (selectedSettings.favorites) {
        setFavoritesList(favorites.map((project) => `title: ${project.title}, description: ${project.description}, instructions: ${project.instructions}`).join('\n'))
        selectedEntries.push(`favorited these projects: ${favoritesList}`);
      }
      if (selectedSettings.projectsList) {
        setProjectsList(userProjects.map((project) => `title: ${project.title}, description: ${project.description}, instructions: ${project.instructions}`).join('\n'));
        selectedEntries.push(`and created these projects: ${projectsList}`);
      }
  
      const openai = new OpenAI({
        apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
        dangerouslyAllowBrowser: true,
      });
      let systemMessage = '';
      if (crazyMode) {
        systemMessage = `Considering the data given to you below, please return a diverse list of 5-8 comma separated fun, interesting and creative keywords that are the INVERSE or OPPOSITE of topics that the user might be interested in for new projects to create. Please do not include the keywords "scratch", "project","exploration", “art”, “animation”, “games”, “music”, “stories”, “tutorials”, or "explore". Generate these keywords as structured JSON data of two keys: the first key should be 'keywords' with the value of that key being an array of these comma-separated string keywords. DO NOT number the list of keywords and ensure that the keys are all lower case. The second key should be 'explanations' with the value of that key being an array of empty strings, with the number of empty strings equal to the number of keywords being returned. Don't include any other text besides the full json object.`;
      } else {
        systemMessage = `Considering the data given to you below, please return a list of 5-8 comma separated topic keywords that are topics that the user might be interested in for new projects to create. Please do not include the keywords "scratch", "project","exploration", “art”, “animation”, “games”, “music”, “stories”, “tutorials”, or "explore". Generate these keywords as structured JSON data of two keys: the first key should be 'keywords' with the value of that key being an array of these comma-separated string keywords. DO NOT number the list of keywords and ensure that the keys are all lower case. The second key should be 'explanations' with the value of that key being an array of strings, which are explanations for why each keyword was selected. There should be an explanation corresponding to each selected keyword. In these explanations, please be specific with what information was used and inferences that were made to generate the keyword. Don't include any other text besides the full json object.`;

      }

      const userDataMessage = `Here is the data for you to consider: ${selectedEntries.join(', ')}`;

      const messages = [
        {
          role: 'system',
          content: systemMessage,
        },
        {
          role: 'user',
          content: userDataMessage,
        },
      ];
      console.log(messages);
      try {
        const chatGptResponse = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: messages,
          response_format: { "type": "json_object" },
        });
        messages.push(chatGptResponse.choices[0].message);
        // console.log("message below");
        // console.log(chatGptResponse.choices[0].message);
        // setMessageHistory(messages.push(chatGptResponse));
        setMessageHistory(messages);
        const keywordResponse = JSON.parse(chatGptResponse.choices[0].message.content).keywords;
        // console.log(keywordResponse);
        setKeywords(keywordResponse);
        setKeywordExplanations(JSON.parse(chatGptResponse.choices[0].message.content).explanations);
        console.log(JSON.parse(chatGptResponse.choices[0].message.content).explanations);
        // setKeywords(keywordResponse.split(',').map((keyword) => keyword.trim()));
      } catch (error) {
        console.error('Error generating keywords:', error);
      }
    };
  
    generateKeywords(); // Call the function to generate keywords
  
  }, [userProjects, userBio, workingon, favorites]);

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

  const [accordionState, setAccordionState] = useState({
    bio: false,
    workingOn: false,
    projectsList: false,
    favorites: false,
  });

  const handleAccordionToggle = (setting) => {
    setAccordionState({
      ...accordionState,
      [setting]: !accordionState[setting],
    });
  };

  const parseProjectsList = (projectsListString) => {
    // console.log(projectsListString);
    // Split the projectsListString into individual projects using "title: " as a delimiter
    const projects = projectsListString.split('title: ').filter(entry => entry.trim() !== ''); // Filter out empty entries
    // Map over each project and convert it into an object
    return projects.map(project => {
        // Split the project entry into title, description, and instructions
        const [title, rest] = project.split(', description: ');
        const [description, instructions] = rest.split(', instructions: ');
        // Replace newline characters with <br> elements in description and instructions
        const formattedDescription = description.replace(/\n/g, '<br>');
        const formattedInstructions = instructions.replace(/\n/g, '<br>');
        return { title: title.trim(), description: formattedDescription.trim(), instructions: formattedInstructions.trim() };
    });
  };


  return (
    <div>

      <form onSubmit={handleUsernameSubmit}>
        <label htmlFor="username" className={!crazyMode ? 'black-text' : ''}>Enter your Scratch username:</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <button type="submit">Submit</button>
      </form>

        <div className={`${crazyMode ? 'inverted-colors' : ''} connect-header`}>
          <h2>Connect</h2>
        </div>
        <div className={crazyMode ? 'inverted-colors' : ''}>
        {keywords.length > 0 && (
          <div>
            {keywords.map((keyword, index) => (
              <button
                className={activeKeyword === keyword ? 'keyword-button-active' : 'keyword-button'}
                key={index}
                onClick={() => handleKeywordClick(keyword)}
                onMouseEnter={() => handleKeywordHover(keywordExplanations[index])} // Hover event handler
                onMouseLeave={() => setActiveKeywordExplanation('')}
              >
                {keyword}
              </button>
            ))}

            {activeKeywordExplanation && (
              <div className="keyword-explanation-tooltip">{activeKeywordExplanation}</div>
            )}

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
      

      {showSettingsPanel && (
  <div>
    <div className={`${crazyMode ? 'inverted-colors' : ''} settings-overlay`} onClick={handleSeeInsideClick}></div>
    <div className={`${crazyMode ? 'inverted-colors' : ''} settings-popup`}>
      <h6>Select what information you want to use to generate keywords:</h6>
      <div className="checklist-item">
        <label>
          <input
            type="checkbox"
            checked={selectedSettings.bio}
            onChange={() => handleSettingToggle('bio')}
          />
          My Bio
        </label>
      </div>
      <div className="accordion">
        <button className="accordion-button" onClick={() => handleAccordionToggle('bio')}>
          See "My Bio" Information
        </button>
        <div className={`accordion-panel ${accordionState.bio ? 'active' : ''}`}>
          <span className="info">{userBio}</span>
        </div>
      </div>
      <div className="checklist-item">
        <label>
          <input
            type="checkbox"
            checked={selectedSettings.workingOn}
            onChange={() => handleSettingToggle('workingOn')}
          />
          What I'm Working On
        </label>
      </div>
      <div className="accordion">
        <button className="accordion-button" onClick={() => handleAccordionToggle('workingOn')}>
          See "What I'm Working On" Information
        </button>
        <div className={`accordion-panel ${accordionState.workingOn ? 'active' : ''}`}>
          <span className="info">{workingon}</span>
        </div>
      </div>
      <div className="checklist-item">
        <label>
          <input
            type="checkbox"
            checked={selectedSettings.projectsList}
            onChange={() => handleSettingToggle('projectsList')}
          />
          Projects I've Created
        </label>
      </div>
      <div className="accordion">
        <button className="accordion-button" onClick={() => handleAccordionToggle('projectsList')}>
          See "Projects I've Created" Information
        </button>
        <div className={`accordion-panel ${accordionState.projectsList ? 'active' : ''}`}>
        {userProjects.map((project, index) => (
          <div key={index} style={{ textAlign: 'center' }}>
            <a href={`https://scratch.mit.edu/projects/${project.id}`} target="_blank" rel="noopener noreferrer">
              <img src={project.image} alt={project.title} style={{ width: '150px', height: 'auto', display: 'block', margin: '0 auto' }} />
            </a>
            <a href={`https://scratch.mit.edu/projects/${project.id}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
              <h5>{project.title}</h5>
            </a>
            {project.description && (
              <div>
                <h6>Description:</h6>
                <span dangerouslySetInnerHTML={{ __html: project.description }} style={{ fontSize: '14px' }} />
              </div>
            )}
            {project.instructions && (
              <div>
                <h6>Instructions:</h6>
                <span dangerouslySetInnerHTML={{ __html: project.instructions }} style={{ fontSize: '12px' }} />
              </div>
            )}
            {index !== userProjects.length - 1 && <hr />} {/* Add divider line if it's not the last project */}
          </div>
        ))}
      </div>

      </div>
      <div className="checklist-item">
        <label>
          <input
            type="checkbox"
            checked={selectedSettings.favorites}
            onChange={() => handleSettingToggle('favorites')}
          />
          Projects I've Favorited
        </label>
      </div>
      <div className="accordion">
        <button className="accordion-button" onClick={() => handleAccordionToggle('favorites')}>
          See "Projects I've Favorited" Information
        </button>

        <div className={`accordion-panel ${accordionState.favorites ? 'active' : ''}`}>
          {favorites.map((project, index) => (
            <div key={index} style={{ textAlign: 'center' }}>
              <a href={`https://scratch.mit.edu/projects/${project.id}`} target="_blank" rel="noopener noreferrer">
                <img src={project.image} alt={project.title} style={{ width: '150px', height: 'auto', display: 'block', margin: '0 auto' }} />
              </a>
              <a href={`https://scratch.mit.edu/projects/${project.id}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                <h5>{project.title}</h5>
              </a>
              {project.description && (
                <div>
                  <h6>Description:</h6>
                  <span dangerouslySetInnerHTML={{ __html: project.description }} style={{ fontSize: '14px' }} />
                </div>
              )}
              {project.instructions && (
                <div>
                  <h6>Instructions:</h6>
                  <span dangerouslySetInnerHTML={{ __html: project.instructions }} style={{ fontSize: '12px' }} />
                </div>
              )}
              {index !== userProjects.length - 1 && <hr />} {/* Add divider line if it's not the last project */}
            </div>
          ))}
        </div>
      </div>
      <h6>Select the checkbox below to enable opposite mode!</h6>
      <div className="checklist-item">
        <label>
          <input
            type="checkbox"
            checked={crazyMode}
            onChange={handleCrazyModeToggle}
          />
          Opposite Mode
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
      <h2 className={!crazyMode ? 'black-text' : ''}>Projects</h2>
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
