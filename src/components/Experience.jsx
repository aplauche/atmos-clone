import { Cloud, Float, OrbitControls, PerspectiveCamera, Text, useScroll } from "@react-three/drei";
import { useMemo, useRef } from "react";
import { Airplane } from "./Airplane";
import Background from "./Background";

import * as THREE from 'three'
import { useFrame } from "@react-three/fiber";
import { Group } from "three";


const LINE_NB_POINTS = 1000;

const CURVE_DISTANCE = 250;
const CURVE_AHEAD_CAMERA = 0.008;
const CURVE_AHEAD_AIRPLANE = 0.02;
const AIRPLANE_MAX_ANGLE = 35;

export const Experience = () => {

  const airplane = useRef()
  const cameraGroup = useRef()

  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -CURVE_DISTANCE),
      new THREE.Vector3(100, 0, -2 * CURVE_DISTANCE),
      new THREE.Vector3(-100, 0, -3 * CURVE_DISTANCE),
      new THREE.Vector3(100, 0, -4 * CURVE_DISTANCE),
      new THREE.Vector3(0, 0, -5 * CURVE_DISTANCE),
      new THREE.Vector3(0, 0, -6 * CURVE_DISTANCE),
      new THREE.Vector3(0, 0, -7 * CURVE_DISTANCE),
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
    shape.moveTo(0, -0.08);
    shape.lineTo(0, 0.08);

    return shape;
  }, [curve]);


  const scroll = useScroll()

  useFrame((state, delta) => {
    // get the index of point closest to scroll %

    const scrollOffset = Math.max(0, scroll.offset)

    // select the actual point from the index
    const curPoint = curve.getPoint(scrollOffset);

    // Move the whole group to the point that corresponds with scroll pos 
    cameraGroup.current.position.lerp(curPoint, delta * 15) // default 24

    // get our point to look ahead at ()
    const lookAtPoint = curve.getPoint(Math.min(scrollOffset + CURVE_AHEAD_CAMERA, 1));

    // get current look at direction
    const currentLookAt = cameraGroup.current.getWorldDirection(
      new THREE.Vector3()
    );
    const targetLookAt = new THREE.Vector3()
    .subVectors(curPoint, lookAtPoint) // subtract lookatpoint from current point
    .normalize(); // normalize from 0 - 1

    const lookAt = currentLookAt.lerp(targetLookAt, delta * 24);
    cameraGroup.current.lookAt(
      cameraGroup.current.position.clone().add(lookAt)
    );

    // Airplane rotation

    const tangent = curve.getTangent(scrollOffset + CURVE_AHEAD_AIRPLANE);

    const nonLerpLookAt = new Group();
    nonLerpLookAt.position.copy(curPoint);
    nonLerpLookAt.lookAt(nonLerpLookAt.position.clone().add(targetLookAt));

    tangent.applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      -nonLerpLookAt.rotation.y
    );

    let angle = Math.atan2(-tangent.z, tangent.x);
    angle = -Math.PI / 2 + angle;

    let angleDegrees = (angle * 180) / Math.PI;
    angleDegrees *= 2.4; // stronger angle

    // LIMIT PLANE ANGLE
    if (angleDegrees < 0) {
      angleDegrees = Math.max(angleDegrees, -AIRPLANE_MAX_ANGLE);
    }
    if (angleDegrees > 0) {
      angleDegrees = Math.min(angleDegrees, AIRPLANE_MAX_ANGLE);
    }

    // SET BACK ANGLE
    angle = (angleDegrees * Math.PI) / 180;

    const targetAirplaneQuaternion = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(
        airplane.current.rotation.x,
        airplane.current.rotation.y,
        angle
      )
    );
    airplane.current.quaternion.slerp(targetAirplaneQuaternion, delta * 2);

    // calculate difference side to side moving along line
    //const xDisplacement = (lookAtPoint.x - curPoint.x) * 80

    // rotate plane left or right base on next point
    // Math.PI / 2 -> LEFT
    // -Math.PI / 2 -> RIGHT

    // generate angle with Math.PI /3 as the max angle even if displacement is bigger
    //const angleRotation = (xDisplacement < 0 ? 1 : -1) * Math.min(Math.abs(xDisplacement), Math.PI / 3);
 
    // rotations cant be lerped so we have to transform to Quarternion
    //const targetAirplaneQuaternion = new THREE.Quaternion().setFromEuler(
    //   new THREE.Euler(
    //     airplane.current.rotation.x,
    //     airplane.current.rotation.y,
    //     angleRotation * 1.5 // scale up to make this more dramatic
    //   )
    // );

    // we can use same logic to rotate camera left/right
    // const targetCameraQuaternion = new THREE.Quaternion().setFromEuler(
    //   new THREE.Euler(
    //     cameraGroup.current.rotation.x,
    //     angleRotation,
    //     cameraGroup.current.rotation.z
    //   )
    // );

    // airplane.current.quaternion.slerp(targetAirplaneQuaternion, delta * 5); // default 2

    // cameraGroup.current.quaternion.slerp(targetCameraQuaternion, delta * 5); // default 2

 
  })


  return (
    <>
      {/* <OrbitControls /> */}
      {/* <Cloud /> */}
      <directionalLight position={[0,3,1]} intensity={0.2} />
      <group ref={cameraGroup}>
        <Background />
        <PerspectiveCamera position={[0, 0, 5]} fov={30} makeDefault />
        <group ref={airplane}>
          <Float floatIntensity={1} speed={1.5} rotationIntensity={0.5}>
            <Airplane
              rotation-y={Math.PI / 2}
              scale={[0.2, 0.2, 0.2]}
              position-y={0.1}
            />
          </Float>
        </group>
      </group>
      {/* TEXT */}
      <group position={[-3, 0, -100]}>
        <Text
          color="white"
          anchorX={"left"}
          anchorY="middle"
          fontSize={0.22}
          maxWidth={2.5}
          font={"./fonts/Inter-Regular.ttf"}
        >
          Welcome to Wawatmos!{"\n"}
          Have a seat and enjoy the ride!
        </Text>
      </group>

      <group position={[-10, 1, -200]}>
        <Text
          color="white"
          anchorX={"left"}
          anchorY="center"
          fontSize={0.52}
          maxWidth={2.5}
          font={"./fonts/DMSerifDisplay-Regular.ttf"}
        >
          Services
        </Text>
        <Text
          color="white"
          anchorX={"left"}
          anchorY="top"
          position-y={-0.66}
          fontSize={0.22}
          maxWidth={2.5}
          font={"./fonts/Inter-Regular.ttf"}
        >
          Do you want a drink?{"\n"}
          We have a wide range of beverages!
        </Text>
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
          <meshStandardMaterial color={"white"} opacity={1} transparent />
        </mesh>
      </group>



            {/* CLOUDS */}
            <Cloud scale={[1, 1, 1.5]} position={[-3.5, -1.2, -7]} />
      <Cloud scale={[1, 1, 2]} position={[3.5, -1, -10]} rotation-y={Math.PI} />
      <Cloud
        scale={[1, 1, 1]}
        position={[-3.5, 0.2, -12]}
        rotation-y={Math.PI / 3}
      />
      <Cloud scale={[1, 1, 1]} position={[3.5, 0.2, -12]} />

      <Cloud
        scale={[0.4, 0.4, 0.4]}
        rotation-y={Math.PI / 9}
        position={[1, -0.2, -12]}
      />
      <Cloud scale={[0.3, 0.5, 2]} position={[-4, -0.5, -53]} />
      <Cloud scale={[0.8, 0.8, 0.8]} position={[-1, -1.5, -100]} />

    </>
  );
};
