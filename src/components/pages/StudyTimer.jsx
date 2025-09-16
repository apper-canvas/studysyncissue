import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { courseService } from "@/services/api/courseService";
import { studySessionService } from "@/services/api/studySessionService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import FormField from "@/components/molecules/FormField";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";

const StudyTimer = () => {
const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionsLoading, setSessionsLoading] = useState(false);
const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, isPaused]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [coursesData, sessionsData] = await Promise.all([
        courseService.getAll(),
        studySessionService.getAll()
      ]);
      setCourses(coursesData);
      setSessions(sessionsData);
      setError(null);
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setError('Failed to load data. Please try again.');
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    try {
      setSessionsLoading(true);
      const data = await studySessionService.getAll();
      setSessions(data);
    } catch (err) {
      console.error('Failed to load sessions:', err);
      toast.error('Failed to load study sessions');
    } finally {
      setSessionsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

const startTimer = () => {
    if (!selectedSubject) {
      toast.error('Please select a subject before starting the timer');
      return;
    }
    
    setIsRunning(true);
    setIsPaused(false);
    startTimeRef.current = Date.now() - (time * 1000);
    
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setTime(elapsed);
    }, 1000);
    
    toast.success('Study session started!');
  };

const pauseTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPaused(true);
    toast.info('Study session paused');
  };

  const resumeTimer = () => {
    setIsPaused(false);
    startTimeRef.current = Date.now() - (time * 1000);
    
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setTime(elapsed);
    }, 1000);
    
    toast.success('Study session resumed!');
  };

const stopTimer = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (time === 0) {
      setIsRunning(false);
      setIsPaused(false);
      return;
    }

    try {
const selectedCourse = courses.find(course => course.Id === parseInt(selectedSubject));
      const sessionData = {
        subject_c: selectedCourse ? (selectedCourse.name_c || selectedCourse.Name) : 'Unknown Subject',
        duration_c: time,
        start_time_c: new Date(Date.now() - time * 1000).toISOString(),
        end_time_c: new Date().toISOString()
      };

      await studySessionService.create(sessionData);
      await loadSessions();

      setIsRunning(false);
      setIsPaused(false);
      setTime(0);
      setSelectedSubject('');
      
      toast.success(`Study session completed! Duration: ${formatDuration(time)}`);
    } catch (err) {
      console.error('Failed to save session:', err);
      toast.error('Failed to save study session');
    }
  };

const resetTimer = () => {
    if (window.confirm('Are you sure you want to reset the timer? This will lose your current session.')) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      setIsRunning(false);
      setIsPaused(false);
      setTime(0);
      toast.info('Timer reset');
    }
  };

  const deleteSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this study session?')) {
      return;
    }

    try {
      await studySessionService.delete(sessionId);
      await loadSessions();
      toast.success('Study session deleted');
    } catch (err) {
      console.error('Failed to delete session:', err);
      toast.error('Failed to delete study session');
    }
  };

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);


  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Study Timer</h1>
          <p className="text-gray-600">Track your study sessions with focused timing</p>
        </div>
      </div>

      {/* Timer Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ApperIcon name="Clock" size={20} />
            Study Session Timer
          </CardTitle>
        </CardHeader>
<CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-6xl font-mono font-bold text-primary-600 mb-4">
              {formatTime(time)}
            </div>
            <div className="text-sm text-gray-600">
              {isRunning ? (isPaused ? 'Paused' : 'Running') : 'Stopped'}
{selectedSubject && courses.find(c => c.Id === parseInt(selectedSubject)) && (
                <span className="block mt-1 font-medium text-primary-600">
                  {courses.find(c => c.Id === parseInt(selectedSubject)).name_c || courses.find(c => c.Id === parseInt(selectedSubject)).Name}
                </span>
              )}
            </div>
          </div>

          <FormField label="Select Subject" required>
            <Select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              disabled={isRunning}
              className="w-full"
            >
              <option value="">Choose a subject...</option>
              {courses.map(course => (
<option key={course.Id} value={course.Id}>
                  {course.name_c || course.Name || 'Untitled Course'}
                </option>
              ))}
            </Select>
          </FormField>

          <div className="flex justify-center gap-3">
            {!isRunning ? (
              <Button onClick={startTimer} size="lg">
                <ApperIcon name="Play" size={16} />
                Start
              </Button>
            ) : (
              <>
                {!isPaused ? (
                  <Button onClick={pauseTimer} variant="warning" size="lg">
                    <ApperIcon name="Pause" size={16} />
                    Pause
                  </Button>
                ) : (
                  <Button onClick={resumeTimer} variant="success" size="lg">
                    <ApperIcon name="Play" size={16} />
                    Resume
                  </Button>
                )}
                <Button onClick={stopTimer} variant="danger" size="lg">
                  <ApperIcon name="Square" size={16} />
                  Stop & Save
                </Button>
              </>
            )}
            {(isRunning || time > 0) && (
              <Button onClick={resetTimer} variant="secondary" size="lg">
                <ApperIcon name="RotateCcw" size={16} />
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

{/* Session History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ApperIcon name="History" size={20} />
            Study Session History
            {sessions.length > 0 && (
              <span className="text-sm font-normal text-gray-500 ml-auto">
                {sessions.length} session{sessions.length !== 1 ? 's' : ''}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessionsLoading ? (
            <Loading />
          ) : sessions.length === 0 ? (
            <Empty message="No study sessions recorded yet. Start your first study session above!" />
          ) : (
            <div className="space-y-3">
              {sessions.slice(0, 10).map((session, index) => (
                <motion.div
                  key={session.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1">{session.subject}</div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium text-primary-600">{formatDuration(session.duration)}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(session.endTime).toLocaleDateString()}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => deleteSession(session.Id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <ApperIcon name="Trash2" size={16} />
                  </Button>
                </motion.div>
              ))}
              {sessions.length > 10 && (
                <div className="text-center py-2 text-sm text-gray-500">
                  Showing 10 most recent sessions
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudyTimer;