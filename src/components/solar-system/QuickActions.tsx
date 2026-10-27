'use client'

import { useSolarStore } from '@/store/solarStore'

function PlaneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
    </svg>
  )
}

function CompareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="8" cy="12" r="6" />
      <circle cx="18" cy="12" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function ScaleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" strokeLinecap="round" />
    </svg>
  )
}

/** Thanh nút dọc bên phải: bay tự do · so sánh kích thước · tỷ lệ thực */
export default function QuickActions() {
  const flightMode = useSolarStore((s) => s.flightMode)
  const realScale = useSolarStore((s) => s.realScale)
  const terrainBusy = useSolarStore((s) => s.terrain.status !== 'idle')
  const toggleFlight = useSolarStore((s) => s.toggleFlight)
  const toggleRealScale = useSolarStore((s) => s.toggleRealScale)
  const setCompareOpen = useSolarStore((s) => s.setCompareOpen)

  if (flightMode || terrainBusy) return null

  const btn =
    'flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/55 text-white/70 backdrop-blur-xl transition hover:scale-110 hover:bg-white/15 hover:text-white active:scale-95'

  return (
    <div
      className="fixed z-20 flex gap-2
        max-md:right-3 max-md:top-16 max-md:flex-row
        md:right-5 md:top-1/2 md:-translate-y-1/2 md:flex-col"
    >
      <button onClick={toggleFlight} className={btn} title="Chế độ bay tự do (WASD)">
        <PlaneIcon />
      </button>
      <button onClick={() => setCompareOpen(true)} className={btn} title="So sánh kích thước">
        <CompareIcon />
      </button>
      <button
        onClick={toggleRealScale}
        className={`${btn} ${realScale ? 'border-amber-300/60 !text-amber-300 shadow-[0_0_16px_rgba(251,191,36,0.35)]' : ''}`}
        title={realScale ? 'Đang ở tỷ lệ thực 1:1 — bấm để về chế độ đẹp' : 'Bật tỷ lệ thực 1:1'}
      >
        <ScaleIcon />
      </button>
    </div>
  )
}
