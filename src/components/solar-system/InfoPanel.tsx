'use client'

import { useEffect } from 'react'
import type { BodyInfo } from '@/data/planets'
import { bodyById } from '@/data/planets'
import { useSolarStore } from '@/store/solarStore'

function MoonLinks({ moonIds, onPick }: { moonIds: string[]; onPick: (id: string) => void }) {
  const moons = moonIds.map(bodyById).filter(Boolean)
  if (moons.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-1.5 px-5 pb-1 pt-3">
      <span className="mr-1 text-[10px] uppercase tracking-wider text-white/40">Vệ tinh lớn</span>
      {moons.map((m) => (
        <button
          key={m!.id}
          onClick={() => onPick(m!.id)}
          className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/70 transition hover:scale-105 hover:bg-white/15 hover:text-white"
        >
          <span
            className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle"
            style={{ backgroundColor: m!.color }}
          />
          {m!.name}
        </button>
      ))}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.04] px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-white/40">{label}</div>
      <div className="mt-0.5 text-[13px] font-semibold leading-snug text-white/90">{value}</div>
    </div>
  )
}

function InfoRows({ info }: { info: BodyInfo }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Stat label="Đường kính" value={info.diameter} />
      <Stat label="Khối lượng" value={info.mass} />
      <Stat label={info.distanceLabel} value={info.distance} />
      <Stat label="Chu kỳ quỹ đạo" value={info.orbitalPeriod} />
      <Stat label="Độ dài ngày" value={info.dayLength} />
      <Stat label="Nhiệt độ" value={info.temperature} />
      <Stat label="Vệ tinh" value={info.moons} />
      <Stat label="Trạng thái" value="Đang quan sát 🔭" />
    </div>
  )
}

/**
 * Panel thông tin: desktop trượt vào từ phải, mobile là bottom sheet.
 */
export default function InfoPanel() {
  const selectedId = useSolarStore((s) => s.selectedId)
  const select = useSolarStore((s) => s.select)
  const terrainBusy = useSolarStore((s) => s.terrain.status !== 'idle')
  const body = selectedId ? bodyById(selectedId) : null
  const open = !!body && !terrainBusy

  // Esc để đóng panel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') select(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [select])

  return (
    <aside
      className={`fixed z-30 flex flex-col overflow-hidden border border-white/10 bg-[#0b0b1d]/90 shadow-2xl shadow-black/70 backdrop-blur-xl transition-transform duration-500 ease-out
        max-md:inset-x-2 max-md:bottom-[108px] max-md:max-h-[52vh] max-md:rounded-2xl
        md:top-1/2 md:right-6 md:w-[390px] md:max-h-[84vh] md:-translate-y-1/2 md:rounded-2xl
        ${open ? 'translate-y-0 md:translate-x-0' : 'pointer-events-none max-md:translate-y-[130%] md:translate-x-[130%]'}`}
    >
      {/* Viền accent màu riêng của thiên thể */}
      <div
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${body?.color ?? '#ffb347'}, transparent)`,
        }}
      />
      {body && (
        <>
          <div className="flex items-start gap-4 border-b border-white/10 p-5">
            <div
              className="h-14 w-14 shrink-0 animate-[spin_24s_linear_infinite] rounded-full border"
              style={
                body.texture
                  ? {
                      backgroundImage: `url(${body.texture})`,
                      backgroundSize: '200% 100%',
                      backgroundPosition: 'center',
                      backgroundColor: body.color,
                      borderColor: `${body.color}88`,
                      boxShadow: `0 0 22px ${body.color}55`,
                    }
                  : {
                      background: `radial-gradient(circle at 32% 30%, #eaffff 0%, #7fd0ff 35%, #1d5d8f 100%)`,
                      borderColor: '#7fd0ff88',
                      boxShadow: '0 0 22px #7fd0ff55',
                    }
              }
            />
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-xl font-bold text-white">{body.name}</h2>
              <p className="text-xs text-white/40">{body.nameEn}</p>
              <p className="mt-1 text-xs leading-snug text-amber-200/80">{body.tagline}</p>
            </div>
            <button
              onClick={() => select(null)}
              aria-label="Đóng"
              className="rounded-full border border-white/10 bg-white/5 p-2 text-white/60 transition hover:rotate-90 hover:bg-white/15 hover:text-white"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {body.moonIds && <MoonLinks moonIds={body.moonIds} onPick={select} />}

          {body.id === 'earth' && (
            <div className="mx-5 mb-1 mt-3 rounded-xl border border-emerald-300/25 bg-emerald-400/[0.07] px-3 py-2.5 text-[12px] leading-relaxed text-emerald-100/85">
              🌍 <b>Mẹo:</b> đang zoom gần Trái Đất? Bấm thẳng vào <b>bất kỳ quốc gia nào</b> trên
              quả cầu để hạ cánh xuống địa hình 3D thật của nước đó — núi, sông, biển hiện ra đúng
              ảnh vệ tinh!
            </div>
          )}

          <div className="panel-scroll flex-1 space-y-5 overflow-y-auto p-5">
            <InfoRows info={body.info} />

            <div>
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
                Giới thiệu
              </h3>
              <p className="text-sm leading-relaxed text-white/75">{body.info.description}</p>
            </div>

            <div>
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
                💡 Sự thật thú vị
              </h3>
              <ul className="space-y-2.5">
                {body.info.funFacts.map((fact, i) => (
                  <li
                    key={i}
                    className="rounded-lg border-l-2 border-amber-400/70 bg-amber-400/[0.06] px-3 py-2 text-[13px] leading-relaxed text-white/80"
                  >
                    {fact}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </aside>
  )
}
