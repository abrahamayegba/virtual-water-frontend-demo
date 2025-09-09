import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCourses } from "../context/CourseContext";
import Navbar from "../components/Navbar";
import PDFViewer from "../components/PDFViewer";
import VideoPlayer from "../components/VideoPlayer";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  FileText,
  Video,
  Presentation,
  Clock,
} from "lucide-react";

export default function LessonPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { getCourse, updateLessonProgress } = useCourses();
  const [isCompleted, setIsCompleted] = useState(false);
  
  const course = getCourse(courseId!);
  const lesson = course?.lessons.find((l) => l.id === lessonId);


  if (!course || !lesson) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Lesson not found
            </h1>
            <Link
              to="/dashboard"
              className="text-blue-500 hover:text-blue-600 mt-4 inline-block"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentLessonIndex = course.lessons.findIndex((l) => l.id === lessonId);
  const previousLesson =
    currentLessonIndex > 0 ? course.lessons[currentLessonIndex - 1] : null;
  const nextLesson =
    currentLessonIndex < course.lessons.length - 1
      ? course.lessons[currentLessonIndex + 1]
      : null;

  const handleCompleteLesson = () => {
    updateLessonProgress(courseId!, lessonId!);
    setIsCompleted(true);
  };

  useEffect(() => {
    const lesson = course.lessons.find((l) => l.id === lessonId);
    setIsCompleted(lesson?.completed ?? false);
  }, [lessonId, course.lessons]);

const handleNext = () => {
  if (nextLesson) {
    navigate(`/course/${courseId}/lesson/${nextLesson.id}`);
  } else {
    const allCompleted = course.lessons.every(
      (l) => l.completed || (l.id === lessonId && isCompleted)
    );
    if (course.quiz && allCompleted) {
      navigate(`/course/${courseId}/quiz`);
    } else {
      navigate(`/course/${courseId}`);
    }
  }
};


  const getContentIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-5 w-5" />;
      case "pdf":
        return <FileText className="h-5 w-5" />;
      case "powerpoint":
        return <Presentation className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const renderContent = () => {
    switch (lesson.type) {
      case "video":
        return (
          <VideoPlayer
            src="https://healthandsafety.s3.amazonaws.com/common/ios/legionalla%20management.mp4"
            title={lesson.title}
          />
        );

      case "powerpoint":
        return <PDFViewer file="/legionella-awareness-revised.pdf" title={lesson.title} />;

      case "pdf":
        return <PDFViewer file="/legionella-awareness-revised.pdf" title={lesson.title} />;

      default:
        return (
          <div className="bg-gray-100 rounded-lg p-8 min-h-96 flex items-center justify-center">
            <div className="text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600">Content not available</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Link to="/dashboard" className="hover:text-gray-700">
              Dashboard
            </Link>
            <span className="mx-2">•</span>
            <Link to={`/course/${courseId}`} className="hover:text-gray-700">
              {course.title}
            </Link>
            <span className="mx-2">•</span>
            <span>{lesson.title}</span>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {lesson.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                <div className="flex items-center space-x-1">
                  {getContentIcon(lesson.type)}
                  <span>
                    {lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{lesson.duration} minutes</span>
                </div>
                <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  Lesson {currentLessonIndex + 1} of {course.lessons.length}
                </div>
              </div>
            </div>

            {(lesson.completed || isCompleted) && (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Completed</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  ((currentLessonIndex +
                    (lesson.completed || isCompleted ? 1 : 0)) /
                    course.lessons.length) *
                  100
                }%`,
              }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Lesson {currentLessonIndex + 1} of {course.lessons.length} in{" "}
            {course.title}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
              {renderContent()}
            </div>

            {/* Lesson Navigation */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  {previousLesson && (
                    <Link
                      to={`/course/${courseId}/lesson/${previousLesson.id}`}
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <div>
                        <p className="text-xs text-gray-500">Previous</p>
                        <p className="font-medium">{previousLesson.title}</p>
                      </div>
                    </Link>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  {!lesson.completed && !isCompleted && (
                    <button
                      onClick={handleCompleteLesson}
                      className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Mark as Complete</span>
                    </button>
                  )}

                  {(lesson.completed || isCompleted) && (
                    <button
                      onClick={handleNext}
                      disabled={
                        !nextLesson &&
                        course.quiz &&
                        !course.lessons.every((l) => l.completed)
                      }
                      className={`px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                        !nextLesson &&
                        course.quiz &&
                        !course.lessons.every((l) => l.completed)
                          ? "bg-gray-400 text-white cursor-not-allowed"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    >
                      <span>
                        {nextLesson
                          ? "Next Lesson"
                          : course.quiz
                          ? "Take Quiz"
                          : "Back to Course"}
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div>
                  {nextLesson && (
                    <div className="flex items-center space-x-2 text-gray-600 text-right">
                      <div>
                        <p className="text-xs text-gray-500">Next</p>
                        <p className="font-medium">{nextLesson.title}</p>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Progress */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Course Progress
              </h3>
              <div className="space-y-3">
                {course.lessons.map((l, index) => (
                  <div key={l.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          l.completed
                            ? "bg-green-500 text-white"
                            : l.id === lessonId
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {l.completed ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span
                        className={`text-sm ${
                          l.id === lessonId
                            ? "font-medium text-gray-900"
                            : "text-gray-600"
                        }`}
                      >
                        {l.title}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{l.duration}m</span>
                  </div>
                ))}

                {course.quiz && (
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm text-gray-600">Final Quiz</span>
                    </div>
                    <span className="text-xs text-gray-500">5m</span>
                  </div>
                )}
              </div>
            </div>

            {/* Lesson Notes */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Key Takeaways
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Review all safety protocols carefully</li>
                <li>• Pay attention to equipment specifications</li>
                <li>• Practice proper procedures regularly</li>
                <li>• Ask questions if anything is unclear</li>
              </ul>
            </div>

            {/* Support */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Need Help?
              </h3>
              <div className="space-y-2 text-sm">
                <Link
                  to="/support"
                  className="block text-blue-600 hover:text-blue-700"
                >
                  Technical Support
                </Link>
                <Link
                  to="/support"
                  className="block text-blue-600 hover:text-blue-700"
                >
                  Content Questions
                </Link>
                <Link
                  to="/support"
                  className="block text-blue-600 hover:text-blue-700"
                >
                  Report an Issue
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
