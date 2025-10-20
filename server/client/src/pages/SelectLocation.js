import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin } from 'lucide-react';
import axios from 'axios';
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});
export default function SelectLocationPage() {
    const navigate = useNavigate();
    const [marker, setMarker] = useState(null);
    const [loading, setLoading] = useState(false);
    const MapClickHandler = () => {
        useMapEvents({
            click(e) {
                setMarker({ lat: e.latlng.lat, lng: e.latlng.lng });
            },
        });
        return null;
    };
    const handleSubmit = async () => {
        if (!marker)
            return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token)
                throw new Error('User not authenticated');
            const response = await axios.post('http://localhost:3000/region/', { region: { lat: marker.lat, lon: marker.lng } }, { headers: { Authorization: `Bearer ${token}` } });
            if (response.data?.status === 'success') {
                alert(`🌱 Location saved successfully! Redirecting...`);
                navigate('/'); // Redirect to dashboard
            }
            else {
                alert('Failed to save location. Please try again.');
            }
        }
        catch (error) {
            console.error('Error saving location:', error.response?.data || error.message);
            alert('Error saving location. Please check console for details.');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-green-50 via-white to-emerald-50 space-y-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-6xl mb-2 animate-bounce", children: "\uD83C\uDF0D" }), _jsxs("h1", { className: "text-4xl font-extrabold text-green-800 mb-2 flex items-center justify-center gap-2", children: [_jsx(MapPin, {}), " Pick Your Farming Spot"] }), _jsx("p", { className: "text-lg text-green-600", children: "Click on the map to select your location \uD83C\uDF3E\uD83C\uDF31\uD83E\uDD98\uD83C\uDF47" })] }), _jsx("div", { className: "w-full max-w-4xl h-[500px] rounded-3xl overflow-hidden shadow-2xl border-4 border-green-100", children: _jsxs(MapContainer, { center: [20, 0], zoom: 2, style: { height: '100%', width: '100%' }, children: [_jsx(TileLayer, { url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", attribution: "\u00A9 OpenStreetMap contributors" }), _jsx(MapClickHandler, {}), marker && _jsx(Marker, { position: [marker.lat, marker.lng] })] }) }), marker && (_jsxs("p", { className: "mt-2 text-green-700 text-lg font-semibold", children: ["\uD83D\uDCCD Selected: ", marker.lat.toFixed(2), ", ", marker.lng.toFixed(2)] })), _jsx("div", { className: "w-full max-w-4xl flex justify-center mt-4", children: _jsx("button", { onClick: handleSubmit, disabled: !marker || loading, className: "px-8 py-3 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 disabled:opacity-50 text-lg font-semibold transition-all", children: loading ? 'Saving...' : '🌱 Save Location & Continue' }) }), _jsx("p", { className: "text-green-500 mt-4", children: "\uD83C\uDF3E Grow your farm smarter with AI-powered insights!" })] }));
}
