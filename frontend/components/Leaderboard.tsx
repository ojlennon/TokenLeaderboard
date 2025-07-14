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
  const [currentTime, setCurrentTime] = useState(new Date())

  // WebSocket effect
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001')

    ws.onopen = () => {
      setIsLoading(false)
      setError(null)
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        if (message.type === 'update' && Array.isArray(message.data)) {
          setUsers(message.data)
          const scores = message.data.map((user: User) => user.score)
          setMaxScore(scores.length > 0 ? Math.max(...scores) : 0)
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

  // Time update effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="w-full max-w-3xl mx-auto space-y-2">
      <h1 className="text-3xl font-bold text-center text-gray-100 mb-2">Vibe Coding Leaderboard</h1> 
      <h2 className="text-xl text-center text-gray-300 mb-4"> # Chat303 Tokens Used </h2>
      <div className="text-gray-400 text-xl text-center mb-4">
        {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
      </div>

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