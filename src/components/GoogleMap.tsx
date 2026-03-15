import React from 'react';

interface GoogleMapProps {
  latitude: number;
  longitude: number;
  address: string;
  height?: string;
  zoom?: number;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ 
  latitude, 
  longitude, 
  address, 
  height = '300px',
  zoom = 15 
}) => {
  // Fallback static map if Google Maps API is not available
  if (!latitude || !longitude) {
    return (
      <div 
        className="bg-gray-200 flex items-center justify-center border border-gray-300 rounded"
        style={{ height }}
      >
        <div className="text-center p-4">
          <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-gray-500 text-sm">Map location not set</p>
          <p className="text-gray-400 text-xs mt-1">Please configure coordinates in settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <iframe
        src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=${zoom}&output=embed`}
        width="100%"
        height={height}
        style={{ border: 0, borderRadius: '0.375rem' }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Map showing location: ${address}`}
        className="border border-gray-300"
      />
      {/* Fallback static map link */}
      <a
        href={`https://www.google.com/maps?q=${latitude},${longitude}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 right-2 bg-white px-2 py-1 rounded shadow text-xs text-gray-600 hover:text-gray-800 transition-colors"
      >
        View on Google Maps
      </a>
    </div>
  );
};

export default GoogleMap;
