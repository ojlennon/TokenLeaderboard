"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"

interface User {
  id: string
  name: string
  score: number
}

export function Leaderboard() {
  const [users, setUsers] = useState<User[]>([])
  const [maxScore, setMaxScore] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdatedTime, setLastUpdatedTime] = useState<Date | null>(null)

  // WebSocket effect
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001')

    ws.onopen = () => {
      setIsLoading(false)
      setError(null)
      setLastUpdatedTime(new Date()) // Set initial connection time
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        if (message.type === 'update' && Array.isArray(message.data)) {
          setUsers(message.data)
          const scores = message.data.map((user: User) => user.score)
          setMaxScore(scores.length > 0 ? Math.max(...scores) : 0)
          setLastUpdatedTime(new Date()) // Update time when new data is received
        }
      } catch (error) {
        console.error('Error parsing message:', error)
        setError('Error processing data')
      }
    }

    ws.onerror = () => {
      setError("Failed to connect to server")
      setIsLoading(false)
    }

    return () => {
      ws.close()
    }
  }, [])

  // Format the time string
  const formatLastUpdated = () => {
    if (!lastUpdatedTime) return 'Not yet updated'
    
    return `Last updated: ${lastUpdatedTime.toLocaleDateString()} ${lastUpdatedTime.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })}`
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-2">
      <h1 className="text-3xl font-bold text-center text-gray-100 mb-2">
        Vibe Coding Leaderboard
      </h1>
      <h2 className="text-xl text-center text-gray-300 mb-4">
        # Chat303 Tokens Used
      </h2>
      
      {/* Last updated time display */}
      <div className="text-gray-400 text-xl text-center mb-4">
        {formatLastUpdated()}
      </div>

      {/* Show loading state */}
      {isLoading && (
        <div className="text-gray-400 text-center">Loading...</div>
      )}

      {/* Show error state */}
      {error && (
        <div className="text-red-400 text-center">{error}</div>
      )}

      {/* Leaderboard entries */}
      {users
        .sort((a, b) => b.score - a.score)
        .map((user) => (
          <div key={user.id} className="flex items-center gap-4">
            <div className="w-32 text-gray-100 font-medium">
              {user.name}
            </div>
            <div className="flex-1 relative h-8">
              <div className="absolute inset-0 bg-gray-800 rounded" />
              <div className="relative h-full">
                <div
                  className="absolute inset-0 bg-blue-600 rounded transition-all duration-500 flex items-center justify-end"
                  style={{ width: `${(user.score / maxScore) * 100}%` }}
                >
                  <span className="text-white font-medium whitespace-nowrap px-3">
                    {user.score.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  )
}