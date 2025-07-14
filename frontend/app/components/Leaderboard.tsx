// app/components/Leaderboard.tsx
"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Medal } from "lucide-react"

interface User {
  id: string
  name: string
  score: number
  avatarUrl?: string
}

const getMedalColor = (position: number) => {
  switch (position) {
    case 0:
      return "text-yellow-500"
    case 1:
      return "text-gray-400"
    case 2:
      return "text-amber-600"
    default:
      return "text-gray-600"
  }
}

export function Leaderboard() {
  const [users, setUsers] = useState<User[]>([])
  const [maxScore, setMaxScore] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000')

    ws.onopen = () => {
      setIsLoading(false)
      setError(null)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setUsers(data)
        setMaxScore(Math.max(...data.map((user: User) => user.score)))
      } catch (error) {
        console.error('Error parsing message:', error)
      }
    }

    ws.onerror = () => {
      setError("Failed to connect to server")
      setIsLoading(false)
    }

    ws.onclose = () => {
      setError("Connection closed")
    }

    return () => {
      ws.close()
    }
  }, [])

  if (error) {
    return (
      <Card className="w-full max-w-3xl mx-auto p-6">
        <div className="text-red-500 text-center">{error}</div>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-3xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded" />
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-3xl mx-auto p-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Rank</TableHea