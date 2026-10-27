// Du hành quốc gia: dò quốc gia theo lat/lon + tải ô địa hình (AWS) & ảnh vệ tinh (ESRI)
// rồi dựng dữ liệu terrain 3D. Chạy hoàn toàn phía client.

export interface CountryFeature {
  /** ISO A2 làm id (nếu thiếu thì dùng ADM0_A3) */
  id: string
  nameEn: string
  iso2: string
  popEst: number
  continent: string
  /** [lonMin, latMin, lonMax, latMax] để sàng lọc nhanh */
  bbox: [number, number, number, number]
  /** MultiPolygon: mỗi polygon = [vòng ngoài, ...vòng lỗ] */
  polygons: number[][][][]
}

export interface TerrainData {
  country: CountryFeature
  width: number
  height: number
  segmentsX: number
  segmentsY: number
  /** Lưới cao độ (mét), gw × gh, hàng từ bắc xuống nam */
  heightGrid: Float32Array
  gw: number
  gh: number
  lonMin: number
  lonMax: number
  latMin: number
  latMax: number
  /** meters/đơn vị cảnh */
  metersPerUnit: number
  /** hệ số phóng đại độ cao hiển thị */
  exaggeration: number
  minElev: number
  maxElev: number
  satellite: HTMLCanvasElement
}

const CONTINENT_VI: Record<string, string> = {
  Africa: 'Châu Phi',
  Asia: 'Châu Á',
  Europe: 'Châu Âu',
  'North America': 'Bắc Mỹ',
  'South America': 'Nam Mỹ',
  Oceania: 'Châu Đại Dương',
  Antarctica: 'Nam Cực',
  'Seven seas (open ocean)': 'Thiên Dương',
}

let displayNameVi: Intl.DisplayNames | null = null
export function countryNameVi(iso2: string, fallback: string): string {
  try {
    displayNameVi ??= new Intl.DisplayNames(['vi'], { type: 'region' })
    const name = displayNameVi.of(iso2)
    if (name && name !== iso2) return name
  } catch {
    /* trình duyệt không hỗ trợ */
  }
  return fallback
}

export function continentVi(continent: string): string {
  return CONTINENT_VI[continent] ?? continent
}

export function flagEmoji(iso2: string): string {
  if (!/^[A-Z]{2}$/.test(iso2)) return '🏳️'
  return String.fromCodePoint(
    ...iso2.split('').map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  )
}

/* ---------------- Tải & chỉ mục GeoJSON ---------------- */

let geoPromise: Promise<CountryFeature[]> | null = null

export function getCountries(): Promise<CountryFeature[]> {
  geoPromise ??= fetch('/data/countries.geojson')
    .then((r) => r.json())
    .then((geo: { features: Array<{ properties: Record<string, string | number>; geometry: { type: string; coordinates: unknown } }> }) =>
      geo.features
        .filter((f) => f.geometry?.type === 'Polygon' || f.geometry?.type === 'MultiPolygon')
        .map((f) => {
          const p = f.properties
          let iso2 = String(p.ISO_A2_EH ?? p.ISO_A2 ?? '')
          if (iso2 === '-99' || iso2.length !== 2) {
            iso2 = String(p.ADM0_A3 ?? '').slice(0, 2)
          }
          const raw =
            f.geometry.type === 'Polygon'
              ? [f.geometry.coordinates as number[][][]]
              : (f.geometry.coordinates as number[][][][])
          let lonMin = 180
          let latMin = 90
          let lonMax = -180
          let latMax = -90
          for (const poly of raw) {
            for (const [lon, lat] of poly[0]) {
              if (lon < lonMin) lonMin = lon
              if (lon > lonMax) lonMax = lon
              if (lat < latMin) latMin = lat
              if (lat > latMax) latMax = lat
            }
          }
          return {
            id: iso2,
            nameEn: String(p.ADMIN ?? p.NAME ?? iso2),
            iso2,
            popEst: Number(p.POP_EST ?? 0),
            continent: String(p.CONTINENT ?? ''),
            bbox: [lonMin, latMin, lonMax, latMax] as [number, number, number, number],
            polygons: raw,
          }
        }),
    )
  return geoPromise
}

function pointInRing(lon: number, lat: number, ring: number[][]): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0]
    const yi = ring[i][1]
    const xj = ring[j][0]
    const yj = ring[j][1]
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}

/** Tìm quốc gia chứa điểm (lon/lat) — sàng bằng bbox rồi thử từng vòng */
export async function pickCountry(lat: number, lon: number): Promise<CountryFeature | null> {
  const countries = await getCountries()
  for (const c of countries) {
    const [loMin, laMin, loMax, laMax] = c.bbox
    if (lon < loMin || lon > loMax || lat < laMin || lat > laMax) continue
    for (const poly of c.polygons) {
      if (pointInRing(lon, lat, poly[0])) {
        let inHole = false
        for (let h = 1; h < poly.length; h++) {
          if (pointInRing(lon, lat, poly[h])) {
            inHole = true
            break
          }
        }
        if (!inHole) return c
      }
    }
  }
  return null
}

/* ---------------- Toạ độ ô tile (Web Mercator) ---------------- */

function lonToTileX(lon: number, z: number): number {
  return ((lon + 180) / 360) * 2 ** z
}
function latToTileY(lat: number, z: number): number {
  const clamped = Math.max(-85.05, Math.min(85.05, lat))
  const rad = (clamped * Math.PI) / 180
  return ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * 2 ** z
}

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = url
  })
}

/* ---------------- Dựng dữ liệu terrain ---------------- */

export async function buildTerrain(
  country: CountryFeature,
  onProgress: (loaded: number, total: number) => void,
): Promise<TerrainData> {
  // Giới hạn phạm vi (đừng vẽ tới cực)
  const lonMin = country.bbox[0]
  const latMin = Math.max(country.bbox[1], -78)
  const lonMax = country.bbox[2]
  const latMax = Math.min(country.bbox[3], 80)
  const lonSpan = lonMax - lonMin
  const latSpan = latMax - latMin

  // Chọn zoom sao cho vừa ~ tối đa 4×4 ô địa hình
  let z = 11
  while (z > 2) {
    const nx = Math.floor(lonToTileX(lonMax, z)) - Math.floor(lonToTileX(lonMin, z)) + 1
    const ny = Math.floor(latToTileY(latMin, z)) - Math.floor(latToTileY(latMax, z)) + 1
    if (nx <= 4 && ny <= 4 && nx * ny <= 16) break
    z--
  }
  const elevZoom = z
  const imgZoom = Math.min(z + 1, 12)

  const tx0 = Math.floor(lonToTileX(lonMin, elevZoom))
  const tx1 = Math.floor(lonToTileX(lonMax, elevZoom))
  const ty0 = Math.floor(latToTileY(latMax, elevZoom)) // y tăng về nam
  const ty1 = Math.floor(latToTileY(latMin, elevZoom))

  const elevTiles: Array<[number, number]> = []
  for (let ty = ty0; ty <= ty1; ty++) {
    for (let tx = tx0; tx <= tx1; tx++) elevTiles.push([tx, ty])
  }

  // Ảnh vệ tinh: mỗi ô địa hình × 4 (zoom +1)
  const itx0 = Math.floor(lonToTileX(lonMin, imgZoom))
  const itx1 = Math.floor(lonToTileX(lonMax, imgZoom))
  const ity0 = Math.floor(latToTileY(latMax, imgZoom))
  const ity1 = Math.floor(latToTileY(latMin, imgZoom))
  const imgTiles: Array<[number, number]> = []
  for (let ty = ity0; ty <= ity1; ty++) {
    for (let tx = itx0; tx <= itx1; tx++) imgTiles.push([tx, ty])
  }

  const total = elevTiles.length + imgTiles.length
  let loaded = 0
  const tick = () => {
    loaded++
    onProgress(loaded, total)
  }

  // ---- Ghép lưới cao độ terrarium ----
  const gridW = (tx1 - tx0 + 1) * 256
  const gridH = (ty1 - ty0 + 1) * 256
  const gw = Math.min(gridW, 640)
  const gh = Math.min(gridH, 640)
  const heightGrid = new Float32Array(gw * gh)
  const gridCanvas = document.createElement('canvas')
  gridCanvas.width = gw
  gridCanvas.height = gh
  const gctx = gridCanvas.getContext('2d', { willReadFrequently: true })!

  await Promise.all(
    elevTiles.map(async ([tx, ty]) => {
      const img = await loadImage(
        `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${elevZoom}/${tx}/${ty}.png`,
      )
      if (img) {
        gctx.drawImage(
          img,
          ((tx - tx0) * 256 * gw) / gridW,
          ((ty - ty0) * 256 * gh) / gridH,
          (256 * gw) / gridW,
          (256 * gh) / gridH,
        )
      }
      tick()
    }),
  )
  const px = gctx.getImageData(0, 0, gw, gh).data
  let minElev = Infinity
  let maxElev = -Infinity
  for (let i = 0; i < gw * gh; i++) {
    const r = px[i * 4]
    const g = px[i * 4 + 1]
    const b = px[i * 4 + 2]
    const elev = r * 256 + g + b / 256 - 32768
    heightGrid[i] = elev
    if (elev < minElev) minElev = elev
    if (elev > maxElev) maxElev = elev
  }
  if (!Number.isFinite(minElev)) minElev = 0
  if (maxElev <= 0) maxElev = 100 // quốc gia đồng bằng phẳng

  // ---- Ghép ảnh vệ tinh ----
  const satW = (itx1 - itx0 + 1) * 256
  const satH = (ity1 - ity0 + 1) * 256
  const satellite = document.createElement('canvas')
  satellite.width = Math.min(satW, 2048)
  satellite.height = Math.min(satH, 2048)
  const sctx = satellite.getContext('2d')!
  sctx.fillStyle = '#123'
  sctx.fillRect(0, 0, satellite.width, satellite.height)
  await Promise.all(
    imgTiles.map(async ([tx, ty]) => {
      const img = await loadImage(
        `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${imgZoom}/${ty}/${tx}`,
      )
      if (img) {
        sctx.drawImage(
          img,
          ((tx - itx0) * 256 * satellite.width) / satW,
          ((ty - ity0) * 256 * satellite.height) / satH,
          (256 * satellite.width) / satW,
          (256 * satellite.height) / satH,
        )
      }
      tick()
    }),
  )

  // ---- Kích thước & phóng đại ----
  const latC = ((latMin + latMax) / 2) * (Math.PI / 180)
  const lonSpanMeters = Math.max(lonSpan, 0.05) * 111320 * Math.cos(latC)
  const latSpanMeters = Math.max(latSpan, 0.05) * 110540
  const width = 100
  const height = (width * latSpanMeters) / lonSpanMeters
  const metersPerUnit = lonSpanMeters / width

  // Muốn đỉnh cao nhất ~ 9% bề rộng cảnh, nhưng phóng đại hợp lý 5–80×
  const targetMaxH = width * 0.09
  const exaggRaw = targetMaxH / (maxElev * (1 / metersPerUnit))
  const exaggeration = Math.max(5, Math.min(80, Math.round(exaggRaw)))

  const aspect = height / width
  const segmentsX = 240
  const segmentsY = Math.max(60, Math.round(240 * aspect))

  return {
    country,
    width,
    height,
    segmentsX,
    segmentsY,
    heightGrid,
    gw,
    gh,
    lonMin,
    lonMax,
    latMin,
    latMax,
    metersPerUnit,
    exaggeration,
    minElev,
    maxElev,
    satellite,
  }
}

/** Lấy cao độ (mét) nội suy song tuyến theo toạ độ uv ∈ [0,1]² của terrain */
export function sampleHeight(data: TerrainData, u: number, v: number): number {
  const { heightGrid, gw, gh } = data
  const x = Math.max(0, Math.min(1, u)) * (gw - 1)
  const y = Math.max(0, Math.min(1, v)) * (gh - 1)
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const x1 = Math.min(x0 + 1, gw - 1)
  const y1 = Math.min(y0 + 1, gh - 1)
  const fx = x - x0
  const fy = y - y0
  const h00 = heightGrid[y0 * gw + x0]
  const h10 = heightGrid[y0 * gw + x1]
  const h01 = heightGrid[y1 * gw + x0]
  const h11 = heightGrid[y1 * gw + x1]
  return h00 * (1 - fx) * (1 - fy) + h10 * fx * (1 - fy) + h01 * (1 - fx) * fy + h11 * fx * fy
}

/** Chuyển cao độ mét → đơn vị cao của cảnh (đã nhân phóng đại) */
export function elevToSceneY(data: TerrainData, elevMeters: number): number {
  const y = (elevMeters / data.metersPerUnit) * data.exaggeration
  return Math.max(y, -1.2) // đáy biển hiện dưới mặt nước
}
