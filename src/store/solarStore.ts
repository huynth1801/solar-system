import { create } from 'zustand'
import {
  buildTerrain,
  pickCountry,
  type CountryFeature,
  type TerrainData,
} from '@/lib/countryTerrain'

export type TerrainStatus = 'idle' | 'loading' | 'ready' | 'error'

interface TerrainState {
  status: TerrainStatus
  country: CountryFeature | null
  data: TerrainData | null
  progress: number
  error: string
}

interface SolarState {
  /** Thiên thể đang được chọn (để camera bay tới + mở panel) */
  selectedId: string | null
  /** Thiên thể đang được hover (tooltip + hiệu ứng sáng) */
  hoveredId: string | null
  /** Quốc gia đang hover trên quả địa cầu (tooltip + viền sáng) */
  countryHover: { id: string; name: string } | null
  /** Tốc độ mô phỏng ×0 → ×5 */
  speed: number
  paused: boolean
  /** Texture đã tải xong → bắn hiệu ứng camera mở màn */
  ready: boolean
  /** Chế độ tỷ lệ thực (1:1) */
  realScale: boolean
  /** Tăng mỗi lần bật/tắt tỷ lệ thực → CameraRig nghe để bay về góc nhìn mới */
  scaleKick: number
  /** Chế độ bay tự do WASD */
  flightMode: boolean
  /** Vận tốc hiển thị trên HUD (đơn vị/giây), cập nhật throttled */
  flightSpeed: number
  /** Modal so sánh kích thước */
  compareOpen: boolean
  /** Du hành xuống địa hình 3D của quốc gia */
  terrain: TerrainState
  select: (id: string | null) => void
  setHovered: (id: string | null) => void
  setCountryHover: (hover: { id: string; name: string } | null) => void
  setSpeed: (v: number) => void
  togglePause: () => void
  setReady: () => void
  toggleRealScale: () => void
  toggleFlight: () => void
  setFlightSpeed: (v: number) => void
  setCompareOpen: (v: boolean) => void
  /** Bấm vào điểm (lat, lon) trên Trái Đất: mở terrain quốc gia nếu trúng */
  openCountryTerrain: (lat: number, lon: number) => Promise<boolean>
  exitCountryTerrain: () => void
  retryCountryTerrain: () => void
}

export const useSolarStore = create<SolarState>((set, get) => {
  const buildAndSet = async (country: CountryFeature) => {
    set({ terrain: { status: 'loading', country, data: null, progress: 0, error: '' } })
    try {
      const data = await buildTerrain(country, (loaded, total) => {
        set({ terrain: { status: 'loading', country, data: null, progress: loaded / total, error: '' } })
      })
      set({ terrain: { status: 'ready', country, data, progress: 1, error: '' } })
    } catch {
      set({ terrain: { status: 'error', country, data: null, progress: 0, error: 'Không tải được dữ liệu địa hình — kiểm tra kết nối mạng.' } })
    }
  }

  return {
  selectedId: null,
  hoveredId: null,
  countryHover: null,
  speed: 1,
  paused: false,
  ready: false,
  realScale: false,
  scaleKick: 0,
  flightMode: false,
  flightSpeed: 0,
  compareOpen: false,
  terrain: { status: 'idle', country: null, data: null, progress: 0, error: '' },
  select: (id) => set({ selectedId: id, hoveredId: null }),
  setHovered: (id) => set({ hoveredId: id }),
  setCountryHover: (name) => set({ countryHover: name }),
  // Kéo slider là coi như chạy lại, kể cả khi đang pause
  setSpeed: (v) => set({ speed: v, paused: false }),
  togglePause: () => set((s) => ({ paused: !s.paused })),
  setReady: () => set({ ready: true }),
  // Đổi tỷ lệ: bỏ chọn + đá camera bay về góc toàn cảnh của chế độ mới
  toggleRealScale: () =>
    set((s) => ({ realScale: !s.realScale, scaleKick: s.scaleKick + 1, selectedId: null })),
  // Vào chế độ bay: bỏ chọn để camera không giật định hướng
  toggleFlight: () => set((s) => ({ flightMode: !s.flightMode, selectedId: null })),
  setFlightSpeed: (v) => set({ flightSpeed: v }),
  setCompareOpen: (v) => set({ compareOpen: v }),

  openCountryTerrain: async (lat, lon) => {
    const country = await pickCountry(lat, lon)
    if (!country) return false
    set({
      selectedId: null,
      hoveredId: null,
      countryHover: null,
      flightMode: false,
      compareOpen: false,
    })
    await buildAndSet(country)
    return true
  },

  exitCountryTerrain: () => set({ terrain: { status: 'idle', country: null, data: null, progress: 0, error: '' } }),

  retryCountryTerrain: () => {
    const { terrain } = get()
    if (terrain.country) void buildAndSet(terrain.country)
  },
  }
})
