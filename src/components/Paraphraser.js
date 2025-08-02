import React, { useState } from 'react';
import { geminiService } from '../services/geminiAPI';

const Paraphraser = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [mode, setMode] = useState('Standard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const modes = ['Formal', 'Academic', 'Simple', 'Creative', 'Shorten', 'Expand'];

  const handleParaphrase = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await geminiService.paraphraseText(text, mode);
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
    <div className="component">
      <h2>🔄 Smart Paraphraser</h2>
      
      <div className="mode-selector">
        <label>Paraphrasing Mode:</label>
        <select 
          value={mode} 
          onChange={(e) => setMode(e.target.value)}
          className="mode-select"
        >
          {modes.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to paraphrase..."
        className="text-area"
      />

      <button 
        onClick={handleParaphrase}
        disabled={loading || !text.trim()}
        className="button"
      >
        {loading ? 'Paraphrasing...' : 'Paraphrase Text'}
      </button>

      {error && <div className="error-message">{error}</div>}

      {result && (
        <div className="results">
          <h3>Paraphrased Text:</h3>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
};

export default Paraphraser;