import { BrowserRouter as Router, Link, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Facebook, Github, Instagram, Linkedin } from 'lucide-react';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateJob from './pages/CreateJob';
import EditJob from './pages/EditJob';
import JobApplicantsPage from './pages/JobApplicantsPage';
import CandidateReviewPage from './pages/CandidateReviewPage';
import UploadResume from './pages/UploadResume';
import Result from './pages/Result';
import Blockchain from './pages/Blockchain';
import JobDetails from './pages/JobDetails';
import Jobs from './pages/Jobs';
import BlockchainExplorer from './pages/BlockchainExplorer';
import Profile from './pages/Profile';
import EditProfilePage from './pages/EditProfilePage';
import SettingsPage from './pages/SettingsPage';
import SecurityPage from './pages/SecurityPage';
import Privacy from './pages/Privacy';
import About from './pages/About';
import Contact from './pages/Contact';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

function App() {
  const socialLinks = [
    { label: 'GitHub', href: 'https://github.com/', icon: Github },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/', icon: Linkedin },
    { label: 'Instagram', href: 'https://www.instagram.com/', icon: Instagram },
    { label: 'Facebook', href: 'https://www.facebook.com/', icon: Facebook }
  ];

  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster position="top-right" reverseOrder={false} />
        <Router>
          <ScrollToTop />
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
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/edit" element={<EditProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/security" element={<SecurityPage />} />
                  <Route path="/result/:id" element={<Result />} />
                  <Route path="/job/:id" element={<JobDetails />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['recruiter', 'admin']} />}>
                  <Route path="/create-job" element={<CreateJob />} />
                  <Route path="/edit-job/:id" element={<EditJob />} />
                  <Route path="/jobs/:id/applicants" element={<JobApplicantsPage />} />
                  <Route path="/applications/:id/review" element={<CandidateReviewPage />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['candidate']} />}>
                  <Route path="/candidate/upload" element={<UploadResume />} />
                  <Route path="/upload/:jobId" element={<UploadResume />} />
                </Route>
              </Routes>
            </main>
            <footer className="mt-10 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface transition-colors duration-300">
              <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-12">
                <div className="flex flex-col gap-5 md:grid md:grid-cols-[1fr_auto_1fr] md:items-end">
                  <div className="hidden md:block" />
                  <div className="text-center md:justify-self-center">
                    <div className="flex flex-wrap items-center justify-center gap-5 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      <Link to="/" className="hover:text-brand-primary transition-colors">Home</Link>
                      <Link to="/jobs" className="hover:text-brand-primary transition-colors">Jobs</Link>
                      <Link to="/blockchain" className="hover:text-brand-primary transition-colors">Blockchain</Link>
                      <Link to="/privacy" className="hover:text-brand-primary transition-colors">Privacy</Link>
                      <Link to="/about" className="hover:text-brand-primary transition-colors">About</Link>
                      <Link to="/contact" className="hover:text-brand-primary transition-colors">Contact</Link>
                    </div>
                    <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      © 2026 HireChain. AI-Powered Resume Screening on Blockchain.
                    </p>
                  </div>

                  <div className="flex items-center justify-center md:justify-self-end md:justify-end gap-3">
                    {socialLinks.map(({ label, href, icon: Icon }) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={label}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-main text-gray-500 dark:text-gray-400 hover:text-brand-primary hover:border-brand-primary/30 transition-colors"
                      >
                        <Icon size={18} />
                      </a>
                    ))}
                  </div>
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
