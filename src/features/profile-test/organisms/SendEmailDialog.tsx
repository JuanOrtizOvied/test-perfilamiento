import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/packages/design/ui/dialog'
import { Input } from '@/packages/design/ui/input'
import { cn } from '@/packages/lib/utils'
import { emailModal } from '@/features/profile-test/constants/copy'

interface SendEmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Pre-filled email (from the personal form); reseeded each time it opens. */
  defaultEmail?: string
  /** Highlights the input when the last send attempt was rejected. */
  invalid?: boolean
  /** Ported from `enviarPorCorreo`; receives the current input value. */
  onSend?: (email: string) => void
  onCancel?: () => void
}

/** "Enviar resultado por correo" modal, over the shadcn dialog primitive. */
export function SendEmailDialog({
  open,
  onOpenChange,
  defaultEmail = '',
  invalid = false,
  onSend,
  onCancel,
}: SendEmailDialogProps) {
  const [email, setEmail] = useState(defaultEmail)

  // Reseed with the personal-form email each time the modal opens
  // (original `abrirModalCorreo`).
  useEffect(() => {
    if (open) setEmail(defaultEmail)
  }, [open, defaultEmail])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle className="text-sabbi-verde-prof">
            {emailModal.title}
          </DialogTitle>
          <DialogDescription>{emailModal.description}</DialogDescription>
        </DialogHeader>

        <Input
          type="email"
          placeholder={emailModal.placeholder}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={cn(invalid && 'border-[#e53935]')}
        />

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onCancel ?? (() => onOpenChange(false))}
            className="flex-1 rounded-[40px] bg-[#f0f0e8] px-3 py-3 text-[14px] font-bold text-sabbi-verde-prof"
          >
            {emailModal.cancel}
          </button>
          <button
            type="button"
            onClick={() => onSend?.(email.trim())}
            className="flex-1 rounded-[40px] bg-sabbi-morado px-3 py-3 text-[14px] font-bold text-white"
          >
            {emailModal.send}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
