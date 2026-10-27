'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { Billboard, useTexture } from '@react-three/drei'
import {
  AU_UNITS,
  EARTH_ORBIT_SECONDS,
  EARTH_SPIN_SECONDS,
  realDisplayRadius,
  type Body,
} from '@/data/planets'
import { countryNameVi, pickCountry } from '@/lib/countryTerrain'
import { useSolarStore } from '@/store/solarStore'
import { bodyScales, getOrCreatePosition, scaleState } from './registry'
import OrbitPath from './OrbitPath'
import SaturnRings from './SaturnRings'
import Moons from './Moons'
import CountryBorders from './CountryBorders'

interface PlanetProps {
  body: Body
}

export default function Planet({ body }: PlanetProps) {
  const pivot = useRef<THREE.Group>(null)
  const anchor = useRef<THREE.Group>(null)
  const sizer = useRef<THREE.Group>(null)
  const visual = useRef<THREE.Group>(null)
  const spin = useRef<THREE.Group>(null)
  const clouds = useRef<THREE.Mesh>(null)
  const material = useRef<THREE.MeshStandardMaterial>(null)
  const ringMaterial = useRef<THREE.MeshBasicMaterial>(null)
  const pathScale = useRef<THREE.Group>(null)
  const lastCountryLookup = useRef(0)

  const isEarth = body.id === 'earth'

  // useTexture yêu cầu số lượng đối số cố định nên luôn load 3 slot (thiếu thì trùng map chính)
  const textures = useTexture([
    body.texture,
    body.bumpMap ?? body.texture,
    body.nightMap ?? body.texture,
  ]) as THREE.Texture[]
  const map = textures[0]
  const bump = body.bumpMap ? textures[1] : undefined
  const night = body.nightMap ? textures[2] : undefined

  const cloudTex = useTexture('/textures/earth_clouds.jpg') as THREE.Texture

  const hovered = useSolarStore((s) => s.hoveredId === body.id)
  const selected = useSolarStore((s) => s.selectedId === body.id)
  const select = useSolarStore((s) => s.select)
  const setHovered = useSolarStore((s) => s.setHovered)
  const setCountryHover = useSolarStore((s) => s.setCountryHover)
  const openCountryTerrain = useSolarStore((s) => s.openCountryTerrain)

  useEffect(() => {
    map.colorSpace = THREE.SRGBColorSpace
    map.anisotropy = 8
    cloudTex.colorSpace = THREE.SRGBColorSpace
    cloudTex.anisotropy = 8
    if (bump) bump.anisotropy = 8
    if (night) {
      night.colorSpace = THREE.SRGBColorSpace
      night.anisotropy = 8
    }
  }, [map, bump, night, cloudTex])

  const orbitSpeed = useMemo(
    () => (Math.PI * 2 * 365.25) / body.orbitPeriodDays / EARTH_ORBIT_SECONDS,
    [body.orbitPeriodDays],
  )
  const spinSpeed = useMemo(
    () => (Math.PI * 2 * 24) / body.rotationHours / EARTH_SPIN_SECONDS,
    [body.rotationHours],
  )
  const realOrbit = useMemo(() => body.realAU * AU_UNITS, [body.realAU])
  const realSizeScale = useMemo(
    () => realDisplayRadius(body.realRadiusRatio) / body.radius,
    [body.realRadiusRatio, body.radius],
  )

  useFrame((state, dt) => {
    const { paused, speed } = useSolarStore.getState()
    const mult = paused ? 0 : speed
    const t = Math.min(dt, 0.05)
    const st = scaleState.t
    if (pivot.current) pivot.current.rotation.y += orbitSpeed * t * mult
    if (spin.current) spin.current.rotation.y += spinSpeed * t * mult
    if (clouds.current) clouds.current.rotation.y += spinSpeed * 0.25 * t * mult
    if (anchor.current) {
      // Khoảng cách Mặt Trời: lerp giữa "chế độ đẹp" và "tỷ lệ thực"
      anchor.current.position.x = THREE.MathUtils.lerp(body.orbitRadius, realOrbit, st)
      anchor.current.getWorldPosition(getOrCreatePosition(body.id))
    }
    if (sizer.current) {
      const s = THREE.MathUtils.lerp(1, realSizeScale, st)
      sizer.current.scale.setScalar(s)
      bodyScales.set(body.id, s)
    }
    if (pathScale.current) {
      pathScale.current.scale.setScalar(THREE.MathUtils.lerp(1, realOrbit / body.orbitRadius, st))
    }
    // Hover: phồng nhẹ + sáng viền emissive
    if (visual.current) {
      const target = hovered ? 1.12 : 1
      const next = THREE.MathUtils.damp(visual.current.scale.x, target, 8, t)
      visual.current.scale.setScalar(next)
    }
    if (material.current) {
      // Trái Đất có đèn đêm riêng; hành tinh khác chỉ sáng khi hover
      const target = night
        ? hovered
          ? 1.3
          : 0.9
        : hovered
          ? 0.35
          : selected
            ? 0.12
            : 0
      material.current.emissiveIntensity = THREE.MathUtils.damp(
        material.current.emissiveIntensity,
        target,
        8,
        t,
      )
    }
    if (ringMaterial.current) {
      ringMaterial.current.opacity = 0.4 + Math.sin(state.clock.elapsedTime * 5) * 0.22
    }
  })

  const handlers = {
    onClick: (e: { stopPropagation: () => void }) => {
      e.stopPropagation()
      select(body.id)
      document.body.style.cursor = ''
    },
    onPointerOver: (e: { stopPropagation: () => void }) => {
      e.stopPropagation()
      setHovered(body.id)
      document.body.style.cursor = 'pointer'
    },
    onPointerOut: () => {
      setHovered(null)
      document.body.style.cursor = ''
    },
  }

  // Trái Đất đặc biệt: bấm thẳng vào quốc gia để du hành terrain 3D
  const uvToLatLon = (uv?: THREE.Vector2) => {
    if (!uv) return null
    return { lat: uv.y * 180 - 90, lon: uv.x * 360 - 180 }
  }
  const earthLog = (msg: string, extra?: unknown) => {
    if (typeof window !== 'undefined') {
      const w = window as typeof window & { __earth?: unknown[] }
      ;(w.__earth ??= []).push([Date.now() % 100000, msg, extra])
    }
  }
  const earthHandlers = {
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      // Kéo-xoay quả cầu thì không tính là click
      if (e.delta > 6) {
        earthLog('click-ignored-drag', e.delta)
        return
      }
      const ll = uvToLatLon(e.uv)
      earthLog('click', ll)
      document.body.style.cursor = ''
      if (!ll) {
        select('earth')
        return
      }
      void openCountryTerrain(ll.lat, ll.lon).then((hit) => {
        earthLog('open-result', hit)
        if (!hit) select('earth') // bấm ra đại dương → mở panel Trái Đất như thường
      })
    },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      earthLog('over')
      setHovered(body.id)
      document.body.style.cursor = 'pointer'
    },
    onPointerMove: (e: ThreeEvent<PointerEvent>) => {
      const now = performance.now()
      if (now - lastCountryLookup.current < 90) return
      lastCountryLookup.current = now
      const ll = uvToLatLon(e.uv)
      if (!ll) return
      void pickCountry(ll.lat, ll.lon).then((c) => {
        earthLog('hover-country ' + (c ? c.id : 'ocean'))
        // Con trỏ có thể đã rời Trái Đất — chỉ cập nhật nếu vẫn đang hover
        if (useSolarStore.getState().hoveredId !== 'earth') return
        setCountryHover(c ? { id: c.id, name: countryNameVi(c.iso2, c.nameEn) } : null)
      })
    },
    onPointerOut: () => {
      earthLog('out')
      setHovered(null)
      setCountryHover(null)
      document.body.style.cursor = ''
    },
  }

  const tiltRad = THREE.MathUtils.degToRad(body.axialTilt)

  return (
    <group rotation={[0, 0, THREE.MathUtils.degToRad(body.orbitInclination)]}>
      <group ref={pathScale}>
        <OrbitPath radius={body.orbitRadius} color={body.color} active={selected || hovered} />
      </group>
      <group ref={pivot}>
        <group ref={anchor} position={[body.orbitRadius, 0, 0]}>
          <group ref={sizer}>
            <group ref={visual}>
              <group rotation={[0, 0, tiltRad]}>
                {/* Khung quay: chứa bề mặt, mây và viền quốc gia (quay cùng nhau) */}
                <group ref={spin}>
                  <mesh {...(isEarth ? earthHandlers : {})}>
                    <sphereGeometry args={[body.radius, 48, 48]} />
                    <meshStandardMaterial
                      ref={material}
                      map={map}
                      bumpMap={bump}
                      bumpScale={0.06}
                      roughness={0.95}
                      metalness={0}
                      emissive={night ? '#ffd9a8' : body.color}
                      emissiveMap={night}
                      emissiveIntensity={0}
                    />
                  </mesh>
                  {body.clouds && (
                    <mesh ref={clouds}>
                      <sphereGeometry args={[body.radius * 1.02, 48, 48]} />
                      <meshStandardMaterial
                        map={cloudTex}
                        alphaMap={cloudTex}
                        transparent
                        opacity={0.85}
                        depthWrite={false}
                        roughness={1}
                      />
                    </mesh>
                  )}
                  {isEarth && <CountryBorders />}
                </group>
                {body.rings && <SaturnRings radius={body.radius} />}
              </group>
              {body.atmosphere && (
                <mesh scale={1.22}>
                  <sphereGeometry args={[body.radius, 32, 32]} />
                  <meshBasicMaterial
                    color={body.atmosphere.color}
                    transparent
                    opacity={body.atmosphere.opacity}
                    blending={THREE.AdditiveBlending}
                    side={THREE.BackSide}
                    depthWrite={false}
                  />
                </mesh>
              )}
              {/* Vòng ngắm khi hover */}
              {hovered && (
                <Billboard>
                  <mesh renderOrder={3}>
                    <ringGeometry
                      args={[body.radius * 1.5, body.radius * 1.5 + Math.max(body.radius * 0.08, 0.035), 64]}
                    />
                    <meshBasicMaterial
                      ref={ringMaterial}
                      color={body.color}
                      transparent
                      opacity={0.5}
                      depthWrite={false}
                      toneMapped={false}
                      side={THREE.DoubleSide}
                    />
                  </mesh>
                </Billboard>
              )}
            </group>
            {/* Vùng chạm to hơn hành tinh để dễ click (Trái Đất tự xử lý để đọc được UV) */}
            {!isEarth && (
              <mesh {...handlers}>
                <sphereGeometry args={[Math.max(body.radius * 1.7, body.radius + 0.3), 16, 16]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              </mesh>
            )}
          </group>
          <Moons parent={body} />
        </group>
      </group>
    </group>
  )
}
