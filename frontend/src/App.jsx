import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import './App.css'

// Connect to backend server on port 5000
const socket = io('http://localhost:5000')

function App() {
  const [logs, setLogs] = useState([])
  const [sender, setSender] = useState('+919876543210')
  const [message, setMessage] = useState('Pay 5000 via UPI scammer@okicici or face arrest')

  useEffect(() => {
    // Listen for events from backend
    socket.on('message-received', (data) => {
      setLogs((prev) => [...prev, `[RECEIVED]: ${JSON.stringify(data)}`])
    })

    socket.on('ai-reply-generated', (data) => {
      setLogs((prev) => [...prev, `[AI BAIT]: ${JSON.stringify(data)}`])
    })

    socket.on('intel-extracted', (data) => {
      setLogs((prev) => [...prev, `[INTEL VAULT]: ${JSON.stringify(data)}`])
    })

    return () => {
      socket.off('message-received')
      socket.off('ai-reply-generated')
      socket.off('intel-extracted')
    }
  }, [])

  const handleDetonate = async () => {
    await fetch('http://localhost:5000/api/detonate-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender, message })
    })
  }

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>ScamBox AI Detonation Dashboard</h1>
      
      <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input 
          type="text" 
          value={sender} 
          onChange={(e) => setSender(e.target.value)}
          placeholder="Sender Phone Number"
          style={{ padding: '8px' }}
        />
        <textarea 
          value={message} 
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Scam Message"
          rows="3"
          style={{ padding: '8px' }}
        />
        <button 
          onClick={handleDetonate} 
          style={{ padding: '12px', background: '#d9534f', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Detonate Message
        </button>
      </div>

      <h3>Live Execution Feed</h3>
      <div style={{ background: '#111', color: '#00ff00', padding: '15px', borderRadius: '6px', minHeight: '200px', fontFamily: 'monospace' }}>
        {logs.length === 0 ? <p style={{ color: '#666' }}>Awaiting message detonation...</p> : null}
        {logs.map((log, index) => (
          <div key={index} style={{ marginBottom: '8px' }}>{log}</div>
        ))}
      </div>
    </div>
  )
}

export default App
