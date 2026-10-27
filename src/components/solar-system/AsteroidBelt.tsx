'use client'

import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { AU_UNITS } from '@/data/planets'
import { useSolarStore } from '@/store/solarStore'
import { scaleState } from './registry'

interface BeltProps {
  count?: number
  inner: number
  outer: number
  color?: string
  /** Cạnh trong thật (AU) — để phóng đúng tỷ lệ ở chế độ thực */
  realInnerAU: number
  ySpread?: number
  spin?: number
}

/** Vành đai đá (tiểu hành tinh / Kuiper) — instanced, phóng theo tỷ lệ thực */
export default function AsteroidBelt({
  count = 2600,
  inner,
  outer,
  color = '#948a7d',
  realInnerAU,
  ySpread = 0.55,
  spin = 0.0152,
}: BeltProps) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const sizer = useRef<THREE.Group>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      // Dày đặc hơn ở mép trong, thưa dần ra ngoài
      const r = inner + Math.pow(Math.random(), 0.65) * (outer - inner)
      const y = (Math.random() + Math.random() + Math.random() - 1.5) * ySpread
      dummy.position.set(Math.cos(angle) * r, y, Math.sin(angle) * r)
      dummy.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      )
      const s = 0.02 + Math.pow(Math.random(), 2) * 0.1
      dummy.scale.set(s * (0.6 + Math.random() * 0.8), s, s * (0.6 + Math.random() * 0.8))
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  }, [count, inner, outer, ySpread, dummy])

  useFrame((_, dt) => {
    const { paused, speed } = useSolarStore.getState()
    const mult = paused ? 0 : speed
    const t = Math.min(dt, 0.05)
    if (ref.current) ref.current.rotation.y += spin * t * mult
    if (sizer.current) {
      const s = THREE.MathUtils.lerp(1, (realInnerAU * AU_UNITS) / inner, scaleState.t)
      sizer.current.scale.setScalar(s)
    }
  })

  return (
    <group ref={sizer}>
      <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={color} roughness={0.95} metalness={0.05} />
      </instancedMesh>
    </group>
  )
}
