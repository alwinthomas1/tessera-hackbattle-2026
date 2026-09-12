import { useState } from 'react'
import { Send } from 'lucide-react'

export default function ScammerSimulator({ onSend }) {
  const [text, setText] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    onSend(text)
    setText('')
  }

  return (
    <div className="flex flex-col h-full p-4 bg-zinc-900 rounded-lg border border-zinc-800">
      <h2 className="text-sm font-mono text-zinc-400 mb-3 uppercase tracking-wider">Test Chamber</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 flex-1">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Your electricity will be cut. Pay ₹2000 to upi scammer@okaxis immediately"
          className="flex-1 resize-none bg-zinc-950 border border-zinc-700 rounded-md p-3 text-sm text-zinc-200 font-mono focus:outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 transition-colors text-white font-mono text-sm py-2 rounded-md"
        >
          <Send size={16} /> Detonate Message
        </button>
      </form>
    </div>
  )
}