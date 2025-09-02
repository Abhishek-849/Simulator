import TopBar from "./components/TopBar";
import SidePanel from "./components/SidePanel";
import MapPanel from "./components/MapPanel";

function App() {
  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <TopBar />

      {/* Main body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <SidePanel />

        {/* Map */}
        <MapPanel />
      </div>
    </div>
  );
}

export default App;
