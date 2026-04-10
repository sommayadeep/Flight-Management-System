import React, { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Environment, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

function FlightTunnel() {
  const ringRef = useRef()
  const ringCount = 18
  const rings = useMemo(
    () =>
      Array.from({ length: ringCount }, (_, i) => ({
        z: -i * 2.4,
        scale: 1 + i * 0.04,
      })),
    []
  )

  useFrame((state, delta) => {
    if (!ringRef.current) return
    ringRef.current.position.z += delta * 2.8
    if (ringRef.current.position.z > 1.6) {
      ringRef.current.position.z = -2.4 * ringCount
    }
    ringRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.35) * 0.15
  })

  return (
    <group>
      {rings.map((ring, index) => (
        <group key={index} position={[0, 0, ring.z]} scale={ring.scale}>
          <mesh ref={index === 0 ? ringRef : null}>
            <torusGeometry args={[2.2, 0.03, 14, 120]} />
            <meshStandardMaterial color="#67e8f9" emissive="#0ea5e9" emissiveIntensity={0.35} metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function FlightCore() {
  const coreRef = useRef()

  useFrame((state) => {
    if (!coreRef.current) return
    coreRef.current.rotation.y = state.clock.elapsedTime * 0.45
    coreRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.25) * 0.35
  })

  return (
    <Float speed={2.2} rotationIntensity={0.8} floatIntensity={1.8}>
      <mesh ref={coreRef} position={[0, 0, -2]}>
        <icosahedronGeometry args={[0.9, 1]} />
        <MeshDistortMaterial
          color="#f59e0b"
          emissive="#fb7185"
          emissiveIntensity={0.35}
          metalness={0.75}
          roughness={0.15}
          distort={0.35}
          speed={2.2}
        />
      </mesh>
    </Float>
  )
}

function FlightParticles() {
  const points = useMemo(() => {
    const count = 1200
    const array = new Float32Array(count * 3)
    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3
      array[i3] = (Math.random() - 0.5) * 30
      array[i3 + 1] = (Math.random() - 0.5) * 16
      array[i3 + 2] = -Math.random() * 50
    }
    return array
  }, [])

  const particlesRef = useRef()

  useFrame((_, delta) => {
    if (!particlesRef.current) return
    particlesRef.current.rotation.y += delta * 0.02
    particlesRef.current.position.z += delta * 2.0
    if (particlesRef.current.position.z > 5) {
      particlesRef.current.position.z = 0
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={points} count={points.length / 3} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#a5f3fc" transparent opacity={0.7} sizeAttenuation />
    </points>
  )
}

const ImmersiveScene = () => (
  <div className="fixed inset-0 -z-20">
    <Canvas camera={{ position: [0, 0, 6], fov: 55 }} dpr={[1, 1.8]}>
      <color attach="background" args={['#02040a']} />
      <fog attach="fog" args={['#02040a', 8, 42]} />
      <ambientLight intensity={0.2} />
      <directionalLight position={[3, 2, 2]} intensity={1.1} color={new THREE.Color('#e0f2fe')} />
      <directionalLight position={[-2, -1, 1]} intensity={0.5} color={new THREE.Color('#fb7185')} />
      <FlightParticles />
      <FlightTunnel />
      <FlightCore />
      <Environment preset="city" />
    </Canvas>
  </div>
)

export default ImmersiveScene
