import React from 'react'

export default function UsersList({ users, connected }) {
  const getUserIcon = () => {
    return '⚔️' // Everyone can draft
  }

  const getUserLabel = () => {
    return 'Drafter'
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-semibold text-white">👥 Users ({users.length})</h3>
        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
      </div>

      <div className="space-y-2 max-h-32 overflow-y-auto">
        {users.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-2">No users connected</p>
        ) : (
          users.map((user, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <span className="text-lg">{getUserIcon()}</span>
              <div className="flex-1">
                <span className="text-white font-medium">{user.name}</span>
                <span className="text-gray-400 text-xs ml-2">
                  {getUserLabel()}
                </span>
              </div>
              {user.connected && (
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}