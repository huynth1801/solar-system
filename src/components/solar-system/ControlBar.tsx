'use client'

import { bodyById, CHIP_ORDER } from '@/data/planets'
import { useSolarStore } from '@/store/solarStore'

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 4 5.6 4 9s-1.5 6.4-4 9c-2.5-2.6-4-5.6-4-9s1.5-6.4 4-9z" />
    </svg>
  )
}

/** Thanh điều khiển: chip chọn nhanh hành tinh + pause/play + slider tốc độ + về toàn cảnh */
export default function ControlBar() {
  const speed = useSolarStore((s) => s.speed)
  const paused = useSolarStore((s) => s.paused)
  const selectedId = useSolarStore((s) => s.selectedId)
  const flightMode = useSolarStore((s) => s.flightMode)
  const setSpeed = useSolarStore((s) => s.setSpeed)
  const togglePause = useSolarStore((s) => s.togglePause)
  const select = useSolarStore((s) => s.select)
  const terrainBusy = useSolarStore((s) => s.terrain.status !== 'idle')

  // Chế độ bay tự do có HUD riêng, du hành quốc gia có HUD riêng — ẩn cho rộng tầm nhìn
  if (flightMode || terrainBusy) return null

  const speedLabel = Number.isInteger(speed) ? speed.toFixed(0) : speed.toFixed(2).replace(/0$/, '')

  return (
    <div className="animate-fade-up pointer-events-none fixed inset-x-0 bottom-0 z-20 flex flex-col items-center gap-3 pb-4 md:pb-6">
      {/* Chip chọn nhanh thiên thể */}
      <div className="panel-scroll pointer-events-auto max-w-full overflow-x-auto px-3">
        <div className="flex w-max gap-1.5">
          {CHIP_ORDER.map((id) => {
            const body = bodyById(id)
            if (!body) return null
            const active = selectedId === id
            return (
              <button
                key={id}
                onClick={() => select(id)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition hover:scale-[1.06] active:scale-95 ${
                  active
                    ? 'border-amber-300/60 bg-amber-300/15 text-amber-200 shadow-[0_0_16px_rgba(251,191,36,0.3)]'
                    : 'border-white/10 bg-black/50 text-white/70 backdrop-blur-md hover:bg-white/10 hover:text-white'
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: body.color, boxShadow: `0 0 6px ${body.color}` }}
                />
                {body.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Thanh điều khiển chính */}
      <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-white/10 bg-black/55 px-4 py-2.5 shadow-lg shadow-black/50 backdrop-blur-xl">
        <button
          onClick={togglePause}
          aria-label={paused ? 'Chạy' : 'Tạm dừng'}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/15 hover:text-white"
        >
          {paused ? <PlayIcon /> : <PauseIcon />}
        </button>

        <div className="flex items-center gap-2.5">
          <input
            type="range"
            min={0}
            max={5}
            step={0.25}
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="speed-slider w-32 md:w-44"
            aria-label="Tốc độ mô phỏng"
          />
          <span className="w-10 text-right text-xs font-semibold tabular-nums text-amber-300">
            ×{speedLabel}
          </span>
        </div>

        <div className="h-5 w-px bg-white/10" />

        <button
          onClick={() => select(null)}
          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/15 hover:text-white"
        >
          <GlobeIcon />
          Toàn cảnh
        </button>
      </div>
    </div>
  )
}
