import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, Loader } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import Navbar from '../Layout/Navbar';
import Sidebar from '../Layout/Sidebar';

const NoteViewer = () => {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNote();
  }, [id]);

  const fetchNote = async () => {
    try {
      const { data } = await api.get(`/notes/${id}`);
      setNote(data.note);
    } catch (error) {
      console.error('Failed to fetch note:', error);
      toast.error('Failed to load note');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <div className="flex-1 flex items-center justify-center">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-600">Note not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <Link
              to="/notes"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Notes
            </Link>

            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {note.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(note.createdAt).toLocaleDateString()}
                    </div>
                    {note.subject && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {note.subject}
                      </span>
                    )}
                  </div>
                </div>
                <FileText className="w-8 h-8 text-gray-400" />
              </div>

              {note.tags && note.tags.length > 0 && (
                <div className="flex gap-2 mb-6">
                  {note.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {note.content}
                </div>
              </div>

              {note.metadata && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Metadata</h3>
                  <div className="flex gap-4 text-sm text-gray-600">
                    {note.metadata.wordCount && (
                      <span>Words: {note.metadata.wordCount}</span>
                    )}
                    {note.metadata.pageCount && (
                      <span>Pages: {note.metadata.pageCount}</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to={`/chat?noteId=${note._id}`}
                className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Ask Questions
              </Link>
              <Link
                to={`/flashcards?noteId=${note._id}`}
                className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Generate Flashcards
              </Link>
              <Link
                to={`/quiz?noteId=${note._id}`}
                className="flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Create Quiz
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NoteViewer;