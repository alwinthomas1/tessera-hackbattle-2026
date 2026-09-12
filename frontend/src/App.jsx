import Header from './components/Header'
import ScammerSimulator from './components/ScammerSimulator'
import DeceptionFeed from './components/DeceptionFeed'
import ThreatVault from './components/ThreatVault'
import { useSocket } from './hooks/useSocket'

function App() {
  const { connected, messages, intel, baitStatus, detonateMessage } = useSocket()

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Header connected={connected} />
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-4 p-4">
        <ScammerSimulator onSend={detonateMessage} />
        <DeceptionFeed messages={messages} baitStatus={baitStatus} />
        <ThreatVault intel={intel} />
      </main>
    </div>
  )
}

export default App