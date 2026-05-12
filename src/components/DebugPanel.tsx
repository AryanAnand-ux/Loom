import { useDebug } from "../lib/debugStore";

export default function DebugPanel() {
  const { uid, closetCount, closetMode, outfitsCount, outfitsMode } = useDebug();

  return (
    <div style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 9999 }}>
      <div style={{ background: 'rgba(0,0,0,0.75)', color: 'white', padding: '8px 12px', borderRadius: 8, fontSize: 12, minWidth: 220, boxShadow: '0 6px 18px rgba(0,0,0,0.3)' }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Loom Debug</div>
        <div style={{ opacity: 0.9 }}><strong>UID:</strong> {uid ?? '—'}</div>
        <div style={{ opacity: 0.9 }}><strong>Closet:</strong> {closetCount} ({closetMode ?? '—'})</div>
        <div style={{ opacity: 0.9 }}><strong>Outfits:</strong> {outfitsCount} ({outfitsMode ?? '—'})</div>
      </div>
    </div>
  );
}
