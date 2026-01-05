import React, { useState, useRef, useEffect } from "react";
import { chatWithAgent } from "../api/job";
import { useAuth } from "../context/AuthContext";

function formatMessage(text) {
  if (!text) return null;
  
  const lines = text.split('\n');
  const elements = [];
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    
    // Detect table (line with pipes |)
    if (line.includes('|') && line.trim().startsWith('|')) {
      const tableLines = [];
      let j = i;
      
      // Collect all consecutive table lines
      while (j < lines.length && lines[j].includes('|')) {
        tableLines.push(lines[j]);
        j++;
      }
      
      if (tableLines.length >= 2) {
        // Parse table
        const headers = tableLines[0].split('|').map(h => h.trim()).filter(h => h);
        const separatorIndex = tableLines.findIndex(l => l.includes('---'));
        const dataStartIndex = separatorIndex >= 0 ? separatorIndex + 1 : 1;
        const rows = tableLines.slice(dataStartIndex).map(row => 
          row.split('|').map(cell => cell.trim()).filter(cell => cell)
        );
        
        elements.push(
          <div key={`table-${i}`} className="my-3 overflow-x-auto">
            <table className="min-w-full border text-xs">
              <thead className="bg-gray-50">
                <tr>
                  {headers.map((header, idx) => (
                    <th key={idx} className="border px-2 py-1 text-left font-semibold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-gray-50">
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="border px-2 py-1">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        
        i = j;
        continue;
      }
    }
    
    // Regular line with bold formatting
    const parts = line.split(/\*\*(.*?)\*\*/g);
    const formatted = parts.map((part, idx) => 
      idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part
    );
    
    elements.push(
      <div key={i} className={line.trim() === '' ? 'h-2' : ''}>
        {formatted}
      </div>
    );
    
    i++;
  }
  
  return elements;
}

export default function HiringManagerChat({ isOpen, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await chatWithAgent(userMessage);
      const replyText = response?.reply || response?.response || response?.message || JSON.stringify(response);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: replyText },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${error?.response?.data?.detail || "Failed to get response"}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  if (user?.role !== "hiring_manager") {
    return (
      <div className="fixed bottom-4 right-4 z-50 w-96 rounded-2xl border bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Chat</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100">
            ✕
          </button>
        </div>
        <div className="p-4 text-sm text-gray-600">Only hiring managers can access chat.</div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-96 flex-col rounded-2xl border bg-white shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold">Hiring Manager Chat</h2>
        <button onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100">
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4" style={{ maxHeight: "400px" }}>
        {messages.length === 0 && (
          <div className="text-center text-sm text-gray-500">Ask about your jobs and applications</div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
                msg.role === "user" ? "bg-black text-white" : "bg-gray-100 text-gray-900"
              }`}
            >
              {msg.role === "assistant" ? formatMessage(msg.content) : msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl bg-gray-100 px-4 py-2 text-sm text-gray-600">Typing...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
