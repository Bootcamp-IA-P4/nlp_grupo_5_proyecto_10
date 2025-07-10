// frontend/src/components/forms/MessageForm.jsx
import React, { useState } from 'react';
import { analyzeAndSaveMessage } from '../../services/messageService';

export default function MessageForm({ onSuccess }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const savedMessage = await analyzeAndSaveMessage(text);
      setResult(savedMessage);
      setText('');
      if (onSuccess) onSuccess(savedMessage);
    } catch (err) {
      setError('Failed to analyze and save message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white dark:bg-gray-800 rounded p-4 shadow">
      <textarea
        className="border rounded p-2 resize-none dark:bg-gray-900 dark:text-gray-100"
        placeholder="Enter message text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        required
        disabled={loading}
      />
      <button
        type="submit"
        className="bg-purple-600 text-white rounded py-2 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Analyzing...' : 'Submit'}
      </button>

      {error && <p className="text-red-500">{error}</p>}

      {result && (
        <div className="mt-4 p-2 bg-green-100 dark:bg-green-800 rounded text-gray-800 dark:text-green-200">
          <p><strong>Message:</strong> {result.text}</p>
          <p><strong>Toxicity:</strong> {result.toxicity}%</p>
          <p><strong>Timestamp:</strong> {new Date(result.timestamp).toLocaleString()}</p>
        </div>
      )}
    </form>
  );
}
