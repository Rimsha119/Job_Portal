import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import JobFeed from './pages/JobFeed';
import JobDetail from './pages/JobDetail';
import CompanyDash from './pages/CompanyDash';
import Applicants from './pages/Applicants';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/jobs" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/jobs" element={<JobFeed />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['company']}>
                  <CompanyDash />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/jobs/:id/applicants"
              element={
                <ProtectedRoute allowedRoles={['company']}>
                  <Applicants />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/jobs" replace />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
