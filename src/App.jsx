// src/App.jsx
import { useState } from "react";
import TopPanel from "./components/TopPanel";
import SidePanel from "./components/SidePanel";
import MapPanel from "./components/MapPanel";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

export default function App() {
  const [modelFile, setModelFile] = useState(null);
  const [layers, setLayers] = useState([]);

  // Handle model selection from TopPanel
  const handleModelSelect = (file) => {
    if (file === null) {
      // Clear the scene
      setModelFile(null);
      setLayers([]);
    } else {
      setModelFile(file);
      // Add the new model as a layer
      setLayers([
        {
          id: Date.now(),
          name: file.name,
          type: 'model',
          visible: true,
          file: file
        },
        ...layers
      ]);
    }
  };

  // Function to clear the scene
  const clearScene = () => {
    handleModelSelect(null);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100">
      {/* Top navigation bar */}
      <TopPanel onModelSelect={handleModelSelect} onClearScene={clearScene} />


      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        <PanelGroup direction="horizontal" className="flex-1">
          {/* Left side panel - Layers and properties */}
          <Panel 
            defaultSize={20} 
            minSize={15} 
            maxSize={40} 
            className="bg-white border-r border-gray-200 flex flex-col"
            style={{ minWidth: '200px' }}
          >
            <div className="p-3 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-semibold text-gray-700">Layers</h2>
            </div>
            <div className="flex-1 overflow-auto">
              <SidePanel layers={layers} onLayersChange={setLayers} />
            </div>
          </Panel>

          <PanelResizeHandle className="w-2 bg-gray-100 hover:bg-blue-300 transition-colors cursor-col-resize flex items-center justify-center">
            <div className="w-0.5 h-8 bg-gray-300 rounded-full" />
          </PanelResizeHandle>

          {/* Main 3D view */}
          <Panel defaultSize={80} minSize={60} className="flex flex-col">
            <div className="h-full w-full bg-gray-50">
             <MapPanel modelFile={modelFile} layers={layers} />

            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
