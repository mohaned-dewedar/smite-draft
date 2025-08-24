import React, { useState } from 'react'

export default function JoinRoomModal({ onClose, onJoin }) {
  const [roomCode, setRoomCode] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (roomCode.trim()) {
      onJoin(roomCode.trim().toUpperCase())
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl max-w-sm w-full">
        <h2 className="text-xl font-bold text-white mb-4">Join Draft Room</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="roomCode" className="block text-sm font-medium text-gray-300 mb-2">
              Room Code
            </label>
            <input
              id="roomCode"
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-character code"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-center text-lg"
              maxLength={6}
              autoFocus
            />
          </div>
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={roomCode.length !== 6}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition-colors"
            >
              Join
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}