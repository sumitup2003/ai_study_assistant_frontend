import { useState } from "react";
import Navbar from "../components/Layout/Navbar";
import Sidebar from "../components/Layout/Sidebar";
import UploadNote from "../components/Notes/UploadNote";
import NotesList from "../components/Notes/NotesList";
import { Plus, List } from "lucide-react";

const NotesPage = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    setShowUpload(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  My Notes
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  Manage your study materials
                </p>
              </div>
              <button
                onClick={() => setShowUpload(!showUpload)}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {showUpload ? (
                  <>
                    <List className="w-5 h-5" />
                    <span>View Notes</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Upload Note</span>
                  </>
                )}
              </button>
            </div>

            {showUpload ? (
              <UploadNote onUploadSuccess={handleUploadSuccess} />
            ) : (
              <NotesList refreshTrigger={refreshTrigger} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default NotesPage;
