interface SatelliteCardProps {
  lat: number;
  lon: number;
  zoom?: number;
  width?: number;
  height?: number;
}

export default function SatelliteCard({
  lat,
  lon,
  zoom = 10,
  width = 600,
  height = 400,
}: SatelliteCardProps) {
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY; // set in .env

  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lon}&zoom=${zoom}&size=${width}x${height}&maptype=satellite&markers=color:green%7C${lat},${lon}&key=${GOOGLE_MAPS_API_KEY}`;

  return (
    <div className="bg-white rounded-lg shadow p-2">
      <h2 className="text-lg font-semibold text-green-800 mb-2">Satellite View</h2>
      <img
        src={mapUrl}
        alt="Satellite view"
        className="w-full rounded"
      />
    </div>
  );
}
