'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { elevToSceneY, sampleHeight } from '@/lib/countryTerrain'
import { useSolarStore } from '@/store/solarStore'

/**
 * Địa hình 3D thật của quốc gia: lưới Plane displaced bằng cao độ terrarium,
 * phủ ảnh vệ tinh ESRI, mặt nước ở mực 0m, nắng xiên tạo bóng núi.
 */
export default function CountryTerrain() {
  const data = useSolarStore((s) => s.terrain.data)

  const terrain = useMemo(() => {
    if (!data) return null
    const { width, height, segmentsX, segmentsY } = data
    const geo = new THREE.PlaneGeometry(width, height, segmentsX, segmentsY)
    const pos = geo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const u = x / width + 0.5
      const v = 0.5 - y / height // v=1 ở mé bắc
      const elev = sampleHeight(data, u, v)
      pos.setZ(i, elevToSceneY(data, elev))
    }
    pos.needsUpdate = true
    geo.computeVertexNormals()

    const texture = new THREE.CanvasTexture(data.satellite)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 8
    return { geo, texture }
  }, [data])

  const waterY = useMemo(() => (data ? elevToSceneY(data, 0) : 0), [data])

  if (!data || !terrain) return null

  return (
    <group>
      <directionalLight position={[70, 95, 40]} intensity={2.4} color="#ffe9cf" />
      <directionalLight position={[-50, 40, -60]} intensity={0.35} color="#9db8ff" />
      <ambientLight intensity={0.3} />

      <mesh geometry={terrain.geo} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial map={terrain.texture} roughness={0.92} metalness={0.02} />
      </mesh>

      {/* Mặt nước ở mực biển 0m (hơi hạ để lộ bờ) */}
      {data.minElev < -2 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, waterY - 0.18, 0]} renderOrder={1}>
          <planeGeometry args={[data.width * 1.06, data.height * 1.06]} />
          <meshStandardMaterial
            color="#16455f"
            transparent
            opacity={0.82}
            roughness={0.15}
            metalness={0.35}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  )
}
