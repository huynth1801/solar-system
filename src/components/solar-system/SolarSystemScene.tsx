'use client'

import { Suspense, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, useTexture } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { PLANETS } from '@/data/planets'
import Sun from './Sun'
import Planet from './Planet'
import CameraRig from './CameraRig'
import AsteroidBelt from './AsteroidBelt'
import Comet from './Comet'
import Nebulas from './Nebulas'
import ScaleRig from './ScaleRig'
import FlightMode from './FlightMode'
import CountryTerrain from './CountryTerrain'
import { useSolarStore } from '@/store/solarStore'
import { scaleState } from './registry'

/** Vòm trời: texture dải Ngân Hà dựng thành quả cầu lộn ngược quanh toàn cảnh */
function MilkyWay() {
  const map = useTexture('/textures/milky_way.jpg') as THREE.Texture
  useEffect(() => {
    map.colorSpace = THREE.SRGBColorSpace
    map.anisotropy = 4
  }, [map])
  return (
    <mesh renderOrder={-10} rotation={[Math.PI / 2, 0, 0]}>
      <sphereGeometry args={[300, 48, 48]} />
      <meshBasicMaterial map={map} side={THREE.BackSide} depthWrite={false} color="#7e87b8" />
    </mesh>
  )
}

/** Nền (Ngân Hà + tinh vân + sao) phóng to theo chế độ tỷ lệ thực để vẫn bao quanh hệ */
function Background() {
  const sizer = useRef<THREE.Group>(null)
  useFrame(() => {
    if (sizer.current) {
      sizer.current.scale.setScalar(THREE.MathUtils.lerp(1, 5.5, scaleState.t))
    }
  })
  return (
    <group ref={sizer}>
      <MilkyWay />
      <Nebulas />
      <Stars radius={190} depth={70} count={8000} factor={4} saturation={0.6} fade speed={0.5} />
    </group>
  )
}

/** Nội dung chính: vũ trụ hoặc địa hình quốc gia đang du hành */
function SceneContents() {
  const terrainActive = useSolarStore((s) => s.terrain.status === 'ready')
  if (terrainActive) return <CountryTerrain />
  return (
    <>
      <Sun />
      {PLANETS.map((p) => (
        <Planet key={p.id} body={p} />
      ))}
      {/* Đai tiểu hành tinh (giữa Sao Hỏa – Sao Mộc) */}
      <AsteroidBelt inner={20} outer={23.8} realInnerAU={2.2} />
      {/* Vành đai Kuiper (ngoài Sao Hải Vương, quanh Sao Diêm Vương) */}
      <AsteroidBelt
        count={1700}
        inner={58}
        outer={75}
        color="#7a8ba6"
        realInnerAU={30}
        ySpread={1.6}
        spin={0.0035}
      />
      <Comet />
    </>
  )
}

export default function SolarSystemScene() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 34, 66], fov: 50, near: 0.1, far: 6000 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <color attach="background" args={['#020010']} />
      <ambientLight intensity={0.18} />
      <Suspense fallback={null}>
        <Background />
        <SceneContents />
      </Suspense>
      <ScaleRig />
      <FlightMode />
      <CameraRig />
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={1.15} luminanceThreshold={0.32} luminanceSmoothing={0.35} radius={0.75} />
        <Vignette offset={0.22} darkness={0.62} />
      </EffectComposer>
    </Canvas>
  )
}
