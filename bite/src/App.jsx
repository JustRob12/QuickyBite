import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from '../src/components/Login'
import Register from '../src/components/Register'
import Dashboard from '../src/components/Dashboard'
import InstallPrompt from '../src/components/InstallPrompt'

function App() {
  return (
    <Router>
      <div className="container">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        <InstallPrompt />
      </div>
    </Router>
  )
}

export default App 