// src/components/MapPanel.jsx
import { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

// 3D Model Component
function Model({ url }) {
  const obj = useLoader(OBJLoader, url);

  // Center the model and scale it appropriately
  useEffect(() => {
    if (obj) {
      const box = new THREE.Box3().setFromObject(obj);
      const center = box.getCenter(new THREE.Vector3());
      obj.position.sub(center); // center the model
    }
  }, [obj]);

  useFrame(() => {
    if (obj) {
      obj.rotation.y += 0.002; // Slow rotation
    }
  });

  return <primitive object={obj} scale={0.5} />;
}

// Scene setup
function Scene({ modelUrl }) {
  const { camera, controls } = useThree();
  
  // Set up camera position and handle model changes
  useEffect(() => {
    // Reset camera position when model changes
    camera.position.z = 5;
    camera.position.y = 2;
    camera.lookAt(0, 0, 0);
    
    // Reset orbit controls if they exist
    if (controls) {
      controls.reset();
    }
  }, [modelUrl, camera, controls]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />
      
      {modelUrl ? (
        <Suspense fallback={null}>
          <Model url={modelUrl} />
        </Suspense>
      ) : (
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="hotpink" />
        </mesh>
      )}
      
      <gridHelper args={[10, 10]} rotation={[Math.PI / 2, 0, 0]} />
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
      />
      <Stats />
    </>
  );
}

export default function MapPanel({ modelFile }) {
  const [modelUrl, setModelUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0, z: 0 });
  const canvasRef = useRef();

  // Handle model file upload and loading
  useEffect(() => {
    if (!modelFile) return;

    const uploadModel = async () => {
      setIsLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', modelFile);

      try {
        // Upload the file to the server
        const response = await fetch('http://localhost:5000/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload model');
        }

        const data = await response.json();
        
        if (data.success) {
          // Construct the full URL to the uploaded file
          const fullUrl = `http://localhost:5000${data.file_url}`;
          setModelUrl(fullUrl);
        } else {
          throw new Error(data.error || 'Failed to process model');
        }
      } catch (err) {
        console.error('Error uploading model:', err);
        setError(err.message || 'Failed to load model');
      } finally {
        setIsLoading(false);
      }
    };

    uploadModel();
  }, [modelFile]);

  const handlePointerMove = (e) => {
    // Get 3D coordinates from mouse position
    if (e.intersections && e.intersections.length > 0) {
      const { point } = e.intersections[0];
      setCoordinates({
        x: point.x.toFixed(2),
        y: point.y.toFixed(2),
        z: point.z.toFixed(2)
      });
    }
  };

  return (
    <div className="h-full w-full relative">
      <Canvas
        ref={canvasRef}
        onPointerMissed={() => {}}
        onPointerMove={handlePointerMove}
        camera={{ position: [0, 5, 10], fov: 50 }}
      >
        <Scene modelUrl={modelUrl} />
      </Canvas>

      {/* Coordinate display */}
      <div className="absolute bottom-4 right-4 z-50 bg-gray-900/80 text-white text-sm px-3 py-2 rounded-md shadow-lg">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <span className="text-gray-300">X:</span>
          <span className="font-mono">{coordinates.x}</span>
          <span className="text-gray-300">Y:</span>
          <span className="font-mono">{coordinates.y}</span>
          <span className="text-gray-300">Z:</span>
          <span className="font-mono">{coordinates.z}</span>
        </div>
      </div>
      
      {/* Loading and error states */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-40">
          <div className="text-white text-lg">Uploading and processing 3D model...</div>
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
