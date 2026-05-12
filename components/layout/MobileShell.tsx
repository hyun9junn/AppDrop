export default function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-md mx-auto min-h-screen relative bg-white">
      {children}
    </div>
  )
}
