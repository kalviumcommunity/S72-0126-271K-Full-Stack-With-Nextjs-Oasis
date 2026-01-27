'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Lesson {
  id: number;
  title: string;
  duration: string;
  isCached: boolean;
  cachePercentage: number;
  isCompleted: boolean;
}

interface TopicData {
  title: string;
  description: string;
  totalLessons: number;
  completedLessons: number;
  overallCachePercentage: number;
  difficulty: string;
  estimatedTime: string;
}

export default function LessonsPage() {
  const router = useRouter();
  const [topicData] = useState<TopicData>({
    title: "Introduction to React Hooks",
    description: "Master the fundamentals of React Hooks and learn how to build modern, functional React components. This comprehensive course covers useState, useEffect, useContext, and custom hooks with real-world examples.",
    totalLessons: 8,
    completedLessons: 3,
    overallCachePercentage: 65,
    difficulty: "Intermediate",
    estimatedTime: "4 hours"
  });

  const [lessons] = useState<Lesson[]>([
    {
      id: 1,
      title: "Understanding useState Hook",
      duration: "25 min",
      isCached: true,
      cachePercentage: 100,
      isCompleted: true
    },
    {
      id: 2,
      title: "Working with useEffect",
      duration: "30 min",
      isCached: true,
      cachePercentage: 100,
      isCompleted: true
    },
    {
      id: 3,
      title: "useContext for State Management",
      duration: "35 min",
      isCached: true,
      cachePercentage: 100,
      isCompleted: true
    },
    {
      id: 4,
      title: "useReducer for Complex State",
      duration: "40 min",
      isCached: true,
      cachePercentage: 85,
      isCompleted: false
    },
    {
      id: 5,
      title: "useCallback and useMemo",
      duration: "28 min",
      isCached: true,
      cachePercentage: 60,
      isCompleted: false
    },
    {
      id: 6,
      title: "useRef and DOM Manipulation",
      duration: "22 min",
      isCached: false,
      cachePercentage: 30,
      isCompleted: false
    },
    {
      id: 7,
      title: "Building Custom Hooks",
      duration: "45 min",
      isCached: false,
      cachePercentage: 0,
      isCompleted: false
    },
    {
      id: 8,
      title: "Advanced Patterns and Best Practices",
      duration: "50 min",
      isCached: false,
      cachePercentage: 0,
      isCompleted: false
    }
  ]);

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button 
          onClick={() => router.push('/courses')}
          className="text-slate-600 hover:text-slate-900 mb-4 flex items-center gap-2 transition-colors cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Topics
          </button>
          
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            {topicData.title}
          </h1>
          
          <div className="flex flex-wrap gap-3 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(topicData.difficulty)}`}>
              {topicData.difficulty}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {topicData.totalLessons} Lessons
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              {topicData.estimatedTime}
            </span>
          </div>
        </div>

        {/* Topic Description Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">About This Topic</h2>
          <p className="text-slate-700 leading-relaxed">{topicData.description}</p>
          
          {/* Progress Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">Course Progress</span>
                <span className="text-sm font-bold text-slate-900">
                  {topicData.completedLessons}/{topicData.totalLessons}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${(topicData.completedLessons / topicData.totalLessons) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">Offline Cache</span>
                <span className="text-sm font-bold text-slate-900">
                  {topicData.overallCachePercentage}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div 
                  className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${topicData.overallCachePercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Offline Mode Info Banner */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-semibold text-green-900 mb-1">Offline Mode Available</h3>
            <p className="text-sm text-green-800">
              Download lessons for offline viewing. Cached content is stored locally on your device and can be accessed without an internet connection.
            </p>
          </div>
        </div>

        {/* Lessons List */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Lessons</h2>
          
          {lessons.map((lesson, index) => (
            <div 
              key={lesson.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start gap-4">
                {/* Lesson Number */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  lesson.isCompleted 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {lesson.isCompleted ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Lesson Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        {lesson.title}
                      </h3>
                      <p className="text-sm text-slate-600">{lesson.duration}</p>
                    </div>
                    
                    {/* Cache Status Badge */}
                    <div className="flex-shrink-0">
                      {lesson.isCached ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Cached
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Cache Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600">Offline availability</span>
                      <span className="font-medium text-slate-900">{lesson.cachePercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          lesson.cachePercentage === 100 
                            ? 'bg-green-500' 
                            : lesson.cachePercentage > 0 
                              ? 'bg-yellow-500' 
                              : 'bg-slate-300'
                        }`}
                        style={{ width: `${lesson.cachePercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Action */}
        <div className="mt-8 flex justify-center">
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm">
            Download All Lessons for Offline
          </button>
        </div>
      </div>
    </div>
  );
}