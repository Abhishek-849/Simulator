// src/App.jsx
import TopPanel from "./components/TopPanel";
import SidePanel from "./components/SidePanel";
import MapPanel from "./components/MapPanel";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

export default function App() {
  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Top bar */}
      <TopPanel />

      {/* Main resizable area */}
      <PanelGroup direction="horizontal" className="flex-1">
        {/* Left side panel */}
        <Panel defaultSize={20} minSize={15}>
          <SidePanel />
        </Panel>

        <PanelResizeHandle className="bg-gray-300 w-1 cursor-col-resize" />

        {/* Map panel */}
        <Panel defaultSize={80} minSize={60}>
          <MapPanel />
        </Panel>
      </PanelGroup>
    </div>
  );
}
