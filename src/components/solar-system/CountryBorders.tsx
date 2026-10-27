'use client'

import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { getCountries, type CountryFeature } from '@/lib/countryTerrain'
import { useSolarStore } from '@/store/solarStore'

const R = 0.6 // bán kính Trái Đất trong chế độ đẹp

function lonLatToVec3(lon: number, lat: number, radius: number, out: THREE.Vector3): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  // Khớp với UV SphereGeometry: u=0 → lon=-180 tại -X
  return out.set(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}

function buildSegments(countries: CountryFeature[], radius: number): Float32Array {
  const pts: number[] = []
  const v = new THREE.Vector3()
  const vPrev = new THREE.Vector3()
  for (const c of countries) {
    for (const poly of c.polygons) {
      const ring = poly[0]
      for (let i = 0; i < ring.length; i++) {
        const [lon1, lat1] = ring[i]
        const [lon2, lat2] = ring[(i + 1) % ring.length]
        // Bỏ cạnh vượt đường chuyển ngày
        if (Math.abs(lon1 - lon2) > 180) continue
        lonLatToVec3(lon1, lat1, radius, vPrev)
        lonLatToVec3(lon2, lat2, radius, v)
        pts.push(vPrev.x, vPrev.y, vPrev.z, v.x, v.y, v.z)
      }
    }
  }
  return new Float32Array(pts)
}

/** Viền toàn bộ quốc gia mờ trên quả địa cầu + quốc gia đang hover sáng rực */
export default function CountryBorders() {
  const [countries, setCountries] = useState<CountryFeature[] | null>(null)
  const countryHover = useSolarStore((s) => s.countryHover)

  useEffect(() => {
    let alive = true
    getCountries().then((cs) => {
      if (alive) setCountries(cs)
    })
    return () => {
      alive = false
    }
  }, [])

  const allGeo = useMemo(() => {
    if (!countries) return null
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(buildSegments(countries, R * 1.002), 3))
    return geo
  }, [countries])

  const hoverGeo = useMemo(() => {
    if (!countries || !countryHover) return null
    const target = countries.find((c) => c.id === countryHover.id)
    if (!target) return null
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(buildSegments([target], R * 1.01), 3))
    return geo
  }, [countries, countryHover])

  if (!allGeo) return null

  return (
    <group>
      <lineSegments geometry={allGeo} raycast={() => null}>
        <lineBasicMaterial color="#ffd27d" transparent opacity={0.28} depthWrite={false} />
      </lineSegments>
      {hoverGeo && (
        <lineSegments geometry={hoverGeo} raycast={() => null}>
          <lineBasicMaterial color="#ffffff" transparent opacity={0.95} depthWrite={false} />
        </lineSegments>
      )}
    </group>
  )
}
