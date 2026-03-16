import React, { useState, useEffect, useCallback } from 'react';
import { SystemSettings } from '../types';
import { getImageUrl } from '../utils/imageUtils';
import { apiWithRetry } from '../services/api';

const AboutPage: React.FC = () => {
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Starting data fetch...');
        setLoading(true);
        const settingsResponse = await apiWithRetry.get('/settings');
        const settingsData = settingsResponse.data;
        console.log('Settings data loaded:', settingsData);
        setSystemSettings(settingsData);
        setLoading(false);
      } catch (error: any) {
        console.error('Failed to fetch data:', error);
        setError(error?.response?.data?.message || error?.message || 'Failed to load content. Please check your connection and try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Memoized categorize staff function
  const memoizedCategorizeStaff = useCallback((staff: any[]) => {
    const categories: { [key: string]: any[] } = {
      'Vice Mayor': [],
      'SB Members': [],
      'SB Secretary': [],
      'Legislative Staff': [],
      'Service Staff': []
    };

    staff.forEach(person => {
      const position = person.position.toLowerCase();
      if (position.includes('vice mayor')) {
        categories['Vice Mayor'].push(person);
      } else if (position.includes('sb member') || position.includes('sangguniang bayan member')) {
        categories['SB Members'].push(person);
      } else if (position.includes('secretary')) {
        categories['SB Secretary'].push(person);
      } else if (position.includes('legislative')) {
        categories['Legislative Staff'].push(person);
      } else if (position.includes('service')) {
        categories['Service Staff'].push(person);
      } else {
        categories['Legislative Staff'].push(person);
      }
    });

    return categories;
  }, []);

  const categorizeStaff = memoizedCategorizeStaff;

  // Auto-slide for Organization Structure
  useEffect(() => {
    if (systemSettings?.organizationStructure && systemSettings.organizationStructure.length > 0) {
      const cats = categorizeStaff(systemSettings.organizationStructure);
      const categoryNames = Object.keys(cats).filter(cat => cats[cat as keyof typeof cats].length > 0);
      
      if (categoryNames.length > 1) {
        const interval = setInterval(() => {
          setCurrentCategoryIndex((prev) => (prev + 1) % categoryNames.length);
        }, 4000); // Change slide every 4 seconds

        return () => clearInterval(interval);
      }
    }
  }, [systemSettings?.organizationStructure, categorizeStaff]);

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-black">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">About Us</h1>
          <p className="text-gray-300 text-lg">Learn more about the Sangguniang Bayan of San Francisco, Southern Leyte</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* About Office */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-black mb-6">About Office</h2>
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-700 p-8">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-white leading-relaxed text-lg text-center">
                {systemSettings?.aboutOffice || 'The Sangguniang Bayan serves as the legislative body of our municipality.'}
              </p>
            </div>
          </div>
        </section>

        {/* Official Seal */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-black mb-6">Official Seal</h2>
          <div className="bg-gradient-to-br from-yellow-900 via-yellow-800 to-yellow-900 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-yellow-700 p-8">
            <div className="text-center">
              {/* Seal Image */}
              {systemSettings?.officialSeal?.image ? (
                <div className="mb-8">
                  <div className="w-64 h-64 md:w-80 md:h-96 mx-auto shadow-lg">
                    <img 
                      src={getImageUrl(systemSettings.officialSeal.image)}
                      alt="Official Seal"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div className="mb-8">
                  <div className="w-64 h-64 md:w-80 md:h-96 mx-auto shadow-lg flex items-center justify-center">
                    <svg className="w-32 h-32 md:w-40 md:h-48 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
              )}
              
              {/* Seal Title */}
              <h3 className="text-2xl md:text-3xl font-bold text-yellow-300 mb-6 drop-shadow-lg">
                {systemSettings?.officialSeal?.title || 'Official Seal of Sangguniang Bayan'}
              </h3>
              
              {/* Seal Description */}
              <div className="max-w-4xl mx-auto">
                <p className="text-yellow-100 leading-relaxed text-lg text-center">
                  {systemSettings?.officialSeal?.description || 'The official seal represents the authority, integrity, and commitment of the Sangguniang Bayan in serving the people of our municipality with dedication and excellence.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission, Vision, Key Responsibilities */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-black mb-6">Our Principles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-blue-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <svg className="w-6 h-6 mr-3 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Mission
              </h3>
              <p className="text-blue-100 text-lg">
                {systemSettings?.mission || 'To enact responsive legislation for our community.'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-purple-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <svg className="w-6 h-6 mr-3 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Vision
              </h3>
              <p className="text-purple-100 text-lg">
                {systemSettings?.vision || 'A progressive municipality with empowered citizens.'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-900 via-green-800 to-green-900 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-green-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <svg className="w-6 h-6 mr-3 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Key Responsibilities
              </h3>
              <p className="text-green-100 text-lg">
                {systemSettings?.keyResponsibilities || 'Legislative oversight, policy development, community representation'}
              </p>
            </div>
          </div>
        </section>

        {/* Organization Structure */}
        {systemSettings?.organizationStructure && systemSettings.organizationStructure.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-black mb-6">Organization Chart</h2>
            <div className="relative min-h-[500px] bg-gray-200 rounded-lg overflow-hidden">
              <div className="flex items-center justify-center h-full p-6">
                <div className="text-center w-full h-full flex flex-col">
                  {(() => {
                    const categories = categorizeStaff(systemSettings.organizationStructure);
                    const categoryNames = Object.keys(categories).filter(cat => categories[cat as keyof typeof categories].length > 0);
                    
                    if (categoryNames.length > 0) {
                      const currentCategory = categoryNames[currentCategoryIndex];
                      const categoryStaff = categories[currentCategory as keyof typeof categories];
                      const isSingleMember = categoryStaff.length === 1;
                      
                      return (
                        <>
                          <h3 className="text-2xl font-bold text-white mb-6 bg-black bg-opacity-75 px-4 py-2 rounded-lg flex-shrink-0">{currentCategory}</h3>
                          <div className="flex-1 overflow-y-auto overflow-x-hidden">
                            <div className={`${
                              isSingleMember
                                ? 'flex justify-center items-center h-full'
                                : categoryStaff.length <= 2
                                  ? 'grid grid-cols-1 gap-4'
                                  : categoryStaff.length <= 4
                                    ? 'grid grid-cols-2 gap-4'
                                    : categoryStaff.length <= 6
                                      ? 'grid grid-cols-2 md:grid-cols-3 gap-4'
                                      : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                            }`}>
                              {categoryStaff.map((staff, index) => (
                                <div key={`${currentCategory}-${index}`} className={`text-center ${
                                  isSingleMember
                                    ? 'p-8'
                                    : 'p-4'
                                }`}>
                                  {staff.image ? (
                                    <img
                                      src={getImageUrl(staff.image)}
                                      alt={staff.name}
                                      className={`${
                                        isSingleMember
                                          ? 'w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-56'
                                          : 'w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32'
                                      } object-cover rounded-full mx-auto mb-4`}
                                      style={{ opacity: '1' }}
                                    />
                                  ) : (
                                    <div className={`${
                                      isSingleMember
                                        ? 'w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-56'
                                          : 'w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32'
                                    } bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4`}>
                                      <span className={`${
                                        isSingleMember
                                          ? 'text-2xl md:text-3xl lg:text-4xl'
                                          : 'text-xl md:text-2xl lg:text-2xl'
                                      } text-white font-bold`}>
                                        {staff.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                  <h4 className={`${
                                    isSingleMember
                                      ? 'text-2xl md:text-3xl lg:text-4xl'
                                      : 'text-lg md:text-xl lg:text-2xl'
                                  } font-semibold text-white mb-2 bg-gray-700 px-3 py-2 rounded truncate leading-tight`}>
                                    {staff.name}
                                  </h4>
                                  <p className={`${
                                    isSingleMember
                                      ? 'text-lg md:text-xl lg:text-2xl'
                                      : 'text-base md:text-lg lg:text-xl'
                                  } text-gray-300 bg-gray-600 px-3 py-2 rounded truncate leading-tight`}>
                                    {staff.position}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
              {/* Navigation Controls */}
              {(() => {
                const cats = categorizeStaff(systemSettings.organizationStructure);
                const categoryNames = Object.keys(cats).filter(cat => cats[cat as keyof typeof cats].length > 0);
                return categoryNames.length > 1 ? (
                  <>
                    <button
                      onClick={() => setCurrentCategoryIndex((prev) => (prev - 1 + categoryNames.length) % categoryNames.length)}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-75 text-white p-3 rounded-full hover:bg-opacity-90"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setCurrentCategoryIndex((prev) => (prev + 1) % categoryNames.length)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-75 text-white p-3 rounded-full hover:bg-opacity-90"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                ) : null;
              })()}
            </div>
          </section>
        )}

        {/* Contact Us */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-black mb-6">Contact Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-700 p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Get in Touch</h3>
              <div className="space-y-4">
                {systemSettings?.contactInfo?.mobileNumbers?.map((phone, index) => (
                  <div key={index} className="flex items-center text-white">
                    <svg className="w-6 h-6 mr-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-lg">{phone}</span>
                  </div>
                ))}
                <div className="flex items-center text-white">
                  <svg className="w-6 h-6 mr-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-lg">{systemSettings?.contactInfo?.email || 'info@sanfranciscosl.gov.ph'}</span>
                </div>
                {systemSettings?.contactInfo?.facebook && (
                  <div className="flex items-center text-white">
                    <svg className="w-6 h-6 mr-3 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <a 
                      href={systemSettings.contactInfo.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-lg hover:text-yellow-300 transition-colors"
                    >
                      Facebook
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-700 p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Address</h3>
              <div className="space-y-4">
                <div className="flex items-start text-white">
                  <svg className="w-6 h-6 mr-3 text-yellow-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-lg leading-relaxed">
                    {systemSettings?.contactInfo?.address || 'San Francisco, Southern Leyte'}
                  </span>
                </div>
                
                {/* Google Map */}
                {systemSettings?.mapLocation && (
                  <div className="mt-6">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <iframe
                        src={`https://www.google.com/maps?q=${systemSettings.mapLocation.latitude},${systemSettings.mapLocation.longitude}&z=15&output=embed`}
                        width="100%"
                        height="250"
                        style={{ border: 0 }}
                        title="Office Location Map"
                        allowFullScreen
                        loading="lazy"
                        className="rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
