'use client'

import { useEffect, useState } from 'react'
import { continentVi, countryNameVi, flagEmoji } from '@/lib/countryTerrain'
import { useSolarStore } from '@/store/solarStore'

/** HUD du hành quốc gia: màn tải ô dữ liệu, thẻ thông tin, nút quay về vũ trụ */
export default function CountryHud() {
  const terrain = useSolarStore((s) => s.terrain)
  const exitTerrain = useSolarStore((s) => s.exitCountryTerrain)
  const retry = useSolarStore((s) => s.retryCountryTerrain)
  const [hintVisible, setHintVisible] = useState(false)

  const country = terrain.country
  const nameVi = country ? countryNameVi(country.iso2, country.nameEn) : ''

  useEffect(() => {
    if (terrain.status === 'ready') {
      setHintVisible(true)
      const t = setTimeout(() => setHintVisible(false), 6000)
      return () => clearTimeout(t)
    }
  }, [terrain.status])

  if (terrain.status === 'idle' || !country) return null

  if (terrain.status === 'loading') {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-md">
        <div className="flex w-[320px] flex-col items-center rounded-3xl border border-white/10 bg-[#0b0b1d]/90 p-7 shadow-2xl">
          <div className="text-5xl">{flagEmoji(country.iso2)}</div>
          <p className="mt-4 text-center text-lg font-bold text-white">
            Đang dựng địa hình {nameVi}
          </p>
          <p className="mt-1 text-center text-xs text-white/45">
            Tải ô cao độ &amp; ảnh vệ tinh — cần kết nối mạng
          </p>
          <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400 transition-all duration-300"
              style={{ width: `${Math.round(terrain.progress * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs tabular-nums text-white/40">
            {Math.round(terrain.progress * 100)}%
          </p>
        </div>
      </div>
    )
  }

  if (terrain.status === 'error') {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-md">
        <div className="flex w-[320px] flex-col items-center rounded-3xl border border-red-400/20 bg-[#0b0b1d]/90 p-7 shadow-2xl">
          <div className="text-4xl">📡</div>
          <p className="mt-4 text-center font-bold text-white">Không tải được dữ liệu</p>
          <p className="mt-1 text-center text-xs text-white/45">{terrain.error}</p>
          <div className="mt-5 flex gap-2">
            <button
              onClick={retry}
              className="rounded-full border border-sky-300/40 bg-sky-400/15 px-4 py-2 text-sm font-medium text-sky-200 transition hover:bg-sky-400/25"
            >
              Thử lại
            </button>
            <button
              onClick={exitTerrain}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/70 transition hover:bg-white/15"
            >
              Quay về
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ready
  const popM = country.popEst / 1e6
  return (
    <div className="pointer-events-none fixed inset-0 z-30 select-none">
      <div className="absolute left-4 top-4 flex flex-col gap-3 md:left-6 md:top-6">
        <button
          onClick={exitTerrain}
          className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/15 bg-black/60 px-4 py-2.5 text-sm font-semibold text-white/85 backdrop-blur-xl transition hover:scale-105 hover:bg-white/15 hover:text-white"
        >
          🛬 Quay về vũ trụ
        </button>

        <div className="rounded-2xl border border-white/10 bg-black/55 px-4 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{flagEmoji(country.iso2)}</span>
            <div>
              <div className="text-base font-bold text-white">{nameVi}</div>
              <div className="text-[11px] text-white/45">
                {country.nameEn} · {continentVi(country.continent)}
              </div>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-white/60">
            {popM >= 1 ? (
              <span>👥 {popM >= 100 ? Math.round(popM) : popM.toFixed(1)} triệu dân</span>
            ) : null}
            <span>⛰ Độ cao phóng đại ×{terrain.data?.exaggeration ?? '—'}</span>
          </div>
        </div>
      </div>

      <div
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/55 px-4 py-2 text-xs text-white/55 backdrop-blur-xl transition-opacity duration-700 ${
          hintVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        Kéo để xoay quanh địa hình · Lăn chuột để bay sát núi · Ảnh vệ tinh &amp; cao độ thật
      </div>
    </div>
  )
}
