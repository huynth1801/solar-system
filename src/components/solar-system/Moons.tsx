'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import {
  EARTH_ORBIT_SECONDS,
  MOONS_BY_PARENT,
  realDisplayRadius,
  type Body,
  type MoonBody,
} from '@/data/planets'
import { useSolarStore } from '@/store/solarStore'
import { bodyScales, getOrCreatePosition, scaleState } from './registry'

/* ---------- Texture procedural cho các vệ tinh lớn (vẽ canvas, khỏi tải file) ---------- */

function canvas2d(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return { c, ctx: c.getContext('2d')! }
}

function fillSpots(
  ctx: CanvasRenderingContext2D,
  n: number,
  colors: string[],
  w: number,
  h: number,
  minR: number,
  maxR: number,
  alpha: number,
) {
  for (let i = 0; i < n; i++) {
    ctx.globalAlpha = alpha * (0.5 + Math.random() * 0.5)
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)]
    ctx.beginPath()
    ctx.arc(Math.random() * w, Math.random() * h, minR + Math.random() * (maxR - minR), 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

const BUILDERS: Record<string, () => THREE.CanvasTexture> = {
  io: () => {
    const { c, ctx } = canvas2d(512, 256)
    ctx.fillStyle = '#d9c544'
    ctx.fillRect(0, 0, 512, 256)
    fillSpots(ctx, 150, ['#c98a2e', '#e8e0a0', '#a05a28', '#efe3b8', '#8a4a1e'], 512, 256, 3, 16, 0.35)
    fillSpots(ctx, 12, ['#f4ecd0'], 512, 256, 14, 30, 0.3)
    return new THREE.CanvasTexture(c)
  },
  europa: () => {
    const { c, ctx } = canvas2d(512, 256)
    ctx.fillStyle = '#d8ddd9'
    ctx.fillRect(0, 0, 512, 256)
    ctx.strokeStyle = '#a4653f'
    for (let i = 0; i < 46; i++) {
      ctx.globalAlpha = 0.18 + Math.random() * 0.22
      ctx.lineWidth = 0.5 + Math.random()
      ctx.beginPath()
      const x = Math.random() * 512
      const y = Math.random() * 256
      ctx.moveTo(x, y)
      ctx.quadraticCurveTo(x + (Math.random() - 0.5) * 300, y + (Math.random() - 0.5) * 160, x + (Math.random() - 0.5) * 420, y + (Math.random() - 0.5) * 240)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
    return new THREE.CanvasTexture(c)
  },
  ganymede: () => {
    const { c, ctx } = canvas2d(512, 256)
    ctx.fillStyle = '#9a8c74'
    ctx.fillRect(0, 0, 512, 256)
    fillSpots(ctx, 90, ['#b5a88e', '#7c7160', '#c2b596'], 512, 256, 8, 34, 0.25)
    fillSpots(ctx, 140, ['#6b6154'], 512, 256, 1, 3, 0.4)
    return new THREE.CanvasTexture(c)
  },
  callisto: () => {
    const { c, ctx } = canvas2d(512, 256)
    ctx.fillStyle = '#5f5a52'
    ctx.fillRect(0, 0, 512, 256)
    fillSpots(ctx, 320, ['#a49c8e', '#8f887b', '#bdb5a6'], 512, 256, 0.6, 2.6, 0.6)
    fillSpots(ctx, 26, ['#c9c1b2'], 512, 256, 4, 10, 0.35)
    return new THREE.CanvasTexture(c)
  },
  titan: () => {
    const { c, ctx } = canvas2d(512, 256)
    const g = ctx.createLinearGradient(0, 0, 0, 256)
    g.addColorStop(0, '#e0a94f')
    g.addColorStop(0.5, '#cf9440')
    g.addColorStop(1, '#b97c33')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 512, 256)
    ctx.globalAlpha = 0.05
    ctx.fillStyle = '#8a5a20'
    for (let i = 0; i < 6; i++) ctx.fillRect(0, i * 44 + Math.random() * 10, 512, 8 + Math.random() * 10)
    ctx.globalAlpha = 1
    return new THREE.CanvasTexture(c)
  },
  triton: () => {
    const { c, ctx } = canvas2d(512, 256)
    ctx.fillStyle = '#d8cfd2'
    ctx.fillRect(0, 0, 512, 256)
    fillSpots(ctx, 60, ['#e8c4c0', '#c4b8c2', '#efe6ea'], 512, 256, 8, 26, 0.25)
    ctx.fillStyle = 'rgba(240,234,238,0.5)'
    ctx.fillRect(0, 170, 512, 86)
    return new THREE.CanvasTexture(c)
  },
}

const canvasTextureCache = new Map<string, THREE.CanvasTexture>()
function getMoonCanvasTexture(id: string): THREE.Texture | undefined {
  const build = BUILDERS[id]
  if (!build) return undefined
  let tex = canvasTextureCache.get(id)
  if (!tex) {
    tex = build()
    tex.colorSpace = THREE.SRGBColorSpace
    canvasTextureCache.set(id, tex)
  }
  return tex
}

/* ---------- Component ---------- */

function MoonOrbit({ moon, parent }: { moon: MoonBody; parent: Body }) {
  const pivot = useRef<THREE.Group>(null)
  const anchor = useRef<THREE.Group>(null)
  const sizer = useRef<THREE.Group>(null)
  const material = useRef<THREE.MeshStandardMaterial>(null)

  // Hook luôn gọi đủ: file texture (Mặt Trăng) hoặc trùng lặp path khi dùng canvas
  const fileMap = useTexture(moon.texture || '/textures/moon.jpg') as THREE.Texture
  const canvasMap = useMemo(() => getMoonCanvasTexture(moon.id), [moon.id])
  const map = moon.texture ? fileMap : (canvasMap ?? fileMap)

  const hovered = useSolarStore((s) => s.hoveredId === moon.id)

  useEffect(() => {
    if (moon.texture) {
      fileMap.colorSpace = THREE.SRGBColorSpace
      fileMap.anisotropy = 8
    }
  }, [fileMap, moon.texture])

  const orbitSpeed = useMemo(
    () => (Math.PI * 2 * 365.25) / moon.orbitPeriodDays / EARTH_ORBIT_SECONDS,
    [moon.orbitPeriodDays],
  )
  const realOrbit = useMemo(
    () => moon.realOrbitParentRadii * realDisplayRadius(parent.realRadiusRatio),
    [moon.realOrbitParentRadii, parent.realRadiusRatio],
  )
  const realSizeScale = useMemo(
    () => realDisplayRadius(moon.realRadiusRatio) / moon.radius,
    [moon.realRadiusRatio, moon.radius],
  )

  useFrame((_, dt) => {
    const { paused, speed } = useSolarStore.getState()
    const mult = paused ? 0 : speed
    const t = Math.min(dt, 0.05)
    const st = scaleState.t
    if (pivot.current) pivot.current.rotation.y += orbitSpeed * t * mult
    if (anchor.current) {
      anchor.current.position.x = THREE.MathUtils.lerp(moon.orbitRadius, realOrbit, st)
      anchor.current.getWorldPosition(getOrCreatePosition(moon.id))
    }
    if (sizer.current) {
      const s = THREE.MathUtils.lerp(1, realSizeScale, st)
      sizer.current.scale.setScalar(s)
      bodyScales.set(moon.id, s)
    }
    if (material.current) {
      const target = hovered ? 0.4 : 0
      material.current.emissiveIntensity = THREE.MathUtils.damp(material.current.emissiveIntensity, target, 8, t)
    }
  })

  const handlers = {
    onClick: (e: { stopPropagation: () => void }) => {
      e.stopPropagation()
      useSolarStore.getState().select(moon.id)
      document.body.style.cursor = ''
    },
    onPointerOver: (e: { stopPropagation: () => void }) => {
      e.stopPropagation()
      useSolarStore.getState().setHovered(moon.id)
      document.body.style.cursor = 'pointer'
    },
    onPointerOut: () => {
      useSolarStore.getState().setHovered(null)
      document.body.style.cursor = ''
    },
  }

  return (
    <group rotation={[0, 0, THREE.MathUtils.degToRad(moon.orbitInclination)]}>
      <group ref={pivot}>
        <group ref={anchor} position={[moon.orbitRadius, 0, 0]}>
          <group ref={sizer}>
            <mesh>
              <sphereGeometry args={[moon.radius, 32, 32]} />
              <meshStandardMaterial
                ref={material}
                map={map}
                roughness={0.95}
                metalness={0}
                emissive={moon.color}
                emissiveIntensity={0}
              />
            </mesh>
            <mesh {...handlers}>
              <sphereGeometry args={[Math.max(moon.radius * 2.2, 0.3), 12, 12]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )
}

/** Toàn bộ vệ tinh lớn quay quanh một hành tinh mẹ */
export default function Moons({ parent }: { parent: Body }) {
  const moons = MOONS_BY_PARENT[parent.id]
  if (!moons || moons.length === 0) return null
  return (
    <>
      {moons.map((m) => (
        <MoonOrbit key={m.id} moon={m} parent={parent} />
      ))}
    </>
  )
}
