import React from 'react'

export default function VotingPanel({ votes, onVote, connected, userRole }) {
  const totalVotes = votes.order + votes.chaos
  const orderPercentage = totalVotes > 0 ? (votes.order / totalVotes) * 100 : 0
  const chaosPercentage = totalVotes > 0 ? (votes.chaos / totalVotes) * 100 : 0

  const canVote = connected && userRole === 'spectator'

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
        🏆 Who's Winning?
        <span className="text-sm text-gray-400">({totalVotes} votes)</span>
      </h3>

      {/* Voting Buttons */}
      {canVote && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => onVote('ORDER')}
            disabled={votes.userVote === 'ORDER'}
            className={`p-3 rounded-lg font-medium transition-all ${
              votes.userVote === 'ORDER'
                ? 'bg-blue-600 text-white border-2 border-blue-400'
                : 'bg-gray-700 hover:bg-blue-600 text-gray-300 hover:text-white border border-gray-600'
            }`}
          >
            Vote ORDER
          </button>
          <button
            onClick={() => onVote('CHAOS')}
            disabled={votes.userVote === 'CHAOS'}
            className={`p-3 rounded-lg font-medium transition-all ${
              votes.userVote === 'CHAOS'
                ? 'bg-red-600 text-white border-2 border-red-400'
                : 'bg-gray-700 hover:bg-red-600 text-gray-300 hover:text-white border border-gray-600'
            }`}
          >
            Vote CHAOS
          </button>
        </div>
      )}

      {/* Vote Results */}
      <div className="space-y-3">
        {/* ORDER Bar */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-blue-400 font-medium">ORDER</span>
            <span className="text-sm text-gray-300">{votes.order} votes</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${orderPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* CHAOS Bar */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-red-400 font-medium">CHAOS</span>
            <span className="text-sm text-gray-300">{votes.chaos} votes</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="bg-red-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${chaosPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* User Vote Status */}
      {votes.userVote && (
        <div className="mt-4 text-sm text-center">
          <span className="text-gray-400">You voted for </span>
          <span className={votes.userVote === 'ORDER' ? 'text-blue-400' : 'text-red-400'}>
            {votes.userVote}
          </span>
        </div>
      )}

      {!canVote && userRole !== 'spectator' && (
        <div className="mt-4 text-sm text-gray-500 text-center">
          Only spectators can vote
        </div>
      )}
    </div>
  )
}