import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Trash2, Eye, Calendar, Tag, Loader } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const NotesList = ({ refreshTrigger }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ subject: '', search: '' });

  useEffect(() => {
    fetchNotes();
  }, [refreshTrigger, filter]);

  const fetchNotes = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.subject) params.append('subject', filter.subject);
      if (filter.search) params.append('search', filter.search);

      const { data } = await api.get(`/notes?${params}`);
      setNotes(data.notes);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      await api.delete(`/notes/${id}`);
      setNotes(notes.filter(note => note._id !== id));
      toast.success('Note deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete note');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search notes..."
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={filter.subject}
          onChange={(e) => setFilter({ ...filter, subject: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Subjects</option>
          {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science'].map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </div>

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No notes found. Upload your first note!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <div
              key={note._id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {note.title}
                  </h3>
                  {note.subject && (
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                      {note.subject}
                    </span>
                  )}
                </div>
                <FileText className="w-5 h-5 text-gray-400" />
              </div>

              {note.tags && note.tags.length > 0 && (
                <div className="flex items-center gap-1 mb-3 flex-wrap">
                  <Tag className="w-4 h-4 text-gray-400" />
                  {note.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(note.createdAt).toLocaleDateString()}
              </div>

              <div className="flex gap-2">
                <Link
                  to={`/notes/${note._id}`}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Link>
                <button
                  onClick={() => handleDelete(note._id)}
                  className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesList;