'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Sparkles, useTexture } from '@react-three/drei'
import { SUN, realDisplayRadius } from '@/data/planets'
import { useSolarStore } from '@/store/solarStore'
import { bodyScales, getOrCreatePosition, scaleState } from './registry'

function makeGlowTexture(): THREE.CanvasTexture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.2, 'rgba(255,235,180,0.75)')
  gradient.addColorStop(0.45, 'rgba(255,170,80,0.28)')
  gradient.addColorStop(0.75, 'rgba(255,120,50,0.08)')
  gradient.addColorStop(1, 'rgba(255,100,40,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

export default function Sun() {
  const spin = useRef<THREE.Mesh>(null)
  const corona = useRef<THREE.Sprite>(null)
  const flare = useRef<THREE.Sprite>(null)
  const material = useRef<THREE.MeshBasicMaterial>(null)
  const sizer = useRef<THREE.Group>(null)
  const glowSizer = useRef<THREE.Group>(null)

  const map = useTexture(SUN.texture) as THREE.Texture
  const glowTexture = useMemo(() => makeGlowTexture(), [])

  const hovered = useSolarStore((s) => s.hoveredId === SUN.id)
  const select = useSolarStore((s) => s.select)
  const setHovered = useSolarStore((s) => s.setHovered)

  useEffect(() => {
    map.colorSpace = THREE.SRGBColorSpace
    map.anisotropy = 8
    getOrCreatePosition(SUN.id).set(0, 0, 0)
  }, [map])

  useFrame((state, dt) => {
    const { paused, speed } = useSolarStore.getState()
    const mult = paused ? 0 : speed
    const t = Math.min(dt, 0.05)
    if (spin.current) spin.current.rotation.y += 0.02 * t * mult * 10
    // Nhịp "thở" của corona
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.4) * 0.05
    if (corona.current) corona.current.scale.set(18 * pulse, 18 * pulse, 1)
    if (flare.current) flare.current.scale.set(9.6 / pulse, 9.6 / pulse, 1)
    if (material.current) {
      const target = hovered ? 1.3 : 1.12
      material.current.color.setScalar(THREE.MathUtils.damp(material.current.color.r, target, 8, t))
    }
    // Chế độ tỷ lệ thực: Mặt Trời phình đúng 109× Trái Đất (glow phóng ít hơn cho đừng chói)
    const sunScale = THREE.MathUtils.lerp(1, realDisplayRadius(SUN.realRadiusRatio) / SUN.radius, scaleState.t)
    if (sizer.current) sizer.current.scale.setScalar(sunScale)
    if (glowSizer.current) glowSizer.current.scale.setScalar(THREE.MathUtils.lerp(1, 1.6, scaleState.t))
    bodyScales.set(SUN.id, sunScale)
  })

  const handlers = {
    onClick: (e: { stopPropagation: () => void }) => {
      e.stopPropagation()
      select(SUN.id)
      document.body.style.cursor = ''
    },
    onPointerOver: (e: { stopPropagation: () => void }) => {
      e.stopPropagation()
      setHovered(SUN.id)
      document.body.style.cursor = 'pointer'
    },
    onPointerOut: () => {
      setHovered(null)
      document.body.style.cursor = ''
    },
  }

  return (
    <group ref={sizer}>
      <mesh ref={spin} {...handlers}>
        <sphereGeometry args={[SUN.radius, 64, 64]} />
        <meshBasicMaterial ref={material} map={map} toneMapped={false} />
      </mesh>

      <group ref={glowSizer}>
        {/* Vầng sáng gần, trắng-vàng */}
        <sprite ref={flare} scale={[9.6, 9.6, 1]}>
          <spriteMaterial
            map={glowTexture}
            color="#ffdd88"
            transparent
            opacity={0.95}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </sprite>
        {/* Corona ngoài, cam ấm */}
        <sprite ref={corona} scale={[18, 18, 1]}>
          <spriteMaterial
            map={glowTexture}
            color="#ff9a3c"
            transparent
            opacity={0.45}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </sprite>
      </group>

      <pointLight color="#fff1d6" intensity={2.4} decay={0} />

      <Sparkles count={90} scale={[11, 11, 11]} size={3.2} speed={0.35} color="#ffd28a" opacity={0.55} />
    </group>
  )
}
