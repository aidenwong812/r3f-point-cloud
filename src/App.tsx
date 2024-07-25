import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import PointCloud from "./PointCloud";

import "./styles.css";

export default function App() {
  return (
    <Canvas camera={{ position: [0, 0, 20] }}>
      <PointCloud />
      <OrbitControls />
    </Canvas>
  );
}
