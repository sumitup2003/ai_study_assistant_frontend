import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import Sidebar from '../components/Layout/Sidebar';
import { CreditCard, ChevronLeft, ChevronRight, RotateCw, Loader, CheckCircle, XCircle } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const FlashcardsPage = () => {
  const [searchParams] = useSearchParams();
  const noteId = searchParams.get('noteId');
  
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(noteId || '');
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    if (noteId) {
      setSelectedNoteId(noteId);
      fetchFlashcards(noteId);
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

  const fetchFlashcards = async (id) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/flashcards/note/${id}`);
      setFlashcards(data.flashcards);
      setCurrentIndex(0);
      setFlipped(false);
    } catch (error) {
      console.error('Failed to fetch flashcards:', error);
      setFlashcards([]);
    } finally {
      setLoading(false);
    }
  };

  const generateFlashcards = async () => {
    if (!selectedNoteId) {
      toast.error('Please select a note first');
      return;
    }

    setGenerating(true);
    try {
      const { data } = await api.post(`/flashcards/generate/${selectedNoteId}`, {
        count: 10
      });
      setFlashcards(data.flashcards);
      setCurrentIndex(0);
      setFlipped(false);
      toast.success('Flashcards generated successfully!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error.response?.data?.message || 'Failed to generate flashcards');
    } finally {
      setGenerating(false);
    }
  };

  const handleNoteChange = (id) => {
    setSelectedNoteId(id);
    if (id) {
      fetchFlashcards(id);
    } else {
      setFlashcards([]);
    }
  };

  const handleReview = async (isCorrect) => {
    if (flashcards.length === 0) return;

    try {
      await api.put(`/flashcards/${flashcards[currentIndex]._id}/review`, {
        isCorrect
      });

      // Update local flashcard
      const updated = [...flashcards];
      updated[currentIndex] = {
        ...updated[currentIndex],
        reviewCount: updated[currentIndex].reviewCount + 1,
        correctCount: isCorrect 
          ? updated[currentIndex].correctCount + 1 
          : updated[currentIndex].correctCount
      };
      setFlashcards(updated);

      // Move to next card
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setFlipped(false);
      } else {
        toast.success('You\'ve reviewed all flashcards!');
      }
    } catch (error) {
      console.error('Review error:', error);
      toast.error('Failed to record review');
    }
  };

  const nextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setFlipped(false);
    }
  };

  const currentCard = flashcards[currentIndex];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Flashcards</h1>
              <p className="text-gray-600">Review and master your study material</p>
            </div>

            {/* Note Selector */}
            <div className="mb-6 flex gap-4">
              <select
                value={selectedNoteId}
                onChange={(e) => handleNoteChange(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a note...</option>
                {notes.map((note) => (
                  <option key={note._id} value={note._id}>
                    {note.title}
                  </option>
                ))}
              </select>

              {flashcards.length === 0 && selectedNoteId && (
                <button
                  onClick={generateFlashcards}
                  disabled={generating}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {generating ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Generate Flashcards
                    </>
                  )}
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : flashcards.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  {selectedNoteId
                    ? 'No flashcards found. Generate some to get started!'
                    : 'Select a note to view or generate flashcards'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Progress */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Card {currentIndex + 1} of {flashcards.length}
                    </span>
                    <span className="text-sm text-gray-600">
                      Accuracy: {currentCard.reviewCount > 0
                        ? Math.round((currentCard.correctCount / currentCard.reviewCount) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Flashcard */}
                <div
                  onClick={() => setFlipped(!flipped)}
                  className="relative bg-white rounded-lg shadow-lg p-12 cursor-pointer min-h-[400px] flex items-center justify-center transition-all hover:shadow-xl"
                  style={{
                    transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.6s'
                  }}
                >
                  <div
                    style={{
                      backfaceVisibility: 'hidden',
                      position: flipped ? 'absolute' : 'relative'
                    }}
                  >
                    <div className="text-center">
                      <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium mb-4">
                        Question
                      </div>
                      <p className="text-2xl text-gray-900">{currentCard.question}</p>
                      <p className="text-sm text-gray-500 mt-6">Click to reveal answer</p>
                    </div>
                  </div>

                  <div
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      position: flipped ? 'relative' : 'absolute'
                    }}
                  >
                    <div className="text-center">
                      <div className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded text-sm font-medium mb-4">
                        Answer
                      </div>
                      <p className="text-2xl text-gray-900">{currentCard.answer}</p>
                      <span className={`inline-block mt-4 px-3 py-1 rounded text-sm ${
                        currentCard.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        currentCard.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {currentCard.difficulty}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={prevCard}
                    disabled={currentIndex === 0}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    Previous
                  </button>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleReview(false)}
                      disabled={!flipped}
                      className="flex items-center px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      Need Review
                    </button>
                    <button
                      onClick={() => handleReview(true)}
                      disabled={!flipped}
                      className="flex items-center px-6 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Got It!
                    </button>
                  </div>

                  <button
                    onClick={nextCard}
                    disabled={currentIndex === flashcards.length - 1}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </button>
                </div>

                {/* Stats */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {currentCard.reviewCount}
                      </p>
                      <p className="text-sm text-gray-600">Times Reviewed</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {currentCard.correctCount}
                      </p>
                      <p className="text-sm text-gray-600">Correct</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {flashcards.filter(f => f.mastered).length}
                      </p>
                      <p className="text-sm text-gray-600">Mastered</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default FlashcardsPage;