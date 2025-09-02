import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

export default function SidePanel() {
  return (
    <PanelGroup direction="vertical">
      {/* Top section */}
      <Panel defaultSize={50} minSize={20}>
        <div className="h-full bg-gray-100 p-2 border-r border-b">
          <p className="font-medium">Left Top Panel (Text Area)</p>
        </div>
      </Panel>

      <PanelResizeHandle className="bg-gray-400 h-1 cursor-row-resize" />

      {/* Bottom section */}
      <Panel defaultSize={50} minSize={20}>
        <div className="h-full bg-gray-200 p-2 border-r">
          <p className="font-medium">Left Bottom Panel (Future Use)</p>
        </div>
      </Panel>
    </PanelGroup>
  );
}
