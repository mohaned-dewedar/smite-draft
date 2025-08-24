import React, { useState } from 'react'

export default function RoomLobby({ onJoinRoom, onCreateRoom, loading }) {
  const [roomId, setRoomId] = useState('')
  const [userName, setUserName] = useState('')

  const handleJoinRoom = (e) => {
    e.preventDefault()
    if (roomId.trim() && userName.trim()) {
      onJoinRoom({
        roomId: roomId.trim().toUpperCase(),
        userName: userName.trim()
      })
    }
  }

  const handleCreateRoom = () => {
    if (userName.trim()) {
      onCreateRoom({
        userName: userName.trim()
      })
    }
  }

  const generateRoomId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setRoomId(result)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Smite Draft Tool
          </h1>
          <p className="text-gray-400">Join or create a multiplayer draft room</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl space-y-6">
          {/* User Info */}
          <div className="space-y-4">
            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-gray-300 mb-2">
                Your Name
              </label>
              <input
                id="userName"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={20}
                required
              />
            </div>

          </div>

          {/* Join Room */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-semibold mb-4">Join Existing Room</h3>
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  placeholder="ROOM CODE"
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  maxLength={6}
                />
                <button
                  type="button"
                  onClick={generateRoomId}
                  className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-3 rounded-lg transition-colors"
                  title="Generate random room code"
                >
                  🎲
                </button>
              </div>
              <button
                type="submit"
                disabled={!roomId.trim() || !userName.trim() || loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
              >
                {loading ? 'Joining...' : 'Join Room'}
              </button>
            </form>
          </div>

          {/* Create Room */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-semibold mb-4">Create New Room</h3>
            <button
              onClick={handleCreateRoom}
              disabled={!userName.trim() || loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>🎮 First 2 people can draft • 💬 Everyone can chat</p>
        </div>
      </div>
    </div>
  )
}