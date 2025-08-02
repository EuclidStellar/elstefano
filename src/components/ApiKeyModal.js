import React, { useState } from 'react';

const ApiKeyModal = ({ isOpen, onApiKeySet }) => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey);
      onApiKeySet(apiKey);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>🔑 Configure Your Gemini API Key</h2>
        <p>To use this AI writing assistant, you need a Google Gemini API key.</p>
        
        <div className="api-key-steps">
          <h3>How to get your API key:</h3>
          <ol>
            <li>Go to <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a></li>
            <li>Click "Create API Key"</li>
            <li>Copy the key and paste it below</li>
          </ol>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Gemini API Key:</label>
            <div className="key-input-container">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key..."
                required
              />
              <button 
                type="button" 
                onClick={() => setShowKey(!showKey)}
                className="show-key-btn"
              >
                {showKey ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          
          <div className="security-note">
            <p>🔒 Your API key is stored locally in your browser and never sent to our servers.</p>
          </div>

          <button type="submit" className="submit-btn">
            Save & Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyModal;