// filepath: /Users/euclidstellar/Desktop/gun_quill/ai-writing-assistant/server/server.js
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Paraphrasing endpoint
app.post('/api/paraphrase', async (req, res) => {
  try {
    const { text, mode, customPrompt } = req.body;
    
    let prompt;
    switch (mode) {
      case 'Formal':
        prompt = `Rewrite the following text in a formal, professional tone while maintaining the original meaning: "${text}"`;
        break;
      case 'Academic':
        prompt = `Rewrite the following text in an academic, scholarly style with appropriate terminology: "${text}"`;
        break;
      case 'Simple':
        prompt = `Simplify the following text to make it easier to read and understand: "${text}"`;
        break;
      case 'Creative':
        prompt = `Creatively rewrite the following text with fresh, original phrasing and style: "${text}"`;
        break;
      case 'Shorten':
        prompt = `Condense the following text while retaining all main points and important information: "${text}"`;
        break;
      case 'Expand':
        prompt = `Expand the following text by adding more detail, description, and elaboration: "${text}"`;
        break;
      case 'Custom':
        prompt = `${customPrompt}: "${text}"`;
        break;
      default:
        prompt = `Paraphrase the following text: "${text}"`;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const paraphrasedText = response.text();

    res.json({ 
      success: true, 
      result: paraphrasedText,
      originalLength: text.length,
      newLength: paraphrasedText.length
    });
  } catch (error) {
    console.error('Paraphrasing error:', error);
    res.status(500).json({ success: false, error: 'Failed to paraphrase text' });
  }
});

// Summarization endpoint
app.post('/api/summarize', async (req, res) => {
  try {
    const { text, length = 'medium' } = req.body;
    
    let prompt;
    switch (length) {
      case 'short':
        prompt = `Provide a brief summary (2-3 sentences) of the following text: "${text}"`;
        break;
      case 'long':
        prompt = `Provide a detailed summary with key points and supporting details of the following text: "${text}"`;
        break;
      default:
        prompt = `Provide a concise summary of the following text: "${text}"`;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    res.json({ 
      success: true, 
      summary,
      originalLength: text.length,
      summaryLength: summary.length,
      compressionRatio: ((text.length - summary.length) / text.length * 100).toFixed(1)
    });
  } catch (error) {
    console.error('Summarization error:', error);
    res.status(500).json({ success: false, error: 'Failed to summarize text' });
  }
});

// Tone analysis endpoint
app.post('/api/analyze-tone', async (req, res) => {
  try {
    const { text } = req.body;
    
    const prompt = `Analyze the tone of the following text and provide insights about:
    1. Overall tone (formal, casual, optimistic, pessimistic, etc.)
    2. Emotional sentiment (positive, negative, neutral)
    3. Confidence level (high, medium, low)
    4. Suggestions for improvement if needed
    
    Text: "${text}"
    
    Please format your response as JSON with the following structure:
    {
      "overallTone": "description",
      "sentiment": "positive/negative/neutral",
      "confidence": "high/medium/low",
      "emotions": ["emotion1", "emotion2"],
      "suggestions": "improvement suggestions"
    }`;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();
    
    // Try to parse JSON, fallback to text if parsing fails
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch {
      analysis = {
        overallTone: analysisText,
        sentiment: "neutral",
        confidence: "medium",
        emotions: [],
        suggestions: "Analysis completed"
      };
    }

    res.json({ success: true, analysis });
  } catch (error) {
    console.error('Tone analysis error:', error);
    res.status(500).json({ success: false, error: 'Failed to analyze tone' });
  }
});

// Plagiarism check endpoint (simulated)
app.post('/api/check-plagiarism', async (req, res) => {
  try {
    const { text } = req.body;
    
    // Simulate plagiarism check (in real implementation, you'd use a dedicated service)
    const similarity = Math.random() * 15; // Random similarity percentage
    const sources = [];
    
    if (similarity > 10) {
      sources.push({
        url: "https://example.com/source1",
        similarity: similarity.toFixed(1) + "%",
        title: "Sample Source Document"
      });
    }

    res.json({
      success: true,
      similarity: similarity.toFixed(1) + "%",
      isOriginal: similarity < 10,
      sources,
      wordsChecked: text.split(' ').length
    });
  } catch (error) {
    console.error('Plagiarism check error:', error);
    res.status(500).json({ success: false, error: 'Failed to check plagiarism' });
  }
});

// AI Humanizer endpoint
app.post('/api/humanize', async (req, res) => {
  try {
    const { text } = req.body;
    
    const prompt = `Make the following AI-generated text sound more natural and human-written by:
    1. Adding natural flow and rhythm
    2. Including subtle imperfections that humans naturally have
    3. Making it more conversational and relatable
    4. Removing overly formal or robotic language
    
    Text: "${text}"`;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const humanizedText = response.text();

    res.json({ success: true, result: humanizedText });
  } catch (error) {
    console.error('Humanization error:', error);
    res.status(500).json({ success: false, error: 'Failed to humanize text' });
  }
});

// Synonym suggestions endpoint
app.post('/api/synonyms', async (req, res) => {
  try {
    const { word, context } = req.body;
    
    const prompt = `Provide 10 synonyms for the word "${word}" in the context: "${context}". 
    Return only a JSON array of synonyms, ordered by relevance.`;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const synonymsText = response.text();
    
    let synonyms;
    try {
      synonyms = JSON.parse(synonymsText);
    } catch {
      synonyms = synonymsText.split(',').map(s => s.trim()).slice(0, 10);
    }

    res.json({ success: true, synonyms });
  } catch (error) {
    console.error('Synonyms error:', error);
    res.status(500).json({ success: false, error: 'Failed to get synonyms' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});