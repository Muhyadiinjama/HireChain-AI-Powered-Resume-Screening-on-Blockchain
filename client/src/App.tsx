import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateJob from './pages/CreateJob';
import EditJob from './pages/EditJob';
import UploadResume from './pages/UploadResume';
import Result from './pages/Result';
import Blockchain from './pages/Blockchain';
import JobDetails from './pages/JobDetails';
import Jobs from './pages/Jobs';
import BlockchainExplorer from './pages/BlockchainExplorer';
import Profile from './pages/Profile';
import Privacy from './pages/Privacy';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster position="top-right" reverseOrder={false} />
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-dark-main flex flex-col transition-colors duration-300">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Navigate to="/login" replace />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/blockchain" element={<BlockchainExplorer />} />
                <Route path="/verify/:hash" element={<Blockchain />} />
                <Route path="/privacy" element={<Privacy />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/result/:id" element={<Result />} />
                  <Route path="/job/:id" element={<JobDetails />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['recruiter', 'admin']} />}>
                  <Route path="/create-job" element={<CreateJob />} />
                  <Route path="/edit-job/:id" element={<EditJob />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['candidate']} />}>
                  <Route path="/candidate/upload" element={<UploadResume />} />
                  <Route path="/upload/:jobId" element={<UploadResume />} />
                </Route>
              </Routes>
            </main>
            <footer className="mt-10 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-main transition-colors duration-300">
              <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-12">
                <div className="flex flex-col items-center justify-center gap-3 text-center">
                  <div className="flex flex-wrap items-center justify-center gap-5 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-300">
                    <a href="/" className="hover:text-brand-primary transition-colors">Home</a>
                    <a href="/jobs" className="hover:text-brand-primary transition-colors">Jobs</a>
                    <a href="/blockchain" className="hover:text-brand-primary transition-colors">Blockchain</a>
                    <a href="/privacy" className="hover:text-brand-primary transition-colors">Privacy</a>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                    (c) 2026 HireChain. AI-Powered Resume Screening on Blockchain.
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
