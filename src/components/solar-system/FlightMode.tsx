'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { useSolarStore } from '@/store/solarStore'
import { bodyScales, flightHud } from './registry'

const BASE_SPEED = 10
const MOVE_KEYS = new Set([
  'KeyW', 'KeyA', 'KeyS', 'KeyD',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'Space', 'ShiftLeft', 'ShiftRight',
])

const _euler = new THREE.Euler(0, 0, 0, 'YXZ')
const _forward = new THREE.Vector3()
const _right = new THREE.Vector3()
const _up = new THREE.Vector3(0, 1, 0)
const _wish = new THREE.Vector3()
const _dir = new THREE.Vector3()

/**
 * Chế độ bay tự do first-person:
 * W/A/S/D + mũi tên bay · Space/Shift lên/xuống · kéo chuột nhìn quanh ·
 * lăn chuột chỉnh ga · ESC thoát.
 */
export default function FlightMode() {
  const { camera, gl, controls } = useThree()
  const keys = useRef(new Set<string>())
  const vel = useRef(new THREE.Vector3())
  const rot = useRef({ yaw: 0, pitch: 0 })
  const throttle = useRef(1)
  const dragging = useRef(false)
  const wasFlight = useRef(false)
  const hudTimer = useRef(0)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!useSolarStore.getState().flightMode) return
      if (e.code === 'Escape') {
        useSolarStore.getState().toggleFlight()
        return
      }
      if (MOVE_KEYS.has(e.code)) {
        keys.current.add(e.code)
        e.preventDefault()
      }
    }
    const onKeyUp = (e: KeyboardEvent) => keys.current.delete(e.code)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    const el = gl.domElement
    const onPointerDown = (e: PointerEvent) => {
      dragging.current = true
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging.current || !useSolarStore.getState().flightMode) return
      rot.current.yaw -= e.movementX * 0.0022
      rot.current.pitch = THREE.MathUtils.clamp(rot.current.pitch - e.movementY * 0.0022, -1.55, 1.55)
    }
    const onPointerUp = () => {
      dragging.current = false
    }
    const onWheel = (e: WheelEvent) => {
      if (!useSolarStore.getState().flightMode) return
      e.preventDefault()
      throttle.current = THREE.MathUtils.clamp(
        throttle.current * Math.exp(-e.deltaY * 0.0009),
        0.15,
        60,
      )
    }
    el.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    el.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      el.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      el.removeEventListener('wheel', onWheel)
    }
  }, [gl])

  useFrame((_, dt) => {
    const flight = useSolarStore.getState().flightMode

    if (flight && !wasFlight.current) {
      // Vào chế độ bay: khoá hướng nhìn hiện tại, tắt orbit controls
      camera.rotation.order = 'YXZ'
      _euler.setFromQuaternion(camera.quaternion)
      rot.current = { yaw: _euler.y, pitch: _euler.x }
      vel.current.set(0, 0, 0)
      throttle.current = 1
      const c = controls as OrbitControlsImpl | null
      if (c) c.enabled = false
    }
    if (!flight && wasFlight.current) {
      // Thoát: trả điều khiển quay quanh điểm phía trước mũi "tàu"
      const c = controls as OrbitControlsImpl | null
      if (c) {
        _dir.set(0, 0, -1).applyQuaternion(camera.quaternion)
        c.target.copy(camera.position).addScaledVector(_dir, 12)
        c.enabled = true
        c.update()
      }
      keys.current.clear()
      flightHud.speed = 0
      flightHud.mobileThrust = false
      useSolarStore.getState().setFlightSpeed(0)
    }
    wasFlight.current = flight
    if (!flight) return

    const t = Math.min(dt, 0.05)
    camera.rotation.set(rot.current.pitch, rot.current.yaw, 0)

    _forward.set(0, 0, -1).applyQuaternion(camera.quaternion)
    _right.set(1, 0, 0).applyQuaternion(camera.quaternion)
    const k = keys.current
    const fwd =
      (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) -
      (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0) +
      (flightHud.mobileThrust ? 1 : 0)
    const side =
      (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) -
      (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0)
    const vert = (k.has('Space') ? 1 : 0) - (k.has('ShiftLeft') || k.has('ShiftRight') ? 1 : 0)

    _wish.set(0, 0, 0)
    _wish.addScaledVector(_forward, fwd)
    _wish.addScaledVector(_right, side)
    _wish.addScaledVector(_up, vert)
    if (_wish.lengthSq() > 0) _wish.normalize()
    _wish.multiplyScalar(BASE_SPEED * throttle.current)
    vel.current.lerp(_wish, 1 - Math.exp(-4 * t))
    camera.position.addScaledVector(vel.current, t)

    // Không cho bay INTO Mặt Trời, và giới hạn phạm vi
    const sunR = 4 * (bodyScales.get('sun') ?? 1) * 1.3
    if (camera.position.length() < sunR) camera.position.setLength(sunR)
    if (camera.position.length() > 2800) camera.position.setLength(2800)

    flightHud.speed = vel.current.length()
    hudTimer.current += t
    if (hudTimer.current > 0.15) {
      hudTimer.current = 0
      useSolarStore.getState().setFlightSpeed(flightHud.speed)
    }
  })

  return null
}
