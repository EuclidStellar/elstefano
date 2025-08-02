import React, { useState } from 'react';
import { geminiService } from '../services/geminiAPI';

const GrammarChecker = () => {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkLevel, setCheckLevel] = useState('comprehensive');

  const checkLevels = [
    { value: 'basic', label: 'Basic (Grammar only)' },
    { value: 'standard', label: 'Standard (Grammar + Style)' },
    { value: 'comprehensive', label: 'Comprehensive (All issues)' },
    { value: 'literary', label: 'Literary (Creative writing focus)' }
  ];

  const handleGrammarCheck = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await geminiService.checkGrammarAdvanced(text, checkLevel);
      if (response.success) {
        setAnalysis(response.analysis);
      }
    } catch (error) {
      setError('Failed to check grammar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = (originalText, suggestion) => {
    const newText = text.replace(originalText, suggestion);
    setText(newText);
    // Re-run analysis after applying suggestion
    handleGrammarCheck();
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'major': return '#f97316';
      case 'minor': return '#eab308';
      default: return '#6b7280';
    }
  };

  return (
    <div className="component grammar-checker">
      <h2>📝 Advanced Grammar & Style Checker</h2>
      
      <div className="check-controls">
        <div className="level-selector">
          <label>Analysis Level:</label>
          <select 
            value={checkLevel} 
            onChange={(e) => setCheckLevel(e.target.value)}
            className="mode-select"
          >
            {checkLevels.map(level => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your text here for comprehensive grammar and style analysis..."
        className="text-area grammar-textarea"
        style={{ height: '400px' }}
      />

      <button 
        onClick={handleGrammarCheck}
        disabled={loading || !text.trim()}
        className="button"
      >
        {loading ? 'Analyzing...' : 'Check Grammar & Style'}
      </button>

      {error && <div className="error-message">{error}</div>}

      {analysis && (
        <div className="grammar-results">
          <div className="analysis-summary">
            <div className="score-card">
              <h3>Grammar Score: {analysis.overallScore}/100</h3>
              <div className="score-bar">
                <div 
                  className="score-fill" 
                  style={{ width: `${analysis.overallScore}%` }}
                ></div>
              </div>
            </div>
            
            <div className="issue-counts">
              <span className="issue-count critical">
                Critical: {analysis.issues.filter(i => i.severity === 'critical').length}
              </span>
              <span className="issue-count major">
                Major: {analysis.issues.filter(i => i.severity === 'major').length}
              </span>
              <span className="issue-count minor">
                Minor: {analysis.issues.filter(i => i.severity === 'minor').length}
              </span>
            </div>
          </div>

          <div className="issues-list">
            <h3>Issues Found:</h3>
            {analysis.issues.map((issue, index) => (
              <div key={index} className={`issue-item ${issue.severity}`}>
                <div className="issue-header">
                  <span 
                    className="severity-badge"
                    style={{ backgroundColor: getSeverityColor(issue.severity) }}
                  >
                    {issue.severity.toUpperCase()}
                  </span>
                  <span className="issue-type">{issue.type}</span>
                </div>
                
                <div className="issue-content">
                  <p className="issue-text">
                    <strong>Found:</strong> "{issue.originalText}"
                  </p>
                  <p className="issue-description">{issue.description}</p>
                  
                  {issue.suggestion && (
                    <div className="suggestion">
                      <p><strong>Suggested:</strong> "{issue.suggestion}"</p>
                      <button 
                        onClick={() => applySuggestion(issue.originalText, issue.suggestion)}
                        className="button small apply-btn"
                      >
                        Apply Fix
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="style-insights">
            <h3>Style Insights:</h3>
            <div className="insights-grid">
              <div className="insight-item">
                <strong>Readability:</strong> {analysis.readability}
              </div>
              <div className="insight-item">
                <strong>Sentence Variety:</strong> {analysis.sentenceVariety}
              </div>
              <div className="insight-item">
                <strong>Vocabulary Level:</strong> {analysis.vocabularyLevel}
              </div>
              <div className="insight-item">
                <strong>Passive Voice:</strong> {analysis.passiveVoiceUsage}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrammarChecker;