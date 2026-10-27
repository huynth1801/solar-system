'use client'

import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useSolarStore } from '@/store/solarStore'
import { scaleState } from './registry'

/** Lerp mượt tiến trình chuyển giữa "chế độ đẹp" (0) và "tỷ lệ thực" (1) */
export default function ScaleRig() {
  useFrame((_, dt) => {
    const target = useSolarStore.getState().realScale ? 1 : 0
    const t = Math.min(dt, 0.05)
    scaleState.t = THREE.MathUtils.damp(scaleState.t, target, 1.1, t)
    if (Math.abs(scaleState.t - target) < 0.0005) scaleState.t = target
  })
  return null
}
