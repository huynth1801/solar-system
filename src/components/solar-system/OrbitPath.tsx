'use client'

import { useMemo } from 'react'
import * as THREE from 'three'

interface OrbitPathProps {
  radius: number
  color: string
  active?: boolean
}

/** Vòng tròn quỹ đạo mờ trên mặt phẳng hoàng đạo */
export default function OrbitPath({ radius, color, active }: OrbitPathProps) {
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = []
    const segments = 160
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius))
    }
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [radius])

  return (
    <lineLoop geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={active ? 0.5 : 0.16} />
    </lineLoop>
  )
}
