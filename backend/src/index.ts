// backend/src/index.ts
import express from 'express';
import { createServer } from 'http';
import { WebSocket, WebSocketServer } from 'ws';

interface User {
  id: string;
  name: string;
  score: number;
}

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Initial data as an array
let leaderboardData: User[] = [
  {
    id: '1',
    name: 'John Doe',
    score: 0,
  },
  {
    id: '2',
    name: 'Jane Smith',
    score: 0,
  }
];

wss.on('connection', (ws: WebSocket) => {
  // Send data as an object with a type
  ws.send(JSON.stringify({
    type: 'update',
    data: leaderboardData
  }));

  ws.on('message', (message: Buffer) => {
    try {
      const data = JSON.parse(message.toString());
      // Handle message
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });
});

function updateScores() {
  leaderboardData = leaderboardData.map(user => ({
    ...user,
    score: user.score + Math.floor(Math.random() * 100)
  }));

  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'update',
        data: leaderboardData
      }));
    }
  });
}

// setInterval(updateScores, 300000);
const updateTimeout = parseInt(process.env.UPDATE_TIMEOUT || '5000', 10); // 5 seconds
setInterval(updateScores, updateTimeout);

const PORT = process.env.BACKEND_PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// // backend/src/index.ts
// import express from 'express';
// import { createServer } from 'http';
// import { WebSocket, WebSocketServer } from 'ws';
// import { Pool } from 'pg';
// import dotenv from 'dotenv';

// dotenv.config();

// interface User {
//   id: string;
//   username: string;
//   tokens_used: number;
// }

// const app = express();
// const server = createServer(app);
// const wss = new WebSocketServer({ server });

// // Configure PostgreSQL connection
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL
// });

// // Function to get user token usage
// async function getUserTokens(): Promise<User[]> {
//   try {
//     const query = `
//       SELECT 
//         u.id,
//         u.username,
//         COALESCE(SUM(c.total_tokens), 0) as tokens_used
//       FROM users u
//       LEFT JOIN conversations c ON u.id = c.user_id
//       GROUP BY u.id, u.username
//       ORDER BY tokens_used DESC
//     `;
//     const result = await pool.query(query);
//     return result.rows;
//   } catch (error) {
//     console.error('Database query error:', error);
//     return [];
//   }
// }

// // WebSocket connection handler
// wss.on('connection', async (ws: WebSocket) => {
//   // Send initial data
//   const initialData = await getUserTokens();
//   ws.send(JSON.stringify({
//     type: 'update',
//     data: initialData
//   }));

//   ws.on('message', async (message: Buffer) => {
//     try {
//       const data = JSON.parse(message.toString());
//       // Handle incoming messages if needed
//     } catch (error) {
//       console.error('Error parsing message:', error);
//     }
//   });
// });

// // Regular updates
// async function updateTokenData() {
//   try {
//     const updatedData = await getUserTokens();
//     wss.clients.forEach((client: WebSocket) => {
//       if (client.readyState === WebSocket.OPEN) {
//         client.send(JSON.stringify({
//           type: 'update',
//           data: updatedData
//         }));
//       }
//     });
//   } catch (error) {
//     console.error('Error updating token data:', error);
//   }
// }

// // Update every 30 seconds
// setInterval(updateTokenData, 30000);

// // REST API endpoints
// app.get('/api/tokens', async (req, res) => {
//   try {
//     const data = await getUserTokens();
//     res.json(data);
//   } catch (error) {
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Get specific user's token usage
// app.get('/api/tokens/:userId', async (req, res) => {
//   try {
//     const query = `
//       SELECT 
//         u.id,
//         u.username,
//         COALESCE(SUM(c.total_tokens), 0) as tokens_used,
//         COUNT(DISTINCT c.id) as conversation_count,
//         MAX(c.created_at) as last_activity
//       FROM users u
//       LEFT JOIN conversations c ON u.id = c.user_id
//       WHERE u.id = $1
//       GROUP BY u.id, u.username
//     `;
//     const result = await pool.query(query, [req.params.userId]);
    
//     if (result.rows.length === 0) {
//       res.status(404).json({ error: 'User not found' });
//     } else {
//       res.json(result.rows[0]);
//     }
//   } catch (error) {
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.BACKEND_PORT || 3001;
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });