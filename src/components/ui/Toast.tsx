import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { CheckCircle2 } from 'lucide-react'

type ToastItem = { id: number; message: string }
type ToastApi = { show: (message: string) => void }

const ToastContext = createContext<ToastApi | null>(null)

const DURATION_MS = 4000

/** Polite live region plus a `useToast()` hook. Toasts disappear on their own. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>())

  // Pending timers must not outlive the provider (they would update a torn-down tree).
  useEffect(() => {
    const pending = timers.current
    return () => {
      pending.forEach(clearTimeout)
      pending.clear()
    }
  }, [])

  const show = useCallback((message: string) => {
    const id = Date.now() + Math.random()
    setItems((list) => [...list, { id, message }])
    const timer = setTimeout(() => {
      timers.current.delete(timer)
      setItems((list) => list.filter((t) => t.id !== id))
    }, DURATION_MS)
    timers.current.add(timer)
  }, [])

  const api = useMemo(() => ({ show }), [show])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className="toast-in pointer-events-auto flex max-w-md items-center gap-2 rounded-full bg-text px-5 py-3 text-sm font-bold text-on-primary shadow-dialog"
          >
            <CheckCircle2 size={18} aria-hidden="true" />
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
