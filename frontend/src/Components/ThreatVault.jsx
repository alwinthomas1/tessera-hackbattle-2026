import { Copy, Link2, Phone, Landmark, FileDown, AlertTriangle } from 'lucide-react'

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

function IntelSection({ title, icon, items, danger }) {
  if (!items.length) return null
  return (
    <div className="mb-4">
      <h3 className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">
        {title} ({items.length})
      </h3>
      <div className="space-y-1.5">
        {items.map((v) => <IntelCard key={v} icon={icon} value={v} danger={danger} />)}
      </div>
    </div>
  )
}

const THREAT_STYLES = {
  LOW: 'bg-emerald-950 text-emerald-400 border-emerald-800',
  MEDIUM: 'bg-amber-950 text-amber-400 border-amber-800',
  HIGH: 'bg-orange-950 text-orange-400 border-orange-800',
  CRITICAL: 'bg-red-950 text-red-400 border-red-800 animate-pulse',
}

export default function ThreatVault({ intel, threatLevel }) {
  const hasIntel = intel.upi.length || intel.links.length || intel.phones.length || intel.banks.length

  const downloadDossier = () => {
    window.open('http://localhost:5000/api/generate-report', '_blank')
  }

  return (
    <div className="flex flex-col h-full bg-zinc-900 rounded-lg border border-zinc-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-mono text-zinc-400 uppercase tracking-wider">Threat Intel Vault</h2>
        {threatLevel && (
          <span className={`flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded border ${THREAT_STYLES[threatLevel] || ''}`}>
            <AlertTriangle size={12} /> {threatLevel}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {!hasIntel && <p className="text-zinc-600 font-mono text-sm">No indicators extracted yet.</p>}

        <IntelSection title="UPI IDs" icon={Copy} items={intel.upi} />
        <IntelSection title="Phishing Links" icon={Link2} items={intel.links} danger />
        <IntelSection title="Phone Numbers" icon={Phone} items={intel.phones} />
        <IntelSection title="Bank Accounts" icon={Landmark} items={intel.banks} />
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