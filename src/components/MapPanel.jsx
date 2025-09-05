// src/components/MapPanel.jsx
import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Stats, Html } from "@react-three/drei";
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

    // Start dragging if not already locked for repositioning
    if (!isDragging) {
      setIsDragging(true);
      gl.domElement.style.cursor = 'grabbing';
      console.log(`Starting drag for ${type} ${index}`);
    }
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
      const point = intersects[0].point.clone();
      // Calculate proper surface offset based on item type and geometry
      const surfaceOffset = type === 'troops' ? 0.09375 : type === 'arsenal' ? 0.05 : type === 'vehicles' ? 0.075 : 0.1;
      
      // Position item directly on the surface with minimal offset
      point.y = intersects[0].point.y + surfaceOffset;
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

  // Define impact circle radius based on type (reduced by 50%)
  const impactRadius = type === 'troops' ? 0.15 : type === 'arsenal' ? 0.3 : type === 'vehicles' ? 0.3 : 0.5; // tanks get largest radius

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

  // Impact circle component
  const impactCircle = (
    <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[impactRadius * 0.8, impactRadius, 32]} />
      <meshBasicMaterial 
        color="red" 
        transparent 
        opacity={isHovered || isDragging ? 0.4 : 0.2}
        side={THREE.DoubleSide}
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
      {/* Impact circle - rendered first so it appears underneath */}
      {impactCircle}
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

// Image Processing Component - renders distance with line connecting points
function DistanceLine({ start, end, calculateDistance }) {
  // Calculate the distance for line positioning
  const distance = calculateDistance(start, end);

  // Calculate rotation and position for the line
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dz = end.z - start.z;
  const length = Math.sqrt(dx * dx + dy * dy + dz * dz);

  // Create line geometry points
  const points = [
    new THREE.Vector3(start.x, start.y + 0.05, start.z),
    new THREE.Vector3(end.x, end.y + 0.05, end.z)
  ];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <group key={`distance-line-${start.x}-${start.y}-${end.x}-${end.y}`}>
      {/* Starting point marker */}
      <mesh position={[start.x, start.y + 0.1, start.z]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="yellow" emissive="yellow" emissiveIntensity={0.2} />
      </mesh>

      {/* End point marker */}
      <mesh position={[end.x, end.y + 0.1, end.z]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="yellow" emissive="yellow" emissiveIntensity={0.2} />
      </mesh>

      {/* Distance line connecting the points */}
      <line geometry={geometry}>
        <lineBasicMaterial color="yellow" linewidth={5} />
      </line>

      {/* Distance label */}
      <Html
        position={[(start.x + end.x) / 2, Math.max(start.y, end.y) + 0.3, (start.z + end.z) / 2]}
        center
      >
        <div
          style={{
            background: 'rgba(255, 255, 0, 0.9)',
            color: 'black',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
            fontWeight: 'bold',
            border: '2px solid yellow',
            boxShadow: '2px 2px 8px rgba(0,0,0,0.5)'
          }}
        >
          {distance.toFixed(2)}m
        </div>
      </Html>
    </group>
  );
}

// Scene setup
function Scene({ layers, setCoordinates, deployMode, setDeployMode, items, setItems, missionDetails, setMissionDetails, setModelLocked, distanceMode, distancePoints, calculateDistance }) {
  const { camera, gl, scene } = useThree();
  const terrainRef = useRef();
  const planeRef = useRef();
  const orbitRef = useRef();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const mouse = useMemo(() => new THREE.Vector2(), []);
  const [previewPosition, setPreviewPosition] = useState(null);
  const [isDraggingItem, setIsDraggingItem] = useState(false);

  // Handle distance measurement clicks (must be at Scene level to access canvas DOM)
  useEffect(() => {
    if (!distanceMode || !distanceMode.active) return;

    const handleDistanceClick = (event) => {
      event.stopPropagation();

      const rect = gl.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2();

      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Create raycaster for terrain intersection
      raycaster.setFromCamera(mouse, camera);

      // Get terrain objects for intersection
      const terrainObjects = terrainRef.current ? terrainRef.current.children : [];
      const objectsToIntersect = [...terrainObjects, planeRef.current].filter(Boolean);

      const intersects = raycaster.intersectObjects(objectsToIntersect, true);

      if (intersects.length > 0) {
        const point = intersects[0].point.clone();

        // Convert to world coordinates as expected by distance calculation
        const worldPoint = {
          x: point.x,
          y: point.y,
          z: point.z,
          screenCoords: { x: event.clientX - rect.left, y: event.clientY - rect.top }
        };

        // Add point to distancePoints array (but we can't modify state from here)
        // Instead, dispatch an event to parent component
        const customEvent = new CustomEvent('distancePointSelected', {
          detail: { point: worldPoint }
        });
        window.dispatchEvent(customEvent);
      }
    };

    gl.domElement.addEventListener('click', handleDistanceClick);

    return () => {
      gl.domElement.removeEventListener('click', handleDistanceClick);
    };
  }, [distanceMode, gl, camera, raycaster, terrainRef, planeRef]);

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
        const point = intersects[0].point.clone();
        // Calculate proper surface offset based on item type and geometry
        const surfaceOffset = deployMode.type === 'troops' ? 0.09375 : deployMode.type === 'arsenal' ? 0.05 : deployMode.type === 'vehicles' ? 0.075 : 0.1;
        
        // Position item directly on the surface with minimal offset
        point.y = intersects[0].point.y + surfaceOffset;
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
      // Don't handle clicks when distance mode is active - let distance tool handle it
      if (distanceMode && distanceMode.active) return;

      if (!deployMode.active || !previewPosition || isDraggingItem || missionDetails[deployMode.type] === 0) return;

      // Add the new item to the scene
      const newItems = [...items, { position: [...previewPosition], type: deployMode.type }];
      setItems(newItems);

      // Update mission details
      setMissionDetails((prev) => ({ ...prev, [deployMode.type]: prev[deployMode.type] - 1 }));
      setPreviewPosition(null);

      // Lock the model position when the first item is deployed on the model
      if (layers.length > 0 && items.length === 0) { // Only lock on first item
        setModelLocked?.(true);
      }

      if (missionDetails[deployMode.type] - 1 === 0) {
        setDeployMode({ active: false, type: null });
      }
    };

    gl.domElement.addEventListener("click", handleClick);
    return () => gl.domElement.removeEventListener("click", handleClick);
  }, [deployMode, previewPosition, isDraggingItem, setItems, setDeployMode, missionDetails, setMissionDetails, setModelLocked, items.length, layers.length, distanceMode]);

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

  // Preview impact circle radius based on type (reduced by 50%)
  const previewImpactRadius = deployMode.type === 'troops' ? 0.15 : deployMode.type === 'arsenal' ? 0.3 : deployMode.type === 'vehicles' ? 0.3 : 0.5;

  // Preview geometry based on type
  const previewGeometry = deployMode.type === 'troops' ? (
    <>
      {/* Preview impact circle */}
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[previewImpactRadius * 0.8, previewImpactRadius, 32]} />
        <meshBasicMaterial color="red" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
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
    <>
      {/* Preview impact circle */}
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[previewImpactRadius * 0.8, previewImpactRadius, 32]} />
        <meshBasicMaterial color="red" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color="blue" opacity={0.5} transparent />
      </mesh>
    </>
  ) : deployMode.type === 'vehicles' ? (
    <>
      {/* Preview impact circle */}
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[previewImpactRadius * 0.8, previewImpactRadius, 32]} />
        <meshBasicMaterial color="red" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.075, 0]}>
        <boxGeometry args={[0.15, 0.15, 0.15]} />
        <meshStandardMaterial color="blue" opacity={0.5} transparent />
      </mesh>
    </>
  ) : (
    <>
      {/* Preview impact circle */}
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[previewImpactRadius * 0.8, previewImpactRadius, 32]} />
        <meshBasicMaterial color="red" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.2, 32]} />
        <meshStandardMaterial color="blue" opacity={0.5} transparent />
      </mesh>
    </>
  );

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />

      {/* Ground plane for fallback placement - positioned lower to avoid interference */}
      <mesh ref={planeRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -10, 0]} visible={false}>
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

      {/* Distance measurement line */}
      {distanceMode.active && distancePoints.length >= 2 && (
        <DistanceLine
          start={distancePoints[0]}
          end={distancePoints[1]}
          calculateDistance={calculateDistance}
        />
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



export default function MapPanel({ layers = [], deployMode, setDeployMode, missionDetails, setMissionDetails, items, setItems }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0, z: 0 });
  const canvasRef = useRef();
  const [modelLocked, setModelLocked] = useState(false);
  const [distanceMode, setDistanceMode] = useState({ active: false });
  const [distancePoints, setDistancePoints] = useState([]);

  // Listen for distance tool activation
  useEffect(() => {
    const handleStartDistanceTool = () => {
      setDistanceMode({ active: true });
      setDistancePoints([]); // Reset points when tool is activated
      console.log("Distance tool activated");
    };

    window.addEventListener('startDistanceTool', handleStartDistanceTool);

    return () => {
      window.removeEventListener('startDistanceTool', handleStartDistanceTool);
    };
  }, []);

  // Listen for distance point selection from Scene component
  useEffect(() => {
    const handleDistancePointSelected = (event) => {
      const { point } = event.detail;
      console.log("Distance point selected:", point);

      const newPoints = [...distancePoints, point];
      setDistancePoints(newPoints);

      // If we have 2 points, create the elevation profile
      if (newPoints.length === 2) {
        const elevationData = sampleElevationAlongLine(newPoints[0], newPoints[1]);
        window.dispatchEvent(new CustomEvent('elevationProfileUpdate', {
          detail: elevationData
        }));
        console.log("Elevation profile generated");

        // Deactivate distance mode after 2 points
        setDistanceMode({ active: false });
      }
    };

    window.addEventListener('distancePointSelected', handleDistancePointSelected);

    return () => {
      window.removeEventListener('distancePointSelected', handleDistancePointSelected);
    };
  }, [distancePoints]);

  // Helper function to calculate distance between two points
  const calculateDistance = (point1, point2) => {
    return Math.sqrt(
      Math.pow(point2.x - point1.x, 2) +
      Math.pow(point2.y - point1.y, 2) +
      Math.pow(point2.z - point1.z, 2)
    );
  };

  // Sample elevation points along the line
  const sampleElevationAlongLine = (startPoint, endPoint, numSamples = 50) => {
    const points = [];
    const distance = calculateDistance(startPoint, endPoint);

    for (let i = 0; i < numSamples; i++) {
      const t = i / (numSamples - 1);
      const x = startPoint.x + (endPoint.x - startPoint.x) * t;
      const y = startPoint.y + (endPoint.y - startPoint.y) * t;
      const z = startPoint.z + (endPoint.z - startPoint.z) * t;

      const elevation = Math.max(y, startPoint.y, endPoint.y); // Simplified elevation, in reality this would sample terrain

      points.push({
        position: i,
        distance: distance * t,
        elevation: elevation,
        worldPosition: { x, y, z }
      });
    }

    return { points, distance };
  };





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
          setModelLocked={setModelLocked}
          distanceMode={distanceMode}
          distancePoints={distancePoints}
          calculateDistance={calculateDistance}
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

      {/* Distance Mode Visual Feedback */}
      {distanceMode.active && (
        <div className="absolute top-16 left-4 z-50 bg-yellow-600/90 text-white text-sm px-4 py-2 rounded-md shadow-lg border-2 border-yellow-400">
          <div className="font-bold">Distance Tool Active</div>
          <div className="text-xs mt-1 opacity-90">
            Click on terrain to select points
          </div>
          <div className="text-xs opacity-75">
            Points selected: {distancePoints.length}/2
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
