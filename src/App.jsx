import { ScrollControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Background from "./components/Background";
import { Experience } from "./components/Experience";

function App() {
  return (
    <>
      <Canvas>
        <Background />
        <color attach="background" args={["#ececec"]} />
        <ScrollControls pages={50} damping={1}>
          <Experience />
        </ScrollControls>
      </Canvas>
    </>
  );
}

export default App;
