import { Copy, Link2, Phone, FileDown } from 'lucide-react'

function IntelCard({ icon: Icon, value, danger }) {
  const copy = () => navigator.clipboard.writeText(value)
  return (
    <div className={`flex items-center justify-between gap-2 rounded-md border p-2 text-sm font-mono ${
      danger ? 'border-red-800 bg-red-950/40 text-red-200' : 'border-zinc-700 bg-zinc-950 text-zinc-200'
    }`}>
      <div className="flex items-center gap-2 truncate">
        <Icon size={14} className="shrink-0" />
        <span className="truncate">{value}</span>
      </div>
      <button onClick={copy} className="text-zinc-500 hover:text-emerald-400">
        <Copy size={14} />
      </button>
    </div>
  )
}

export default function ThreatVault({ intel }) {
  const hasIntel = intel.upi.length || intel.links.length || intel.phones.length

  const downloadDossier = () => {
    window.open('http://localhost:5000/api/generate-report', '_blank')
  }

  return (
    <div className="flex flex-col h-full bg-zinc-900 rounded-lg border border-zinc-800 p-4">
      <h2 className="text-sm font-mono text-zinc-400 mb-3 uppercase tracking-wider">Threat Intel Vault</h2>
      <div className="flex-1 overflow-y-auto space-y-2">
        {!hasIntel && <p className="text-zinc-600 font-mono text-sm">No indicators extracted yet.</p>}
        {intel.upi.map((v) => <IntelCard key={v} icon={Copy} value={v} />)}
        {intel.links.map((v) => <IntelCard key={v} icon={Link2} value={v} danger />)}
        {intel.phones.map((v) => <IntelCard key={v} icon={Phone} value={v} />)}
      </div>
      <button
        onClick={downloadDossier}
        className="mt-4 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 transition-colors text-white font-mono text-sm py-2.5 rounded-md"
      >
        <FileDown size={16} /> Download CyberCrime Complaint Dossier
      </button>
    </div>
  )
}