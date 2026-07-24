import type { ComponentType } from 'react'
import { Download, Phone, RotateCcw, Share2, Users } from 'lucide-react'
import { actionBar } from '@/features/profile-test/constants/copy'

export interface TestActionBarProps {
  onRestart?: () => void
  onMembers?: () => void
  onDownload?: () => void
  onScheduleCall?: () => void
  onShare?: () => void
}

interface ActionButtonProps {
  label: string
  icon: ComponentType<{ className?: string }>
  onClick?: () => void
}

function ActionButton({ label, icon: Icon, onClick }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="group relative flex size-[52px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-sabbi-border bg-white transition-colors hover:border-sabbi-verde hover:bg-[#f0f4e8]"
    >
      <Icon className="size-[22px] text-sabbi-verde-prof" />
      <span className="pointer-events-none absolute bottom-[calc(100%+9px)] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#1a2310] px-2.5 py-[5px] text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100">
        {label}
      </span>
    </button>
  )
}

/** Result action bar: restart, members, download, schedule call, share. */
export function TestActionBar({
  onRestart,
  onMembers,
  onDownload,
  onScheduleCall,
  onShare,
}: TestActionBarProps) {
  return (
    <div className="mt-[18px] flex flex-wrap justify-center gap-3">
      <ActionButton
        label={actionBar.restart}
        icon={RotateCcw}
        onClick={onRestart}
      />
      <ActionButton
        label={actionBar.members}
        icon={Users}
        onClick={onMembers}
      />
      <ActionButton
        label={actionBar.download}
        icon={Download}
        onClick={onDownload}
      />
      <ActionButton
        label={actionBar.scheduleCall}
        icon={Phone}
        onClick={onScheduleCall}
      />
      <ActionButton label={actionBar.share} icon={Share2} onClick={onShare} />
    </div>
  )
}
