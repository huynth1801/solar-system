'use client'

import { useEffect, useRef } from 'react'
import { useSolarStore } from '@/store/solarStore'
import { flightHud } from './registry'

/** HUD chế độ bay tự do: tâm ngắm, vận tốc, hướng dẫn, nút thoát + nút bay cho mobile */
export default function FlightHud() {
  const flightMode = useSolarStore((s) => s.flightMode)
  const flightSpeed = useSolarStore((s) => s.flightSpeed)
  const toggleFlight = useSolarStore((s) => s.toggleFlight)
  const thrustRef = useRef<HTMLButtonElement>(null)

  // Nút "TIẾN" cho mobile: giữ để bay
  useEffect(() => {
    const el = thrustRef.current
    if (!el || !flightMode) return
    const start = (e: PointerEvent) => {
      e.preventDefault()
      flightHud.mobileThrust = true
    }
    const stop = () => {
      flightHud.mobileThrust = false
    }
    el.addEventListener('pointerdown', start)
    el.addEventListener('pointerup', stop)
    el.addEventListener('pointerleave', stop)
    el.addEventListener('pointercancel', stop)
    return () => {
      el.removeEventListener('pointerdown', start)
      el.removeEventListener('pointerup', stop)
      el.removeEventListener('pointerleave', stop)
      el.removeEventListener('pointercancel', stop)
      flightHud.mobileThrust = false
    }
  }, [flightMode])

  if (!flightMode) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-30 select-none">
      {/* Tâm ngắm */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="h-5 w-5 rounded-full border border-white/40 shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
        <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80" />
      </div>

      {/* Thanh trạng thái trên */}
      <div className="absolute left-1/2 top-4 flex -translate-x-1/2 items-center gap-3 rounded-full border border-sky-300/25 bg-sky-950/60 px-4 py-2 backdrop-blur-xl">
        <span className="text-xs font-bold tracking-[0.2em] text-sky-300">🚀 CHẾ ĐỘ BAY TỰ DO</span>
        <button
          onClick={toggleFlight}
          className="pointer-events-auto rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80 transition hover:bg-white/20 hover:text-white"
        >
          Thoát (Esc)
        </button>
      </div>

      {/* Vận tốc */}
      <div className="absolute bottom-4 left-4 rounded-xl border border-white/10 bg-black/50 px-3 py-2 backdrop-blur-xl">
        <div className="text-[10px] uppercase tracking-widest text-white/40">Vận tốc</div>
        <div className="text-lg font-bold tabular-nums text-sky-300">
          {flightSpeed.toFixed(1)} <span className="text-xs text-white/40">đv/giây</span>
        </div>
      </div>

      {/* Hướng dẫn */}
      <div className="absolute bottom-4 right-4 hidden rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-[11px] leading-relaxed text-white/60 backdrop-blur-xl md:block">
        <div><b className="text-white/85">W A S D</b> — bay · <b className="text-white/85">Space/Shift</b> — lên/xuống</div>
        <div><b className="text-white/85">Kéo chuột</b> — nhìn quanh · <b className="text-white/85">Lăn chuột</b> — chỉnh ga</div>
      </div>

      {/* Nút bay cho mobile */}
      <button
        ref={thrustRef}
        className="pointer-events-auto absolute bottom-6 left-1/2 h-20 w-20 -translate-x-1/2 touch-none rounded-full border border-sky-300/40 bg-sky-500/20 text-sm font-bold text-sky-200 backdrop-blur-xl active:bg-sky-400/40 md:hidden"
      >
        TIẾN ▲
      </button>
    </div>
  )
}
