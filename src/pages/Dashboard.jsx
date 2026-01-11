'''import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Calendar, TrendingUp, DollarSign, Clock, ChevronLeft, ChevronRight } from 'lucide-react'

function Dashboard({ atendimentos }) {
  const [dataExibicao, setDataExibicao] = useState(new Date())

  const calcularHoras = (checkin, checkout) => {
    if (!checkin || !checkout) return 0
    const [hIn, mIn] = checkin.split(':').map(Number)
    const [hOut, mOut] = checkout.split(':').map(Number)
    const totalMinutos = (hOut * 60 + mOut) - (hIn * 60 + mIn)
    return totalMinutos / 60
  }

  const calcularValorBruto = (atendimento) => {
    return (parseFloat(atendimento.valor_chamado) || 0) + (parseFloat(atendimento.ganhos_adicionais) || 0)
  }

  const calcularValorLiquido = (atendimento) => {
    const bruto = calcularValorBruto(atendimento)
    const despesas = parseFloat(atendimento.despesas_os) || 0
    return bruto - despesas
  }

  const diasComAtendimentos = useMemo(() => {
    const dias = new Set()
    atendimentos.forEach(atendimento => {
      if (atendimento.data_atendimento) {
        dias.add(atendimento.data_atendimento)
      }
    })
    return dias
  }, [atendimentos])

  const dadosMensais = useMemo(() => {
    const anoExibicao = dataExibicao.getFullYear()
    const meses = {}
    for (let i = 1; i <= 12; i++) {
      const mesKey = `${anoExibicao}-${String(i).padStart(2, '0')}`
      meses[mesKey] = {
        mes: new Date(anoExibicao, i - 1).toLocaleString('pt-BR', { month: 'short' }),
        faturamentoBruto: 0,
        despesas: 0,
        faturamentoLiquido: 0
      }
    }
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
  }, [atendimentos, dataExibicao])

  const proximoPagamento = useMemo(() => {
    console.log("Dashboard: Atendimentos recebidos para proximoPagamento:", atendimentos);
    const hoje = new Date().toISOString().split('T')[0];
    const atendimentosPendentes = atendimentos.filter(a => {
      if (!a.data_prevista_pagamento || a.status === 'Pago') return false;
      return a.data_prevista_pagamento >= hoje;
    });
    if (atendimentosPendentes.length === 0) {
      console.log("Dashboard: Nenhum atendimento pendente futuro encontrado para proximoPagamento.");
      return null;
    }
    const proximo = atendimentosPendentes.reduce((maisProximo, atual) => {
      if (!maisProximo) return atual;
      const dataMaisProxima = new Date(maisProximo.data_prevista_pagamento + 'T03:00:00Z');
      const dataAtual = new Date(atual.data_prevista_pagamento + 'T03:00:00Z');
      return dataAtual < dataMaisProxima ? atual : maisProximo;
    }, null);
    if (!proximo) {
      console.log("Dashboard: Nenhum próximo pagamento encontrado após redução em proximoPagamento.");
      return null;
    }
    const valorBruto = calcularValorBruto(proximo);
    const adiantamento = parseFloat(proximo.adiantamento_recebido) || 0;
    const valorAReceber = valorBruto - adiantamento;
    const result = {
      valor: valorAReceber,
      data: proximo.data_prevista_pagamento,
      cliente: proximo.nome_cliente,
      plataforma: proximo.plataforma,
      status: proximo.status
    };
    console.log("Dashboard: Próximo Pagamento calculado:", result);
    return result;
  }, [atendimentos]);

  const estatisticas = useMemo(() => {
    const anoExibicao = dataExibicao.getFullYear()
    const mesExibicao = dataExibicao.getMonth()
    const atendimentosMes = atendimentos.filter(a => {
      if (!a.data_atendimento) return false
      const dataAtendimento = new Date(a.data_atendimento + 'T03:00:00Z')
      return dataAtendimento.getFullYear() === anoExibicao && dataAtendimento.getMonth() === mesExibicao
    })
    const totalBruto = atendimentosMes.reduce((acc, a) => acc + calcularValorBruto(a), 0)
    const totalDespesas = atendimentosMes.reduce((acc, a) => acc + (parseFloat(a.despesas_os) || 0), 0)
    const totalLiquido = totalBruto - totalDespesas
    const totalHoras = atendimentosMes.reduce((acc, a) => acc + calcularHoras(a.checkin, a.checkout), 0)
    return {
      totalAtendimentos: atendimentosMes.length,
      totalBruto,
      totalDespesas,
      totalLiquido,
      totalHoras
    }
  }, [atendimentos, dataExibicao])

  const faturamentoPorPlataforma = useMemo(() => {
    const plataformas = {}
    const atendimentosMes = atendimentos.filter(a => {
      if (!a.data_atendimento) return false
      const dataAtendimento = new Date(a.data_atendimento + 'T03:00:00Z')
      return dataAtendimento.getFullYear() === dataExibicao.getFullYear() && dataAtendimento.getMonth() === dataExibicao.getMonth()
    })
    atendimentosMes.forEach(atendimento => {
      if (!plataformas[atendimento.plataforma]) {
        plataformas[atendimento.plataforma] = 0
      }
      plataformas[atendimento.plataforma] += calcularValorBruto(atendimento)
    })
    return Object.entries(plataformas).map(([plataforma, faturamento]) => ({ plataforma, faturamento }))
  }, [atendimentos, dataExibicao])

  const mudarMes = (incremento) => {
    setDataExibicao(prevDate => {
      const novaData = new Date(prevDate)
      novaData.setMonth(novaData.getMonth() + incremento)
      return novaData
    })
  }

  const renderCalendario = () => {
    const mesAtual = dataExibicao.getMonth()
    const anoAtual = dataExibicao.getFullYear()
    const primeiroDia = new Date(anoAtual, mesAtual, 1).getDay()
    const ultimoDia = new Date(anoAtual, mesAtual + 1, 0).getDate()
    const dias = []
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    for (let i = 0; i < primeiroDia; i++) {
      dias.push(<div key={`empty-${i}`} className="h-10"></div>)
    }
    for (let dia = 1; dia <= ultimoDia; dia++) {
      const dataStr = `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
      const temAtendimento = diasComAtendimentos.has(dataStr)
      const ehHoje = dia === new Date().getDate() && mesAtual === new Date().getMonth() && anoAtual === new Date().getFullYear()
      dias.push(
        <div
          key={dia}
          className={`h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
            ehHoje
              ? 'bg-primary text-primary-foreground'
              : temAtendimento
              ? 'border-2 border-green-500'
              : 'text-foreground hover:bg-accent'
          }`}
        >
          {dia}
        </div>
      )
    }
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <button onClick={() => mudarMes(-1)} className="p-2 rounded-md hover:bg-accent"><ChevronLeft className="w-4 h-4" /></button>
          <h3 className="text-lg font-semibold">{new Date(anoAtual, mesAtual).toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</h3>
          <button onClick={() => mudarMes(1)} className="p-2 rounded-md hover:bg-accent"><ChevronRight className="w-4 h-4" /></button>
        </div>
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
            <div className="w-4 h-4 border-2 border-green-500 rounded"></div>
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
        <p className="mt-1 text-sm text-muted-foreground">Visão geral dos seus atendimentos e faturamento para {new Date(dataExibicao).toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <Link to="/extrato" className="block hover:shadow-lg transition-shadow rounded-lg">
          <Card className="border-l-4 border-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximo Pagamento</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {proximoPagamento ? proximoPagamento.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {proximoPagamento ? `Previsto para ${new Date(proximoPagamento.data + 'T03:00:00Z').toLocaleDateString('pt-BR')} (${proximoPagamento.plataforma})` : 'Nenhum pagamento pendente futuro.'}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/extrato" className="block hover:shadow-lg transition-shadow rounded-lg">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Atendimentos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.totalAtendimentos}</div>
              <p className="text-xs text-muted-foreground">no mês</p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Bruto</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estatisticas.totalBruto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-muted-foreground">no mês</p>
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
            <p className="text-xs text-muted-foreground">no mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Trabalhadas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.totalHoras.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">no mês</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calendário de Atendimentos</CardTitle>
          </CardHeader>
          <CardContent>
            {renderCalendario()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Faturamento por Plataforma</CardTitle>
            <CardDescription>Faturamento bruto por plataforma no mês de {new Date(dataExibicao).toLocaleString('pt-BR', { month: 'long' })}</CardDescription>
          </CardHeader>
          <CardContent>
            {faturamentoPorPlataforma.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={faturamentoPorPlataforma}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="plataforma" />
                  <YAxis />
                  <Tooltip formatter={(value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                  <Legend />
                  <Bar dataKey="faturamento" fill="#8884d8" name="Faturamento" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p>Nenhum faturamento registrado para este mês.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Faturamento Mensal</CardTitle>
            <CardDescription>Comparação de faturamento bruto, despesas e líquido no ano de {dataExibicao.getFullYear()}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dadosMensais}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                <Legend />
                <Line type="monotone" dataKey="faturamentoBruto" stroke="#8884d8" name="Faturamento Bruto" />
                <Line type="monotone" dataKey="despesas" stroke="#82ca9d" name="Despesas" />
                <Line type="monotone" dataKey="faturamentoLiquido" stroke="#ffc658" name="Faturamento Líquido" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evolução do Faturamento Bruto</CardTitle>
            <CardDescription>Comparação mês a mês no ano de {dataExibicao.getFullYear()}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dadosMensais}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                <Legend />
                <Line type="monotone" dataKey="faturamentoBruto" stroke="#8884d8" name="Faturamento Bruto" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
'''
