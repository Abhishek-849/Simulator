import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Stats, DragControls } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

// Soldier model (cylinder body + sphere head, 25% of previous size)
function Soldier({ position, index }, ref) {
  return (
    <group position={position} userData={{ index }} ref={ref}>
      {/* Body: ~0.1875 units tall, 0.05 units wide */}
      <mesh position={[0, 0.09375, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.1875, 32]} />
        <meshStandardMaterial color="green" />
      </mesh>
      {/* Head: ~0.0375 units diameter, positioned above body */}
      <mesh position={[0, 0.20625, 0]}>
        <sphereGeometry args={[0.01875, 32, 32]} />
        <meshStandardMaterial color="green" />
      </mesh>
    </group>
  );
}

// Forward ref to Soldier component for DragControls
const SoldierWithRef = React.forwardRef(Soldier);

// 3D Model Component
function Model({ url, layerId, visible, onPointerMove }) {
  const obj = useLoader(OBJLoader, url);

  useEffect(() => {
    if (obj) {
      const box = new THREE.Box3().setFromObject(obj);
      const center = box.getCenter(new THREE.Vector3());
      obj.position.sub(center);
      obj.userData.layerId = layerId;
    }
  }, [obj, layerId]);

  return obj ? (
    <primitive
      object={obj}
      scale={0.5}
      visible={visible}
      onPointerMove={(e) => {
        e.stopPropagation();
        if (onPointerMove) {
          const { point } = e;
          onPointerMove({
            x: (point.x * 100).toFixed(2),
            y: (point.y * 100).toFixed(2),
            z: (point.z * 100).toFixed(2),
          });
        }
      }}
    />
  ) : null;
}

// Scene setup
function Scene({ layers, setCoordinates, deployMode, setDeployMode, soldiers, setSoldiers }) {
  const { camera, gl, scene } = useThree();
  const terrainRef = useRef();
  const planeRef = useRef();
  const soldiersRef = useRef([]);
  const dragControlsRef = useRef();
  const orbitRef = useRef();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const mouse = useMemo(() => new THREE.Vector2(), []);
  const [previewPosition, setPreviewPosition] = useState(null);

  // Sync soldier refs with soldiers array
  useEffect(() => {
    soldiersRef.current = soldiersRef.current.slice(0, soldiers.length);
  }, [soldiers]);

  // Handle mouse move for preview marker
  useEffect(() => {
    const handlePointerMove = (event) => {
      if (!deployMode) return;

      const rect = gl.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const terrainObjects = terrainRef.current ? terrainRef.current.children : [];
      const objectsToIntersect = [...terrainObjects, planeRef.current].filter(Boolean);

      const intersects = raycaster.intersectObjects(objectsToIntersect, true);

      if (intersects.length > 0) {
        const point = intersects[0].point;
        point.y += 0.09375; // Offset by half body height (0.1875 / 2)
        setPreviewPosition([point.x, point.y, point.z]);
      } else {
        setPreviewPosition(null);
      }
    };

    gl.domElement.addEventListener("pointermove", handlePointerMove);
    return () => gl.domElement.removeEventListener("pointermove", handlePointerMove);
  }, [deployMode, gl, camera, raycaster, mouse]);

  // Handle click to place soldier
  useEffect(() => {
    const handleClick = (event) => {
      if (!deployMode || !previewPosition) return;

      setSoldiers((prev) => [...prev, [...previewPosition]]);
      setPreviewPosition(null);
      setDeployMode(false); // Exit deploy mode after placing
    };

    gl.domElement.addEventListener("click", handleClick);
    return () => gl.domElement.removeEventListener("click", handleClick);
  }, [deployMode, previewPosition, setSoldiers, setDeployMode]);

  // Update cursor based on deploy mode
  useEffect(() => {
    gl.domElement.style.cursor = deployMode ? "crosshair" : "auto";
    return () => {
      gl.domElement.style.cursor = "auto";
    };
  }, [deployMode, gl]);

  // Handle soldier dragging and disable OrbitControls during drag
  useEffect(() => {
    const controls = dragControlsRef.current;
    const orbit = orbitRef.current;
    if (!controls || !orbit) return;

    const handleDragStart = () => {
      orbit.enabled = false; // Disable OrbitControls during drag
    };

    const handleDrag = (event) => {
      raycaster.setFromCamera(mouse, camera);
      const terrainObjects = terrainRef.current ? terrainRef.current.children : [];
      const objectsToIntersect = [...terrainObjects, planeRef.current].filter(Boolean);
      const intersects = raycaster.intersectObjects(objectsToIntersect, true);

      if (intersects.length > 0) {
        const point = intersects[0].point;
        point.y += 0.09375; // Offset by half body height
        event.object.position.set(point.x, point.y, point.z);
      }
    };

    const handleDragEnd = (event) => {
      orbit.enabled = true; // Re-enable OrbitControls
      const idx = event.object.userData.index;
      const p = event.object.position;
      setSoldiers((prev) => {
        const newSoldiers = [...prev];
        newSoldiers[idx] = [p.x, p.y, p.z];
        return newSoldiers;
      });
    };

    controls.addEventListener("dragstart", handleDragStart);
    controls.addEventListener("drag", handleDrag);
    controls.addEventListener("dragend", handleDragEnd);

    return () => {
      controls.removeEventListener("dragstart", handleDragStart);
      controls.removeEventListener("drag", handleDrag);
      controls.removeEventListener("dragend", handleDragEnd);
    };
  }, [dragControlsRef, orbitRef, setSoldiers, raycaster, mouse, camera]);

  // Update mouse position for dragging
  useEffect(() => {
    const handleMouseMove = (event) => {
      const rect = gl.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    gl.domElement.addEventListener("mousemove", handleMouseMove);
    return () => gl.domElement.removeEventListener("mousemove", handleMouseMove);
  }, [gl]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />

      {/* Ground plane for fallback placement */}
      <mesh ref={planeRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} visible={false}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial />
      </mesh>

      {/* Models */}
      <group ref={terrainRef}>
        {layers.length > 0 ? (
          layers.map((layer) =>
            layer.fileUrl ? (
              <Suspense key={layer.id} fallback={null}>
                <Model
                  url={layer.fileUrl}
                  layerId={layer.id}
                  visible={layer.visible}
                  onPointerMove={setCoordinates}
                />
              </Suspense>
            ) : null
          )
        ) : (
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="hotpink" />
          </mesh>
        )}
      </group>

      {/* Soldiers */}
      {soldiers.map((pos, idx) => (
        <SoldierWithRef
          key={idx}
          position={pos}
          index={idx}
          ref={(el) => (soldiersRef.current[idx] = el)}
        />
      ))}

      <DragControls ref={dragControlsRef} objects={soldiersRef.current} />

      {/* Preview soldier - matches soldier geometry */}
      {deployMode && previewPosition && (
        <group position={previewPosition}>
          <mesh position={[0, 0.09375, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.1875, 32]} />
            <meshStandardMaterial color="blue" opacity={0.5} transparent />
          </mesh>
          <mesh position={[0, 0.20625, 0]}>
            <sphereGeometry args={[0.01875, 32, 32]} />
            <meshStandardMaterial color="blue" opacity={0.5} transparent />
          </mesh>
        </group>
      )}

      <gridHelper args={[10, 10]} rotation={[Math.PI / 2, 0, 0]} />
      <OrbitControls ref={orbitRef} enablePan={true} enableZoom={true} enableRotate={true} />
    </>
  );
}

export default function MapPanel({ layers = [], deployMode, setDeployMode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0, z: 0 });
  const [soldiers, setSoldiers] = useState([]);
  const canvasRef = useRef();

  useEffect(() => {
    const uploadModel = async (layer) => {
      setIsLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", layer.file);

      try {
        const response = await fetch("http://localhost:5000/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Failed to upload model");

        const data = await response.json();

        if (data.success) {
          layer.fileUrl = `http://localhost:5000${data.file_url}`;
        } else {
          throw new Error(data.error || "Failed to process model");
        }
      } catch (err) {
        console.error("Error uploading model:", err);
        setError(err.message || "Failed to load model");
      } finally {
        setIsLoading(false);
      }
    };

    layers.forEach((layer) => {
      if (layer.type === "model" && !layer.fileUrl && layer.file) {
        uploadModel(layer);
      }
    });
  }, [layers]);

  return (
    <div className="h-full w-full relative">
      <Canvas ref={canvasRef} camera={{ position: [0, 5, 10], fov: 50 }}>
        <Scene
          layers={layers}
          setCoordinates={setCoordinates}
          deployMode={deployMode}
          setDeployMode={setDeployMode}
          soldiers={soldiers}
          setSoldiers={setSoldiers}
        />
      </Canvas>

      <Stats className="!absolute !top-2 !right-2 !left-auto !z-50" />

      {/* Coordinate display in meters */}
      <div className="absolute bottom-4 right-4 z-50 bg-gray-900/80 text-white text-sm px-3 py-2 rounded-md shadow-lg">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <span className="text-gray-300">X (m):</span>
          <span className="font-mono">{coordinates.x}</span>
          <span className="text-gray-300">Y (m):</span>
          <span className="font-mono">{coordinates.y}</span>
          <span className="text-gray-300">Z (m):</span>
          <span className="font-mono">{coordinates.z}</span>
        </div>
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-40">
          <div className="text-white text-lg">
            Uploading and processing 3D model...
          </div>
        </div>
      )}

      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-600 text-white px-4 py-2 rounded-md shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}