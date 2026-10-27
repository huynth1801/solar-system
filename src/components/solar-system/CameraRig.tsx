'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { bodyById } from '@/data/planets'
import { useSolarStore } from '@/store/solarStore'
import { bodyPositions, bodyScales, scaleState } from './registry'

type Mode = 'intro' | 'overview' | 'flying' | 'following' | 'returning' | 'terrain-in' | 'terrain'

const ORIGIN = new THREE.Vector3(0, 0, 0)
const INTRO_SECONDS = 5.5
const TERRAIN_VIEW = new THREE.Vector3(0, 30, 55)
const TERRAIN_TARGET = new THREE.Vector3(0, 3, 0)

/**
 * Mở màn: lượn từ sát Mặt Trời kéo ra góc toàn cảnh (bắn khi texture tải xong).
 * Sau đó: bay tới hành tinh được chọn rồi bám theo nó; bỏ chọn thì bay về home.
 * Home nội suy giữa "chế độ đẹp" và "tỷ lệ thực" theo scaleState.t.
 * Nhường quyền điều khiển hoàn toàn cho FlightMode khi bật chế độ bay tự do.
 */
export default function CameraRig() {
  const controls = useRef<OrbitControlsImpl>(null)
  const mode = useRef<Mode>('overview')
  const selectedRef = useRef<string | null>(null)
  const prevTarget = useRef(new THREE.Vector3())
  const introStarted = useRef(false)
  const introT = useRef(0)
  const kickRef = useRef(false)
  const home = useRef(new THREE.Vector3(0, 34, 66))
  const desired = useRef(new THREE.Vector3())
  const { camera } = useThree()

  const homeBeauty = useMemo(() => new THREE.Vector3(0, 34, 66), [])
  const homeReal = useMemo(() => new THREE.Vector3(0, 680, 1560), [])
  const homeMobileBeauty = useMemo(() => new THREE.Vector3(0, 70, 130), [])
  const homeMobileReal = useMemo(() => new THREE.Vector3(0, 1150, 2600), [])

  const introCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(2.5, 4, 13),
        new THREE.Vector3(17, 12, 33),
        new THREE.Vector3(-13, 26, 56),
        new THREE.Vector3(0, 34, 66),
      ]),
    [],
  )

  useEffect(() => {
    const narrow = typeof window !== 'undefined' && window.innerWidth < 768
    if (narrow) {
      home.current.copy(homeMobileBeauty)
    }
    // Đổi tỷ lệ hiển thị → camera cần bay về góc nhìn của chế độ mới
    const unsub = useSolarStore.subscribe((s, prev) => {
      if (s.scaleKick !== prev.scaleKick) kickRef.current = true
    })
    return unsub
  }, [homeMobileBeauty])

  useFrame((_, dt) => {
    const c = controls.current
    if (!c) return
    const { selectedId, ready, flightMode } = useSolarStore.getState()
    const terrainStatus = useSolarStore.getState().terrain.status
    const t = Math.min(dt, 0.05)
    const k = 1 - Math.exp(-3.2 * t)

    // Chế độ bay tự do: nhường hoàn toàn, thoát thì trả controls
    if (flightMode) {
      if (c.enabled) c.enabled = false
      return
    }

    // Du hành quốc gia: hạ cánh xuống địa hình rồi để người dùng xoay tự do
    if (terrainStatus === 'ready') {
      if (mode.current !== 'terrain-in' && mode.current !== 'terrain') {
        mode.current = 'terrain-in'
        c.enabled = false
        camera.position.set(0, 85, 130)
        c.target.copy(TERRAIN_TARGET)
      }
      if (mode.current === 'terrain-in') {
        const kSlow = 1 - Math.exp(-1.6 * t)
        camera.position.lerp(TERRAIN_VIEW, kSlow)
        c.target.lerp(TERRAIN_TARGET, kSlow)
        c.update()
        if (camera.position.distanceTo(TERRAIN_VIEW) < 0.8) {
          mode.current = 'terrain'
          c.enabled = true
        }
      } else {
        c.update()
      }
      return
    }
    // Vừa thoát terrain → bay về toàn cảnh vũ trụ
    if (mode.current === 'terrain-in' || mode.current === 'terrain') {
      mode.current = 'returning'
      c.enabled = false
    }

    // Home nội suy theo tiến trình chuyển tỷ lệ
    const narrow = typeof window !== 'undefined' && window.innerWidth < 768
    home.current.lerpVectors(
      narrow ? homeMobileBeauty : homeBeauty,
      narrow ? homeMobileReal : homeReal,
      scaleState.t,
    )

    // Bật/tắt tỷ lệ thực → bay về góc nhìn phù hợp của chế độ mới
    if (kickRef.current && !selectedId) {
      kickRef.current = false
      if (mode.current === 'overview' || mode.current === 'returning' || mode.current === 'intro') {
        mode.current = 'returning'
        c.enabled = false
      }
    }

    // Texture vừa tải xong → bắt đầu đường bay mở màn (bỏ qua nếu đã từng đổi tỷ lệ)
    if (
      ready &&
      !introStarted.current &&
      mode.current === 'overview' &&
      !selectedId &&
      !kickRef.current &&
      scaleState.t < 0.5
    ) {
      introStarted.current = true
      mode.current = 'intro'
      c.enabled = false
      camera.position.copy(introCurve.getPoint(0))
    }

    if (mode.current === 'intro' && !selectedId) {
      introT.current += t
      const p = Math.min(introT.current / INTRO_SECONDS, 1)
      const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2
      camera.position.copy(introCurve.getPoint(eased))
      c.target.copy(ORIGIN)
      c.update()
      if (p >= 1) {
        mode.current = 'overview'
        c.enabled = true
      }
      return
    }

    const target = selectedId ? bodyPositions.get(selectedId) : undefined

    if (selectedId && target) {
      if (selectedRef.current !== selectedId) {
        selectedRef.current = selectedId
        mode.current = 'flying'
        c.enabled = false
      }
      const body = bodyById(selectedId)
      const scale = bodyScales.get(selectedId) ?? 1
      const dist = Math.max((body ? body.radius * scale * 4.6 : 5) + 1.5, 0.85)

      if (mode.current === 'flying') {
        // Đáp phía được Mặt Trời chiếu sáng (70% hướng nắng + 30% hướng camera hiện tại)
        const sunDir = target.clone().sub(ORIGIN)
        const camDir = camera.position.clone().sub(target)
        if (sunDir.lengthSq() < 1e-6) sunDir.set(0, 0.5, 1)
        if (camDir.lengthSq() < 1e-6) camDir.set(0, 0.5, 1)
        sunDir.normalize()
        camDir.normalize()
        const dir = sunDir.multiplyScalar(0.7).add(camDir.multiplyScalar(0.5))
        if (dir.lengthSq() < 1e-6) dir.set(0, 0.5, 1)
        dir.normalize()
        dir.y = Math.max(dir.y, 0.24)
        dir.normalize()
        desired.current.copy(target).addScaledVector(dir, dist)
        camera.position.lerp(desired.current, k)
        c.target.lerp(target, k)
        if (camera.position.distanceTo(desired.current) < Math.max(0.15, dist * 0.04)) {
          mode.current = 'following'
          prevTarget.current.copy(target)
          c.enabled = true
        }
      } else {
        // Bám theo: cộng thêm delta di chuyển của hành tinh, người dùng vẫn xoay/zoom tự do
        const dx = target.x - prevTarget.current.x
        const dy = target.y - prevTarget.current.y
        const dz = target.z - prevTarget.current.z
        camera.position.x += dx
        camera.position.y += dy
        camera.position.z += dz
        c.target.copy(target)
        prevTarget.current.copy(target)
      }
    } else if (selectedRef.current) {
      selectedRef.current = null
      mode.current = 'returning'
      c.enabled = false
    }

    if (mode.current === 'returning') {
      camera.position.lerp(home.current, k)
      c.target.lerp(ORIGIN, k)
      if (camera.position.distanceTo(home.current) < 0.6) {
        mode.current = 'overview'
        c.enabled = true
      }
    }

    c.update()
  })

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.07}
      minDistance={0.05}
      maxDistance={2800}
      zoomSpeed={0.9}
      rotateSpeed={0.9}
      enablePan={false}
    />
  )
}
