import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { canCreatePig } from '../../domain/slots'
import { useApp } from '../../state/AppProvider'
import { CreatePigModal } from './CreatePigModal'

type Api = {
  /** False when every pig slot is in use. */
  canCreate: boolean
  open: () => void
}

const CreatePigContext = createContext<Api | null>(null)

/** Lets any section open the create-pig modal, and renders the modal once for the whole page. */
export function CreatePigProvider({ children }: { children: ReactNode }) {
  const { data } = useApp()
  const [isOpen, setOpen] = useState(false)
  const canCreate = canCreatePig(data)
  const open = useCallback(() => setOpen(true), [])
  const api = useMemo(() => ({ canCreate, open }), [canCreate, open])

  return (
    <CreatePigContext.Provider value={api}>
      {children}
      <CreatePigModal open={isOpen} onOpenChange={setOpen} />
    </CreatePigContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCreatePig(): Api {
  const ctx = useContext(CreatePigContext)
  if (!ctx) throw new Error('useCreatePig must be used inside <CreatePigProvider>')
  return ctx
}
