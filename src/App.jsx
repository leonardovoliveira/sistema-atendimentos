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
      <nav className="bg-background border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-foreground hover:text-blue-500 transition-colors">LVO TI</Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <button
                onClick={toggleDarkMode}
                className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors border-transparent text-muted-foreground hover:border-muted hover:text-foreground"
              >
                {darkMode ? "Light Mode" : "Dark Mode"}
              </button>
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  isActive('/')
                    ? 'border-blue-500 text-foreground'
                    : 'border-transparent text-muted-foreground hover:border-muted hover:text-foreground'
                }`}
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
              <Link
                to="/extrato"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  isActive('/extrato')
                    ? 'border-blue-500 text-foreground'
                    : 'border-transparent text-muted-foreground hover:border-muted hover:text-foreground'
                }`}
              >
                <FileText className="w-4 h-4 mr-2" />
                Extrato de Atendimentos
              </Link>
              <Link
                to="/relatorios"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  isActive('/relatorios')
                    ? 'border-blue-500 text-foreground'
                    : 'border-transparent text-muted-foreground hover:border-muted hover:text-foreground'
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Relatórios Mensais
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <a
              href="https://www.nfse.gov.br/EmissorNacional/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Emitir NF
            </a>
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
      setAtendimentos(JSON.parse(savedData));
    }
  }, [])

  // Salvar dados no localStorage sempre que houver alteração
  useEffect(() => {
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


// Forçando novo deploy
