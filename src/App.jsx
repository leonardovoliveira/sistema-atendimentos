import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Home, FileText, BarChart3, Sun, Moon, Plus, AlertTriangle, X, Menu, ExternalLink } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Extrato from './pages/Extrato'
import Relatorios from './pages/Relatorios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

import './App.css'

const plataformas = ['FINDUP', 'EUNERD', 'QUALLITY', 'NS SUPORTE', 'ONIX SUPORTE', 'CO&BE', 'LVO TI']
const statusOpcoes = [
  'Prox Atendimento',
  'em atendimento',
  'Gerar NF',
  'NF Gerada',
  'NF enviada',
  'Aguardando Pagamento',
  'Pagamento Atrasado',
  'Pago'
]

function Navigation({ toggleDarkMode, darkMode, onNovoChamado }) {
  const location = useLocation()
  const [menuAberto, setMenuAberto] = useState(false)

  const itensNavegacao = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/extrato', label: 'Extrato de Atendimentos', icon: FileText },
    { path: '/relatorios', label: 'Relatórios Mensais', icon: BarChart3 }
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto max-w-7xl px-3 sm:px-5 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-2 sm:h-16">
          <Link to="/" className="shrink-0 text-lg font-bold tracking-tight text-foreground transition-colors hover:text-blue-500 sm:text-xl">
            LVO TI
          </Link>

          <div className="hidden h-full items-center gap-1 lg:flex">
            <button
              onClick={toggleDarkMode}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              title={darkMode ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
              aria-label={darkMode ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            {itensNavegacao.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`inline-flex h-full items-center gap-2 border-b-2 px-2 pt-1 text-sm font-medium transition-colors ${
                  isActive(path)
                    ? 'border-blue-500 text-foreground'
                    : 'border-transparent text-muted-foreground hover:border-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              onClick={onNovoChamado}
              size="sm"
              className="h-9 bg-green-600 px-2.5 text-white hover:bg-green-700 sm:px-3"
              aria-label="Novo chamado"
            >
              <Plus className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Novo Chamado</span>
            </Button>

            <a
              href="https://www.nfse.gov.br/EmissorNacional/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-9 items-center gap-1.5 rounded-md bg-blue-600 px-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 lg:inline-flex"
            >
              Emitir NF
              <ExternalLink className="h-3.5 w-3.5" />
            </a>


            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 lg:hidden"
              onClick={() => setMenuAberto(true)}
              aria-label="Abrir menu de navegação"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {menuAberto && (
        <div className="lg:hidden">
          <button
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setMenuAberto(false)}
            aria-label="Fechar menu de navegação"
          />
          <aside className="fixed inset-y-0 right-0 z-[60] flex w-[86vw] max-w-sm flex-col border-l border-border bg-background shadow-2xl animate-in slide-in-from-right duration-200" aria-label="Menu de navegação">
            <div className="flex items-start justify-between border-b border-border px-5 py-5">
              <div>
                <p className="text-xl font-semibold">LVO TI</p>
                <p className="mt-1 text-sm text-muted-foreground">Navegação e atalhos</p>
              </div>
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setMenuAberto(false)} aria-label="Fechar menu">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-4">
              {itensNavegacao.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMenuAberto(false)}
                  className={`flex min-h-12 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
                    isActive(path) ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              ))}
              <div className="my-2 border-t border-border" />
              <button
                onClick={toggleDarkMode}
                className="flex min-h-12 items-center gap-3 rounded-lg px-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                {darkMode ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
              </button>
              <a
                href="https://www.nfse.gov.br/EmissorNacional/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-12 items-center gap-3 rounded-lg px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                <ExternalLink className="h-5 w-5" />
                Emitir Nota Fiscal
              </a>
            </div>
          </aside>
        </div>
      )}
    </nav>
  )
}

function App() {
  const [atendimentos, setAtendimentos] = useState([])
  const [darkMode, setDarkMode] = useState(true)
  const [isModalNovoAberto, setIsModalNovoAberto] = useState(false)
  const [notificacaoAtraso, setNotificacaoAtraso] = useState(0)
  const [novoAtendimento, setNovoAtendimento] = useState({
    data_atendimento: '',
    checkin: '',
    checkout: '',
    numero_os: '',
    nome_cliente: '',
    plataforma: plataformas[0],
    data_prevista_pagamento: '',
    valor_chamado: '0',
    ganhos_adicionais: '0',
    despesas_os: '0',
    adiantamento_recebido: '0',
    status: 'Prox Atendimento'
  })

  // Carregar tema do localStorage ao iniciar
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme !== null) {
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

  // Verificação automática de pagamentos atrasados
  useEffect(() => {
    if (atendimentos.length === 0) return;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const hojeStr = hoje.toISOString().split('T')[0];
    
    let novosAtrasos = 0;
    const novosAtendimentos = atendimentos.map(att => {
      if (att.data_prevista_pagamento && 
          att.data_prevista_pagamento < hojeStr && 
          att.status !== 'Pago' && 
          att.status !== 'Pagamento Atrasado') {
        novosAtrasos++;
        return { ...att, status: 'Pagamento Atrasado' };
      }
      return att;
    });

    if (novosAtrasos > 0) {
      setAtendimentos(novosAtendimentos);
      setNotificacaoAtraso(novosAtrasos);
    }
  }, [atendimentos.length]); // Executa quando a lista é carregada ou alterada em tamanho

  const handleAdicionar = () => {
    if (!novoAtendimento.data_atendimento || !novoAtendimento.numero_os) {
      alert('Por favor, preencha pelo menos a data e o número da OS')
      return
    }
    const atendimento = { ...novoAtendimento, id: Date.now().toString() }
    setAtendimentos([...atendimentos, atendimento])
    setNovoAtendimento({
      data_atendimento: '', checkin: '', checkout: '', numero_os: '', nome_cliente: '',
      plataforma: plataformas[0], data_prevista_pagamento: '', valor_chamado: '0',
      ganhos_adicionais: '0', despesas_os: '0', adiantamento_recebido: '0', status: 'Prox Atendimento'
    });
    setIsModalNovoAberto(false);
  }

  return (
    <Router>
      <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50"}`}>
        <Navigation 
          toggleDarkMode={toggleDarkMode} 
          darkMode={darkMode} 
          onNovoChamado={() => setIsModalNovoAberto(true)} 
        />

        {notificacaoAtraso > 0 && (
          <div className="flex items-start justify-between gap-3 bg-red-600 px-4 py-3 text-white shadow-lg animate-in fade-in slide-in-from-top duration-500 sm:items-center sm:px-6">
            <div className="flex min-w-0 items-start gap-3 sm:items-center">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 animate-pulse sm:mt-0 sm:h-6 sm:w-6" />
              <div className="min-w-0">
                <p className="font-bold">Atenção: Pagamentos Vencidos!</p>
                <p className="text-sm opacity-90">Identificamos {notificacaoAtraso} novo(s) chamado(s) que passaram da data de pagamento e foram movidos para "Atrasado".</p>
              </div>
            </div>
            <button
              onClick={() => setNotificacaoAtraso(0)}
              className="shrink-0 rounded-full p-1 transition-colors hover:bg-white/20"
              aria-label="Fechar notificação"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        
        <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Dashboard atendimentos={atendimentos} />} />
            <Route path="/extrato" element={<Extrato atendimentos={atendimentos} setAtendimentos={setAtendimentos} />} />
            <Route path="/relatorios" element={<Relatorios atendimentos={atendimentos} />} />
          </Routes>
        </main>

        {/* Modal Global de Novo Chamado */}
        <Dialog open={isModalNovoAberto} onOpenChange={setIsModalNovoAberto}>
          <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto sm:w-full">
            <DialogHeader>
              <DialogTitle>Registrar Novo Chamado</DialogTitle>
              <DialogDescription>Preencha as informações abaixo para cadastrar um novo atendimento no sistema.</DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Data do Atendimento</Label>
                <Input type="date" value={novoAtendimento.data_atendimento} onChange={(e) => setNovoAtendimento({ ...novoAtendimento, data_atendimento: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Número da OS</Label>
                <Input placeholder="Ex: 123456" value={novoAtendimento.numero_os} onChange={(e) => setNovoAtendimento({ ...novoAtendimento, numero_os: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Nome do Cliente</Label>
                <Input placeholder="Nome do cliente ou local" value={novoAtendimento.nome_cliente} onChange={(e) => setNovoAtendimento({ ...novoAtendimento, nome_cliente: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Plataforma</Label>
                <Select value={novoAtendimento.plataforma} onValueChange={(v) => setNovoAtendimento({ ...novoAtendimento, plataforma: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{plataformas.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Check-in</Label>
                  <Input type="time" value={novoAtendimento.checkin} onChange={(e) => setNovoAtendimento({ ...novoAtendimento, checkin: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Check-out</Label>
                  <Input type="time" value={novoAtendimento.checkout} onChange={(e) => setNovoAtendimento({ ...novoAtendimento, checkout: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Previsão de Pagamento</Label>
                <Input type="date" value={novoAtendimento.data_prevista_pagamento} onChange={(e) => setNovoAtendimento({ ...novoAtendimento, data_prevista_pagamento: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Valor Chamado</Label>
                  <Input type="number" value={novoAtendimento.valor_chamado} onChange={(e) => setNovoAtendimento({ ...novoAtendimento, valor_chamado: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Ganhos Extras</Label>
                  <Input type="number" value={novoAtendimento.ganhos_adicionais} onChange={(e) => setNovoAtendimento({ ...novoAtendimento, ganhos_adicionais: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Despesas OS</Label>
                  <Input type="number" value={novoAtendimento.despesas_os} onChange={(e) => setNovoAtendimento({ ...novoAtendimento, despesas_os: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Adiantamento</Label>
                  <Input type="number" value={novoAtendimento.adiantamento_recebido} onChange={(e) => setNovoAtendimento({ ...novoAtendimento, adiantamento_recebido: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Status Inicial</Label>
                <Select value={novoAtendimento.status} onValueChange={(v) => setNovoAtendimento({ ...novoAtendimento, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{statusOpcoes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-0">
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => setIsModalNovoAberto(false)}>Cancelar</Button>
              <Button onClick={handleAdicionar} className="w-full bg-green-600 text-white hover:bg-green-700 sm:w-auto">Salvar Atendimento</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Router>
  )
}

export default App
