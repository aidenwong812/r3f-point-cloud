// Inspired from https://threejs.org/examples/?q=draw#webgl_buffergeometry_drawrange

import { useEffect, useMemo, useRef } from "react";
import { AdditiveBlending, Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import { points } from "./points";

export default function PointCloud() {
  const groupRef = useRef();
  const particlesRef = useRef();

  const maxParticleCount = points.length / 3;
  const particleCount = 2000;
  const r = 10;
  const rHalf = r / 2;
  const maxConnections = 20;
  const minDistance = 2.5;
  let vertexpos = 0;
  let colorpos = 0;
  let numConnected = 0;

  const segments = maxParticleCount * maxParticleCount;
  const positions = useMemo(() => new Float32Array(segments * 3), [segments]);
  const colors = useMemo(() => new Float32Array(segments * 3), [segments]);

  const particlePositions = useMemo(
    () => new Float32Array(maxParticleCount * 3),
    []
  );

  const particlesData: any[] = useMemo(() => [], []);

  const v = useMemo(() => new Vector3(), []);

  useEffect(() => {
    for (let i = 0; i < maxParticleCount; i++) {
      particlePositions[i * 3] = points[i * 3];
      particlePositions[i * 3 + 1] = points[i * 3 + 1];
      particlePositions[i * 3 + 2] = points[i * 3 + 2];

      const v = new Vector3(
        -1 + Math.random() * 2,
        -1 + Math.random() * 2,
        -1 + Math.random() * 2
      );
      particlesData.push({
        velocity: v.normalize().divideScalar(50),
        numConnections: 0,
      });
    }

    particlesRef.current.setDrawRange(0, particleCount);
  });

  useFrame((_, delta) => {
    vertexpos = 0;
    colorpos = 0;
    numConnected = 0;

    for (let i = 0; i < particleCount; i++) particlesData[i].numConnections = 0;

    for (let i = 0; i < particleCount; i++) {
      const particleData = particlesData[i];

      v.set(
        particlePositions[i * 3],
        particlePositions[i * 3 + 1],
        particlePositions[i * 3 + 2]
      )
        .add(particleData.velocity)
        .setLength(10);
      particlePositions[i * 3] = v.x;
      particlePositions[i * 3 + 1] = v.y;
      particlePositions[i * 3 + 2] = v.z;

      if (
        particlePositions[i * 3 + 1] < -rHalf ||
        particlePositions[i * 3 + 1] > rHalf
      )
        particleData.velocity.y = -particleData.velocity.y;

      if (particlePositions[i * 3] < -rHalf || particlePositions[i * 3] > rHalf)
        particleData.velocity.x = -particleData.velocity.x;

      if (
        particlePositions[i * 3 + 2] < -rHalf ||
        particlePositions[i * 3 + 2] > rHalf
      )
        particleData.velocity.z = -particleData.velocity.z;

      if (particleData.numConnections >= maxConnections) continue;

      for (let j = i + 1; j < particleCount; j++) {
        const particleDataB = particlesData[j];
        if (particleDataB.numConnections >= maxConnections) continue;

        const dx = particlePositions[i * 3] - particlePositions[j * 3];
        const dy = particlePositions[i * 3 + 1] - particlePositions[j * 3 + 1];
        const dz = particlePositions[i * 3 + 2] - particlePositions[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < minDistance) {
          particleData.numConnections++;
          particleDataB.numConnections++;

          const alpha = 1.0 - dist / minDistance;

          positions[vertexpos++] = particlePositions[i * 3];
          positions[vertexpos++] = particlePositions[i * 3 + 1];
          positions[vertexpos++] = particlePositions[i * 3 + 2];

          positions[vertexpos++] = particlePositions[j * 3];
          positions[vertexpos++] = particlePositions[j * 3 + 1];
          positions[vertexpos++] = particlePositions[j * 3 + 2];

          colors[colorpos++] = alpha;
          colors[colorpos++] = alpha;
          colors[colorpos++] = alpha;

          colors[colorpos++] = alpha;
          colors[colorpos++] = alpha;
          colors[colorpos++] = alpha;

          numConnected++;
        }
      }
    }

    particlesRef.current.attributes.position.needsUpdate = true;

    groupRef.current.rotation.y += delta / 5;
  });

  return (
    <group ref={groupRef} dispose={null}>
      <points>
        <bufferGeometry ref={particlesRef}>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color={"white"}
          size={3}
          blending={AdditiveBlending}
          transparent={true}
          sizeAttenuation={false}
        />
      </points>
    </group>
  );
}
