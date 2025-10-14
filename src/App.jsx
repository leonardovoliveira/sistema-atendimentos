import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Home, FileText, BarChart3 } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Extrato from './pages/Extrato'
import Relatorios from './pages/Relatorios'
import './App.css'

function Navigation({ toggleDarkMode, darkMode }) {
  const location = useLocation()
  
  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Sistema de Atendimentos</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <button
                onClick={toggleDarkMode}
                className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
              >
                {darkMode ? "Light Mode" : "Dark Mode"}
              </button>
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  isActive('/')
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
              <Link
                to="/extrato"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  isActive('/extrato')
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <FileText className="w-4 h-4 mr-2" />
                Extrato de Atendimentos
              </Link>
              <Link
                to="/relatorios"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  isActive('/relatorios')
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Relatórios Mensais
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

function App() {
  const [atendimentos, setAtendimentos] = useState([])
  const [darkMode, setDarkMode] = useState(false)

  // Carregar tema do localStorage ao iniciar
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setDarkMode(JSON.parse(savedTheme))
    }
  }, [])

  // Salvar tema no localStorage sempre que houver alteração
  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  // Carregar dados do localStorage ao iniciar
  useEffect(() => {
    const savedData = localStorage.getItem('atendimentos')
    if (savedData) {
      setAtendimentos(JSON.parse(savedData))
    }
  }, [])

  // Salvar dados no localStorage sempre que houver alteração
  useEffect(() => {    console.log("Salvando no localStorage:", atendimentos);
    localStorage.setItem("atendimentos", JSON.stringify(atendimentos));
  }, [atendimentos])

  return (
    <Router>
      <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50"}`}>
        <Navigation toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Dashboard atendimentos={atendimentos} />} />
            <Route path="/extrato" element={<Extrato atendimentos={atendimentos} setAtendimentos={setAtendimentos} />} />
            <Route path="/relatorios" element={<Relatorios atendimentos={atendimentos} />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

