import React, { useState, useEffect } from "react";

const ToxicWordsChart = ({ messages }) => {
  const [wordFreq, setWordFreq] = useState([]);

  useEffect(() => {
    if (!messages.length) return;

    // Extract words from toxic messages
    const toxicMessages = messages.filter((msg) => msg.sentiment === "toxic");
    const wordCount = {};

    // Common stop words to exclude
    const stopWords = new Set([
      "the",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should",
      "can",
      "may",
      "might",
      "must",
      "shall",
      "this",
      "that",
      "these",
      "those",
      "i",
      "you",
      "he",
      "she",
      "it",
      "we",
      "they",
      "me",
      "him",
      "her",
      "us",
      "them",
      "my",
      "your",
      "his",
      "her",
      "its",
      "our",
      "their",
      "a",
      "an",
    ]);

    toxicMessages.forEach((msg) => {
      const words = msg.text.toLowerCase().split(/\W+/);
      words.forEach((word) => {
        if (word.length > 2 && !stopWords.has(word)) {
          wordCount[word] = (wordCount[word] || 0) + 1;
        }
      });
    });

    // Sort by frequency and take top 10
    const sortedWords = Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

    setWordFreq(sortedWords);
  }, [messages]);

  const maxCount = Math.max(...wordFreq.map((w) => w.count), 1);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
        Most Frequent Words in Toxic Messages
      </h3>

      {wordFreq.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          No toxic messages to analyze
        </div>
      ) : (
        <div className="space-y-2">
          {wordFreq.map((item, index) => (
            <div key={item.word} className="flex items-center space-x-3">
              <div className="w-8 text-sm text-gray-500 dark:text-gray-400 font-mono">
                #{index + 1}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.word}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {item.count} times
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ToxicWordsChart;
