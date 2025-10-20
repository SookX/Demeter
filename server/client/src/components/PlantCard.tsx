import { useState } from "react";
import { Droplet, BarChart2, Leaf } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Watering {
  date: string;
  amount: number;
}

interface Plant {
  _id?: string;
  name: string;
  scientificName?: string;
  family?: string;
  apiId?: number;
  slug?: string;
  imageUrl?: string;
  lastWateredAt: string | null;
  nextWateringAt: string | null;
  waterings: Watering[];
}

interface PlantCardProps {
  plant: Plant & { waterings?: Watering[] }; 
  onAddWatering: (plantId: string, amount: number) => void;
}

export default function PlantCard({ plant, onAddWatering }: PlantCardProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [showChartPopup, setShowChartPopup] = useState(false);
  const [amount, setAmount] = useState<number>(0);

  const handleSubmit = () => {
    if (amount > 0) {
      onAddWatering(plant._id, amount);
      setAmount(0);
      setShowPopup(false);
    }
  };

  const chartData = plant.waterings.map(w => ({
    date: new Date(w.date).toLocaleDateString(),
    amount: w.amount,
  }));

  return (
    <div className="bg-white shadow-lg rounded-xl p-4 flex flex-col gap-3 relative">
      {/* Plant Image */}
      {plant.imageUrl ? (
        <img
          src={plant.imageUrl}
          alt={plant.name}
          className="w-full h-40 object-cover rounded-lg mb-2 shadow-sm"
        />
      ) : (
        <div className="w-full h-40 bg-gray-200 flex items-center justify-center rounded-lg mb-2">
          <span className="text-gray-400 text-lg">🌱 No Image</span>
        </div>
      )}

      {/* Plant Name & Buttons */}
      <div className="flex justify-between items-center gap-2">
        <h3 className="text-green-800 font-bold text-lg flex items-center gap-1">
          <Leaf size={18} /> {plant.name}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPopup(true)}
            className="flex items-center gap-1 text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded-lg shadow"
          >
            <Droplet size={16} /> Water
          </button>
          <button
            onClick={() => setShowChartPopup(true)}
            className="flex items-center gap-1 text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded-lg shadow"
          >
            <BarChart2 size={16} /> View Chart
          </button>
        </div>
      </div>

      {/* Plant Info */}
      <div className="text-sm text-gray-700 space-y-1">
        {plant.scientificName && (
          <p>🧬 <span className="italic">{plant.scientificName}</span></p>
        )}
        {plant.family && <p>🌿 Family: {plant.family}</p>}
        {plant.apiId && <p>🔖 Trefle ID: {plant.apiId}</p>}
      </div>

      {/* Watering Info */}
      <div className="text-sm text-gray-600 flex justify-between mt-2">
        <p>Last watered: {plant.lastWateredAt ? new Date(plant.lastWateredAt).toLocaleDateString() : "Never"} 💧</p>
        <p>Next: {plant.nextWateringAt ? new Date(plant.nextWateringAt).toLocaleDateString() : "TBD"} ⏰</p>
      </div>

      {/* Mini Chart */}
      {plant.waterings.length > 0 && (
        <div style={{ width: "100%", height: 100 }} className="mt-2">
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="amount" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Watering Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-80">
            <h4 className="font-bold text-green-800 mb-2 flex items-center gap-1">
              <Droplet size={16} /> Add Watering
            </h4>
            <input
              type="number"
              min={0}
              value={amount}
              onChange={e => setAmount(parseFloat(e.target.value))}
              placeholder="Amount (ml)"
              className="border rounded px-3 py-2 w-full mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowPopup(false)} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
              <button onClick={handleSubmit} className="px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600">Add</button>
            </div>
          </div>
        </div>
      )}

      {showChartPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-11/12 max-w-3xl h-96">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-blue-600 flex items-center gap-1">
                <BarChart2 size={18} /> Watering History
              </h4>
              <button onClick={() => setShowChartPopup(false)} className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300">Close</button>
            </div>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={chartData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
