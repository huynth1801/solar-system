'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { COMET } from '@/data/planets'
import { useSolarStore } from '@/store/solarStore'
import { bodyScales, getOrCreatePosition, scaleState } from './registry'

// Quỹ đạo elip: gần Mặt Trời 8.4, xa 51.6, nghiêng 14°
const A = 30
const E = 0.72
const INCLINATION = THREE.MathUtils.degToRad(14)
const TRAIL = 220
// Kepler: gần Mặt Trời quay rất nhanh, xa thì chậm (dθ/dt ∝ 1/r²)
const KEPLER_K = 26

function orbitRadius(theta: number): number {
  return (A * (1 - E * E)) / (1 + E * Math.cos(theta))
}

function makeGlowTexture(): THREE.CanvasTexture {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.3, 'rgba(190,235,255,0.6)')
  g.addColorStop(1, 'rgba(120,200,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

/** Sao chổi trên quỹ đạo elip + đuôi hạt mờ dần, click được như hành tinh */
export default function Comet() {
  const head = useRef<THREE.Group>(null)
  const sizer = useRef<THREE.Group>(null)
  const theta = useRef(-0.7)
  const glowTexture = useMemo(() => makeGlowTexture(), [])

  const trailGeometry = useMemo(() => {
    const positions = new Float32Array(TRAIL * 3)
    const progress = new Float32Array(TRAIL)
    for (let i = 0; i < TRAIL; i++) progress[i] = i / (TRAIL - 1)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aProgress', new THREE.BufferAttribute(progress, 1))
    return geo
  }, [])

  const trailMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uSize: { value: 2.4 },
          uColorHead: { value: new THREE.Color('#dff4ff') },
          uColorTail: { value: new THREE.Color('#2f8fe0') },
        },
        vertexShader: /* glsl */ `
          attribute float aProgress;
          uniform float uSize;
          varying float vP;
          void main() {
            vP = aProgress;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = uSize * (0.25 + aProgress * 1.15) * (300.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          varying float vP;
          uniform vec3 uColorHead;
          uniform vec3 uColorTail;
          void main() {
            float d = distance(gl_PointCoord, vec2(0.5));
            float alpha = smoothstep(0.5, 0.05, d) * vP * 0.8;
            gl_FragColor = vec4(mix(uColorTail, uColorHead, vP), alpha);
          }
        `,
      }),
    [],
  )

  const ellipseGeometry = useMemo(() => {
    const points: THREE.Vector3[] = []
    for (let i = 0; i < 256; i++) {
      const t = (i / 256) * Math.PI * 2
      points.push(new THREE.Vector3(Math.cos(t) * orbitRadius(t), 0, Math.sin(t) * orbitRadius(t)))
    }
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [])

  // Khởi tạo đuôi nằm gọn tại vị trí xuất phát (tránh vệt kéo từ gốc tọa độ)
  useEffect(() => {
    const r = orbitRadius(theta.current)
    const x = Math.cos(theta.current) * r
    const z = Math.sin(theta.current) * r
    const pos = trailGeometry.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < TRAIL; i++) {
      pos.setXYZ(i, x, 0, z)
    }
    pos.needsUpdate = true
  }, [trailGeometry])

  useFrame((_, dt) => {
    const { paused, speed } = useSolarStore.getState()
    const mult = paused ? 0 : speed
    const t = Math.min(dt, 0.05)
    const r1 = orbitRadius(theta.current)
    theta.current += (KEPLER_K / (r1 * r1)) * t * mult
    const r = orbitRadius(theta.current)
    const x = Math.cos(theta.current) * r
    const z = Math.sin(theta.current) * r
    if (head.current) {
      head.current.position.set(x, 0, z)
      head.current.getWorldPosition(getOrCreatePosition(COMET.id))
    }
    const pos = trailGeometry.attributes.position as THREE.BufferAttribute
    const arr = pos.array as Float32Array
    arr.copyWithin(0, 3)
    arr[3 * (TRAIL - 1)] = x
    arr[3 * (TRAIL - 1) + 1] = 0
    arr[3 * (TRAIL - 1) + 2] = z
    pos.needsUpdate = true
    // Ở chế độ tỷ lệ thực, phóng toàn quỹ đạo sao chổi ra xa
    const s = THREE.MathUtils.lerp(1, 12, scaleState.t)
    if (sizer.current) sizer.current.scale.setScalar(s)
    bodyScales.set(COMET.id, s)
  })

  const handlers = {
    onClick: (e: { stopPropagation: () => void }) => {
      e.stopPropagation()
      useSolarStore.getState().select(COMET.id)
      document.body.style.cursor = ''
    },
    onPointerOver: (e: { stopPropagation: () => void }) => {
      e.stopPropagation()
      useSolarStore.getState().setHovered(COMET.id)
      document.body.style.cursor = 'pointer'
    },
    onPointerOut: () => {
      useSolarStore.getState().setHovered(null)
      document.body.style.cursor = ''
    },
  }

  return (
    <group ref={sizer}>
      <group rotation={[INCLINATION, 0, 0]}>
      <lineLoop geometry={ellipseGeometry}>
        <lineBasicMaterial color="#8fd4ff" transparent opacity={0.1} />
      </lineLoop>

      <points geometry={trailGeometry} material={trailMaterial} frustumCulled={false} />

      <group ref={head}>
        <mesh>
          <sphereGeometry args={[COMET.radius, 16, 16]} />
          <meshBasicMaterial color="#eaffff" toneMapped={false} />
        </mesh>
        <sprite scale={[1.8, 1.8, 1]}>
          <spriteMaterial
            map={glowTexture}
            color="#bfe9ff"
            transparent
            opacity={0.95}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </sprite>
        <sprite scale={[4.2, 4.2, 1]}>
          <spriteMaterial
            map={glowTexture}
            color="#4aa8ff"
            transparent
            opacity={0.3}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>
        <mesh {...handlers}>
          <sphereGeometry args={[1.4, 12, 12]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
      </group>
    </group>
  )
}
