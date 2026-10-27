'use client'

import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'

interface SaturnRingsProps {
  radius: number
}

/**
 * Vành đai Sao Thổ: RingGeometry với UV được nới lại theo bán kính
 * để texture dải (2048×125) nằm ngang theo hướng ra ngoài.
 */
export default function SaturnRings({ radius }: SaturnRingsProps) {
  const map = useTexture('/textures/saturn_ring.png') as THREE.Texture
  const inner = radius * 1.35
  const outer = radius * 2.3

  useEffect(() => {
    map.colorSpace = THREE.SRGBColorSpace
    map.anisotropy = 8
  }, [map])

  const geometry = useMemo(() => {
    const geo = new THREE.RingGeometry(inner, outer, 180, 1)
    const pos = geo.attributes.position
    const uv = geo.attributes.uv
    const v = new THREE.Vector3()
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i)
      const r = v.length()
      uv.setXY(i, (r - inner) / (outer - inner), 0.5)
    }
    uv.needsUpdate = true
    return geo
  }, [inner, outer])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
      <primitive object={geometry} attach="geometry" />
      <meshBasicMaterial
        map={map}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
        opacity={0.96}
      />
    </mesh>
  )
}
