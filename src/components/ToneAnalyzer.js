import React, { useState } from 'react';
import { geminiService } from '../services/geminiAPI';

const ToneAnalyzer = () => {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await geminiService.analyzeTone(text);
      if (response.success) {
        setAnalysis(response.analysis);
      }
    } catch (error) {
      setError('Failed to analyze tone: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getToneColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return '#22c55e';
      case 'negative': return '#ef4444';
      default: return '#667eea';
    }
  };

  return (
    <div className="component">
      <h2>🎭 Tone Analyzer</h2>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to analyze tone..."
        className="text-area"
      />

      <button 
        onClick={handleAnalyze}
        disabled={loading || !text.trim()}
        className="button"
      >
        {loading ? 'Analyzing...' : 'Analyze Tone'}
      </button>

      {error && <div className="error-message">{error}</div>}

      {analysis && (
        <div className="results">
          <h3>Tone Analysis Results:</h3>
          
          <div className="tone-details">
            <div className="tone-item">
              <strong>Overall Tone:</strong>
              <span>{analysis.overallTone}</span>
            </div>
            
            <div className="tone-item">
              <strong>Sentiment:</strong>
              <span 
                style={{ 
                  color: getToneColor(analysis.sentiment),
                  fontWeight: 'bold'
                }}
              >
                {analysis.sentiment?.toUpperCase()}
              </span>
            </div>
            
            <div className="tone-item">
              <strong>Confidence Level:</strong>
              <span>{analysis.confidence}</span>
            </div>
            
            {analysis.emotions && analysis.emotions.length > 0 && (
              <div className="tone-item">
                <strong>Detected Emotions:</strong>
                <span>{analysis.emotions.join(', ')}</span>
              </div>
            )}
            
            {analysis.suggestions && (
              <div className="tone-item">
                <strong>Suggestions:</strong>
                <p>{analysis.suggestions}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ToneAnalyzer;