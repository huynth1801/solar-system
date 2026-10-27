'use client'

import { useEffect, useState } from 'react'
import { useProgress } from '@react-three/drei'
import { useSolarStore } from '@/store/solarStore'

/** Màn chờ tải texture: hành tinh + quỹ đạo quay, fade khi xong rồi bắn camera mở màn */
export default function LoadingScreen() {
  const { progress, active } = useProgress()
  const done = progress > 0 && progress >= 100 && !active
  const [hidden, setHidden] = useState(false)
  const setReady = useSolarStore((s) => s.setReady)

  useEffect(() => {
    if (done) {
      // Bắt đầu đường bay mở màn khi overlay đang mờ dần
      const t1 = setTimeout(() => setReady(), 450)
      const t2 = setTimeout(() => setHidden(true), 850)
      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
      }
    }
  }, [done, setReady])

  // An toàn: nếu chẳng có gì cần tải (progress mãi 0) thì tự đóng sau 6 giây
  const started = progress > 0 || active
  useEffect(() => {
    if (hidden || started) return
    const t = setTimeout(() => {
      setHidden(true)
      setReady()
    }, 6000)
    return () => clearTimeout(t)
  }, [hidden, started, setReady])

  if (hidden) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,#0b0b2e_0%,#020010_75%)] transition-opacity duration-700 ${
        done ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <div className="relative flex h-28 w-28 items-center justify-center">
        <div className="absolute inset-0 animate-[spin_3.2s_linear_infinite] rounded-full border border-amber-300/30">
          <span className="absolute -top-[3px] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-amber-300 shadow-[0_0_10px_2px_rgba(252,211,77,0.9)]" />
        </div>
        <div className="absolute inset-4 animate-[spin_5.4s_linear_infinite_reverse] rounded-full border border-white/15">
          <span className="absolute -top-[3px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-sky-300 shadow-[0_0_8px_2px_rgba(125,211,252,0.8)]" />
        </div>
        <div className="animate-pulse text-4xl">🪐</div>
      </div>

      <h2 className="mt-8 bg-gradient-to-r from-amber-200 via-orange-300 to-amber-200 bg-clip-text text-sm font-bold tracking-[0.45em] text-transparent">
        HỆ MẶT TRỜI
      </h2>
      <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-white/40">Đang tải vũ trụ</p>

      <div className="mt-5 h-1.5 w-56 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 shadow-[0_0_12px_rgba(251,146,60,0.7)] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-3 text-xs tabular-nums text-white/40">{Math.round(progress)}%</p>
    </div>
  )
}
