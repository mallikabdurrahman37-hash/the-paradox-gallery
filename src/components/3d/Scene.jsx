import React, { useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';

// ── GLB Model ─────────────────────────────────────────────────────
function ArtModel({ mouseX, mouseY }) {
  const { scene } = useGLTF('/src/assets/models/hero-art.glb');
  const groupRef = useRef();

  // Smooth mouse-tracking rotation
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // Slow base rotation
    groupRef.current.rotation.y += 0.003;

    // Mouse influence — gentle tilt
    const targetX = (mouseY.current || 0) * 0.3;
    const targetY = groupRef.current.rotation.y + (mouseX.current || 0) * 0.5;

    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetX,
      0.05
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetY,
      0.05
    );
  });

  return (
    <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.4}>
      <primitive ref={groupRef} object={scene} scale={1.2} />
    </Float>
  );
}

// ── Fallback Mesh (if GLB fails to load) ──────────────────────────
function FallbackMesh({ mouseX, mouseY }) {
  const meshRef = useRef();

  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += 0.005;
    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      (mouseY.current || 0) * 0.25,
      0.05
    );
  });

  return (
    <Float speed={1.8} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.4, 1]} />
        <meshStandardMaterial
          color="#C84B31"
          metalness={0.4}
          roughness={0.3}
          wireframe={false}
        />
      </mesh>
    </Float>
  );
}

// ── Error Boundary ─────────────────────────────────────────────────
class GLBErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return <FallbackMesh mouseX={this.props.mouseX} mouseY={this.props.mouseY} />;
    }
    return this.props.children;
  }
}

// ── Main Scene Export ──────────────────────────────────────────────
export default function Scene() {
  const mouseX = useRef(0);
  const mouseY = useRef(0);

  useEffect(() => {
    const handleMouse = (e) => {
      mouseX.current = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY.current = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} color="#F9F8F5" />
      <pointLight position={[-3, 2, 2]} intensity={0.8} color="#C84B31" />

      <Suspense fallback={<FallbackMesh mouseX={mouseX} mouseY={mouseY} />}>
        <GLBErrorBoundary mouseX={mouseX} mouseY={mouseY}>
          <ArtModel mouseX={mouseX} mouseY={mouseY} />
        </GLBErrorBoundary>
        <Environment preset="studio" />
      </Suspense>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={true}
        autoRotate={false}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 3}
      />
    </Canvas>
  );
}
