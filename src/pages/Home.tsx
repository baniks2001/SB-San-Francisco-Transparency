import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SystemSettings } from '../types';
import { getImageUrl } from '../utils/imageUtils';
import api from '../services/api';

const Home: React.FC = () => {
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [imagesPreloaded, setImagesPreloaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [showAllModal, setShowAllModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [visibleProjectImages, setVisibleProjectImages] = useState<Set<number>>(new Set([0, 1, 2, 3, 4]));

  // Function to preload images with performance optimization
  const preloadImages = useCallback(async (imageUrls: string[]): Promise<void> => {
    console.log('Starting to preload', imageUrls.length, 'images');
    
    // Preload in batches to avoid overwhelming the browser
    const batchSize = 5;
    const batches: string[][] = [];
    
    for (let i = 0; i < imageUrls.length; i += batchSize) {
      batches.push(imageUrls.slice(i, i + batchSize));
    }
    
    for (const batch of batches) {
      const preloadPromises = batch.map((url, index) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          
          img.onload = () => {
            console.log(`Image loaded: ${url}`);
            resolve();
          };
          
          img.onerror = () => {
            console.warn(`Image failed to load: ${url}`);
            resolve();
          };
          
          img.src = url;
        });
      });
      
      await Promise.all(preloadPromises);
      // Small delay between batches to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('All images preloaded successfully');
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Starting data fetch...');
        setLoading(true);
        const settingsResponse = await api.get('/settings');
        const settingsData = settingsResponse.data;
        console.log('Settings data loaded:', settingsData);
        setSystemSettings(settingsData);
        setAnnouncements(settingsData.announcements || []);
        
        // Collect all image URLs to preload
        const imageUrls: string[] = [];
        
        // Add carousel images
        if (settingsData.carouselImages && settingsData.carouselImages.length > 0) {
          settingsData.carouselImages.forEach((image: string) => {
            imageUrls.push(getImageUrl(image));
          });
        }
        
        // Add project images
        if (settingsData.projectImages && settingsData.projectImages.length > 0) {
          settingsData.projectImages.forEach((project: any) => {
            if (project.image) {
              imageUrls.push(getImageUrl(project.image));
            }
          });
        }
        
        // Add organization structure images
        if (settingsData.organizationStructure && settingsData.organizationStructure.length > 0) {
          settingsData.organizationStructure.forEach((staff: any) => {
            if (staff.image) {
              imageUrls.push(getImageUrl(staff.image));
            }
          });
        }
        
        // Add announcement images
        if (settingsData.announcements && settingsData.announcements.length > 0) {
          settingsData.announcements.forEach((announcement: any) => {
            if (announcement.image) {
              imageUrls.push(getImageUrl(announcement.image));
            }
          });
        }
        
        console.log('Found', imageUrls.length, 'images to preload');
        
        // Preload all images
        if (imageUrls.length > 0) {
          await preloadImages(imageUrls);
        } else {
          console.log('No images to preload');
          setImagesPreloaded(true);
        }
        
        setImagesPreloaded(true);
        setLoading(false);
        console.log('Loading complete - showing content');
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-slide for main carousel
  useEffect(() => {
    if (systemSettings?.carouselImages && systemSettings.carouselImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % systemSettings.carouselImages.length);
      }, 5000); // Change slide every 5 seconds

      return () => clearInterval(interval);
    }
  }, [systemSettings?.carouselImages]);

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
  }, [systemSettings?.organizationStructure]);

  // Intersection Observer for lazy loading project images
  useEffect(() => {
    if (!systemSettings?.projectImages || systemSettings.projectImages.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-project-index') || '0');
            setVisibleProjectImages((prev) => {
              if (!prev.has(index)) {
                return new Set(prev).add(index);
              }
              return prev;
            });
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    const elements = document.querySelectorAll('[data-project-index]');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [systemSettings?.projectImages?.length]);

  // Memoized project data for performance
  const memoizedProjectImages = useMemo(() => {
    return systemSettings?.projectImages?.slice(0, 10) || [];
  }, [systemSettings?.projectImages]);

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

  // Static carousels - no animations

  const categorizeStaff = memoizedCategorizeStaff;

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-black">
            {!systemSettings ? 'Loading content...' : 
             !imagesPreloaded ? `Preloading ${imagesPreloaded ? '0' : '...'} images...` : 
             'Almost ready...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50">
      {/* Image Carousel */}
      {systemSettings?.carouselImages && systemSettings.carouselImages.length > 0 && (
        <div className="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] bg-gray-200 overflow-hidden">
          <img
            src={getImageUrl(systemSettings.carouselImages[currentImageIndex])}
            alt="Carousel"
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white bg-black bg-opacity-50 p-4 sm:p-6 md:p-8 rounded-lg backdrop-blur-sm mx-4 max-w-4xl">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-2 sm:mb-4 drop-shadow-lg line-clamp-2">{systemSettings?.transparencyTitle || 'Sangguniang Bayan Transparency'}</h2>
              <p className="text-sm sm:text-lg md:text-2xl lg:text-3xl drop-shadow-md">{systemSettings?.location || 'San Francisco, Southern Leyte'}</p>
            </div>
          </div>
          {/* Preload next image */}
          {systemSettings.carouselImages.length > 1 && (
            <img
              src={getImageUrl(systemSettings.carouselImages[(currentImageIndex + 1) % systemSettings.carouselImages.length])}
              alt="Preload"
              className="hidden"
              loading="eager"
            />
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* About Office */}
        <section className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-black mb-2">About Office</h2>
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-700 p-6 sm:p-8">
            <div className="text-center">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-white leading-relaxed text-sm sm:text-base text-center">
                {systemSettings?.aboutOffice || 'The Sangguniang Bayan serves as the legislative body of our municipality.'}
              </p>
            </div>
          </div>
        </section>

        {/* Mission, Vision, Key Responsibilities */}
        <section className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-black mb-2">Our Principles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-blue-700 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Mission
              </h3>
              <p className="text-blue-100 text-sm sm:text-base">
                {systemSettings?.mission || 'To enact responsive legislation for our community.'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-purple-700 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Vision
              </h3>
              <p className="text-purple-100 text-sm sm:text-base">
                {systemSettings?.vision || 'A progressive municipality with empowered citizens.'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-900 via-green-800 to-green-900 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-green-700 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Key Responsibilities
              </h3>
              <p className="text-green-100 text-sm sm:text-base">
                {systemSettings?.keyResponsibilities || 'Legislative oversight, policy development, community representation'}
              </p>
            </div>
          </div>
        </section>

        {/* News, Projects, & Activities */}
        {memoizedProjectImages.length > 0 && (
          <section className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-black mb-2">News, Projects, & Activities</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-6" style={{ contain: 'layout' }}>
              {memoizedProjectImages.map((project, index) => (
                <div 
                  key={index} 
                  className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group border border-gray-700"
                  data-project-index={index}
                >
                  {project.image && (
                    <div className="h-32 sm:h-40 md:h-48 bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden">
                      <img
                        src={getImageUrl(project.image)}
                        alt={project.projectName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        decoding="async"
                        style={{ willChange: 'transform' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  )}
                  {!project.image && (
                    <div className="h-32 sm:h-40 md:h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <div className="text-gray-600 text-center">
                        <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs sm:text-sm font-medium">No Image</p>
                      </div>
                    </div>
                  )}
                  <div className="p-3 sm:p-4 bg-gradient-to-b from-transparent to-gray-800/50">
                    <h3 className="font-bold text-white mb-2 line-clamp-2 text-sm sm:text-base group-hover:text-yellow-300 transition-colors duration-300">{project.projectName}</h3>
                    <p className="text-gray-300 text-xs sm:text-sm mb-3 line-clamp-3 group-hover:text-gray-200 transition-colors duration-300">{project.details}</p>
                    <button
                      onClick={() => setSelectedItem(project)}
                      className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-lg text-xs sm:text-sm hover:from-yellow-700 hover:to-yellow-800 transition-all duration-300 w-full shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 sm:mt-6 text-center">
              <button
                onClick={() => setShowAllModal(true)}
                className="bg-yellow-600 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-md hover:bg-yellow-700 transition-colors duration-200 text-sm sm:text-base"
              >
                Show All News, Projects, & Activities
              </button>
            </div>
          </section>
        )}

        {/* Organization Structure Carousel */}
        {systemSettings?.organizationStructure && systemSettings.organizationStructure.length > 0 && (
          <section className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-black mb-2">Organization Structure</h2>
            <div className="relative min-h-[400px] sm:min-h-[450px] md:min-h-[500px] lg:min-h-[600px] bg-gray-200 rounded-lg overflow-hidden">
              <div className="flex items-center justify-center h-full p-3 sm:p-4 md:p-6">
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
                          <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2 sm:mb-3 md:mb-4 bg-black bg-opacity-75 px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-lg flex-shrink-0">{currentCategory}</h3>
                          <div className="flex-1 overflow-y-auto overflow-x-hidden">
                            <div className={`${
                              isSingleMember
                                ? 'flex justify-center items-center h-full'
                                : categoryStaff.length <= 2
                                  ? 'grid grid-cols-1 gap-1 sm:gap-2'
                                  : categoryStaff.length <= 4
                                    ? 'grid grid-cols-2 gap-1 sm:gap-2'
                                    : categoryStaff.length <= 6
                                      ? 'grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-2'
                                      : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-2'
                            }`}>
                              {categoryStaff.map((staff, index) => (
                                <div key={`${currentCategory}-${index}`} className={`text-center ${
                                  isSingleMember
                                    ? 'p-4 sm:p-6 md:p-8'
                                    : categoryStaff.length <= 2
                                      ? 'p-2 sm:p-3'
                                      : categoryStaff.length <= 4
                                        ? 'p-2 sm:p-3'
                                        : 'p-1 sm:p-2'
                                }`}>
                                  {staff.image ? (
                                    <img
                                      src={getImageUrl(staff.image)}
                                      alt={staff.name}
                                      className={`${
                                        isSingleMember
                                          ? 'w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-56 xl:h-56'
                                          : categoryStaff.length <= 2
                                            ? 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32'
                                            : categoryStaff.length <= 4
                                              ? 'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28'
                                              : 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24'
                                      } object-cover rounded-full mx-auto mb-2 sm:mb-3`}
                                      style={{ opacity: '1' }}
                                    />
                                  ) : (
                                    <div className={`${
                                      isSingleMember
                                        ? 'w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-56 xl:h-56'
                                          : categoryStaff.length <= 2
                                            ? 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32'
                                            : categoryStaff.length <= 4
                                              ? 'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28'
                                              : 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24'
                                    } bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3`}>
                                      <span className={`${
                                        isSingleMember
                                          ? 'text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl'
                                          : categoryStaff.length <= 2
                                            ? 'text-sm sm:text-base md:text-lg lg:text-lg xl:text-xl'
                                            : categoryStaff.length <= 4
                                              ? 'text-sm sm:text-base md:text-base lg:text-base xl:text-lg'
                                              : 'text-xs sm:text-sm md:text-sm lg:text-sm xl:text-base'
                                      } text-white font-bold`}>
                                        {staff.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                  <h4 className={`${
                                    isSingleMember
                                      ? 'text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl'
                                      : categoryStaff.length <= 2
                                        ? 'text-sm sm:text-base md:text-lg lg:text-lg xl:text-xl'
                                        : categoryStaff.length <= 4
                                          ? 'text-sm sm:text-base md:text-base lg:text-base xl:text-lg'
                                          : 'text-xs sm:text-sm md:text-sm lg:text-sm xl:text-base'
                                    } font-semibold text-white mb-1 sm:mb-2 bg-gray-700 px-2 sm:px-3 py-1 sm:py-2 rounded truncate leading-tight`}>
                                    {staff.name}
                                  </h4>
                                  <p className={`${
                                    isSingleMember
                                      ? 'text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl'
                                      : categoryStaff.length <= 2
                                        ? 'text-xs sm:text-sm md:text-sm lg:text-sm xl:text-base'
                                        : categoryStaff.length <= 4
                                          ? 'text-xs sm:text-sm md:text-sm lg:text-sm xl:text-base'
                                          : 'text-xs sm:text-sm md:text-sm lg:text-sm xl:text-base'
                                  } text-gray-300 bg-gray-600 px-2 sm:px-3 py-1 sm:py-2 rounded truncate leading-tight`}>
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
                      className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-75 text-white p-1.5 sm:p-2 rounded-full hover:bg-opacity-90"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setCurrentCategoryIndex((prev) => (prev + 1) % categoryNames.length)}
                      className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-75 text-white p-1.5 sm:p-2 rounded-full hover:bg-opacity-90"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                ) : null;
              })()}
            </div>
          </section>
        )}

        {/* Announcement Card */}
        <section className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-black mb-2">Latest Announcements</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {announcements.length > 0 ? (
              announcements
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 5)
                .map((announcement, index) => (
                <div key={index} className="bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  {announcement.image && (
                    <div className="h-32 sm:h-40 md:h-48 bg-gray-200">
                      <img
                        src={getImageUrl(announcement.image)}
                        alt={announcement.title}
                        className="w-full h-full object-cover"
                        style={{ opacity: '1' }}
                      />
                    </div>
                  )}
                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-white mb-2 line-clamp-2 text-sm sm:text-base">{announcement.title}</h3>
                    <p className="text-gray-300 text-xs sm:text-sm mb-3 line-clamp-3">{announcement.content}</p>
                    <div className="flex items-center text-xs text-gray-400">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white">Stay Updated</h3>
                    <p className="text-gray-300 text-sm sm:text-base">Check out our latest announcements and updates</p>
                  </div>
                </div>
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-3 sm:p-4">
                  <h4 className="font-semibold text-white mb-2 text-sm sm:text-base">Welcome to Sangguniang Bayan Transparency Portal</h4>
                  <p className="text-gray-300 mb-4 text-sm sm:text-base">
                    This portal provides transparent access to government services, announcements, and important information 
                    for the residents of San Francisco, Southern Leyte.
                  </p>
                  <div className="flex items-center text-xs sm:text-sm text-gray-400">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Last updated: {new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="mt-4 sm:mt-6 text-center">
            <button 
              onClick={() => window.location.href = '/announcements'}
              className="bg-yellow-600 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-md hover:bg-yellow-700 transition-colors duration-200 text-sm sm:text-base"
            >
              View All Announcements
            </button>
          </div>
        </section>
      </div>

      {/* Individual Item Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white pr-2">{selectedItem.projectName}</h2>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-white hover:text-white flex-shrink-0"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {selectedItem.image && (
                <div className="mb-4">
                  <img
                    src={getImageUrl(selectedItem.image)}
                    alt={selectedItem.projectName}
                    className="w-full h-40 sm:h-48 md:h-64 object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="text-white leading-relaxed text-sm sm:text-base">
                <p>{selectedItem.details}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show All Modal */}
      {showAllModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white pr-2">All News, Projects, & Activities</h2>
                <button
                  onClick={() => setShowAllModal(false)}
                  className="text-white hover:text-white flex-shrink-0"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {systemSettings?.projectImages?.map((project, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                    {project.image && (
                      <div className="h-32 sm:h-40 md:h-48 bg-gray-200">
                        <img
                          src={getImageUrl(project.image)}
                          alt={project.projectName}
                          className="w-full h-full object-cover"
                          style={{ opacity: '1' }}
                        />
                      </div>
                    )}
                    <div className="p-3 sm:p-4">
                      <h3 className="font-semibold text-white mb-2 line-clamp-2 text-sm sm:text-base">{project.projectName}</h3>
                      <p className="text-gray-300 text-xs sm:text-sm mb-3 line-clamp-3">{project.details}</p>
                      <button
                        onClick={() => {
                          setSelectedItem(project);
                          setShowAllModal(false);
                        }}
                        className="bg-yellow-600 text-white px-2 py-1 sm:px-3 sm:py-1 rounded text-xs sm:text-sm hover:bg-yellow-700 transition-colors duration-200 w-full"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
