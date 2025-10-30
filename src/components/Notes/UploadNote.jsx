import { useState } from 'react';
import { Upload, Loader, FileText } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { SUBJECTS, MAX_FILE_SIZE } from '../../utils/constants';

const UploadNote = ({ onUploadSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    tags: '',
    content: ''
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file && !formData.content) {
      toast.error('Please upload a file or enter content');
      return;
    }

    setUploading(true);

    try {
      const uploadData = new FormData();
      uploadData.append('title', formData.title);
      uploadData.append('subject', formData.subject);
      uploadData.append('tags', formData.tags);
      
      if (file) {
        uploadData.append('file', file);
      } else {
        uploadData.append('content', formData.content);
      }

      const { data } = await api.post('/notes/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Note uploaded successfully!');
      
      // Reset form
      setFormData({ title: '', subject: '', tags: '', content: '' });
      setFile(null);
      
      if (onUploadSuccess) {
        onUploadSuccess(data.note);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload note');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Upload Study Material</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter note title"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select subject</option>
              {SUBJECTS.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="exam, chapter1, important"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload File (PDF, DOCX, or TXT)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              {file ? (
                <div className="flex items-center justify-center space-x-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <span className="text-sm text-gray-700">{file.name}</span>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, DOCX or TXT (Max 10MB)
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Or Paste Content
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Paste your notes here..."
          />
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {uploading ? (
            <>
              <Loader className="w-5 h-5 mr-2 animate-spin" />
              Uploading & Processing...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 mr-2" />
              Upload Note
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default UploadNote;