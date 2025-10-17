import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Calendar, TrendingUp, DollarSign, Clock } from 'lucide-react'

function Dashboard({ atendimentos }) {
  // Função para calcular horas trabalhadas
  const calcularHoras = (checkin, checkout) => {
    if (!checkin || !checkout) return 0
    const [hIn, mIn] = checkin.split(':').map(Number)
    const [hOut, mOut] = checkout.split(':').map(Number)
    const totalMinutos = (hOut * 60 + mOut) - (hIn * 60 + mIn)
    return totalMinutos / 60
  }

  // Função para calcular valor bruto
  const calcularValorBruto = (atendimento) => {
    return (parseFloat(atendimento.valor_chamado) || 0) + (parseFloat(atendimento.ganhos_adicionais) || 0)
  }

  // Função para calcular valor líquido
  const calcularValorLiquido = (atendimento) => {
    const bruto = calcularValorBruto(atendimento)
    const despesas = parseFloat(atendimento.despesas_os) || 0
    return bruto - despesas
  }

  // Processar dados para o calendário
  const diasComAtendimentos = useMemo(() => {
    const dias = new Set()
    atendimentos.forEach(atendimento => {
      if (atendimento.data_atendimento) {
        dias.add(atendimento.data_atendimento)
      }
    })
    return dias
  }, [atendimentos])

  // Processar dados para gráficos mensais
  const dadosMensais = useMemo(() => {
    const anoAtual = new Date().getFullYear()
    const meses = {}
    
    // Inicializar todos os meses do ano atual
    for (let i = 1; i <= 12; i++) {
      const mesKey = `${anoAtual}-${String(i).padStart(2, '0')}`
      meses[mesKey] = {
        mes: new Date(anoAtual, i - 1).toLocaleString('pt-BR', { month: 'short' }),
        faturamentoBruto: 0,
        despesas: 0,
        faturamentoLiquido: 0
      }
    }

    // Processar atendimentos
    atendimentos.forEach(atendimento => {
      if (atendimento.data_atendimento) {
        const mesKey = atendimento.data_atendimento.substring(0, 7)
        if (meses[mesKey]) {
          const bruto = calcularValorBruto(atendimento)
          const despesas = parseFloat(atendimento.despesas_os) || 0
          const liquido = calcularValorLiquido(atendimento)
          
          meses[mesKey].faturamentoBruto += bruto
          meses[mesKey].despesas += despesas
          meses[mesKey].faturamentoLiquido += liquido
        }
      }
    })

    return Object.values(meses)
  }, [atendimentos])

  // Calcular estatísticas gerais
  const estatisticas = useMemo(() => {
    const anoAtual = new Date().getFullYear()
    const atendimentosAnoAtual = atendimentos.filter(a => 
      a.data_atendimento && a.data_atendimento.startsWith(String(anoAtual))
    )

    const totalBruto = atendimentosAnoAtual.reduce((acc, a) => acc + calcularValorBruto(a), 0)
    const totalDespesas = atendimentosAnoAtual.reduce((acc, a) => acc + (parseFloat(a.despesas_os) || 0), 0)
    const totalLiquido = totalBruto - totalDespesas
    const totalHoras = atendimentosAnoAtual.reduce((acc, a) => acc + calcularHoras(a.checkin, a.checkout), 0)

    return {
      totalAtendimentos: atendimentosAnoAtual.length,
      totalBruto,
      totalDespesas,
      totalLiquido,
      totalHoras
    }
  }, [atendimentos])

  // Renderizar calendário simples
  const renderCalendario = () => {
    const hoje = new Date()
    const mesAtual = hoje.getMonth()
    const anoAtual = hoje.getFullYear()
    
    const primeiroDia = new Date(anoAtual, mesAtual, 1).getDay()
    const ultimoDia = new Date(anoAtual, mesAtual + 1, 0).getDate()
    
    const dias = []
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    
    // Adicionar dias vazios antes do primeiro dia
    for (let i = 0; i < primeiroDia; i++) {
      dias.push(<div key={`empty-${i}`} className="h-10"></div>)
    }
    
    // Adicionar dias do mês
    for (let dia = 1; dia <= ultimoDia; dia++) {
      const dataStr = `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
      const temAtendimento = diasComAtendimentos.has(dataStr)
      const ehHoje = dia === hoje.getDate()
      
      dias.push(
        <div
          key={dia}
          className={`h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
            ehHoje
              ? 'bg-primary text-primary-foreground'
              : temAtendimento
              ? 'bg-green-100/10 text-green-400 hover:bg-green-100/20'
              : 'text-foreground hover:bg-accent'
          }`
        >
          {dia}
        </div>
      )
    }
    
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {diasSemana.map(dia => (
            <div key={dia} className="text-center text-xs font-semibold text-muted-foreground">
              {dia}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {dias}
        </div>
        <div className="flex items-center justify-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary rounded"></div>
            <span className="text-muted-foreground">Hoje</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100/10 border border-green-400/50 rounded"></div>
            <span className="text-muted-foreground">Com atendimento</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
        <p className="mt-1 text-sm text-muted-foreground">Visão geral dos seus atendimentos e faturamento</p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Atendimentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.totalAtendimentos}</div>
            <p className="text-xs text-muted-foreground">no ano atual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Bruto</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estatisticas.totalBruto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-muted-foreground">no ano atual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Líquido</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estatisticas.totalLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-muted-foreground">no ano atual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Trabalhadas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.totalHoras.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">no ano atual</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Calendário */}
        <Card>
          <CardHeader>
            <CardTitle>Calendário de Atendimentos</CardTitle>
            <CardDescription>
              {new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderCalendario()}
          </CardContent>
        </Card>

        {/* Gráfico de Faturamento Mensal */}
        <Card>
          <CardHeader>
            <CardTitle>Faturamento Mensal</CardTitle>
            <CardDescription>Comparação de faturamento bruto, despesas e líquido</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosMensais}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                />
                <Legend />
                <Bar dataKey="faturamentoBruto" fill="#3b82f6" name="Faturamento Bruto" />
                <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
                <Bar dataKey="faturamentoLiquido" fill="#10b981" name="Faturamento Líquido" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Evolução do Faturamento Bruto */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução do Faturamento Bruto</CardTitle>
          <CardDescription>Comparação mês a mês ao longo do ano</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dadosMensais}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip 
                formatter={(value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="faturamentoBruto" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Faturamento Bruto"
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard

