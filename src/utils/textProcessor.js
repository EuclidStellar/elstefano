const cleanText = (text) => {
    return text.trim().replace(/\s+/g, ' ');
};

const formatTextForAPI = (text) => {
    const cleanedText = cleanText(text);
    return {
        input: cleanedText,
        length: cleanedText.length,
    };
};

const extractKeywords = (text) => {
    const words = text.split(/\s+/);
    const wordCount = {};
    
    words.forEach(word => {
        word = word.toLowerCase();
        wordCount[word] = (wordCount[word] || 0) + 1;
    });

    return Object.entries(wordCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
};

export { cleanText, formatTextForAPI, extractKeywords };