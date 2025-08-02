import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiAPI';
import ApiKeyModal from './ApiKeyModal';

const MainEditor = () => {
  const [text, setText] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [synonyms, setSynonyms] = useState([]);
  const [showSynonyms, setShowSynonyms] = useState(false);
  const [synonymPosition, setSynonymPosition] = useState({ x: 0, y: 0 });
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const [frozenWords, setFrozenWords] = useState(new Set());
  const [compareMode, setCompareMode] = useState(false);
  const [compareResults, setCompareResults] = useState([]);
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiKeySet, setApiKeySet] = useState(false);
  const [error, setError] = useState('');
  
  const textareaRef = useRef(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      geminiService.setApiKey(savedKey);
      setApiKeySet(true);
    } else {
      setShowApiModal(true);
    }
  }, []);

  const handleApiKeySet = (apiKey) => {
    geminiService.setApiKey(apiKey);
    setApiKeySet(true);
    setShowApiModal(false);
  };

  const handleTextSelection = async () => {
    if (!apiKeySet) {
      setShowApiModal(true);
      return;
    }

    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (selectedText && selectedText.length > 0) {
      setSelectedText(selectedText);
      
      // Get word synonyms if single word selected
      if (selectedText.split(' ').length === 1) {
        try {
          const response = await geminiService.getSynonyms(selectedText, text);
          if (response.success) {
            setSynonyms(response.synonyms);
            
            // Position synonym popup near selection
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setSynonymPosition({
              x: rect.left,
              y: rect.bottom + window.scrollY
            });
            setShowSynonyms(true);
          }
        } catch (error) {
          setError('Failed to get synonyms: ' + error.message);
        }
      }
    } else {
      setShowSynonyms(false);
    }
  };

  const replaceSynonym = (synonym) => {
    const newText = text.replace(selectedText, synonym);
    setText(newText);
    setShowSynonyms(false);
  };

  const freezeWord = (word) => {
    const newFrozenWords = new Set(frozenWords);
    if (newFrozenWords.has(word)) {
      newFrozenWords.delete(word);
    } else {
      newFrozenWords.add(word);
    }
    setFrozenWords(newFrozenWords);
  };

  const handleParaphrase = async (mode, customPrompt = '') => {
    if (!apiKeySet) {
      setShowApiModal(true);
      return;
    }

    if (!text.trim()) return;
    
    setLoading(prev => ({ ...prev, [mode]: true }));
    setError('');
    
    try {
      // Protect frozen words
      let processedText = text;
      frozenWords.forEach(word => {
        processedText = processedText.replace(new RegExp(`\\b${word}\\b`, 'gi'), `[FROZEN]${word}[/FROZEN]`);
      });

      const response = await geminiService.paraphraseText(processedText, mode, customPrompt);
      if (response.success) {
        let result = response.result;
        // Restore frozen words
        frozenWords.forEach(word => {
          result = result.replace(new RegExp(`\\[FROZEN\\]${word}\\[/FROZEN\\]`, 'gi'), word);
        });

        if (compareMode) {
          setCompareResults(prev => [...prev, { mode, result, original: text }]);
        } else {
          setResults(prev => ({ ...prev, [mode]: result }));
        }
      }
    } catch (error) {
      setError('Paraphrasing failed: ' + error.message);
    } finally {
      setLoading(prev => ({ ...prev, [mode]: false }));
    }
  };

  const handleSummarize = async (length = 'medium') => {
    if (!apiKeySet) {
      setShowApiModal(true);
      return;
    }

    if (!text.trim()) return;
    
    setLoading(prev => ({ ...prev, summarize: true }));
    setError('');
    
    try {
      const response = await geminiService.summarizeText(text, length);
      if (response.success) {
        setResults(prev => ({ ...prev, summary: response.summary }));
      }
    } catch (error) {
      setError('Summarization failed: ' + error.message);
    } finally {
      setLoading(prev => ({ ...prev, summarize: false }));
    }
  };

  const handleToneAnalysis = async () => {
    if (!apiKeySet) {
      setShowApiModal(true);
      return;
    }

    if (!text.trim()) return;
    
    setLoading(prev => ({ ...prev, tone: true }));
    setError('');
    
    try {
      const response = await geminiService.analyzeTone(text);
      if (response.success) {
        setResults(prev => ({ ...prev, toneAnalysis: response.analysis }));
      }
    } catch (error) {
      setError('Tone analysis failed: ' + error.message);
    } finally {
      setLoading(prev => ({ ...prev, tone: false }));
    }
  };

  const handleHumanize = async () => {
    if (!apiKeySet) {
      setShowApiModal(true);
      return;
    }

    if (!text.trim()) return;
    
    setLoading(prev => ({ ...prev, humanize: true }));
    setError('');
    
    try {
      const response = await geminiService.humanizeText(text);
      if (response.success) {
        setResults(prev => ({ ...prev, humanized: response.result }));
      }
    } catch (error) {
      setError('Humanization failed: ' + error.message);
    } finally {
      setLoading(prev => ({ ...prev, humanize: false }));
    }
  };

  const paraphraseModes = ['Formal', 'Academic', 'Simple', 'Creative', 'Shorten', 'Expand'];

  return (
    <div className="main-editor">
      <ApiKeyModal isOpen={showApiModal} onApiKeySet={handleApiKeySet} />
      
      <div className="editor-header">
        <h1>✍️ QuillBot Flow - All-in-One Writing Space</h1>
        <div className="editor-controls">
          <button 
            className={`compare-btn ${compareMode ? 'active' : ''}`}
            onClick={() => setCompareMode(!compareMode)}
          >
            📊 Compare Modes
          </button>
          <button 
            className="api-key-btn"
            onClick={() => setShowApiModal(true)}
          >
            🔑 API Key
          </button>
          <span className="word-count">{text.split(' ').filter(w => w).length} words</span>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="editor-container">
        <div className="input-section">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onMouseUp={handleTextSelection}
            placeholder="Start writing your masterpiece here... ✨

💡 Tips:
• Select words to get synonyms
• Use the tools panel to enhance your writing
• Try different paraphrasing modes for various styles
• Enable compare mode to see multiple versions"
            className="main-textarea"
          />
          
          {frozenWords.size > 0 && (
            <div className="frozen-words">
              <h4>🧊 Frozen Words (Protected from changes):</h4>
              <div>
                {Array.from(frozenWords).map(word => (
                  <span key={word} className="frozen-word" onClick={() => freezeWord(word)}>
                    {word} ×
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="tools-section">
          <div className="tool-group">
            <h3>🎨 Paraphrasing Modes</h3>
            <div className="mode-buttons">
              {paraphraseModes.map(mode => (
                <button
                  key={mode}
                  onClick={() => handleParaphrase(mode)}
                  disabled={loading[mode] || !apiKeySet}
                  className="mode-btn"
                >
                  <span style={{ marginRight: '0.5rem' }}>
                    {mode === 'Formal' && '👔'}
                    {mode === 'Academic' && '🎓'}
                    {mode === 'Simple' && '💡'}
                    {mode === 'Creative' && '🎨'}
                    {mode === 'Shorten' && '📝'}
                    {mode === 'Expand' && '📖'}
                  </span>
                  {loading[mode] ? 'Processing...' : mode}
                </button>
              ))}
            </div>
          </div>

          <div className="tool-group">
            <h3>🔍 Analysis Tools</h3>
            <div className="analysis-buttons">
              <button onClick={handleToneAnalysis} disabled={loading.tone || !apiKeySet}>
                <span style={{ marginRight: '0.5rem' }}>🎭</span>
                {loading.tone ? 'Analyzing...' : 'Tone Insights'}
              </button>
              <button onClick={handleSummarize} disabled={loading.summarize || !apiKeySet}>
                <span style={{ marginRight: '0.5rem' }}>📄</span>
                {loading.summarize ? 'Summarizing...' : 'Summarize'}
              </button>
              <button onClick={handleHumanize} disabled={loading.humanize || !apiKeySet}>
                <span style={{ marginRight: '0.5rem' }}>🤖</span>
                {loading.humanize ? 'Humanizing...' : 'AI Humanizer'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showSynonyms && (
        <div 
          className="synonym-popup"
          style={{
            position: 'absolute',
            left: synonymPosition.x,
            top: synonymPosition.y,
            zIndex: 1000
          }}
        >
          <h4>💭 Synonyms for "{selectedText}"</h4>
          <div className="synonym-list">
            {synonyms.map((synonym, index) => (
              <button
                key={index}
                onClick={() => replaceSynonym(synonym)}
                className="synonym-option"
              >
                {synonym}
              </button>
            ))}
          </div>
          <button onClick={() => freezeWord(selectedText)} className="freeze-btn">
            {frozenWords.has(selectedText) ? '🔓 Unfreeze' : '🧊 Freeze'} Word
          </button>
        </div>
      )}

      <div className="results-section">
        {compareMode && compareResults.length > 0 && (
          <div className="compare-results">
            <h3>📊 Mode Comparison</h3>
            <div className="compare-grid">
              {compareResults.map((result, index) => (
                <div key={index} className="compare-item">
                  <h4>{result.mode}</h4>
                  <p>{result.result}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {Object.entries(results).map(([key, value]) => (
          <div key={key} className="result-item">
            <h3>
              {key === 'toneAnalysis' && '🎭 '}
              {key === 'summary' && '📄 '}
              {key === 'humanized' && '🤖 '}
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </h3>
            {key === 'toneAnalysis' ? (
              <div className="tone-results">
                <p><strong>Overall Tone:</strong> {value.overallTone}</p>
                <p><strong>Sentiment:</strong> {value.sentiment}</p>
                <p><strong>Confidence:</strong> {value.confidence}</p>
                {value.emotions?.length > 0 && (
                  <p><strong>Emotions:</strong> {value.emotions.join(', ')}</p>
                )}
                <p><strong>Suggestions:</strong> {value.suggestions}</p>
              </div>
            ) : (
              <p>{value}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MainEditor;