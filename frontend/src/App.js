import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import authService from './services/authService';
import './App.css';

// Pages
import Home from './pages/Home';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Booking from './pages/Booking';
import Login from './pages/Login';
import Register from './pages/Register';
import MyAppointments from './pages/MyAppointments';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import ManageServices from './pages/admin/ManageServices';
import ManageAppointments from './pages/admin/ManageAppointments';
import Analytics from './pages/admin/Analytics';
import ManageStaff from './pages/admin/ManageStaff';
import ManageCustomers from './pages/admin/ManageCustomers';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import ConsentBanner from './components/ConsentBanner';
import { readUserLocation } from './utils/consent';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(() => readUserLocation());

  useEffect(() => {
    const savedUser = authService.getUser();
    if (savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    authService.setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    authService.logout();
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <Router>
      <div className="app">
        <Header user={user} onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home userLocation={userLocation} />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
            <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />

            {/* Customer routes */}
            {user && user.role === 'customer' && (
              <>
                <Route path="/booking/:serviceId" element={<Booking />} />
                <Route path="/my-appointments" element={<MyAppointments />} />
                <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
              </>
            )}

            {/* Admin routes */}
            {user && user.role === 'admin' && (
              <>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/services" element={<ManageServices />} />
                <Route path="/admin/staff" element={<ManageStaff />} />
                <Route path="/admin/customers" element={<ManageCustomers />} />
                <Route path="/admin/appointments" element={<ManageAppointments />} />
                <Route path="/admin/analytics" element={<Analytics />} />
              </>
            )}

            {/* Staff routes */}
            {user && user.role === 'staff' && (
              <>
                <Route path="/staff/customers" element={<ManageCustomers />} />
              </>
            )}

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <ConsentBanner onLocationChange={setUserLocation} />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
