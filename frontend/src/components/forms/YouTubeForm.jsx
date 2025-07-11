import React, { useState } from "react";
import axios from "axios";

const YouTubeForm = ({ onCommentsLoaded }) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [videoInfo, setVideoInfo] = useState(null);
  const [comments, setComments] = useState([]);
  const [maxComments, setMaxComments] = useState(50);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setVideoInfo(null);
    setComments([]);

    try {
      const response = await axios.post(
        "http://localhost:8000/youtube-comments",
        {
          url: url,
          max_comments: maxComments,
        }
      );

      if (response.data.success) {
        setVideoInfo(response.data.video_info);
        setComments(response.data.comentarios);

        // Callback to parent component with the comments
        if (onCommentsLoaded) {
          onCommentsLoaded(response.data);
        }
      } else {
        setError(response.data.error || "Failed to load comments");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Error loading YouTube comments");
      console.error("YouTube API error:", err);
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
          <div className="flex space-x-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
              disabled={loading}
            />
            <select
              value={maxComments}
              onChange={(e) => setMaxComments(Number(e.target.value))}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              disabled={loading}
            >
              <option value={25}>25 comments</option>
              <option value={50}>50 comments</option>
              <option value={100}>100 comments</option>
              <option value={200}>200 comments</option>
            </select>
          </div>
          {url && !isValidURL && (
            <p className="text-red-500 text-sm mt-1">
              Please enter a valid YouTube URL
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !url || !isValidURL}
          className="w-full bg-red-600 text-white rounded-lg py-2 px-4 
                     hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors duration-200 font-medium
                     flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
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
              <span>Loading Comments...</span>
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              <span>Load YouTube Comments</span>
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
          <p className="text-red-700 dark:text-red-200">{error}</p>
        </div>
      )}

      {videoInfo && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
            Video Information
          </h3>
          <div className="space-y-1 text-sm text-blue-800 dark:text-blue-300">
            <p>
              <strong>Title:</strong> {videoInfo.titulo}
            </p>
            <p>
              <strong>Channel:</strong> {videoInfo.canal}
            </p>
            <p>
              <strong>Views:</strong> {videoInfo.vistas?.toLocaleString()}
            </p>
            <p>
              <strong>Total Comments:</strong>{" "}
              {videoInfo.comentarios_totales?.toLocaleString()}
            </p>
            <p>
              <strong>Comments Loaded:</strong> {comments.length}
            </p>
          </div>
        </div>
      )}

      {comments.length > 0 && (
        <div className="max-h-64 overflow-y-auto bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Preview Comments ({comments.length})
          </h4>
          <div className="space-y-2">
            {comments.slice(0, 5).map((comment, index) => (
              <div
                key={comment.id}
                className="border-b border-gray-200 dark:border-gray-600 pb-2"
              >
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {comment.autor} • {comment.likes} likes
                </p>
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  {comment.texto.length > 100
                    ? comment.texto.substring(0, 100) + "..."
                    : comment.texto}
                </p>
              </div>
            ))}
            {comments.length > 5 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
                ...and {comments.length - 5} more comments
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubeForm;
