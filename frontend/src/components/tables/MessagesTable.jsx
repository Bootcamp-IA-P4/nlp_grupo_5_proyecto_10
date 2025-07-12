// frontend/src/components/tables/MessagesTable.jsx
import React, { useEffect, useState } from "react";
import {
  getMessages,
  getFilteredMessages,
  deleteMessage,
} from "../../services/messageService";
import EditMessageModal from "../forms/EditMessageModal";
import ConfidenceStars from "../common/ConfidenceStars";
import MessageFilters from "./MessageFilters";

export default function MessagesTable({ refreshTrigger }) {
  const [messages, setMessages] = useState([]);
  const [filteredData, setFilteredData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingMessage, setEditingMessage] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadMessages();
  }, [refreshTrigger]);

  // Load messages based on filters
  const loadMessages = async (filters = {}, page = 1) => {
    setLoading(true);
    setError("");
    try {
      if (Object.values(filters).some((value) => value !== "")) {
        // Use filtered search
        const data = await getFilteredMessages(filters, page);
        setFilteredData(data);
        setMessages(data.messages || []);
      } else {
        // Use original method for no filters
        const data = await getMessages();
        setMessages(Array.isArray(data) ? data : data.messages || []);
        setFilteredData(null);
      }
    } catch (err) {
      setError("Failed to load messages");
      console.error("Error loading messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (filters) => {
    setActiveFilters(filters);
    setCurrentPage(1);
    loadMessages(filters, 1);
  };

  const handleClearFilters = () => {
    setActiveFilters({});
    setCurrentPage(1);
    loadMessages({}, 1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadMessages(activeFilters, page);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) {
      return;
    }

    try {
      await deleteMessage(id);
      setMessages(messages.filter((msg) => msg.id !== id));
    } catch (err) {
      setError("Failed to delete message");
      console.error("Error deleting message:", err);
    }
  };

  const handleEdit = (message) => {
    setEditingMessage(message);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = (updatedMessage) => {
    setMessages(
      messages.map((msg) =>
        msg.id === updatedMessage.id ? updatedMessage : msg
      )
    );
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingMessage(null);
  };

  const getSentimentLabel = (sentiment) => {
    return sentiment === "not toxic" ? "Not Toxic" : "Toxic";
  };

  const getSentimentStyle = (sentiment) => {
    return sentiment === "not toxic"
      ? "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200"
      : "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-purple-600 dark:text-purple-400">
          Loading messages...
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Add Filters */}
      <MessageFilters
        onFiltersChange={handleFiltersChange}
        onClear={handleClearFilters}
      />

      {/* Results Info */}
      {filteredData && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded">
          <p>
            📊 Showing {filteredData.messages?.length || 0} of{" "}
            {filteredData.total || 0} results
            {filteredData.has_more && ` (Page ${currentPage})`}
          </p>
        </div>
      )}

      <div className="overflow-x-auto">
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded">
            {error}
          </div>
        )}

        <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow">
          <thead>
            <tr className="bg-purple-700 text-white">
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Text</th>
              <th className="px-4 py-2">Sentiment</th>
              <th className="px-4 py-2">Confidence</th>
              <th className="px-4 py-2">Source</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {messages.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  {Object.values(activeFilters).some((value) => value !== "")
                    ? "No messages found matching the selected filters."
                    : "No messages found. Create your first message above!"}
                </td>
              </tr>
            ) : (
              messages.map((msg) => (
                <tr
                  key={msg.id}
                  className="text-center border-b dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900"
                >
                  <td className="px-4 py-2 dark:text-gray-200">{msg.id}</td>
                  <td className="px-4 py-2 dark:text-gray-200 text-left max-w-xs">
                    <div className="truncate" title={msg.text}>
                      {msg.text}
                    </div>
                    {msg.source === "youtube" && msg.youtube_author && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        👤 {msg.youtube_author} • 👍 {msg.youtube_likes || 0}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getSentimentStyle(
                        msg.sentiment
                      )}`}
                    >
                      {getSentimentLabel(msg.sentiment)}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <ConfidenceStars
                      sentiment={msg.sentiment}
                      confidence={msg.confidence}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        msg.source === "youtube"
                          ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200"
                      }`}
                    >
                      {msg.source === "youtube" ? "📺 YouTube" : "✏️ Manual"}
                    </span>
                    {msg.source === "youtube" && msg.youtube_channel && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {msg.youtube_channel}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      className="text-blue-500 mx-2 hover:text-blue-700 px-2 py-1 rounded transition-colors"
                      onClick={() => handleEdit(msg)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-500 mx-2 hover:text-red-700 px-2 py-1 rounded transition-colors"
                      onClick={() => handleDelete(msg.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredData && filteredData.total > filteredData.limit && (
        <div className="flex justify-center items-center mt-4 space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
            Page {currentPage}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!filteredData.has_more}
            className="px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700"
          >
            Next
          </button>
        </div>
      )}

      <EditMessageModal
        message={editingMessage}
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleEditSuccess}
      />
    </>
  );
}
