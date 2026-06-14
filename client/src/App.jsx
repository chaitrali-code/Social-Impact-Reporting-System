import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectUpload from './pages/ProjectUpload';
import ProjectDetail from './pages/ProjectDetail';
import ReportGenerator from './pages/ReportGenerator';
import SocialMediaCreator from './pages/SocialMediaCreator';
import SDGMapping from './pages/SDGMapping';
import ImpactVisualization from './pages/ImpactVisualization';
import SmartCalendar from './pages/SmartCalender';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/new" element={<ProjectUpload />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/reports" element={<ReportGenerator />} />
              <Route path="/social-media" element={<SocialMediaCreator />} />
              <Route path="/sdg-mapping" element={<SDGMapping />} />
              <Route path="/impact" element={<ImpactVisualization />} />
              <Route path="/smart-calendar" element={<SmartCalendar />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
