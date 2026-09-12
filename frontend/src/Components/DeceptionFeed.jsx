export default function DeceptionFeed({ messages, baitStatus }) {
    return (
      <div className="flex flex-col h-full bg-zinc-900 rounded-lg border border-zinc-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-mono text-zinc-400 uppercase tracking-wider">Live Deception Feed</h2>
          <span className="text-xs font-mono px-2 py-1 rounded bg-amber-950 text-amber-400 border border-amber-800">
            {baitStatus}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {messages.length === 0 && (
            <p className="text-zinc-600 font-mono text-sm text-center mt-10">
              Waiting for incoming payload...
            </p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.sender === 'ai' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-lg px-3 py-2 text-sm font-mono ${
                  m.sender === 'ai'
                    ? 'bg-emerald-900/60 text-emerald-100 border border-emerald-700'
                    : 'bg-red-950/60 text-red-100 border border-red-800'
                }`}
              >
                <div className="text-[10px] opacity-60 mb-1">
                  {m.sender === 'ai' ? 'Ramesh Uncle (AI)' : 'Scammer'}
                </div>
                {m.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }