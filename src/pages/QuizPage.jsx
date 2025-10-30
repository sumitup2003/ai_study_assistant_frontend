import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import Sidebar from '../components/Layout/Sidebar';
import { Award, Loader, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const QuizPage = () => {
  const [searchParams] = useSearchParams();
  const noteId = searchParams.get('noteId');
  
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(noteId || '');
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [results, setResults] = useState(null);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    if (noteId) {
      setSelectedNoteId(noteId);
    }
  }, [noteId]);

  const fetchNotes = async () => {
    try {
      const { data } = await api.get('/notes');
      setNotes(data.notes);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      toast.error('Failed to load notes');
    }
  };

  const generateQuiz = async () => {
    if (!selectedNoteId) {
      toast.error('Please select a note first');
      return;
    }

    setGenerating(true);
    try {
      const { data } = await api.post(`/quiz/generate/${selectedNoteId}`, {
        questionCount: 5
      });
      setQuiz(data.quiz);
      setAnswers(new Array(data.quiz.questions.length).fill(null));
      setCurrentQuestion(0);
      setCompleted(false);
      setResults(null);
      setStartTime(Date.now());
      toast.success('Quiz generated successfully!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate quiz');
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (answers.some(a => a === null)) {
      toast.error('Please answer all questions before submitting');
      return;
    }

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    setLoading(true);
    try {
      const { data } = await api.post(`/quiz/${quiz._id}/submit`, {
        answers,
        timeTaken
      });
      setResults(data);
      setCompleted(true);
      toast.success(`Quiz completed! Score: ${data.score.toFixed(0)}%`);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit quiz');
    } finally {
      setLoading(false);
    }
  };

  const question = quiz?.questions[currentQuestion];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz</h1>
              <p className="text-gray-600">Test your knowledge</p>
            </div>

            {!quiz ? (
              <div className="space-y-6">
                {/* Note Selector */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select a note to generate quiz
                  </label>
                  <select
                    value={selectedNoteId}
                    onChange={(e) => setSelectedNoteId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a note...</option>
                    {notes.map((note) => (
                      <option key={note._id} value={note._id}>
                        {note.title}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={generateQuiz}
                  disabled={!selectedNoteId || generating}
                  className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg font-medium"
                >
                  {generating ? (
                    <>
                      <Loader className="w-6 h-6 mr-2 animate-spin" />
                      Generating Quiz...
                    </>
                  ) : (
                    <>
                      <Award className="w-6 h-6 mr-2" />
                      Generate Quiz
                    </>
                  )}
                </button>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> The quiz will contain 5 multiple-choice questions based on your selected note.
                  </p>
                </div>
              </div>
            ) : completed ? (
              /* Results */
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    results.score >= 80 ? 'bg-green-100' :
                    results.score >= 60 ? 'bg-yellow-100' :
                    'bg-red-100'
                  }`}>
                    <Award className={`w-12 h-12 ${
                      results.score >= 80 ? 'text-green-600' :
                      results.score >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                    }`} />
                  </div>
                  
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {results.score.toFixed(0)}%
                  </h2>
                  <p className="text-gray-600 mb-6">
                    You got {results.correctCount} out of {results.totalQuestions} questions correct
                  </p>

                  <div className="flex items-center justify-center gap-6 mb-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {Math.floor(results.quiz.timeTaken / 60)}:{(results.quiz.timeTaken % 60).toString().padStart(2, '0')}
                      </p>
                      <p className="text-sm text-gray-600">Time Taken</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setQuiz(null);
                      setCompleted(false);
                      setResults(null);
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Take Another Quiz
                  </button>
                </div>

                {/* Answers Review */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Review Answers</h3>
                  <div className="space-y-6">
                    {results.quiz.questions.map((q, index) => (
                      <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium text-gray-900">
                            {index + 1}. {q.question}
                          </p>
                          {q.isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 ml-2" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 ml-2" />
                          )}
                        </div>

                        <div className="space-y-2 ml-4">
                          {q.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className={`p-2 rounded ${
                                optIndex === q.correctAnswer
                                  ? 'bg-green-100 border border-green-300'
                                  : optIndex === q.userAnswer && !q.isCorrect
                                  ? 'bg-red-100 border border-red-300'
                                  : 'bg-gray-50'
                              }`}
                            >
                              <p className="text-sm text-gray-700">{option}</p>
                            </div>
                          ))}
                        </div>

                        {q.explanation && (
                          <div className="mt-2 ml-4 p-3 bg-blue-50 rounded">
                            <p className="text-sm text-blue-900">
                              <strong>Explanation:</strong> {q.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Quiz In Progress */
              <div className="space-y-6">
                {/* Progress */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Question {currentQuestion + 1} of {quiz.questions.length}
                    </span>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      {startTime && Math.floor((Date.now() - startTime) / 1000 / 60)}:
                      {startTime && ((Math.floor((Date.now() - startTime) / 1000) % 60)).toString().padStart(2, '0')}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Question */}
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    {question.question}
                  </h3>

                  <div className="space-y-3">
                    {question.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          answers[currentQuestion] === index
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                            answers[currentQuestion] === index
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {answers[currentQuestion] === index && (
                              <CheckCircle className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <span className="text-gray-900">{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <div className="flex gap-2">
                    {quiz.questions.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestion(index)}
                        className={`w-10 h-10 rounded-lg font-medium ${
                          index === currentQuestion
                            ? 'bg-blue-600 text-white'
                            : answers[index] !== null
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>

                  {currentQuestion === quiz.questions.length - 1 ? (
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {loading ? (
                        <>
                          <Loader className="w-5 h-5 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Quiz'
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default QuizPage;