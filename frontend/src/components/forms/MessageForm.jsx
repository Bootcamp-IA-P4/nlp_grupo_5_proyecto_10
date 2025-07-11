// frontend/src/components/forms/MessageForm.jsx
import React, { useState } from "react";
import { analyzeAndSaveMessage } from "../../services/messageService";
import ConfidenceStars from "../common/ConfidenceStars";

export default function MessageForm({ onSuccess }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const savedMessage = await analyzeAndSaveMessage(text);
      setResult(savedMessage);
      setText("");
      if (onSuccess) onSuccess(savedMessage);
    } catch (err) {
      setError("Failed to analyze and save message.");
    } finally {
      setLoading(false);
    }
  };

  const getSentimentLabel = (sentiment) => {
    return sentiment === "not toxic" ? "Not Toxic" : "Toxic";
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
        className="bg-purple-600 text-white rounded py-2 disabled:opacity-50 hover:bg-purple-700 transition"
        disabled={loading}
      >
        {loading ? "Analyzing..." : "Submit"}
      </button>

      {error && <p className="text-red-500">{error}</p>}

      {result && (
        <div className="mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-900 text-green-900 dark:text-green-200 border border-green-200 dark:border-green-700">
          <div className="space-y-3">
            <p>
              <strong>Message:</strong> {result.text}
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p>
                  <strong>Sentiment:</strong>
                  <span
                    className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                      result.sentiment === "not toxic"
                        ? "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200"
                        : "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200"
                    }`}
                  >
                    {getSentimentLabel(result.sentiment)}
                  </span>
                </p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-sm font-medium mb-2">Confidence Rating:</p>
                <ConfidenceStars
                  sentiment={result.sentiment}
                  confidence={result.confidence}
                />
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>ID:</strong> {result.id}
            </p>
          </div>
        </div>
      )}
    </form>
  );
}
