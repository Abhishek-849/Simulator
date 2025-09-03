// src/components/SidePanel.jsx
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

export default function SidePanel() {
  return (
    <PanelGroup direction="vertical" className="h-full">
      {/* Top area: 4-5 checkboxes (Layers/Options) */}
      <Panel defaultSize={60} minSize={25}>
        <div className="h-full bg-gray-100 p-3 overflow-auto">
          <h3 className="text-sm font-semibold mb-3">Layers & Options</h3>

          <div className="space-y-3 text-sm">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" defaultChecked />
              <span>Enable Grid</span>
            </label>

            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span>Show Terrain</span>
            </label>

            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span>Highlight Roads</span>
            </label>

            <label className="flex items-center">
              <input type="checkbox" className="mr-2" defaultChecked />
              <span>Show Units</span>
            </label>

            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span>Enable Satellite</span>
            </label>
          </div>
        </div>
      </Panel>

      <PanelResizeHandle className="h-1 bg-gray-300 cursor-row-resize" />

      {/* Bottom area: reserved for future content (kept empty but styled) */}
      <Panel defaultSize={40} minSize={15}>
        <div className="h-full bg-gray-200 p-3">
          <h3 className="text-sm font-semibold mb-2">Attributes / Legend</h3>
          <div className="text-xs text-gray-600">
            ( layer legend, attributes, filters)
          </div>
        </div>
      </Panel>
    </PanelGroup>
  );
}
