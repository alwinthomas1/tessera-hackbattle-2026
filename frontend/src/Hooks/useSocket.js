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

    // Backend sends the raw entry: { queueId, sender, message, direction, timestamp }
    socket.on('message-received', (payload) => {
      setMessages((prev) => [...prev, { sender: 'scammer', text: payload.message, timestamp: Date.now() }])
      setBaitStatus('Baiting Scammer for Financial Intel...')
    })

    // Backend event name is "ai-reply-generated", payload is { reply, classification, queueId }
    socket.on('ai-reply-generated', (payload) => {
      setMessages((prev) => [...prev, { sender: 'ai', text: payload.reply, timestamp: Date.now() }])
      setBaitStatus('Idle')
    })

    // Backend event name is "intel-extracted", payload shape:
    // { intelId, sourceQueueId, sender, upiIds?, urls?, phoneNumbers?, riskLevel, extractedAt }
    socket.on('intel-extracted', (payload) => {
      setIntel((prev) => {
        const next = { ...prev }
        if (Array.isArray(payload.upiIds)) {
          next.upi = [...new Set([...prev.upi, ...payload.upiIds])]
        }
        if (Array.isArray(payload.urls)) {
          next.links = [...new Set([...prev.links, ...payload.urls])]
        }
        if (Array.isArray(payload.phoneNumbers)) {
          next.phones = [...new Set([...prev.phones, ...payload.phoneNumbers])]
        }
        return next
      })
    })

    return () => socket.disconnect()
  }, [])

  // Backend expects { sender, message } in the POST body
  const detonateMessage = async (text, sender = '+919876543210') => {
    setBaitStatus('Detonating payload...')
    try {
      const res = await fetch('http://localhost:5000/api/detonate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender, message: text }),
      })
      const data = await res.json()
      if (!data.success) {
        setBaitStatus(`Error: ${data.error || 'Unknown error'}`)
      }
    } catch (err) {
      setBaitStatus(`Error: Failed to fetch. Is backend running on port 5000?`)
    }
  }

  return { connected, messages, intel, baitStatus, detonateMessage }
}