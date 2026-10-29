import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'
import Results from './pages/Results'
import OrganizerAuth from './pages/OrganizerAuth'
import OrganizerDashboard from './pages/OrganizerDashboard'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#fafafa] text-zinc-900 flex flex-col selection:bg-zinc-900 selection:text-white">
        <Navbar />
        
        <main className="flex-1 w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:eventId" element={<EventDetail />} />
            <Route path="/events/:eventId/results" element={<Results />} />
            <Route path="/organizer/login" element={<OrganizerAuth mode="login" />} />
            <Route path="/organizer/signup" element={<OrganizerAuth mode="signup" />} />
            <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
