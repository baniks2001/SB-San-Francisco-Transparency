import React, { useState, useEffect, useCallback } from 'react';
import { SystemSettings, Activity } from '../types';
import { getImageUrl } from '../utils/imageUtils';
import { apiWithRetry } from '../services/api';

const Home: React.FC = () => {
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imagesPreloaded, setImagesPreloaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [showAllModal, setShowAllModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [, setVisibleProjectImages] = useState<Set<number>>(new Set([0, 1, 2, 3, 4]));
  
  // Ticker state
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<any>(null);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [activities, setActivities] = useState<Activity[]>([]);

  // Statistics state
  const [statistics, setStatistics] = useState({
    resolutions: { total: 0, approved: 0, pending: 0 },
    ordinances: { total: 0, approved: 0, pending: 0 },
    procurements: { total: 0, approved: 0, pending: 0 }
  });

  // Navigation functions for projects
  const handleNextProject = () => {
    if (systemSettings?.projectImages) {
      setCurrentProjectIndex((prev) => (prev + 1) % systemSettings.projectImages.length);
    }
  };

  const handlePrevProject = () => {
    if (systemSettings?.projectImages) {
      setCurrentProjectIndex((prev) => (prev - 1 + systemSettings.projectImages.length) % systemSettings.projectImages.length);
    }
  };

  // Function to fetch activities
  const fetchActivities = useCallback(async () => {
    try {
      const response = await apiWithRetry.get('/activities');
      setActivities(response.data || []);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    }
  }, []);

  // Function to fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      const [resolutionsResponse, ordinancesResponse, procurementsResponse] = await Promise.all([
        apiWithRetry.get('/resolutions'),
        apiWithRetry.get('/ordinances'),
        apiWithRetry.get('/procurements')
      ]);

      const resolutions = resolutionsResponse.data;
      const ordinances = ordinancesResponse.data;
      const procurements = procurementsResponse.data;

      const calculateStats = (items: any[]) => {
        const total = items.length;
        const approved = items.filter(item => item.status === 'Approved').length;
        const pending = items.filter(item => item.status === 'Pending').length;
        return { total, approved, pending };
      };

      setStatistics({
        resolutions: calculateStats(resolutions),
        ordinances: calculateStats(ordinances),
        procurements: calculateStats(procurements)
      });
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  }, []);

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
        const settingsResponse = await apiWithRetry.get('/settings');
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
        
        // Fetch statistics after main data is loaded
        fetchStatistics();
        // Fetch activities
        fetchActivities();
      } catch (error: any) {
        console.error('Failed to fetch data:', error);
        setError(error?.response?.data?.message || error?.message || 'Failed to load content. Please check your connection and try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, [preloadImages, fetchStatistics, fetchActivities]);

  // Ticker effect - Rotate announcements
  useEffect(() => {
    if (announcements.length === 0) return;

    const sortedAnnouncements = announcements
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    // Set initial announcement
    setCurrentAnnouncement(sortedAnnouncements[0]);

    // Rotate announcements every 5 seconds
    const interval = setInterval(() => {
      setCurrentAnnouncementIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % sortedAnnouncements.length;
        setCurrentAnnouncement(sortedAnnouncements[nextIndex]);
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [announcements]);

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
  }, [systemSettings?.organizationStructure, categorizeStaff]);

  // Auto-slide for News, Projects & Activities
  useEffect(() => {
    if (systemSettings?.projectImages && systemSettings.projectImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentProjectIndex((prev) => (prev + 1) % systemSettings.projectImages.length);
      }, 5000); // Change slide every 5 seconds

      return () => clearInterval(interval);
    }
  }, [systemSettings?.projectImages]);

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
  }, [systemSettings?.projectImages, systemSettings?.projectImages?.length]);

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-white">
            {!systemSettings && !error ? 'Loading content...' : 
             !imagesPreloaded && !error ? `Preloading images...` : 
             error ? 'Connection issue detected...' : 
             'Almost ready...'}
          </p>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg max-w-md mx-auto">
              <p className="text-red-600 text-sm">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50">
      {/* Live Announcements Ticker */}
      {announcements.length > 0 && currentAnnouncement && (
        <div className="bg-yellow-600 text-white py-2 px-3 sm:px-4 overflow-hidden">
          <div className="flex items-center max-w-7xl mx-auto">
            <span className="bg-yellow-700 text-white px-2 py-1 rounded text-xs font-semibold mr-3 flex-shrink-0 border-r-2 border-black self-center">
              ANNOUNCEMENTS
            </span>
            <div className="flex-1 overflow-hidden self-center">
              <div className="animate-fade-in-out">
                <p className="text-xs sm:text-sm font-medium truncate">
                  <span className="font-bold">{currentAnnouncement.title}:</span> {currentAnnouncement.content}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Carousel */}
      {systemSettings?.carouselImages && systemSettings.carouselImages.length > 0 && (
        <div className="relative h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] bg-gray-200 overflow-hidden">
          <img
            src={getImageUrl(systemSettings.carouselImages[currentImageIndex])}
            alt="Carousel"
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white bg-black bg-opacity-50 p-2 sm:p-3 md:p-4 rounded-lg backdrop-blur-sm mx-2 sm:mx-4 max-w-6xl w-full">
              <h2 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold mb-1 sm:mb-2 drop-shadow-lg animate-pulse leading-tight">{systemSettings?.transparencyTitle || 'Sangguniang Bayan Transparency'}</h2>
              <p className="text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg drop-shadow-md animate-pulse leading-tight">{systemSettings?.location || 'San Francisco, Southern Leyte'}</p>
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

      {/* Statistics Cards */}
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Resolutions Card */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 sm:p-6">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">Resolutions</h3>
                <p className="text-sm text-gray-600">Total Documents</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-white mb-1">
                {statistics.resolutions.total}
              </div>
              <div className="text-lg font-semibold text-gray-600 mb-3">
                Total
              </div>
              <div className="text-base text-gray-600">
                <span className="text-green-600 font-bold text-lg">{statistics.resolutions.approved}</span> | 
                <span className="text-orange-600 font-bold text-lg"> {statistics.resolutions.pending}</span>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Approved | Pending
              </div>
            </div>
          </div>

          {/* Ordinances Card */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 sm:p-6">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 rounded-full p-3 mr-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">Ordinances</h3>
                <p className="text-sm text-gray-600">Local Laws</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-white mb-1">
                {statistics.ordinances.total}
              </div>
              <div className="text-lg font-semibold text-gray-600 mb-3">
                Total
              </div>
              <div className="text-base text-gray-600">
                <span className="text-green-600 font-bold text-lg">{statistics.ordinances.approved}</span> | 
                <span className="text-orange-600 font-bold text-lg"> {statistics.ordinances.pending}</span>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Approved | Pending
              </div>
            </div>
          </div>

          {/* Procurements Card */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 sm:p-6">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 rounded-full p-3 mr-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">Procurements</h3>
                <p className="text-sm text-gray-600">Bids & Contracts</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-white mb-1">
                {statistics.procurements.total}
              </div>
              <div className="text-lg font-semibold text-gray-600 mb-3">
                Total
              </div>
              <div className="text-base text-gray-600">
                <span className="text-green-600 font-bold text-lg">{statistics.procurements.approved}</span> | 
                <span className="text-orange-600 font-bold text-lg"> {statistics.procurements.pending}</span>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Approved | Pending
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar of Activities Section */}
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
          {/* Title Section */}
          <div className="bg-amber-800 px-8 py-4 sm:py-6">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                Calendar of Activities
              </h2>
            </div>
          </div>
          
          {/* Content Section */}
          <div className="p-4 sm:p-6 bg-white">
          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.slice(0, 3).map((activity) => (
                <div key={activity._id} className="bg-white/90 backdrop-blur-sm rounded-lg border-l-4 border-yellow-600 p-3 hover:bg-white/95 transition-colors duration-200 shadow-sm border border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-black mb-1">{activity.title}</h3>
                      <p className="text-black text-base mb-1">{activity.description}</p>
                      <div className="flex flex-wrap gap-6 text-base text-black">
                        <span className="flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(activity.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                        <span className="flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {activity.time}
                        </span>
                        <span className="flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {activity.location}
                        </span>
                      </div>
                      <div className="mt-1 text-base text-black">
                        <span className="font-medium">Organizer:</span> {activity.organizer}
                        {activity.contactInfo && (
                          <span className="ml-6">
                            <span className="font-medium">Contact:</span> {activity.contactInfo}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-1 sm:mt-0 sm:ml-4">
                      <span className={`inline-block px-6 py-3 rounded-full text-lg font-bold ${
                        activity.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                        activity.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                        activity.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-400 text-lg">No upcoming activities scheduled</p>
              <p className="text-gray-500 text-sm mt-2">Check back later for updates on community events and meetings</p>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* News, Projects & Activities Section */}
      {systemSettings?.projectImages && systemSettings.projectImages.length > 0 && (
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
          {/* Section Title */}
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              News, Projects & Activities
            </h2>
          </div>
          
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              {/* Left side - Image card */}
              <div className="lg:w-2/5 relative">
                {systemSettings.projectImages[currentProjectIndex]?.image && (
                  <div className="h-64 lg:h-full min-h-[300px] bg-gray-200">
                    <img
                      src={getImageUrl(systemSettings.projectImages[currentProjectIndex].image)}
                      alt={systemSettings.projectImages[currentProjectIndex].projectName || "News, Projects & Activities"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {/* Navigation arrows */}
                {systemSettings.projectImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevProject}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={handleNextProject}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
                {/* Project indicator */}
                {systemSettings.projectImages.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {systemSettings.projectImages.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${
                          index === currentProjectIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Right side - Content */}
              <div className="lg:w-3/5 p-6 sm:p-8 flex flex-col justify-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  {systemSettings.projectImages[currentProjectIndex]?.projectName || 'Current Project'}
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {systemSettings.projectImages[currentProjectIndex]?.details || 
                   'Stay updated with the latest news, ongoing projects, and community activities in San Francisco, Southern Leyte. ' +
                   'Explore our development initiatives and see how we\'re working together for a better community.'}
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {systemSettings.projectImages.length > 1 && (
                      <span>{currentProjectIndex + 1} of {systemSettings.projectImages.length}</span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowAllModal(true)}
                    className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors duration-200 font-semibold"
                  >
                    View All News, Projects & Activities
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}

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
