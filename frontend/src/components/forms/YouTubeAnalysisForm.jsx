import React, { useState } from "react";
import axios from "axios";
import ConfidenceStars from "../common/ConfidenceStars";

const YouTubeAnalysisForm = ({ onAnalysisComplete, onRefreshMessages }) => {
  const [url, setUrl] = useState("");
  const [maxComments, setMaxComments] = useState(50);
  const [saveToDatabase, setSaveToDatabase] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await axios.post(
        "http://localhost:8000/youtube-analyze",
        {
          url: url,
          max_comments: maxComments,
          save_to_database: saveToDatabase,
        }
      );

      if (response.data.success) {
        setResult(response.data);
        if (onAnalysisComplete) {
          onAnalysisComplete(response.data);
        }
        if (saveToDatabase && onRefreshMessages) {
          onRefreshMessages();
        }
      } else {
        setError(response.data.error || "Failed to analyze comments");
      }
    } catch (err) {
      setError(
        err.response?.data?.detail || "Error analyzing YouTube comments"
      );
      console.error("YouTube analysis error:", err);
    } finally {
      setLoading(false);
    }
  };

  const validateYouTubeURL = (url) => {
    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/;
    return youtubeRegex.test(url);
  };

  const isValidURL = validateYouTubeURL(url);

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            YouTube Video URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
            disabled={loading}
          />
          {url && !isValidURL && (
            <p className="text-red-500 text-sm mt-1">
              Please enter a valid YouTube URL
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Comments
            </label>
            <select
              value={maxComments}
              onChange={(e) => setMaxComments(Number(e.target.value))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              disabled={loading}
            >
              <option value={25}>25 comments</option>
              <option value={50}>50 comments</option>
              <option value={100}>100 comments</option>
              <option value={200}>200 comments</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="saveToDb"
              checked={saveToDatabase}
              onChange={(e) => setSaveToDatabase(e.target.checked)}
              className="mr-2"
              disabled={loading}
            />
            <label
              htmlFor="saveToDb"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              Save to Database
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !url || !isValidURL}
          className="w-full bg-red-600 text-white rounded-lg py-3 px-4 
                     hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors duration-200 font-medium
                     flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Analyzing Comments...</span>
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              <span>Analyze & Save Comments</span>
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
          <p className="text-red-700 dark:text-red-200">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Video Info */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
              Analysis Complete!
            </h3>
            <div className="space-y-1 text-sm text-blue-800 dark:text-blue-300">
              <p>
                <strong>Video:</strong> {result.video_info.titulo}
              </p>
              <p>
                <strong>Channel:</strong> {result.video_info.canal}
              </p>
              <p>
                <strong>Comments Analyzed:</strong> {result.analyzed_comments}
              </p>
              {saveToDatabase && (
                <p>
                  <strong>Saved to Database:</strong> {result.saved_to_database}
                </p>
              )}
            </div>
          </div>

          {/* Analysis Summary */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Sentiment Analysis Summary
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-red-100 dark:bg-red-900 p-3 rounded">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {result.analysis_summary.toxic_count}
                </div>
                <div className="text-sm text-red-600 dark:text-red-400">
                  Toxic
                </div>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {result.analysis_summary.not_toxic_count}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  Not Toxic
                </div>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {(result.analysis_summary.avg_confidence * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  Avg Confidence
                </div>
              </div>
            </div>
          </div>

          {/* Comment Preview */}
          {result.comments && result.comments.length > 0 && (
            <div className="max-h-64 overflow-y-auto bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Sample Analyzed Comments
              </h4>
              <div className="space-y-3">
                {result.comments.slice(0, 3).map((comment, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-200 dark:border-gray-600 pb-3"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {comment.original.autor} • {comment.original.likes}{" "}
                        likes
                      </p>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            comment.sentiment === "not toxic"
                              ? "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200"
                              : "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200"
                          }`}
                        >
                          {comment.sentiment === "not toxic"
                            ? "Not Toxic"
                            : "Toxic"}
                        </span>
                        <ConfidenceStars
                          sentiment={comment.sentiment}
                          confidence={comment.confidence}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      {comment.original.texto.length > 150
                        ? comment.original.texto.substring(0, 150) + "..."
                        : comment.original.texto}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default YouTubeAnalysisForm;
