'use client'

import dynamic from 'next/dynamic'
import CompareModal from '@/components/solar-system/CompareModal'
import ControlBar from '@/components/solar-system/ControlBar'
import CountryHud from '@/components/solar-system/CountryHud'
import FlightHud from '@/components/solar-system/FlightHud'
import InfoPanel from '@/components/solar-system/InfoPanel'
import LoadingScreen from '@/components/solar-system/LoadingScreen'
import QuickActions from '@/components/solar-system/QuickActions'
import Tooltip from '@/components/solar-system/Tooltip'
import { useSolarStore } from '@/store/solarStore'

// Canvas chỉ chạy phía client
const SolarSystemScene = dynamic(() => import('@/components/solar-system/SolarSystemScene'), {
  ssr: false,
  loading: () => null,
})

export default function Home() {
  const terrainBusy = useSolarStore((s) => s.terrain.status !== 'idle')

  return (
    <main className="fixed inset-0 select-none overflow-hidden bg-[#020010] text-white">
      <SolarSystemScene />

      {!terrainBusy && (
        <>
          <header className="animate-fade-down pointer-events-none fixed left-0 top-0 z-20 p-5 md:p-7">
            <h1 className="bg-gradient-to-r from-amber-200 via-orange-300 to-amber-200 bg-clip-text text-lg font-bold tracking-[0.15em] text-transparent drop-shadow-[0_0_18px_rgba(251,146,60,0.35)] md:text-2xl">
              HỆ MẶT TRỜI
            </h1>
            <p className="mt-1 text-[11px] text-white/50 md:text-xs">
              Mô hình 3D tương tác · Kéo để xoay — Chạm hành tinh để khám phá
            </p>
          </header>

          <div className="pointer-events-none fixed right-0 top-0 z-20 hidden p-4 text-[10px] text-white/30 md:block">
            Texture &amp; dữ liệu: NASA / Solar System Scope
          </div>
        </>
      )}

      <Tooltip />
      <InfoPanel />
      <ControlBar />
      <QuickActions />
      <FlightHud />
      <CompareModal />
      <CountryHud />
      <LoadingScreen />
    </main>
  )
}
