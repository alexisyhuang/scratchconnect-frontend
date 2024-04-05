import React, { useState } from 'react';
import OpenAI from 'openai';
import axios from 'axios';

function UserKeywords() {
  const [username, setUsername] = useState('');
  const [projects, setProjects] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [searchprojects, setSearchProjects] = useState([]);
  const [activeKeyword, setActiveKeyword] = useState(null); // State to store active keyword
  const chatCompletion = useState(null);
  const chatGptResponse = useState(null);
  const keywordList = useState(null);

  const handleRefreshClick = async (e) => {
    e.preventDefault(); // Prevent the default button click behavior
    await handleUsernameSubmit();
  };

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`http://localhost:8081/?m=${username}`);
      const userProjects = response.data.projects;
      const userBio = response.data.bio;
      const workingOn = response.data.workingOn;
      setProjects(userProjects);
      console.log(userProjects);
      console.log(workingOn);
      console.log(userBio);
      console.log("key:");
      console.log(process.env.REACT_APP_OPENAI_API_KEY);
      const projectsList = userProjects.map(project => project.title).join(', ');
      const openai = new OpenAI({
        apiKey: process.env.REACT_APP_OPENAI_API_KEY || "",
        dangerouslyAllowBrowser: true
      });
      const messages = [{
        role: 'user',
        content: `Given that this user has this bio: ${userBio}, is currently working on ${workingOn}, and created these projects, please return a list of 5-8 comma separated keywords that represent the user's interests. Please do not include the keywords "scratch" or "project". ${projectsList}`
      }];
      const chatGptResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo', // Make sure this model is appropriate for your use case
        messages: messages,
      });
      const keywords = chatGptResponse.choices[0].message.content;
      const keywordList = keywords.split(',').map(keyword => keyword.trim());
      setKeywords(keywordList);
    } catch (error) {
      console.error('Error fetching user projects and generating keywords:', error);
    }
  };

  const handleKeywordClick = async (keyword) => {
    try {
      const response = await axios.get(`http://localhost:8081/search?keyword=${keyword}`);
      const keywordProjects = response.data;
      setSearchProjects(keywordProjects);
  
      // Update active keyword only if it's different from the currently active one
      if (activeKeyword !== keyword) {
        setActiveKeyword(keyword);
        console.log("Active keyword:", keyword);
      }
    } catch (error) {
      console.error('Error fetching projects for keyword:', error);
    }
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
                  className={activeKeyword === keyword ? "keyword-button-active" : "keyword-button"}
                  key={index}
                  onClick={() => handleKeywordClick(keyword)}>
                  {keyword}
                </button>
              ))}
              <button className="refresh-button" onClick={handleUsernameSubmit}>Refresh</button>
            </div>
          )}
        </div>
      </div>

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