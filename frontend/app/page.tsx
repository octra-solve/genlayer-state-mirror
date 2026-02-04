import StoragePanel from "../components/StoragePanel";

export default function Page() {
  return (
    <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'radial-gradient(circle at top, #0f172a, #020617)' }}>
      <StoragePanel />
    </main>
  );
}
