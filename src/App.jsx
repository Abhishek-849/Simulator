// src/App.jsx
import { useState } from "react";
import TopPanel from "./components/TopPanel";
import SidePanel from "./components/SidePanel";
import MapPanel from "./components/MapPanel";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

export default function App() {
  const [modelFile, setModelFile] = useState(null);
  const [layers, setLayers] = useState([]);
  const [deployMode, setDeployMode] = useState(false); // Soldier deploy mode toggle
  const [missionDetails, setMissionDetails] = useState({
    troops: 0,
    arsenal: 0,
    vehicles: 0,
    tanks: 0,
  });
  const [items, setItems] = useState([]); // Deployed items state lifted up
  const [sceneClearTrigger, setSceneClearTrigger] = useState(0); // Used to trigger remounting

  const handleModelSelect = (file) => {
    if (file === null) {
      setModelFile(null);
      setLayers([]);
    } else {
      setModelFile(file);
      setLayers((prevLayers) => [
        {
          id: Date.now(),
          name: file.name,
          type: "model",
          visible: true,
          file: file,
        },
        ...prevLayers,
      ]);
    }
  };

  const clearScene = () => {
    // Clear 3D model layers and increment trigger to force MapPanel remount
    handleModelSelect(null);
    setSceneClearTrigger(prev => prev + 1);
    // Also clear deployed items
    setItems([]);
  };

  const resetMissionDetails = () => {
    setMissionDetails({
      troops: 0,
      arsenal: 0,
      vehicles: 0,
      tanks: 0,
    });
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100">
      <TopPanel
        onModelSelect={handleModelSelect}
        onClearScene={clearScene}
        setMissionDetails={setMissionDetails}
        resetMissionDetails={resetMissionDetails}
        items={items}
        layers={layers}
        missionDetails={missionDetails}
      />

      <div className="flex-1 flex overflow-hidden">
        <PanelGroup direction="horizontal" className="flex-1">
          <Panel
            defaultSize={20}
            minSize={15}
            maxSize={40}
            className="bg-white border-r border-gray-200 flex flex-col"
            style={{ minWidth: "200px" }}
          >
            <div className="p-3 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-semibold text-gray-700">Layers</h2>
            </div>
            <div className="flex-1 overflow-auto">
              <SidePanel
                layers={layers}
                onLayersChange={setLayers}
                missionDetails={missionDetails}
                setMissionDetails={setMissionDetails}
                setDeployMode={setDeployMode}
              />
            </div>
          </Panel>

          <PanelResizeHandle className="w-2 bg-gray-100 hover:bg-blue-300 transition-colors cursor-col-resize flex items-center justify-center">
            <div className="w-0.5 h-8 bg-gray-300 rounded-full" />
          </PanelResizeHandle>

          <Panel defaultSize={80} minSize={60} className="flex flex-col">
            <div className="h-full w-full bg-gray-50">
              <MapPanel
                key={sceneClearTrigger}
                modelFile={modelFile}
                layers={layers}
                deployMode={deployMode}
                setDeployMode={setDeployMode}
                missionDetails={missionDetails}
                setMissionDetails={setMissionDetails}
                items={items}
                setItems={setItems}
              />
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
