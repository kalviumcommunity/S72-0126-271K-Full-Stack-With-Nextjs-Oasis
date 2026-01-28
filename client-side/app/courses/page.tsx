'use client';
import { useState, useEffect } from 'react';
import { Download, Clock, BookOpen, Check, Wifi, WifiOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

const CoursesPage = () => {
  const [filter, setFilter] = useState('all');
  const [isOnline, setIsOnline] = useState(true);
  const [showCacheDebug, setShowCacheDebug] = useState(false);
  const [cachedUrls, setCachedUrls] = useState<string[]>([]);
  const router = useRouter();
  const [courses, setCourses] = useState([
    {
      id: '1',
      slug: 'typescript',
      title: 'Advanced TypeScript Patterns',
      instructor: 'Sarah Chen',
      category: 'development',
      progress: 68,
      totalLessons: 24,
      completedLessons: 16,
      duration: '8h 30m',
      thumbnail: 'dev',
      isCached: true,
      color: 'from-orange-500 to-orange-700'
    },
    {
      id: '2',
      slug: 'design',
      title: 'UI/UX Design Principles',
      instructor: 'Marcus Johnson',
      category: 'design',
      progress: 45,
      totalLessons: 18,
      completedLessons: 8,
      duration: '6h 15m',
      thumbnail: 'design',
      isCached: true,
      color: 'from-emerald-500 to-emerald-700'
    },
    {
      id: '3',
      slug: 'architecture',
      title: 'Modern Web Architecture',
      instructor: 'Elena Rodriguez',
      category: 'tech',
      progress: 23,
      totalLessons: 32,
      completedLessons: 7,
      duration: '12h 45m',
      thumbnail: 'tech',
      isCached: false,
      color: 'from-blue-500 to-blue-700'
    },
    {
      id: '4',
      slug: 'product-management',
      title: 'Product Management Essentials',
      instructor: 'David Park',
      category: 'business',
      progress: 91,
      totalLessons: 20,
      completedLessons: 18,
      duration: '5h 20m',
      thumbnail: 'business',
      isCached: true,
      color: 'from-amber-500 to-amber-700'
    },
    {
      id: '5',
      slug: 'react-performance',
      title: 'React Performance Optimization',
      instructor: 'Anna Kowalski',
      category: 'development',
      progress: 12,
      totalLessons: 16,
      completedLessons: 2,
      duration: '4h 50m',
      thumbnail: 'dev',
      isCached: false,
      color: 'from-orange-500 to-orange-700'
    },
    {
      id: '6',
      slug: 'design-systems',
      title: 'Design Systems Mastery',
      instructor: 'James Liu',
      category: 'design',
      progress: 56,
      totalLessons: 22,
      completedLessons: 12,
      duration: '9h 10m',
      thumbnail: 'design',
      isCached: true,
      color: 'from-emerald-500 to-emerald-700'
    },
    {
      id: '7',
      slug: 'cloud-infrastructure',
      title: 'Cloud Infrastructure Deep Dive',
      instructor: 'Robert Martinez',
      category: 'tech',
      progress: 34,
      totalLessons: 28,
      completedLessons: 9,
      duration: '11h 20m',
      thumbnail: 'tech',
      isCached: true,
      color: 'from-blue-500 to-blue-700'
    },
    {
      id: '8',
      title: 'Startup Growth Strategies',
      instructor: 'Lisa Thompson',
      category: 'business',
      progress: 78,
      totalLessons: 15,
      completedLessons: 12,
      duration: '6h 45m',
      thumbnail: 'business',
      isCached: false,
      color: 'from-amber-500 to-amber-700'
    }
  ]);

  useEffect(() => {
    // Register service worker for offline functionality
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => console.log('Service Worker registered:', registration))
        .catch(error => console.log('Service Worker registration failed:', error));
    }

    // Check online/offline status
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Check which courses are actually cached
    const checkCachedCourses = async () => {
      if ('caches' in window) {
        try {
          const cache = await caches.open('oasis-cache-v2');
          const cachedRequests = await cache.keys();
          const cachedPaths = cachedRequests.map(req => new URL(req.url).pathname);
          
          setCachedUrls(cachedPaths);
          
          setCourses(prevCourses => 
            prevCourses.map(course => ({
              ...course,
              isCached: course.slug ? cachedPaths.includes(`/courses/${course.slug}`) : false
            }))
          );
        } catch (error) {
          console.error('Error checking cached courses:', error);
        }
      }
    };

    checkCachedCourses();
    
    // Refresh cache status every 2 seconds
    const interval = setInterval(checkCachedCourses, 2000);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(interval);
    };
  }, []);

  const filteredCourses = filter === 'all' 
    ? courses 
    : courses.filter(course => course.category === filter);

  const categories = [
    { id: 'all', label: 'All Courses' },
    { id: 'development', label: 'Development' },
    { id: 'design', label: 'Design' },
    { id: 'tech', label: 'Technology' },
    { id: 'business', label: 'Business' }
  ];

  return (
    <div className="min-h-screen bg-stone-50">

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Online/Offline Status Banner */}
        <div className={`mb-4 p-4 rounded-lg border-2 ${
          isOnline 
            ? 'bg-green-50 border-green-200' 
            : 'bg-orange-50 border-orange-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isOnline ? (
                <Wifi className="w-5 h-5 text-green-600" />
              ) : (
                <WifiOff className="w-5 h-5 text-orange-600" />
              )}
              <div>
                <p className={`font-semibold ${isOnline ? 'text-green-900' : 'text-orange-900'}`}>
                  {isOnline ? 'Online Mode' : 'Offline Mode'}
                </p>
                <p className={`text-sm ${isOnline ? 'text-green-700' : 'text-orange-700'}`}>
                  {isOnline 
                    ? 'Visit courses to cache them for offline viewing' 
                    : 'Only cached courses will load'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCacheDebug(!showCacheDebug)}
              className="px-4 py-2 bg-white border border-stone-300 rounded-lg text-sm font-medium hover:bg-stone-50 transition"
            >
              {showCacheDebug ? 'Hide' : 'Show'} Cache Info
            </button>
          </div>
        </div>

        {/* Cache Debug Panel */}
        {showCacheDebug && (
          <div className="mb-4 p-4 bg-white rounded-lg border border-stone-200">
            <h3 className="font-bold text-stone-900 mb-2">Cached URLs ({cachedUrls.length}):</h3>
            <div className="max-h-40 overflow-y-auto">
              {cachedUrls.length === 0 ? (
                <p className="text-sm text-stone-500">No URLs cached yet. Visit some course pages!</p>
              ) : (
                <ul className="space-y-1">
                  {cachedUrls.map((url, i) => (
                    <li key={i} className="text-xs font-mono text-stone-600 bg-stone-50 px-2 py-1 rounded">
                      {url}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              onClick={async () => {
                if (confirm('Clear all cached data?')) {
                  const cache = await caches.open('oasis-cache-v2');
                  const keys = await cache.keys();
                  await Promise.all(keys.map(key => cache.delete(key)));
                  window.location.reload();
                }
              }}
              className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition"
            >
              Clear All Cache
            </button>
          </div>
        )}

        {/* Hero Section */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-bold text-stone-900 mb-3 font-sans">
            My Courses
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl">
            Continue your learning journey. All cached courses are available offline.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setFilter(category.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                filter === category.id
                  ? 'bg-stone-900 text-white shadow-lg shadow-stone-900/20'
                  : 'bg-white text-stone-700 border border-stone-200 hover:border-stone-300 hover:shadow-md'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-600">Total Courses</p>
                <p className="text-3xl font-bold text-stone-900 mt-1">{courses.length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-600">Cached Offline</p>
                <p className="text-3xl font-bold text-stone-900 mt-1">
                  {courses.filter(c => c.isCached).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <Download className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-600">Avg Progress</p>
                <p className="text-3xl font-bold text-stone-900 mt-1">
                  {Math.round(courses.reduce((acc, c) => acc + c.progress, 0) / courses.length)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Check className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <div
              key={course.id}
              className="group bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-xl hover:shadow-stone-900/10 transition-all duration-500 cursor-pointer animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${300 + index * 100}ms` }}
            >
              {/* Thumbnail */}
              <div className={`relative h-48 bg-gradient-to-br ${course.color} overflow-hidden`}>
                {/* Decorative Pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-20 translate-x-20"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-16 -translate-x-16"></div>
                </div>

                {/* Cached Badge */}
                {course.isCached && (
                  <div className="absolute top-4 right-4 flex items-center space-x-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg">
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-700">Cached</span>
                  </div>
                )}

                {/* Category Tag */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full">
                  <span className="text-xs font-medium text-white uppercase tracking-wide">
                    {course.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Meta Info */}
                <div className="flex items-center space-x-4 text-xs text-stone-500 mb-3">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{course.totalLessons} lessons</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-stone-900 mb-2 group-hover:text-orange-600 transition-colors font-sans">
                  {course.title}
                </h3>

                {/* Instructor */}
                <p className="text-sm text-stone-600 mb-4">{course.instructor}</p>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-stone-600">
                      {course.completedLessons} of {course.totalLessons} completed
                    </span>
                    <span className="font-semibold text-stone-900">{course.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${course.color} rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* CTA Button */}
                <button 
                onClick={() => router.push(`/courses/${course.slug}`)}
                className="w-full py-3 bg-stone-900 text-white font-medium rounded-xl hover:bg-stone-800 transition-colors duration-300 group-hover:shadow-lg cursor-pointer">
                  {course.progress === 0 ? 'Start Course' : 'Continue Learning'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-12 h-12 text-stone-400" />
            </div>
            <h3 className="text-xl font-semibold text-stone-900 mb-2">No courses found</h3>
            <p className="text-stone-600 mb-6">Try selecting a different category</p>
            <button
              onClick={() => setFilter('all')}
              className="px-6 py-3 bg-stone-900 text-white font-medium rounded-xl hover:bg-stone-800 transition-colors"
            >
              View All Courses
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default CoursesPage;