import { useState, useEffect } from 'react';
import Navbar from '../components/Layout/Navbar';
import Sidebar from '../components/Layout/Sidebar';
import { FileCheck, Loader, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../utils/api';
import toast from 'react-hot-toast';

const SummariesPage = () => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const { data } = await api.get('/notes');
      setNotes(data.notes);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      toast.error('Failed to load notes');
    }
  };

  const fetchSummary = async (noteId) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/summary/${noteId}`);
      setSummary(data.summary);
      const note = notes.find(n => n._id === noteId);
      setSelectedNote(note);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
      toast.error('Failed to load summary');
    } finally {
      setLoading(false);
    }
  };

  const handleNoteSelect = (noteId) => {
    if (noteId) {
      fetchSummary(noteId);
    } else {
      setSummary(null);
      setSelectedNote(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Summaries</h1>
              <p className="text-gray-600">AI-generated summaries of your notes</p>
            </div>

            {/* Note Selector */}
            <div className="mb-6">
              <select
                onChange={(e) => handleNoteSelect(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a note to view summary...</option>
                {notes.map((note) => (
                  <option key={note._id} value={note._id}>
                    {note.title}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : summary ? (
              <div className="space-y-6">
                {/* Summary Card */}
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedNote?.title}
                      </h2>
                      <p className="text-sm text-gray-600">
                        Created on {new Date(summary.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <FileCheck className="w-8 h-8 text-blue-600" />
                  </div>

                  <div className="prose max-w-none">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Summary</h3>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      <ReactMarkdown>{summary.summary}</ReactMarkdown>
                    </div>
                  </div>
                </div>

                {/* Key Points */}
                {summary.keyPoints && summary.keyPoints.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Points</h3>
                    <ul className="space-y-3">
                      {summary.keyPoints.map((point, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                            <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                          </div>
                          <p className="text-gray-700 flex-1">{point}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => {
                      const text = `${summary.title}\n\n${summary.summary}\n\nKey Points:\n${summary.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}`;
                      navigator.clipboard.writeText(text);
                      toast.success('Summary copied to clipboard!');
                    }}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Copy Summary
                  </button>
                  <button
                    onClick={() => {
                      const text = `${summary.title}\n\n${summary.summary}\n\nKey Points:\n${summary.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}`;
                      const blob = new Blob([text], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${selectedNote?.title || 'summary'}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast.success('Summary downloaded!');
                    }}
                    className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Download Summary
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Print Summary
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a note to view its AI-generated summary</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SummariesPage;