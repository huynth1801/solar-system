'use client'

import { useEffect } from 'react'
import { COMPARE_ROWS, SUN, bodyById } from '@/data/planets'
import { useSolarStore } from '@/store/solarStore'

function Circle({ id, px }: { id: string; px: number }) {
  const body = bodyById(id)
  if (!body) return null
  const size = Math.max(px, 8)
  return (
    <div className="flex flex-col items-center gap-1.5" style={{ width: Math.max(size, 64) }}>
      <div
        className="rounded-full"
        style={{
          width: size,
          height: size,
          backgroundColor: body.color,
          backgroundImage: body.texture ? `url(${body.texture})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: `inset -${Math.max(size * 0.08, 3)}px -${Math.max(size * 0.08, 3)}px ${Math.max(size * 0.2, 8)}px rgba(0,0,0,0.5), 0 0 ${Math.max(size * 0.15, 6)}px ${body.color}44`,
        }}
      />
      <div className="text-center">
        <div className="text-xs font-semibold text-white/85">{body.name}</div>
        <div className="text-[10px] text-white/40">{body.info.diameter}</div>
        <div className="text-[10px] font-medium text-amber-300/80">
          {id === 'earth' ? 'chuẩn' : `×${body.realRadiusRatio < 1 ? body.realRadiusRatio.toFixed(2) : body.realRadiusRatio.toFixed(1)} Trái Đất`}
        </div>
      </div>
    </div>
  )
}

function Row({ title, note, items }: { title: string; note?: string; items: string[] }) {
  const bodies = items.map(bodyById).filter(Boolean)
  const maxRatio = Math.max(...bodies.map((b) => b!.realRadiusRatio))
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <h3 className="text-sm font-bold text-white/90">{title}</h3>
      {note && <p className="mt-0.5 text-[11px] text-white/40">{note}</p>}
      <div className="mt-4 flex items-end gap-3 overflow-x-auto pb-1 panel-scroll">
        {items.map((id) => (
          <Circle key={id} id={id} px={(bodyById(id)!.realRadiusRatio / maxRatio) * 120} />
        ))}
      </div>
    </section>
  )
}

/** Modal so sánh kích thước các thiên thể theo đúng tỷ lệ thật */
export default function CompareModal() {
  const open = useSolarStore((s) => s.compareOpen)
  const setOpen = useSolarStore((s) => s.setCompareOpen)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, setOpen])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b1d]/95 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <h2 className="text-lg font-bold text-white">So sánh kích thước</h2>
            <p className="text-xs text-white/40">Đường kính đúng tỷ lệ thật giữa các thiên thể</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Đóng"
            className="rounded-full border border-white/10 bg-white/5 p-2 text-white/60 transition hover:rotate-90 hover:bg-white/15 hover:text-white"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="panel-scroll flex-1 space-y-4 overflow-y-auto p-5">
          {/* Mặt Trời quá to — chỉ vẽ vành cung để cảm nhận */}
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            <div className="p-4 pb-2">
              <h3 className="text-sm font-bold text-white/90">Mặt Trời vs Trái Đất</h3>
              <p className="mt-0.5 text-[11px] text-white/40">
                Mặt Trời to gấp 109 lần Trái Đất — modal này không đủ chỗ, chỉ vẽ được vành cung của nó
              </p>
            </div>
            <div className="relative h-36">
              <div
                className="absolute left-1/2 -translate-x-1/2 rounded-full"
                style={{
                  width: 900,
                  height: 900,
                  bottom: -745,
                  backgroundColor: '#ffb347',
                  backgroundImage: `url(${SUN.texture})`,
                  backgroundSize: 'cover',
                  boxShadow: '0 -20px 100px 30px rgba(255,140,50,0.35)',
                }}
              />
              <div className="absolute bottom-3 right-5 flex items-end gap-2">
                <div>
                  <div
                    className="rounded-full"
                    style={{
                      width: 8,
                      height: 8,
                      backgroundColor: '#6ea8ff',
                      backgroundImage: 'url(/textures/earth.jpg)',
                      backgroundSize: 'cover',
                      boxShadow: '0 0 8px rgba(110,168,255,0.8)',
                    }}
                  />
                  <div className="mt-1 text-right text-[10px] font-medium text-sky-300">Trái Đất</div>
                  <div className="text-[9px] text-white/35">chấm bé xíu này</div>
                </div>
              </div>
            </div>
          </section>

          {COMPARE_ROWS.map((row) => (
            <Row key={row.title} {...row} />
          ))}
        </div>
      </div>
    </div>
  )
}
