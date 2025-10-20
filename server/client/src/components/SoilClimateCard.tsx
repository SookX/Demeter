import React from "react";

export default function SoilClimateCard({ soilType, climate }) {
  return (
    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 mt-4">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
        🌱 Soil & Climate Info
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Soil Info */}
        <div className="flex items-center gap-4 bg-white bg-opacity-30 rounded-lg p-4">
          <div className="text-5xl">🌱</div>
          <div>
            <div className="font-medium text-sm text-black">Soil Type</div>
            <div className="font-bold text-lg text-black">{soilType || "Unknown"}</div>
          </div>
        </div>

        {/* Climate Info */}
        <div className="flex flex-col gap-2 bg-white bg-opacity-30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="text-5xl">🌡️</div>
            <div>
              <div className="font-medium text-sm text-black">Climate Zone</div>
              <div className="font-bold text-lg text-black">
                {climate?.koppen_geiger_zone || "N/A"}
              </div>
            </div>
          </div>
          <div className="mt-2 ml-12">
            <div className="font-medium text-sm text-black">Description</div>
            <div className="font-bold text-black">
              {climate?.zone_description || "N/A"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
