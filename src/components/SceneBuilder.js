import React, { useState } from 'react';
import { geminiService } from '../services/geminiAPI';

const SceneBuilder = () => {
  const [sceneText, setSceneText] = useState('');
  const [sceneType, setSceneType] = useState('dialogue');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('builder');

  const sceneTypes = [
    { value: 'dialogue', label: 'Dialogue Scene' },
    { value: 'action', label: 'Action Scene' },
    { value: 'emotional', label: 'Emotional Scene' },
    { value: 'exposition', label: 'Exposition Scene' },
    { value: 'climax', label: 'Climax Scene' },
    { value: 'transition', label: 'Transition Scene' }
  ];

  const analyzeScene = async () => {
    if (!sceneText.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await geminiService.analyzeScene(sceneText, sceneType);
      if (response.success) {
        setAnalysis(response.analysis);
        setActiveTab('analysis');
      }
    } catch (error) {
      setError('Failed to analyze scene: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 80) return '#22c55e';
    if (rating >= 60) return '#eab308';
    if (rating >= 40) return '#f97316';
    return '#ef4444';
  };

  const getRatingLabel = (rating) => {
    if (rating >= 80) return 'Excellent';
    if (rating >= 60) return 'Good';
    if (rating >= 40) return 'Fair';
    return 'Needs Work';
  };

  return (
    <div className="component scene-builder">
      <h2>🎪 Interactive Scene Builder</h2>
      
      <div className="scene-tabs">
        <button 
          className={`tab-btn ${activeTab === 'builder' ? 'active' : ''}`}
          onClick={() => setActiveTab('builder')}
        >
          ✍️ Scene Builder
        </button>
        <button 
          className={`tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('analysis')}
          disabled={!analysis}
        >
          ⚡ Conflict & Tension Analysis
        </button>
      </div>

      {activeTab === 'builder' && (
        <div className="scene-builder-tab">
          <div className="scene-controls">
            <div className="scene-type-selector">
              <label>Scene Type:</label>
              <select 
                value={sceneType} 
                onChange={(e) => setSceneType(e.target.value)}
                className="mode-select"
              >
                {sceneTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="scene-guidelines">
            <h3>📋 Writing Guidelines for {sceneTypes.find(t => t.value === sceneType)?.label}</h3>
            <SceneGuidelines sceneType={sceneType} />
          </div>

          <textarea
            value={sceneText}
            onChange={(e) => setSceneText(e.target.value)}
            placeholder="Write your scene here. Focus on conflict, tension, and character development...

💡 Tips for great scenes:
• Start with clear character goals
• Create obstacles and conflicts
• Show don't tell emotions
• End with hooks or resolutions
• Use dialogue to reveal character"
            className="scene-textarea"
            style={{ height: '400px' }}
          />

          <div className="scene-footer">
            <span className="word-count">
              📊 {sceneText.split(' ').filter(w => w).length} words
            </span>
            <button 
              onClick={analyzeScene}
              disabled={loading || !sceneText.trim()}
              className="button"
            >
              {loading ? '🔄 Analyzing Scene...' : '⚡ Analyze Conflict & Tension'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'analysis' && analysis && (
        <div className="scene-analysis-tab">
          <div className="analysis-overview">
            <h3>📊 Scene Analysis Results</h3>
            
            <div className="rating-grid">
              <div className="rating-card">
                <div className="rating-circle" style={{ backgroundColor: getRatingColor(analysis.conflictLevel) }}>
                  <span className="rating-number">{analysis.conflictLevel}</span>
                </div>
                <div className="rating-info">
                  <h4>⚔️ Conflict Level</h4>
                  <p>{getRatingLabel(analysis.conflictLevel)}</p>
                </div>
              </div>

              <div className="rating-card">
                <div className="rating-circle" style={{ backgroundColor: getRatingColor(analysis.tensionRating) }}>
                  <span className="rating-number">{analysis.tensionRating}</span>
                </div>
                <div className="rating-info">
                  <h4>⚡ Tension Rating</h4>
                  <p>{getRatingLabel(analysis.tensionRating)}</p>
                </div>
              </div>

              <div className="rating-card">
                <div className="rating-circle" style={{ backgroundColor: getRatingColor(analysis.paceRating) }}>
                  <span className="rating-number">{analysis.paceRating}</span>
                </div>
                <div className="rating-info">
                  <h4>🏃 Pace Rating</h4>
                  <p>{getRatingLabel(analysis.paceRating)}</p>
                </div>
              </div>

              <div className="rating-card">
                <div className="rating-circle" style={{ backgroundColor: getRatingColor(analysis.dialogueQuality) }}>
                  <span className="rating-number">{analysis.dialogueQuality}</span>
                </div>
                <div className="rating-info">
                  <h4>💬 Dialogue Quality</h4>
                  <p>{getRatingLabel(analysis.dialogueQuality)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="analysis-details">
            <div className="analysis-section">
              <h4>⚔️ Conflict Types Detected</h4>
              <div className="conflict-types">
                {analysis.conflictTypes.map((type, index) => (
                  <span key={index} className="conflict-tag">
                    {type}
                  </span>
                ))}
              </div>
            </div>

            <div className="analysis-section">
              <h4>⚡ Tension Techniques Used</h4>
              <div className="tension-techniques">
                {analysis.tensionTechniques.map((technique, index) => (
                  <span key={index} className="technique-tag">
                    {technique}
                  </span>
                ))}
              </div>
            </div>

            <div className="strengths-improvements">
              <div className="strengths-section">
                <h4>✅ Strengths</h4>
                <ul>
                  {analysis.strengths.map((strength, index) => (
                    <li key={index} className="strength-item">✓ {strength}</li>
                  ))}
                </ul>
              </div>

              <div className="improvements-section">
                <h4>📈 Areas for Improvement</h4>
                <ul>
                  {analysis.improvements.map((improvement, index) => (
                    <li key={index} className="improvement-item">• {improvement}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="scene-suggestions">
              <h4>💡 Enhancement Suggestions</h4>
              {analysis.suggestions.map((suggestion, index) => (
                <div key={index} className="suggestion-card">
                  <div className="suggestion-type">🎯 {suggestion.type}</div>
                  <div className="suggestion-content">
                    <p><strong>Suggestion:</strong> {suggestion.description}</p>
                    <div className="suggestion-example">
                      <strong>Example:</strong> "{suggestion.example}"
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

const SceneGuidelines = ({ sceneType }) => {
  const guidelines = {
    dialogue: [
      "Focus on subtext - what characters aren't saying",
      "Use dialogue to reveal character and advance plot",
      "Create conflict through opposing goals",
      "Vary speech patterns to distinguish characters"
    ],
    action: [
      "Use short, punchy sentences to increase pace",
      "Focus on concrete, specific details",
      "Show cause and effect clearly",
      "Build tension through obstacles and stakes"
    ],
    emotional: [
      "Show emotions through actions and body language",
      "Use internal conflict to create tension",
      "Connect emotions to character motivations",
      "Balance showing vs. telling"
    ],
    exposition: [
      "Weave information naturally into action/dialogue",
      "Reveal only what's necessary for this moment",
      "Use character reactions to make info interesting",
      "Avoid info-dumping"
    ],
    climax: [
      "Bring all conflicts to a head",
      "Highest stakes and tension in your story",
      "Character makes crucial decision/action",
      "Consequences should be clear and significant"
    ],
    transition: [
      "Connect scenes smoothly",
      "Maintain story momentum",
      "Set up the next scene's conflict",
      "Use time/location changes purposefully"
    ]
  };

  return (
    <ul className="guidelines-list">
      {guidelines[sceneType]?.map((guideline, index) => (
        <li key={index}>{guideline}</li>
      ))}
    </ul>
  );
};

export default SceneBuilder;