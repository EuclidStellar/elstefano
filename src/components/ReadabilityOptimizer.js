import React, { useState } from 'react';
import { geminiService } from '../services/geminiAPI';

const ReadabilityOptimizer = () => {
  const [text, setText] = useState('');
  const [targetAudience, setTargetAudience] = useState('general-adult');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('optimizer');

  const audiences = [
    { value: 'elementary', label: 'Elementary (Ages 6-11)', gradeLevel: '3rd-5th Grade' },
    { value: 'middle-school', label: 'Middle School (Ages 11-14)', gradeLevel: '6th-8th Grade' },
    { value: 'high-school', label: 'High School (Ages 14-18)', gradeLevel: '9th-12th Grade' },
    { value: 'general-adult', label: 'General Adult', gradeLevel: '8th-10th Grade' },
    { value: 'college', label: 'College Level', gradeLevel: '13th-16th Grade' },
    { value: 'academic', label: 'Academic/Professional', gradeLevel: 'Graduate Level' },
    { value: 'young-adult', label: 'Young Adult Fiction', gradeLevel: '7th-9th Grade' },
    { value: 'literary', label: 'Literary Fiction', gradeLevel: '10th+ Grade' }
  ];

  const analyzeReadability = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await geminiService.analyzeReadability(text, targetAudience);
      if (response.success) {
        setAnalysis(response.analysis);
        setActiveTab('results');
      }
    } catch (error) {
      setError('Failed to analyze readability: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#eab308';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const useOptimizedVersion = () => {
    setText(analysis.optimizedVersion);
    setAnalysis(null);
    setActiveTab('optimizer');
  };

  return (
    <div className="component readability-optimizer">
      <h2>📊 Readability Optimizer</h2>
      
      <div className="readability-tabs">
        <button 
          className={`tab-btn ${activeTab === 'optimizer' ? 'active' : ''}`}
          onClick={() => setActiveTab('optimizer')}
        >
          ✍️ Text Optimizer
        </button>
        <button 
          className={`tab-btn ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => setActiveTab('results')}
          disabled={!analysis}
        >
          📊 Readability Analysis
        </button>
      </div>

      {activeTab === 'optimizer' && (
        <div className="optimizer-tab">
          <div className="audience-selector">
            <label>🎯 Target Audience:</label>
            <select 
              value={targetAudience} 
              onChange={(e) => setTargetAudience(e.target.value)}
              className="mode-select"
            >
              {audiences.map(audience => (
                <option key={audience.value} value={audience.value}>
                  {audience.label} ({audience.gradeLevel})
                </option>
              ))}
            </select>
          </div>

          <div className="audience-info">
            <h3>📚 Writing for: {audiences.find(a => a.value === targetAudience)?.label}</h3>
            <ReadabilityGuidelines audience={targetAudience} />
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your text here for readability analysis and optimization...

💡 Tips for better readability:
• Use shorter sentences for younger audiences
• Choose simpler words when possible
• Break up long paragraphs
• Use active voice over passive voice
• Include transition words for flow"
            className="text-area readability-textarea"
            style={{ height: '350px' }}
          />

          <div className="text-stats">
            <div className="stat-item">
              <span className="stat-number">{text.split(' ').filter(w => w).length}</span>
              <span className="stat-label">Words</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{text.split('.').filter(s => s.trim()).length}</span>
              <span className="stat-label">Sentences</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{text.length}</span>
              <span className="stat-label">Characters</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {text.split(' ').filter(w => w).length > 0 
                  ? Math.round(text.split(' ').filter(w => w).length / text.split('.').filter(s => s.trim()).length * 10) / 10
                  : 0}
              </span>
              <span className="stat-label">Avg Words/Sentence</span>
            </div>
          </div>

          <button 
            onClick={analyzeReadability}
            disabled={loading || !text.trim()}
            className="button"
          >
            {loading ? '🔄 Analyzing Readability...' : '🚀 Analyze & Optimize'}
          </button>
        </div>
      )}

      {activeTab === 'results' && analysis && (
        <div className="results-tab">
          <div className="readability-overview">
            <div className="score-section">
              <div className="main-score">
                <div 
                  className="score-circle-large"
                  style={{ backgroundColor: getScoreColor(analysis.readabilityScore) }}
                >
                  <span className="score-number">{analysis.readabilityScore}</span>
                  <span className="score-label">Readability Score</span>
                </div>
                <div className="score-details">
                  <p className="grade-level">📊 Grade Level: {analysis.gradeLevel}</p>
                  <p className={`target-match ${analysis.targetMatch ? 'match' : 'no-match'}`}>
                    {analysis.targetMatch ? '✅ Matches target audience' : '⚠️ Does not match target audience'}
                  </p>
                </div>
              </div>

              <div className="component-scores">
                <div className="component-score">
                  <h4>Word Complexity</h4>
                  <span className={`status ${analysis.wordComplexity}`}>{analysis.wordComplexity}</span>
                </div>
                <div className="component-score">
                  <h4>Sentence Length</h4>
                  <span className={`status ${analysis.sentenceLength}`}>{analysis.sentenceLength}</span>
                </div>
                <div className="component-score">
                  <h4>Vocabulary Level</h4>
                  <span className={`status ${analysis.vocabularyLevel}`}>{analysis.vocabularyLevel}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="analysis-sections">
            <div className="strengths-section">
              <h3>✅ Strengths</h3>
              <ul>
                {analysis.strengths.map((strength, index) => (
                  <li key={index} className="strength-item">
                    <span className="strength-icon">✓</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            <div className="improvements-section">
              <h3>📈 Areas for Improvement</h3>
              {analysis.improvements.map((improvement, index) => (
                <div key={index} className="improvement-card">
                  <div className="improvement-header">
                    <h4>⚠️ Issue: {improvement.issue}</h4>
                  </div>
                  <div className="improvement-content">
                    <p><strong>💡 Suggestion:</strong> {improvement.suggestion}</p>
                    <div className="improvement-example">
                      <strong>📝 Example:</strong> {improvement.example}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="optimized-version">
              <h3>✨ Optimized Version</h3>
              <div className="optimized-text">
                {analysis.optimizedVersion}
              </div>
              <div className="optimized-actions">
                <button 
                  onClick={useOptimizedVersion}
                  className="button"
                >
                  🔄 Use Optimized Version
                </button>
                <button 
                  onClick={() => navigator.clipboard.writeText(analysis.optimizedVersion)}
                  className="button secondary"
                >
                  📋 Copy to Clipboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

const ReadabilityGuidelines = ({ audience }) => {
  const guidelines = {
    'elementary': [
      "Use simple, common words",
      "Keep sentences short (8-12 words)",
      "Use active voice",
      "Avoid complex concepts without explanation"
    ],
    'middle-school': [
      "Mix simple and moderate vocabulary",
      "Average 12-15 words per sentence",
      "Use clear transitions",
      "Explain technical terms"
    ],
    'high-school': [
      "Use varied vocabulary appropriately",
      "Sentences can be 15-20 words",
      "Include some complex sentences",
      "Assume basic background knowledge"
    ],
    'general-adult': [
      "Use clear, concise language",
      "Average 15-20 words per sentence",
      "Avoid unnecessary jargon",
      "Balance simple and complex sentences"
    ],
    'college': [
      "Use sophisticated vocabulary when appropriate",
      "Sentences can be 20+ words",
      "Include complex ideas and relationships",
      "Assume educated background"
    ],
    'academic': [
      "Use precise, technical language",
      "Complex sentence structures acceptable",
      "Include specialized terminology",
      "Assume expert knowledge"
    ],
    'young-adult': [
      "Use contemporary, relatable language",
      "Mix sentence lengths for flow",
      "Avoid overly complex concepts",
      "Keep language engaging and accessible"
    ],
    'literary': [
      "Use rich, varied vocabulary",
      "Experiment with sentence structure",
      "Include sophisticated themes",
      "Assume well-read audience"
    ]
  };

  return (
    <div className="guidelines-section">
      <h4>📋 Guidelines for this audience:</h4>
      <ul className="guidelines-list">
        {guidelines[audience]?.map((guideline, index) => (
          <li key={index}>{guideline}</li>
        ))}
      </ul>
    </div>
  );
};

export default ReadabilityOptimizer;