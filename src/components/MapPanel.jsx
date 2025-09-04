// src/components/MapPanel.jsx
import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Stats } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

// Draggable Item component with manual drag implementation
function DraggableItem({ position, index, type, onPositionChange, terrainRef, planeRef }) {
  const { camera, gl } = useThree();
  const groupRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const mouse = useMemo(() => new THREE.Vector2(), []);

  const handlePointerDown = (event) => {
    event.stopPropagation();
    setIsDragging(true);
    gl.domElement.style.cursor = 'grabbing';
    console.log(`Starting drag for ${type} ${index}`);
  };

  const handleGlobalPointerMove = (event) => {
    if (!isDragging) return;

    const rect = gl.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    // Get terrain objects for intersection
    const terrainObjects = terrainRef.current ? terrainRef.current.children : [];
    const objectsToIntersect = [...terrainObjects, planeRef.current].filter(Boolean);
    
    const intersects = raycaster.intersectObjects(objectsToIntersect, true);
    
    if (intersects.length > 0) {
      const point = intersects[0].point;
      point.y += type === 'troops' ? 0.09375 : type === 'arsenal' ? 0.05 : type === 'vehicles' ? 0.075 : 0.1; // Adjust offset for each type
      groupRef.current.position.set(point.x, point.y, point.z);
    }
  };

  const handleGlobalPointerUp = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    gl.domElement.style.cursor = isHovered ? 'pointer' : 'auto';
    console.log(`Ending drag for ${type} ${index}`);
    
    // Update position in parent component
    const pos = groupRef.current.position;
    onPositionChange(index, { position: [pos.x, pos.y, pos.z], type });
  };

  // Add global event listeners for drag
  useEffect(() => {
    if (isDragging) {
      const canvas = gl.domElement;
      canvas.addEventListener('pointermove', handleGlobalPointerMove);
      canvas.addEventListener('pointerup', handleGlobalPointerUp);
      
      return () => {
        canvas.removeEventListener('pointermove', handleGlobalPointerMove);
        canvas.removeEventListener('pointerup', handleGlobalPointerUp);
      };
    }
  }, [isDragging, handleGlobalPointerMove, handleGlobalPointerUp]);

  // Define geometry and material based on type
  const geometry = type === 'troops' ? (
    <>
      <mesh position={[0, 0.09375, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.1875, 32]} />
        <meshStandardMaterial 
          color={isDragging ? "lightgreen" : isHovered ? "darkgreen" : "green"} 
        />
      </mesh>
      <mesh position={[0, 0.20625, 0]}>
        <sphereGeometry args={[0.01875, 32, 32]} />
        <meshStandardMaterial 
          color={isDragging ? "lightgreen" : isHovered ? "darkgreen" : "green"} 
        />
      </mesh>
    </>
  ) : type === 'arsenal' ? (
    <mesh position={[0, 0.05, 0]}>
      <boxGeometry args={[0.1, 0.1, 0.1]} />
      <meshStandardMaterial 
        color={isDragging ? "lightblue" : isHovered ? "darkblue" : "blue"} 
      />
    </mesh>
  ) : type === 'vehicles' ? (
    <mesh position={[0, 0.075, 0]}>
      <boxGeometry args={[0.15, 0.15, 0.15]} />
      <meshStandardMaterial 
        color={isDragging ? "yellow" : isHovered ? "goldenrod" : "orange"} 
      />
    </mesh>
  ) : (
    <mesh position={[0, 0.1, 0]}>
      <cylinderGeometry args={[0.05, 0.05, 0.2, 32]} />
      <meshStandardMaterial 
        color={isDragging ? "salmon" : isHovered ? "darkred" : "red"} 
      />
    </mesh>
  );

  return (
    <group 
      ref={groupRef}
      position={position} 
      userData={{ index, type }}
      onPointerDown={handlePointerDown}
      onPointerEnter={() => {
        setIsHovered(true);
        gl.domElement.style.cursor = 'pointer';
      }}
      onPointerLeave={() => {
        setIsHovered(false);
        if (!isDragging) {
          gl.domElement.style.cursor = 'auto';
        }
      }}
    >
      {geometry}
      {/* Larger invisible collision mesh for easier interaction */}
      <mesh position={[0, type === 'troops' ? 0.125 : type === 'arsenal' ? 0.05 : type === 'vehicles' ? 0.075 : 0.1, 0]} visible={false}>
        <boxGeometry args={[0.12, 0.3, 0.12]} />
        <meshBasicMaterial />
      </mesh>
    </group>
  );
}

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
function Scene({ layers, setCoordinates, deployMode, setDeployMode, items, setItems, missionDetails, setMissionDetails }) {
  const { camera, gl, scene } = useThree();
  const terrainRef = useRef();
  const planeRef = useRef();
  const orbitRef = useRef();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const mouse = useMemo(() => new THREE.Vector2(), []);
  const [previewPosition, setPreviewPosition] = useState(null);
  const [isDraggingItem, setIsDraggingItem] = useState(false);

  // Handle mouse move for preview marker
  useEffect(() => {
    const handlePointerMove = (event) => {
      if (!deployMode.active || isDraggingItem || missionDetails[deployMode.type] === 0) return;

      const rect = gl.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const terrainObjects = terrainRef.current ? terrainRef.current.children : [];
      const objectsToIntersect = [...terrainObjects, planeRef.current].filter(Boolean);

      const intersects = raycaster.intersectObjects(objectsToIntersect, true);

      if (intersects.length > 0) {
        const point = intersects[0].point;
        point.y += deployMode.type === 'troops' ? 0.09375 : deployMode.type === 'arsenal' ? 0.05 : deployMode.type === 'vehicles' ? 0.075 : 0.1;
        setPreviewPosition([point.x, point.y, point.z]);
      } else {
        setPreviewPosition(null);
      }
    };

    gl.domElement.addEventListener("pointermove", handlePointerMove);
    return () => gl.domElement.removeEventListener("pointermove", handlePointerMove);
  }, [deployMode, isDraggingItem, gl, camera, raycaster, mouse, missionDetails]);

  // Handle click to place item
  useEffect(() => {
    const handleClick = (event) => {
      if (!deployMode.active || !previewPosition || isDraggingItem || missionDetails[deployMode.type] === 0) return;

      setItems((prev) => [...prev, { position: [...previewPosition], type: deployMode.type }]);
      setMissionDetails((prev) => ({ ...prev, [deployMode.type]: prev[deployMode.type] - 1 }));
      setPreviewPosition(null);
      if (missionDetails[deployMode.type] - 1 === 0) {
        setDeployMode({ active: false, type: null });
      }
    };

    gl.domElement.addEventListener("click", handleClick);
    return () => gl.domElement.removeEventListener("click", handleClick);
  }, [deployMode, previewPosition, isDraggingItem, setItems, setDeployMode, missionDetails, setMissionDetails]);

  // Update cursor based on deploy mode
  useEffect(() => {
    if (!isDraggingItem) {
      gl.domElement.style.cursor = deployMode.active && missionDetails[deployMode.type] > 0 ? "crosshair" : "auto";
    }
    return () => {
      if (!isDraggingItem) {
        gl.domElement.style.cursor = "auto";
      }
    };
  }, [deployMode, isDraggingItem, gl, missionDetails]);

  // Handle item position updates
  const handleItemPositionChange = (index, { position, type }) => {
    setItems((prev) => {
      const newItems = [...prev];
      if (index < newItems.length) {
        newItems[index] = { position, type };
      }
      return newItems;
    });
  };

  // Track when any item is being dragged
  useEffect(() => {
    const handleDragStart = () => setIsDraggingItem(true);
    const handleDragEnd = () => setIsDraggingItem(false);

    // Listen for item drag events
    items.forEach((_, index) => {
      // This is handled within each item component
    });
  }, [items]);

  // Preview geometry based on type
  const previewGeometry = deployMode.type === 'troops' ? (
    <>
      <mesh position={[0, 0.09375, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.1875, 32]} />
        <meshStandardMaterial color="blue" opacity={0.5} transparent />
      </mesh>
      <mesh position={[0, 0.20625, 0]}>
        <sphereGeometry args={[0.01875, 32, 32]} />
        <meshStandardMaterial color="blue" opacity={0.5} transparent />
      </mesh>
    </>
  ) : deployMode.type === 'arsenal' ? (
    <mesh position={[0, 0.05, 0]}>
      <boxGeometry args={[0.1, 0.1, 0.1]} />
      <meshStandardMaterial color="blue" opacity={0.5} transparent />
    </mesh>
  ) : deployMode.type === 'vehicles' ? (
    <mesh position={[0, 0.075, 0]}>
      <boxGeometry args={[0.15, 0.15, 0.15]} />
      <meshStandardMaterial color="blue" opacity={0.5} transparent />
    </mesh>
  ) : (
    <mesh position={[0, 0.1, 0]}>
      <cylinderGeometry args={[0.05, 0.05, 0.2, 32]} />
      <meshStandardMaterial color="blue" opacity={0.5} transparent />
    </mesh>
  );

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

      {/* Draggable Items */}
      {items.map((item, idx) => (
        <DraggableItem
          key={idx}
          position={item.position}
          index={idx}
          type={item.type}
          onPositionChange={handleItemPositionChange}
          terrainRef={terrainRef}
          planeRef={planeRef}
        />
      ))}

      {/* Preview item */}
      {deployMode.active && previewPosition && !isDraggingItem && missionDetails[deployMode.type] > 0 && (
        <group position={previewPosition}>
          {previewGeometry}
        </group>
      )}

      <gridHelper args={[10, 10]} rotation={[Math.PI / 2, 0, 0]} />
      <OrbitControls 
        ref={orbitRef} 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true}
        enabled={!isDraggingItem} // Disable when dragging items
      />
    </>
  );
}

export default function MapPanel({ layers = [], deployMode, setDeployMode, missionDetails, setMissionDetails }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0, z: 0 });
  const [items, setItems] = useState([]);
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
          items={items}
          setItems={setItems}
          missionDetails={missionDetails}
          setMissionDetails={setMissionDetails}
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

      {/* Debug information for terrain intersection */}
      {items.length > 0 && (
        <div className="absolute top-4 left-4 z-50 bg-green-900/80 text-white text-sm px-3 py-2 rounded-md shadow-lg">
          <span>Items Deployed: {items.length}</span>
          <div className="text-xs mt-1 opacity-75">
            Click and drag items to reposition
          </div>
          <div className="text-xs mt-1 opacity-75">
            Terrain layers: {layers.filter(l => l.visible).length}
          </div>
        </div>
      )}

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