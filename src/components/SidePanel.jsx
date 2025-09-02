function SidePanel() {
  return (
    <div className="w-64 bg-gray-100 border-r border-gray-300 p-2 overflow-y-auto">
      <h2 className="text-sm font-semibold mb-2">Layers</h2>
      <ul className="space-y-1 text-sm">
        <li>
          <input type="checkbox" className="mr-2" defaultChecked /> World Map
        </li>
        <li>
          <input type="checkbox" className="mr-2" /> Rivers
        </li>
        <li>
          <input type="checkbox" className="mr-2" /> Cities
        </li>
        <li>
          <input type="checkbox" className="mr-2" /> Roads
        </li>
      </ul>
    </div>
  );
}

export default SidePanel;
