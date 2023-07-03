import { Cloud, Float, OrbitControls, PerspectiveCamera, useScroll } from "@react-three/drei";
import { useMemo, useRef } from "react";
import { Airplane } from "./Airplane";
import Background from "./Background";

import * as THREE from 'three'
import { useFrame } from "@react-three/fiber";


const LINE_NB_POINTS = 12000;

export const Experience = () => {

  const airplane = useRef()
  const cameraGroup = useRef()

  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -10),
      new THREE.Vector3(-2, 0, -20),
      new THREE.Vector3(-3, 0, -30),
      new THREE.Vector3(0, 0, -40),
      new THREE.Vector3(5, 0, -50),
      new THREE.Vector3(7, 0, -60),
      new THREE.Vector3(5, 0, -70),
      new THREE.Vector3(0, 0, -80),
      new THREE.Vector3(0, 0, -90),
      new THREE.Vector3(0, 0, -100),
    ],
    false,
    "catmullrom",
    0.5)


  })

  const linePoints = useMemo(() => {
    return curve.getPoints(LINE_NB_POINTS);
  }, [curve]);

  const shape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.2);
    shape.lineTo(0, 0.2);

    return shape;
  }, [curve]);


  const scroll = useScroll()

  useFrame((state, delta) => {
    // get the index of point closest to scroll %
    const curPointIndex = Math.min(
      Math.round(scroll.offset * linePoints.length),
      linePoints.length - 1
    );
    // select the actual point from the index
    const curPoint = linePoints[curPointIndex];

    // Move the whole group to the point that corresponds with scroll pos 
    cameraGroup.current.position.lerp(curPoint, delta * 15) // default 24

    // get the point ahead on curve - either next or final point -  to determine direction to point
    const pointAhead = linePoints[Math.min(curPointIndex + 1, linePoints.length - 1)];

    // calculate difference side to side moving along line
    const xDisplacement = (pointAhead.x - curPoint.x) * 80

    // rotate plane left or right base on next point
    // Math.PI / 2 -> LEFT
    // -Math.PI / 2 -> RIGHT

    // generate angle with Math.PI /3 as the max angle even if displacement is bigger
    const angleRotation = (xDisplacement < 0 ? 1 : -1) * Math.min(Math.abs(xDisplacement), Math.PI / 3);
 
    // rotations cant be lerped so we have to transform to Quarternion
    const targetAirplaneQuaternion = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(
        airplane.current.rotation.x,
        airplane.current.rotation.y,
        angleRotation * 2.5 // scale up to make this more dramatic
      )
    );

    // we can use same logic to rotate camera left/right
    const targetCameraQuaternion = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(
        cameraGroup.current.rotation.x,
        angleRotation,
        cameraGroup.current.rotation.z
      )
    );

    airplane.current.quaternion.slerp(targetAirplaneQuaternion, delta * 5); // default 2

    cameraGroup.current.quaternion.slerp(targetCameraQuaternion, delta * 5); // default 2

 
  })


  return (
    <>
      {/* <OrbitControls enableZoom={false}/> */}
      {/* <Cloud /> */}
      <group ref={cameraGroup}>
        <Background />
        <PerspectiveCamera position={[0, 0, 5]} fov={30} makeDefault />
        <group ref={airplane}>
          <Float floatIntensity={2} speed={2}>
            <Airplane
              rotation-y={Math.PI / 2}
              scale={[0.2, 0.2, 0.2]}
              position-y={0.1}
            />
          </Float>
        </group>
      </group>
      {/* LINE */}
      <group position-y={-2}>
        <mesh>
          <extrudeGeometry
            args={[
              shape,
              {
                steps: LINE_NB_POINTS,
                bevelEnabled: false,
                extrudePath: curve,
              },
            ]}
          />
          <meshStandardMaterial color={"white"} opacity={0.7} transparent />
        </mesh>
      </group>

    </>
  );
};
