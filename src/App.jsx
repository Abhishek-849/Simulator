// src/App.jsx
import { useState } from "react";
import TopPanel from "./components/TopPanel";
import SidePanel from "./components/SidePanel";
import MapPanel from "./components/MapPanel";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [tileUrl, setTileUrl] = useState(null);

  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Top bar */}
      <TopPanel
        onFileSelect={setSelectedFile}
        onTileLayerReady={setTileUrl} // backend tile URL
      />

      {/* Main resizable area */}
      <PanelGroup direction="horizontal" className="flex-1">
        {/* Left side panel */}
        <Panel defaultSize={20} minSize={15}>
          <SidePanel />
        </Panel>

        <PanelResizeHandle className="bg-gray-300 w-1 cursor-col-resize" />

        {/* Map panel */}
        <Panel defaultSize={80} minSize={60}>
          <MapPanel file={selectedFile} tileUrl={tileUrl} />
        </Panel>
      </PanelGroup>
    </div>
  );
}
