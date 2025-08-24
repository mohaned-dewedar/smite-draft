import React, { useState, useRef, useEffect } from 'react'

export default function Chat({ messages, onSendMessage, connected }) {
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(scrollToBottom, [messages])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim() && connected) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }


  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 flex flex-col h-80">
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <h3 className="font-semibold text-white flex items-center gap-2">
          💬 Chat
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        </h3>
      </div>

      {/* Messages */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No messages yet...</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="text-sm">
              <span className="font-medium text-blue-400">
                {msg.author}:
              </span>
              <span className="text-gray-300 ml-2">{msg.text}</span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={connected ? "Type a message..." : "Connecting..."}
            disabled={!connected}
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            maxLength={200}
          />
          <button
            type="submit"
            disabled={!connected || !message.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}