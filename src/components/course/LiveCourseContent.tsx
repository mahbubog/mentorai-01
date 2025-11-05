import { useEffect, useState } from 'react';
import { Calendar, Clock, Link, Users, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { CourseRow } from '../../lib/database.types';
import { LessonResources } from './LessonResources';
import { supabase } from '../../lib/supabase';

interface LiveCourseContentProps {
  course: CourseRow;
}

// Placeholder for live course sessions (since we don't have a dedicated sessions table yet)
interface LiveSession {
  id: number;
  start_time: Date;
  end_time: Date;
  title: string;
}

// Helper function to calculate time until next session
const calculateTimeLeft = (targetDate: Date) => {
  const difference = +targetDate - +new Date();
  let timeLeft = {};

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }
  return timeLeft;
};

export function LiveCourseContent({ course }: LiveCourseContentProps) {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [nextSession, setNextSession] = useState<LiveSession | null>(null);
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(new Date()));
  const [isLive, setIsLive] = useState(false);

  // Mock session data based on course start/end dates
  useEffect(() => {
    if (course.start_date && course.end_date) {
      // For simplicity, assume one session based on course dates
      const start = new Date(course.start_date);
      const end = new Date(course.end_date);
      
      const mockSession: LiveSession = {
        id: 1,
        start_time: start,
        end_time: end,
        title: `${course.title} - Live Kickoff Session`,
      };
      setSessions([mockSession]);
      setNextSession(mockSession);
    }
  }, [course]);

  useEffect(() => {
    if (!nextSession) return;

    const timer = setTimeout(() => {
      const newTimeLeft = calculateTimeLeft(nextSession.start_time);
      setTimeLeft(newTimeLeft);

      const now = new Date();
      const isCurrentlyLive = now >= nextSession.start_time && now <= nextSession.end_time;
      setIsLive(isCurrentlyLive);
    }, 1000);

    return () => clearTimeout(timer);
  }, [nextSession, timeLeft]);

  const timerComponents = Object.keys(timeLeft).map((interval) => {
    if (!(timeLeft as any)[interval]) {
      return null;
    }
    return (
      <span key={interval} className="text-2xl font-bold text-blue-600 mx-2">
        {(timeLeft as any)[interval]} <span className="block text-sm font-medium text-gray-600">{interval}</span>
      </span>
    );
  });

  const handleJoinSession = () => {
    if (course.meeting_link) {
      window.open(course.meeting_link, '_blank');
    }
  };

  // Since live courses don't have individual lessons, we use the course ID as a placeholder for resources
  const mockLessonId = course.id; 

  return (
    <div className="p-8 space-y-10">
      <div className="bg-white rounded-xl shadow p-8 border border-blue-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <Calendar className="h-7 w-7 mr-3 text-blue-600" />
          Live Session Status
        </h1>

        {nextSession ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-4">
                <Clock className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900">Next Session: {nextSession.title}</p>
                  <p className="text-sm text-gray-600">
                    {nextSession.start_time.toLocaleString()} - {nextSession.end_time.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              
              {isLive ? (
                <button
                  onClick={handleJoinSession}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition flex items-center"
                >
                  <Link className="h-5 w-5 mr-2" />
                  Join Session NOW
                </button>
              ) : (
                <button
                  disabled
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold cursor-not-allowed"
                >
                  Session Offline
                </button>
              )}
            </div>

            {/* Countdown */}
            {!isLive && timerComponents.length > 0 && (
              <div className="text-center py-4 border-t border-b border-gray-200">
                <p className="text-lg font-medium text-gray-700 mb-3">Time until next session starts:</p>
                <div className="flex justify-center">
                  {timerComponents}
                </div>
              </div>
            )}

            {/* Meeting Link Info */}
            {course.meeting_link && (
              <div className="p-4 bg-gray-50 rounded-lg flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">Meeting Link Available</p>
                  <p className="text-sm text-gray-600">
                    The link to join the live session is active during the scheduled time.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
            <AlertCircle className="h-8 w-8 mx-auto mb-3 text-gray-400" />
            <p>No upcoming live sessions scheduled at this time.</p>
          </div>
        )}
      </div>

      {/* Course Materials Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Course Materials</h2>
        
        {/* Downloadable Resources */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <Download className="h-6 w-6 mr-2 text-blue-600" />
            Downloadable Resources
          </h3>
          {/* Reusing LessonResources component, passing course ID as lesson ID placeholder */}
          <LessonResources lessonId={mockLessonId} />
        </div>

        {/* Assignments/Uploads Placeholder */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <Users className="h-6 w-6 mr-2 text-purple-600" />
            Assignments & Submissions
          </h3>
          <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
            <p>Assignment submission feature coming soon!</p>
          </div>
        </div>
      </div>
    </div>
  );
}