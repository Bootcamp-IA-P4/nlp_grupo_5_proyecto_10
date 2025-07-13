import React, { useState, useEffect } from "react";
import { messageService } from "../services/messageService";
import MessageFilters from "./MessageFilters";
// ...existing imports...

const MessagesTable = () => {
  const [messages, setMessages] = useState([]);
  const [filteredData, setFilteredData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState({});

  // Load messages based on filters
  const loadMessages = async (filters = {}, page = 1) => {
    setLoading(true);
    try {
      if (Object.values(filters).some((value) => value !== "")) {
        // Use filtered search
        const data = await messageService.getFilteredMessages(filters, page);
        setFilteredData(data);
        setMessages(data.messages || []);
      } else {
        // Use original method for no filters
        const data = await messageService.getMessages();
        setMessages(Array.isArray(data) ? data : data.messages || []);
        setFilteredData(null);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      setError(error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

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

  // ...existing code for delete, edit, etc...

  if (loading) return <div className="loading">Loading messages...</div>;
  if (error)
    return <div className="error">Error loading messages: {error.message}</div>;

  return (
    <div className="messages-container">
      <h2>Message History</h2>

      {/* Add Filters */}
      <MessageFilters
        onFiltersChange={handleFiltersChange}
        onClear={handleClearFilters}
      />

      {/* Results Info */}
      {filteredData && (
        <div className="results-info">
          <p>
            Showing {filteredData.messages?.length || 0} of{" "}
            {filteredData.total || 0} results
            {filteredData.has_more && ` (Page ${currentPage})`}
          </p>
        </div>
      )}

      {/* Messages Table */}
      <div className="table-container">
        <table className="messages-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Text</th>
              <th>Sentiment</th>
              <th>Confidence</th>
              <th>Source</th>
              <th>Author</th>
              <th>Likes</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {messages.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-data">
                  {Object.values(activeFilters).some((value) => value !== "")
                    ? "No messages found matching the selected filters."
                    : "No messages found. Create your first message above!"}
                </td>
              </tr>
            ) : (
              messages.map((message) => (
                <tr key={message.id}>
                  {/* ...existing table row code... */}
                  <td>{message.id}</td>
                  <td className="text-cell" title={message.text}>
                    {message.text.length > 100
                      ? `${message.text.substring(0, 100)}...`
                      : message.text}
                  </td>
                  <td>
                    <span
                      className={`sentiment ${message.sentiment.replace(
                        " ",
                        "-"
                      )}`}
                    >
                      {message.sentiment === "toxic" ? "🔴" : "🟢"}{" "}
                      {message.sentiment}
                    </span>
                  </td>
                  <td>{message.confidence.toFixed(3)}</td>
                  <td>
                    <span className={`source ${message.source}`}>
                      {message.source === "youtube" ? "📺" : "✍️"}{" "}
                      {message.source}
                    </span>
                  </td>
                  <td>{message.youtube_author || "N/A"}</td>
                  <td>{message.youtube_likes || 0}</td>
                  <td>{new Date(message.created_at).toLocaleDateString()}</td>
                  <td>{/* ...existing action buttons... */}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredData && filteredData.total > filteredData.limit && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            Previous
          </button>
          <span>Page {currentPage}</span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!filteredData.has_more}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default MessagesTable;
