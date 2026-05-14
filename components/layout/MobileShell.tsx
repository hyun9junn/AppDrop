export default function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-md mx-auto min-h-screen relative" style={{ background: 'var(--cream)' }}>
      {children}
    </div>
  )
}
