function TopBar() {
  return (
    <div className="flex items-center bg-gray-200 border-b border-gray-400 px-4 py-2 text-sm">
      <div className="mr-6 font-bold">Prototype GIS</div>

      <div className="space-x-4 flex">
        <select className="bg-white border rounded px-2 py-1">
          <option>Project</option>
          <option>New</option>
          <option>Open</option>
          <option>Save</option>
        </select>
        <select className="bg-white border rounded px-2 py-1">
          <option>Layer</option>
          <option>Add Layer</option>
          <option>Remove Layer</option>
        </select>
        <select className="bg-white border rounded px-2 py-1">
          <option>Settings</option>
          <option>Preferences</option>
        </select>
        <select className="bg-white border rounded px-2 py-1">
          <option>Help</option>
          <option>About</option>
        </select>
      </div>
    </div>
  );
}

export default TopBar;
