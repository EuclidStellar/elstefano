import React, { useState } from 'react';
import { geminiService } from '../services/geminiAPI';

const Summarizer = () => {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [length, setLength] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  const handleSummarize = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await geminiService.summarizeText(text, length);
      if (response.success) {
        setSummary(response.summary);
        setStats({
          originalLength: response.originalLength,
          summaryLength: response.summaryLength,
          compressionRatio: response.compressionRatio
        });
      }
    } catch (error) {
      setError('Failed to summarize: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="component">
      <h2>📄 Smart Summarizer</h2>
      
      <div className="length-selector">
        <label>Summary Length:</label>
        <select 
          value={length} 
          onChange={(e) => setLength(e.target.value)}
          className="mode-select"
        >
          <option value="short">Short (2-3 sentences)</option>
          <option value="medium">Medium</option>
          <option value="long">Long (detailed)</option>
        </select>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to summarize..."
        className="text-area"
        style={{ height: '300px' }}
      />

      <button 
        onClick={handleSummarize}
        disabled={loading || !text.trim()}
        className="button"
      >
        {loading ? 'Summarizing...' : 'Summarize Text'}
      </button>

      {error && <div className="error-message">{error}</div>}

      {summary && (
        <div className="results">
          <h3>Summary:</h3>
          <p>{summary}</p>
          
          {stats && (
            <div className="stats">
              <p><strong>Original:</strong> {stats.originalLength} characters</p>
              <p><strong>Summary:</strong> {stats.summaryLength} characters</p>
              <p><strong>Compression:</strong> {stats.compressionRatio}% reduction</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Summarizer;