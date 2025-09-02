export default function TopPanel() {
  return (
    <div className="bg-gray-900 text-white p-3 flex items-center space-x-4">
      <h1 className="text-lg font-semibold">Simulator Prototype</h1>

      <select className="bg-gray-800 text-white px-2 py-1 rounded">
        <option>Artillery</option>
        <option>Recon</option>
        <option>Logistics</option>
      </select>

      <select className="bg-gray-800 text-white px-2 py-1 rounded">
        <option>Mission Planning</option>
        <option>Surveillance</option>
        <option>Patrol Routes</option>
      </select>
    </div>
  );
}
