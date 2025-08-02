import React, { useState } from 'react';
import { geminiService } from '../services/geminiAPI';

const CharacterAssistant = () => {
  const [characterName, setCharacterName] = useState('');
  const [characterText, setCharacterText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState({});
  const [error, setError] = useState('');
  const [analysisType, setAnalysisType] = useState('voice');

  const analysisTypes = [
    { value: 'voice', label: 'Character Voice Analysis' },
    { value: 'development', label: 'Character Development' },
    { value: 'consistency', label: 'Consistency Check' },
    { value: 'dialogue', label: 'Dialogue Enhancement' },
    { value: 'backstory', label: 'Backstory Suggestions' }
  ];

  const analyzeCharacter = async () => {
    if (!characterText.trim()) return;
    
    setLoading(prev => ({ ...prev, analysis: true }));
    setError('');
    
    try {
      const response = await geminiService.analyzeCharacter(
        characterText, 
        characterName, 
        analysisType
      );
      if (response.success) {
        setAnalysis(response.analysis);
      }
    } catch (error) {
      setError('Failed to analyze character: ' + error.message);
    } finally {
      setLoading(prev => ({ ...prev, analysis: false }));
    }
  };

  const generateCharacterSuggestions = async () => {
    if (!characterName.trim()) return;
    
    setLoading(prev => ({ ...prev, suggestions: true }));
    setError('');
    
    try {
      const response = await geminiService.generateCharacterSuggestions(
        characterName,
        analysis?.traits || [],
        analysisType
      );
      if (response.success) {
        setSuggestions(response.suggestions);
      }
    } catch (error) {
      setError('Failed to generate suggestions: ' + error.message);
    } finally {
      setLoading(prev => ({ ...prev, suggestions: false }));
    }
  };

  return (
    <div className="component character-assistant">
      <h2>👥 Character Development Assistant</h2>
      
      <div className="character-controls">
        <div className="character-input">
          <label>Character Name:</label>
          <input
            type="text"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            placeholder="Enter character name..."
            className="character-name-input"
          />
        </div>

        <div className="analysis-type-selector">
          <label>Analysis Type:</label>
          <select 
            value={analysisType} 
            onChange={(e) => setAnalysisType(e.target.value)}
            className="mode-select"
          >
            {analysisTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <textarea
        value={characterText}
        onChange={(e) => setCharacterText(e.target.value)}
        placeholder="Paste text featuring this character (dialogue, descriptions, actions, etc.)..."
        className="text-area character-textarea"
        style={{ height: '300px' }}
      />

      <div className="action-buttons">
        <button 
          onClick={analyzeCharacter}
          disabled={loading.analysis || !characterText.trim()}
          className="button"
        >
          {loading.analysis ? 'Analyzing...' : 'Analyze Character'}
        </button>

        <button 
          onClick={generateCharacterSuggestions}
          disabled={loading.suggestions || !characterName.trim()}
          className="button secondary"
        >
          {loading.suggestions ? 'Generating...' : 'Get Suggestions'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {analysis && (
        <div className="character-analysis">
          <h3>Character Analysis: {characterName}</h3>
          
          <div className="analysis-sections">
            <div className="traits-section">
              <h4>Character Traits:</h4>
              <div className="traits-list">
                {analysis.traits?.map((trait, index) => (
                  <span key={index} className="trait-tag">
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            <div className="voice-section">
              <h4>Voice Characteristics:</h4>
              <ul>
                <li><strong>Tone:</strong> {analysis.voiceTone}</li>
                <li><strong>Speech Pattern:</strong> {analysis.speechPattern}</li>
                <li><strong>Vocabulary Level:</strong> {analysis.vocabularyLevel}</li>
                <li><strong>Emotional Range:</strong> {analysis.emotionalRange}</li>
              </ul>
            </div>

            <div className="development-section">
              <h4>Development Notes:</h4>
              <p>{analysis.developmentNotes}</p>
            </div>

            {analysis.inconsistencies && (
              <div className="inconsistencies-section">
                <h4>Potential Inconsistencies:</h4>
                <ul>
                  {analysis.inconsistencies.map((issue, index) => (
                    <li key={index} className="inconsistency-item">
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {suggestions && (
        <div className="character-suggestions">
          <h3>Enhancement Suggestions:</h3>
          
          <div className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="suggestion-item">
                <h4>{suggestion.category}</h4>
                <p>{suggestion.description}</p>
                {suggestion.example && (
                  <div className="suggestion-example">
                    <strong>Example:</strong> "{suggestion.example}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterAssistant;