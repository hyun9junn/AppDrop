import Link from 'next/link'

interface TopBarProps {
  title?: string
  backHref?: string
  rightAction?: React.ReactNode
}

export default function TopBar({ title, backHref, rightAction }: TopBarProps) {
  return (
    <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
      {backHref && (
        <Link href={backHref} className="text-gray-400 text-sm">←</Link>
      )}
      {!backHref && !title && (
        <span className="text-brand font-black text-xl flex-1">AppDrop</span>
      )}
      {title && (
        <span className="font-bold text-gray-900 text-sm flex-1">{title}</span>
      )}
      {rightAction}
    </header>
  )
}
