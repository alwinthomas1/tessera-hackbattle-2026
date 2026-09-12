import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = 'http://localhost:5000'

export function useSocket() {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState([])
  const [intel, setIntel] = useState({ upi: [], links: [], phones: [], banks: [] })
  const [threatLevel, setThreatLevel] = useState(null)
  const [baitStatus, setBaitStatus] = useState('Idle')

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket'] })
    socketRef.current = socket

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    socket.on('message-received', (payload) => {
      setMessages((prev) => [...prev, { sender: 'scammer', text: payload.message, timestamp: Date.now() }])
      setBaitStatus('Baiting Scammer for Financial Intel...')
    })

    socket.on('ai-reply-generated', (payload) => {
      setMessages((prev) => [...prev, { sender: 'ai', text: payload.reply, timestamp: Date.now() }])
      setBaitStatus('Idle')
    })

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
        if (Array.isArray(payload.bankAccounts)) {
          next.banks = [...new Set([...prev.banks, ...payload.bankAccounts])]
        }
        return next
      })

      if (payload.riskLevel) {
        setThreatLevel(payload.riskLevel)
      }
    })

    return () => socket.disconnect()
  }, [])

  const detonateMessage = async (text, sender = '+919876543210') => {
    setBaitStatus('Detonating payload...')
    console.log('SENDING PAYLOAD:', { sender, message: text })
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

  return { connected, messages, intel, baitStatus, detonateMessage, threatLevel }
}