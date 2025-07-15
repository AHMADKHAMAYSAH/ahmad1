import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './App.css'

// Components
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Pages
import HomePage from './pages/HomePage'
import GamesPage from './pages/GamesPage'
import GamePlayer from './pages/GamePlayer'
import ProfilePage from './pages/ProfilePage'
import EarnPointsPage from './pages/EarnPointsPage'
import WithdrawPage from './pages/WithdrawPage'
import ReferralsPage from './pages/ReferralsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ContactPage from './pages/ContactPage'
import AdminDashboard from './pages/AdminDashboard'

// Context
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/games" element={<GamesPage />} />
              <Route path="/games/:gameId" element={<GamePlayer />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/earn-points" element={<EarnPointsPage />} />
              <Route path="/withdraw" element={<WithdrawPage />} />
              <Route path="/referrals" element={<ReferralsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App

