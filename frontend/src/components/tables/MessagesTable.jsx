// frontend/src/components/tables/MessagesTable.jsx
import React, { useEffect, useState } from "react";
import { getMessages, deleteMessage } from "../../services/messageService";
import EditMessageModal from "../forms/EditMessageModal";
import ConfidenceStars from "../common/ConfidenceStars";

export default function MessagesTable({ refreshTrigger }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingMessage, setEditingMessage] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    loadMessages();
  }, [refreshTrigger]);

  const loadMessages = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMessages();
      setMessages(data);
    } catch (err) {
      setError("Failed to load messages");
      console.error("Error loading messages:", err);
    } finally {
      setLoading(false);
    }
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
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {messages.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  No messages found. Create your first message above!
                </td>
              </tr>
            ) : (
              messages.map((msg) => (
                <tr
                  key={msg.id}
                  className="text-center border-b dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900"
                >
                  <td className="px-4 py-2 dark:text-gray-200">{msg.id}</td>
                  <td className="px-4 py-2 dark:text-gray-200 text-left max-w-xs truncate">
                    {msg.text}
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

      <EditMessageModal
        message={editingMessage}
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleEditSuccess}
      />
    </>
  );
}
