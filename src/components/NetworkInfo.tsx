import React, { useState, useEffect } from 'react';
import { getNetworkInfo, generateNetworkUrls } from '../utils/networkUtils';

const NetworkInfo: React.FC = () => {
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const [networkUrls, setNetworkUrls] = useState<any>(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const loadNetworkInfo = async () => {
      try {
        const info = await getNetworkInfo();
        const urls = await generateNetworkUrls();
        setNetworkInfo(info);
        setNetworkUrls(urls);
      } catch (error) {
        console.error('Failed to load network info:', error);
      }
    };

    loadNetworkInfo();
  }, []);

  if (!showInfo || !networkInfo || !networkUrls) {
    return (
      <button
        onClick={() => setShowInfo(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 z-50"
        title="Show Network Info"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl p-4 max-w-sm z-50 border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-800">Network Access</h3>
        <button
          onClick={() => setShowInfo(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium text-gray-600">Local IP:</span>
          <span className="ml-2 text-gray-800">{networkInfo.localIp}</span>
        </div>
        
        <div>
          <span className="font-medium text-gray-600">Public IP:</span>
          <span className="ml-2 text-gray-800">{networkInfo.publicIp}</span>
        </div>

        <div className="pt-2 border-t border-gray-200">
          <div className="font-medium text-gray-600 mb-1">Access URLs:</div>
          <div className="space-y-1">
            <div>
              <span className="text-gray-500">Local:</span>
              <a href={networkUrls.local} className="ml-2 text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                {networkUrls.local}
              </a>
            </div>
            <div>
              <span className="text-gray-500">Network:</span>
              <a href={networkUrls.network} className="ml-2 text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                {networkUrls.network}
              </a>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <div className="bg-blue-50 p-2 rounded text-xs text-blue-800">
            💡 Use the Network URL on other devices on the same network
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkInfo;
