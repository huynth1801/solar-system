'use client'

import { useMemo } from 'react'
import * as THREE from 'three'

/** Texture tinh vân: vài vệt mây mờ loang trên canvas, dùng làm sprite additive */
function makeNebulaTexture(color: string): THREE.CanvasTexture {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.globalCompositeOperation = 'lighter'
  for (let i = 0; i < 7; i++) {
    const x = size * (0.2 + Math.random() * 0.6)
    const y = size * (0.2 + Math.random() * 0.6)
    const r = size * (0.12 + Math.random() * 0.25)
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    const alpha = 0.16 + Math.random() * 0.14
    g.addColorStop(0, hexToRgba(color, alpha))
    g.addColorStop(1, hexToRgba(color, 0))
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
  }
  return new THREE.CanvasTexture(canvas)
}

function hexToRgba(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return `rgba(${r},${g},${b},${alpha})`
}

const NEBULAS: Array<{ color: string; position: [number, number, number]; scale: number; opacity: number }> = [
  { color: '#6d5bd0', position: [-190, 70, -130], scale: 260, opacity: 0.22 },
  { color: '#2f7bd9', position: [210, -50, -110], scale: 220, opacity: 0.18 },
  { color: '#b06fd9', position: [-110, -90, 190], scale: 240, opacity: 0.17 },
  { color: '#2aa79b', position: [160, 100, 150], scale: 200, opacity: 0.15 },
  { color: '#c98a3d', position: [-10, 150, -190], scale: 180, opacity: 0.12 },
  { color: '#4a63d9', position: [-200, -30, 80], scale: 200, opacity: 0.14 },
]

/** Các vệt tinh vân màu mờ phía sau dải Ngân Hà — tạo chiều sâu cho nền */
export default function Nebulas() {
  const textures = useMemo(() => NEBULAS.map((n) => makeNebulaTexture(n.color)), [])
  return (
    <group renderOrder={-8}>
      {NEBULAS.map((n, i) => (
        <sprite key={i} position={n.position} scale={[n.scale, n.scale, 1]} renderOrder={-8}>
          <spriteMaterial
            map={textures[i]}
            transparent
            opacity={n.opacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>
      ))}
    </group>
  )
}
