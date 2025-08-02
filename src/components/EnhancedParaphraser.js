import React, { useState } from 'react';
import { geminiService } from '../services/geminiAPI';

const EnhancedParaphraser = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [mode, setMode] = useState('Literary');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [writingStyle, setWritingStyle] = useState('neutral');
  const [targetAudience, setTargetAudience] = useState('general');
  const [preserveDialogue, setPreserveDialogue] = useState(true);

  const literaryModes = [
    'Literary', 'Victorian', 'Modern', 'Minimalist', 'Descriptive', 
    'Dialogue-Heavy', 'Stream-of-Consciousness', 'Gothic', 'Romance', 
    'Thriller', 'Fantasy', 'Sci-Fi', 'Historical', 'Poetry'
  ];

  const writingStyles = [
    { value: 'hemingway', label: 'Hemingway (Concise)' },
    { value: 'dickens', label: 'Dickens (Elaborate)' },
    { value: 'rowling', label: 'Rowling (Accessible)' },
    { value: 'tolkien', label: 'Tolkien (Epic)' },
    { value: 'austen', label: 'Austen (Witty)' },
    { value: 'king', label: 'Stephen King (Suspenseful)' }
  ];

  const handleAdvancedParaphrase = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await geminiService.advancedParaphrase(text, {
        mode,
        writingStyle,
        targetAudience,
        preserveDialogue
      });
      if (response.success) {
        setResult(response.result);
      }
    } catch (error) {
      setError('Failed to paraphrase: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="component enhanced-paraphraser">
      <h2>🎨 Literary Paraphraser</h2>
      
      <div className="advanced-controls">
        <div className="control-row">
          <div className="mode-selector">
            <label>Literary Style:</label>
            <select 
              value={mode} 
              onChange={(e) => setMode(e.target.value)}
              className="mode-select"
            >
              {literaryModes.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="style-selector">
            <label>Author Style:</label>
            <select 
              value={writingStyle} 
              onChange={(e) => setWritingStyle(e.target.value)}
              className="mode-select"
            >
              <option value="neutral">Neutral</option>
              {writingStyles.map(style => (
                <option key={style.value} value={style.value}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="control-row">
          <div className="audience-selector">
            <label>Target Audience:</label>
            <select 
              value={targetAudience} 
              onChange={(e) => setTargetAudience(e.target.value)}
              className="mode-select"
            >
              <option value="general">General Adult</option>
              <option value="ya">Young Adult</option>
              <option value="literary">Literary Fiction</option>
              <option value="commercial">Commercial Fiction</option>
              <option value="academic">Academic</option>
            </select>
          </div>

          <div className="preserve-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={preserveDialogue}
                onChange={(e) => setPreserveDialogue(e.target.checked)}
              />
              Preserve Dialogue Structure
            </label>
          </div>
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter your prose to enhance with literary style..."
        className="text-area literary-textarea"
        style={{ height: '300px' }}
      />

      <button 
        onClick={handleAdvancedParaphrase}
        disabled={loading || !text.trim()}
        className="button literary-button"
      >
        {loading ? 'Enhancing...' : 'Transform Text'}
      </button>

      {error && <div className="error-message">{error}</div>}

      {result && (
        <div className="results enhanced-results">
          <h3>Enhanced Text:</h3>
          <div className="result-text">{result}</div>
          
          <div className="result-actions">
            <button 
              onClick={() => setText(result)}
              className="button secondary"
            >
              Use as New Input
            </button>
            <button 
              onClick={() => navigator.clipboard.writeText(result)}
              className="button secondary"
            >
              Copy Result
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedParaphraser;