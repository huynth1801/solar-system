'use client'

import { useEffect, useRef } from 'react'
import { bodyById } from '@/data/planets'
import { useSolarStore } from '@/store/solarStore'

/** Tên thiên thể / quốc gia bám theo con trỏ khi hover */
export default function Tooltip() {
  const hoveredId = useSolarStore((s) => s.hoveredId)
  const countryHover = useSolarStore((s) => s.countryHover)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (ref.current) {
        ref.current.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 16}px)`
      }
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [])

  const body = hoveredId ? bodyById(hoveredId) : null
  const show = body || countryHover

  return (
    <div
      ref={ref}
      className={`pointer-events-none fixed left-0 top-0 z-40 transition-opacity duration-150 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="rounded-lg border border-white/15 bg-black/75 px-3 py-1.5 shadow-xl backdrop-blur-md">
        {countryHover ? (
          <span className="text-sm font-semibold text-white">
            {countryHover.name}
            <span className="ml-1.5 text-[11px] font-medium text-emerald-300/80">
              · bấm để hạ cánh 🛬
            </span>
          </span>
        ) : (
          <>
            <span className="text-sm font-semibold text-white">{body?.name}</span>{' '}
            <span className="text-xs text-white/40">· {body?.nameEn}</span>
          </>
        )}
      </div>
    </div>
  )
}
