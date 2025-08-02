import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/geminiAPI';

const ManuscriptManager = () => {
  const [chapters, setChapters] = useState([]);
  const [currentChapter, setCurrentChapter] = useState({ title: '', content: '', wordCount: 0 });
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingChapter, setEditingChapter] = useState(null);

  useEffect(() => {
    const savedChapters = localStorage.getItem('manuscript_chapters');
    if (savedChapters) {
      setChapters(JSON.parse(savedChapters));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('manuscript_chapters', JSON.stringify(chapters));
  }, [chapters]);

  const addChapter = () => {
    if (!currentChapter.title.trim() || !currentChapter.content.trim()) return;

    const newChapter = {
      id: Date.now(),
      title: currentChapter.title,
      content: currentChapter.content,
      wordCount: currentChapter.content.split(' ').filter(w => w).length,
      createdAt: new Date().toLocaleDateString(),
      status: 'draft'
    };

    setChapters(prev => [...prev, newChapter]);
    setCurrentChapter({ title: '', content: '', wordCount: 0 });
  };

  const updateChapter = (id, updatedChapter) => {
    setChapters(prev => prev.map(chapter => 
      chapter.id === id 
        ? { ...chapter, ...updatedChapter, wordCount: updatedChapter.content.split(' ').filter(w => w).length }
        : chapter
    ));
    setEditingChapter(null);
  };

  const deleteChapter = (id) => {
    setChapters(prev => prev.filter(chapter => chapter.id !== id));
  };

  const analyzeManuscript = async () => {
    if (chapters.length === 0) return;

    setLoading(true);
    setError('');

    try {
      const chapterData = chapters.map(ch => ({
        title: ch.title,
        wordCount: ch.wordCount,
        content: ch.content.substring(0, 500) // First 500 chars for analysis
      }));

      const response = await geminiService.analyzeManuscript(chapterData);
      if (response.success) {
        setAnalysis(response.analysis);
      }
    } catch (error) {
      setError('Failed to analyze manuscript: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (content) => {
    setCurrentChapter(prev => ({
      ...prev,
      content,
      wordCount: content.split(' ').filter(w => w).length
    }));
  };

  const totalWordCount = chapters.reduce((total, chapter) => total + chapter.wordCount, 0);
  const averageChapterLength = chapters.length > 0 ? Math.round(totalWordCount / chapters.length) : 0;

  return (
    <div className="component manuscript-manager">
      <h2>📖 Manuscript Manager</h2>
      
      <div className="manuscript-stats">
        <div className="stat-card">
          <h3>{chapters.length}</h3>
          <p>Chapters</p>
        </div>
        <div className="stat-card">
          <h3>{totalWordCount.toLocaleString()}</h3>
          <p>Total Words</p>
        </div>
        <div className="stat-card">
          <h3>{averageChapterLength}</h3>
          <p>Avg. Chapter Length</p>
        </div>
        <div className="stat-card">
          <h3>{Math.round(totalWordCount / 250)}</h3>
          <p>Estimated Pages</p>
        </div>
      </div>

      <div className="chapter-input-section">
        <h3>Add New Chapter</h3>
        <input
          type="text"
          value={currentChapter.title}
          onChange={(e) => setCurrentChapter(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Chapter title..."
          className="chapter-title-input"
        />
        
        <textarea
          value={currentChapter.content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Write your chapter content here..."
          className="chapter-content-input"
          style={{ height: '300px' }}
        />
        
        <div className="chapter-input-footer">
          <span className="word-count">{currentChapter.wordCount} words</span>
          <button 
            onClick={addChapter}
            disabled={!currentChapter.title.trim() || !currentChapter.content.trim()}
            className="button"
          >
            Add Chapter
          </button>
        </div>
      </div>

      <div className="chapters-list">
        <div className="chapters-header">
          <h3>Chapters ({chapters.length})</h3>
          <button 
            onClick={analyzeManuscript}
            disabled={loading || chapters.length === 0}
            className="button secondary"
          >
            {loading ? 'Analyzing...' : 'Analyze Manuscript'}
          </button>
        </div>

        {chapters.map((chapter, index) => (
          <div key={chapter.id} className="chapter-item">
            {editingChapter === chapter.id ? (
              <ChapterEditor 
                chapter={chapter}
                onSave={(updated) => updateChapter(chapter.id, updated)}
                onCancel={() => setEditingChapter(null)}
              />
            ) : (
              <ChapterDisplay
                chapter={chapter}
                index={index}
                onEdit={() => setEditingChapter(chapter.id)}
                onDelete={() => deleteChapter(chapter.id)}
              />
            )}
          </div>
        ))}
      </div>

      {error && <div className="error-message">{error}</div>}

      {analysis && (
        <div className="manuscript-analysis">
          <h3>Manuscript Analysis</h3>
          
          <div className="analysis-overview">
            <div className="progress-circle">
              <span className="progress-number">{analysis.overallProgress}%</span>
              <span className="progress-label">Overall Progress</span>
            </div>
            
            <div className="readability-score">
              <span className="score-number">{analysis.readabilityScore}</span>
              <span className="score-label">Readability Score</span>
            </div>
          </div>

          <div className="analysis-details">
            <div className="analysis-section">
              <h4>Pacing Analysis</h4>
              <p>{analysis.paceAnalysis}</p>
            </div>

            {analysis.consistencyIssues.length > 0 && (
              <div className="analysis-section">
                <h4>Consistency Issues</h4>
                <ul>
                  {analysis.consistencyIssues.map((issue, index) => (
                    <li key={index} className="issue-item">{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="analysis-section">
              <h4>Suggestions</h4>
              <ul>
                {analysis.suggestions.map((suggestion, index) => (
                  <li key={index} className="suggestion-item">{suggestion}</li>
                ))}
              </ul>
            </div>

            {analysis.chapterInsights.length > 0 && (
              <div className="chapter-insights">
                <h4>Chapter Insights</h4>
                {analysis.chapterInsights.map((insight, index) => (
                  <div key={index} className="insight-card">
                    <h5>Chapter {insight.chapterNumber}</h5>
                    <div className="insight-details">
                      <div className="strengths">
                        <strong>Strengths:</strong>
                        <ul>
                          {insight.strengths.map((strength, idx) => (
                            <li key={idx}>{strength}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="improvements">
                        <strong>Improvements:</strong>
                        <ul>
                          {insight.improvements.map((improvement, idx) => (
                            <li key={idx}>{improvement}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="pace-rating">
                        <strong>Pace:</strong> {insight.paceRating}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ChapterDisplay = ({ chapter, index, onEdit, onDelete }) => (
  <div className="chapter-display">
    <div className="chapter-header">
      <h4>Chapter {index + 1}: {chapter.title}</h4>
      <div className="chapter-actions">
        <button onClick={onEdit} className="edit-btn">Edit</button>
        <button onClick={onDelete} className="delete-btn">Delete</button>
      </div>
    </div>
    
    <div className="chapter-meta">
      <span className="word-count">{chapter.wordCount} words</span>
      <span className="created-date">{chapter.createdAt}</span>
      <span className={`status ${chapter.status}`}>{chapter.status}</span>
    </div>
    
    <div className="chapter-preview">
      {chapter.content.substring(0, 200)}...
    </div>
  </div>
);

const ChapterEditor = ({ chapter, onSave, onCancel }) => {
  const [title, setTitle] = useState(chapter.title);
  const [content, setContent] = useState(chapter.content);
  const [status, setStatus] = useState(chapter.status);

  const handleSave = () => {
    onSave({ title, content, status });
  };

  return (
    <div className="chapter-editor">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="chapter-title-input"
      />
      
      <select 
        value={status} 
        onChange={(e) => setStatus(e.target.value)}
        className="status-select"
      >
        <option value="draft">Draft</option>
        <option value="review">In Review</option>
        <option value="final">Final</option>
      </select>
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="chapter-content-input"
        style={{ height: '200px' }}
      />
      
      <div className="editor-actions">
        <button onClick={handleSave} className="button">Save</button>
        <button onClick={onCancel} className="button secondary">Cancel</button>
      </div>
    </div>
  );
};

export default ManuscriptManager;