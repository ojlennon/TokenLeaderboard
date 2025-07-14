// app/page.tsx
import { Leaderboard } from "@/components/Leaderboard"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-800 p-10">
      <Leaderboard />
    </main>
  )
}