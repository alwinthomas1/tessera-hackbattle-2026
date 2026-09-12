export default function Header({ connected }) {
    return (
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
        <h1 className="text-xl font-mono font-bold text-emerald-400 tracking-tight">
          ScamBox <span className="text-zinc-500">// Active AI Threat SandBox</span>
        </h1>
        <div className="flex items-center gap-2 font-mono text-sm">
          <span className={`h-2.5 w-2.5 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          <span className={connected ? 'text-emerald-400' : 'text-red-400'}>
            {connected ? 'LOCKED AND LOADED' : 'DISCONNECTED'}
          </span>
        </div>
      </header>
    )
  }