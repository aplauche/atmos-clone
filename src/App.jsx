import { ScrollControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Noise } from "@react-three/postprocessing";
import Background from "./components/Background";
import { Experience } from "./components/Experience";
import Overlay from "./components/Overlay";

function App() {
  return (
    <>
      <Canvas>
        <color attach="background" args={["#ececec"]} />
        <ScrollControls pages={20} damping={0.5}>
          <Experience />
        </ScrollControls>
        <EffectComposer>
          <Noise opacity={0.125} />
        </EffectComposer>
      </Canvas>
      <Overlay />
    </>
  );
}

export default App;
