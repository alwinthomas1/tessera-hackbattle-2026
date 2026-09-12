import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = 'http://localhost:5000'

export function useSocket() {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState([])
  const [intel, setIntel] = useState({ upi: [], links: [], phones: [] })
  const [baitStatus, setBaitStatus] = useState('Idle')

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket'] })
    socketRef.current = socket

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    socket.on('message-received', (payload) => {
      setMessages((prev) => [...prev, { sender: 'scammer', text: payload.text, timestamp: Date.now() }])
      setBaitStatus('Baiting Scammer for Financial Intel...')
    })

    socket.on('ai-reply', (payload) => {
      setMessages((prev) => [...prev, { sender: 'ai', text: payload.text, timestamp: Date.now() }])
    })

    socket.on('intel-found', (payload) => {
      setIntel((prev) => {
        const key = payload.type === 'upi' ? 'upi' : payload.type === 'link' ? 'links' : 'phones'
        if (prev[key].includes(payload.value)) return prev
        return { ...prev, [key]: [...prev[key], payload.value] }
      })
    })

    return () => socket.disconnect()
  }, [])

  const detonateMessage = async (text) => {
    setBaitStatus('Detonating payload...')
    await fetch('http://localhost:5000/api/detonate-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
  }

  return { connected, messages, intel, baitStatus, detonateMessage }
}