import React, { useState } from 'react';
import { createMessage } from '../../services/messageService';

export default function MessageForm({ onSuccess }) {
  const [text, setText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createMessage({ text });
    setText('');
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <textarea
        className="border rounded p-2"
        placeholder="Enter message text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
      />
      <button type="submit" className="bg-purple-600 text-white rounded py-2">
        Submit
      </button>
    </form>
  );
}
