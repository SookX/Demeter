import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapPin } from "lucide-react";
import axios from "axios";

delete L.Icon.Default.prototype._getIconUrl; 
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function ClickHandler({ setMarker }: { setMarker: (pos: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      setMarker({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function SelectLocationPage() {
  const navigate = useNavigate();
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!marker) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated");

      const response = await axios.post(
        "http://localhost:3000/region/",
        { region: { lat: marker.lat, lon: marker.lng } },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.status === "success") {
        alert(`🌱 Location saved successfully! Redirecting...`);
        navigate("/");
      } else {
        alert("Failed to save location. Please try again.");
      }
    } catch (error: any) {
      console.error("Error saving location:", error.response?.data || error.message);
      alert("Error saving location. Please check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-green-50 via-white to-emerald-50 space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-2 animate-bounce">🌍</div>
        <h1 className="text-4xl font-extrabold text-green-800 mb-2 flex items-center justify-center gap-2">
          <MapPin /> Pick Your Farming Spot
        </h1>
        <p className="text-lg text-green-600">
          Click on the map to select your location 🌾🌱🦘🍇
        </p>
      </div>

      <div className="w-full max-w-4xl h-[500px] rounded-3xl overflow-hidden shadow-2xl border-4 border-green-100">
        <MapContainer
          center={marker ? [marker.lat, marker.lng] : [20, 0]}
          zoom={marker ? 10 : 2}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <ClickHandler setMarker={setMarker} />
          {marker && <Marker position={[marker.lat, marker.lng]} />}
        </MapContainer>
      </div>

      {marker && (
        <p className="mt-2 text-green-700 text-lg font-semibold">
          📍 Selected: {marker.lat.toFixed(2)}, {marker.lng.toFixed(2)}
        </p>
      )}

      <div className="w-full max-w-4xl flex justify-center mt-4">
        <button
          onClick={handleSubmit}
          disabled={!marker || loading}
          className="px-8 py-3 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 disabled:opacity-50 text-lg font-semibold transition-all"
        >
          {loading ? "Saving..." : "🌱 Save Location & Continue"}
        </button>
      </div>

      <p className="text-green-500 mt-4">
        🌾 Grow your farm smarter with AI-powered insights!
      </p>
    </div>
  );
}
