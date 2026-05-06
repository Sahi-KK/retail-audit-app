import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuditStore } from './store/auditStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AuditForm from './pages/AuditForm';
import History from './pages/History';
import ReportDetail from './pages/ReportDetail';
import Stores from './pages/Stores';
import Profile from './pages/Profile';
import ManageStores from './pages/ManageStores';
import Terminology from './pages/Terminology';

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuditStore(state => state.auth);
  if (!auth.auditorId || !auth.auditorName) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#F4F4F6] font-sans">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <AuthGuard>
              <Dashboard />
            </AuthGuard>
          } />
          <Route path="/stores" element={
            <AuthGuard>
              <Stores />
            </AuthGuard>
          } />
          <Route path="/history" element={
            <AuthGuard>
              <History />
            </AuthGuard>
          } />
          <Route path="/profile" element={
            <AuthGuard>
              <Profile />
            </AuthGuard>
          } />
          <Route path="/terminology" element={
            <AuthGuard>
              <Terminology />
            </AuthGuard>
          } />
          <Route path="/manage-stores" element={
            <AuthGuard>
              <ManageStores />
            </AuthGuard>
          } />
          <Route path="/audit-form" element={
            <AuthGuard>
              <AuditForm />
            </AuthGuard>
          } />
          <Route path="/report/:id" element={
            <AuthGuard>
              <ReportDetail />
            </AuthGuard>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
