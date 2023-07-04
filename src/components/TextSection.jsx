import { Text } from "@react-three/drei"
import { fadeOnBeforeCompileFlat } from "../utils/fadeMaterial"

function TextSection({title, subtitle, ...props}) {
  return (
    <group {...props}>
      {!!title && (
        <Text
        color="white"
        anchorX={"left"}
        anchorY="bottom"
        fontSize={0.52}
        maxWidth={2.5}
        lineHeight={1}
        font={"./fonts/DMSerifDisplay-Regular.ttf"}
      >
        {title}
        <meshStandardMaterial
          color={"white"}
          onBeforeCompile={fadeOnBeforeCompileFlat}
        />
      </Text>
      )}

    <Text
      color="white"
      anchorX={"left"}
      anchorY="top"
      position-y={0}
      fontSize={0.22}
      maxWidth={2.5}
      font={"./fonts/Inter-Regular.ttf"}
    >
      {subtitle}
      <meshStandardMaterial
          color={"white"}
          onBeforeCompile={fadeOnBeforeCompileFlat}
        />
    </Text>
  </group>
  )
}

export default TextSection
