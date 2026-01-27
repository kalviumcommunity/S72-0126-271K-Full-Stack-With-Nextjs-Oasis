'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Clock, BookOpen, Check } from 'lucide-react';

interface Lesson {
  id: number;
  title: string;
  duration: string;
  isCached: boolean;
  cachePercentage: number;
  isCompleted: boolean;
}

export default function ReactPerformanceCoursePage() {
  const router = useRouter();
  const [lessons] = useState<Lesson[]>([
    { id: 1, title: "Performance Metrics", duration: "38 min", isCached: true, cachePercentage: 100, isCompleted: true },
    { id: 2, title: "Code Splitting Techniques", duration: "42 min", isCached: true, cachePercentage: 100, isCompleted: true },
    { id: 3, title: "React Rendering Optimization", duration: "45 min", isCached: true, cachePercentage: 95, isCompleted: false },
    { id: 4, title: "Memoization & useMemo", duration: "40 min", isCached: false, cachePercentage: 0, isCompleted: false },
    { id: 5, title: "Bundle Analysis", duration: "35 min", isCached: false, cachePercentage: 0, isCompleted: false },
    { id: 6, title: "Production Monitoring", duration: "40 min", isCached: false, cachePercentage: 0, isCompleted: false },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <button
        onClick={() => router.back()}
        className="mb-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition"
      >
        ← Back
      </button>

      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-orange-500 to-orange-700 rounded-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">React Performance Optimization</h1>
          <p className="text-orange-100">Build lightning-fast React applications with advanced optimization techniques</p>
          <p className="text-orange-100 mt-2">Instructor: Anna Kowalski • 19 lessons • 7h 20m</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-700 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Progress</p>
                <p className="text-3xl font-bold text-white">63%</p>
              </div>
              <Check className="text-green-400" size={32} />
            </div>
          </div>
          <div className="bg-slate-700 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Cached</p>
                <p className="text-3xl font-bold text-white">58%</p>
              </div>
              <Download className="text-blue-400" size={32} />
            </div>
          </div>
          <div className="bg-slate-700 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Duration</p>
                <p className="text-3xl font-bold text-white">7h 20m</p>
              </div>
              <Clock className="text-purple-400" size={32} />
            </div>
          </div>
        </div>

        <div className="bg-blue-900 border border-blue-700 rounded-lg p-4 mb-8">
          <p className="text-blue-100">📱 Offline mode: View cached lessons below. Download lesson for offline access.</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-white mb-4">Course Lessons</h2>
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-slate-700 hover:bg-slate-600 p-4 rounded-lg cursor-pointer transition flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                {lesson.isCompleted && <Check size={20} className="text-green-400" />}
                <div>
                  <h3 className="text-white font-semibold">{lesson.title}</h3>
                  <div className="flex gap-4 text-slate-400 text-sm mt-1">
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> {lesson.duration}
                    </span>
                    {lesson.isCached && (
                      <span className="flex items-center gap-1 text-green-400">
                        <Check size={14} /> {lesson.cachePercentage}% cached
                      </span>
                    )}
                    {!lesson.isCached && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <Download size={14} /> Not cached
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="mt-8 w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 rounded-lg transition">
          <Download className="inline mr-2" size={20} />
          Download All Lessons for Offline
        </button>
      </div>
    </div>
  );
}
