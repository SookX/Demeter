import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function SatelliteCard({ lat, lon, zoom = 10, width = 600, height = 400, }) {
    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY; // set in .env
    const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lon}&zoom=${zoom}&size=${width}x${height}&maptype=satellite&markers=color:green%7C${lat},${lon}&key=${GOOGLE_MAPS_API_KEY}`;
    return (_jsxs("div", { className: "bg-white rounded-lg shadow p-2", children: [_jsx("h2", { className: "text-lg font-semibold text-green-800 mb-2", children: "Satellite View" }), _jsx("img", { src: mapUrl, alt: "Satellite view", className: "w-full rounded" })] }));
}
