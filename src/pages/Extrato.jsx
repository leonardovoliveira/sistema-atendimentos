import { useState, useEffect, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react'

// Função para calcular horas trabalhadas
const calcularHoras = (checkin, checkout) => {
  if (!checkin || !checkout) return 0
  const [hIn, mIn] = checkin.split(':').map(Number)
  const [hOut, mOut] = checkout.split(':').map(Number)
  const totalMinutos = (hOut * 60 + mOut) - (hIn * 60 + mIn)
  return (totalMinutos / 60).toFixed(2)
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

const plataformas = ['FINDUP', 'EUNERD', 'QUALLITY', 'NS SUPORTE', 'ONIX SUPORTE', 'CO&BE', 'LVO TI']
const statusOpcoes = [
  'Prox Atendimento',
  'em atendimento',
  'Gerar NF',
  'NF Gerada',
  'NF enviada',
  'Aguardando Pagamento',
  'Pago'
]

// Componente de linha da tabela para gerenciar o estado de edição individualmente
const AtendimentoRow = ({ atendimento, handleSalvarEdicao, handleExcluir, editandoId, setEditandoId }) => {
  const dataAtendimentoFormatada = atendimento.data_atendimento ? new Date(atendimento.data_atendimento + 'T03:00:00Z').toLocaleDateString('pt-BR') : '';
  const dataPrevistaPagamentoFormatada = atendimento.data_prevista_pagamento ? new Date(atendimento.data_prevista_pagamento + 'T03:00:00Z').toLocaleDateString('pt-BR') : '-';
  const isEditando = editandoId === atendimento.id
  const [atendimentoEditado, setAtendimentoEditado] = useState(atendimento)

  // Efeito para atualizar o estado interno quando o atendimento externo muda (ex: após salvar)
  useEffect(() => {
    setAtendimentoEditado(atendimento)
  }, [atendimento])

  if (isEditando) {
    return (
      <tr key={atendimento.id} className="bg-accent">
        <td className="px-3 py-2">
          <Input
            type="date"
            value={atendimentoEditado.data_atendimento}
            onChange={(e) => setAtendimentoEditado({ ...atendimentoEditado, data_atendimento: e.target.value })}
            className="w-full text-sm"
          />
        </td>
        <td className="px-3 py-2">
          <Input
            type="time"
            value={atendimentoEditado.checkin}
            onChange={(e) => setAtendimentoEditado({ ...atendimentoEditado, checkin: e.target.value })}
            className="w-full text-sm"
          />
        </td>
        <td className="px-3 py-2">
          <Input
            type="time"
            value={atendimentoEditado.checkout}
            onChange={(e) => setAtendimentoEditado({ ...atendimentoEditado, checkout: e.target.value })}
            className="w-full text-sm"
          />
        </td>
        <td className="px-3 py-2">
          <span className="text-sm font-medium">
            {calcularHoras(atendimentoEditado.checkin, atendimentoEditado.checkout)}h
          </span>
        </td>
        <td className="px-3 py-2">
          <Input
            value={atendimentoEditado.numero_os}
            onChange={(e) => setAtendimentoEditado({ ...atendimentoEditado, numero_os: e.target.value })}
            className="w-full text-sm"
          />
        </td>
        <td className="px-3 py-2">
          <Input
            value={atendimentoEditado.nome_cliente}
            onChange={(e) => setAtendimentoEditado({ ...atendimentoEditado, nome_cliente: e.target.value })}
            className="w-full text-sm"
          />
        </td>
        <td className="px-3 py-2">
          <Select
            value={atendimentoEditado.plataforma}
            onValueChange={(value) => setAtendimentoEditado({ ...atendimentoEditado, plataforma: value })}
          >
            <SelectTrigger className="w-full text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {plataformas.map(p => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </td>
        <td className="px-3 py-2">
          <Input
            type="date"
            value={atendimentoEditado.data_prevista_pagamento}
            onChange={(e) => setAtendimentoEditado({ ...atendimentoEditado, data_prevista_pagamento: e.target.value })}
            className="w-full text-sm"
          />
        </td>
        <td className="px-3 py-2">
          <Input
            type="number"
            step="0.01"
            value={atendimentoEditado.valor_chamado}
            onChange={(e) => setAtendimentoEditado({ ...atendimentoEditado, valor_chamado: e.target.value })}
            className="w-full text-sm"
          />
        </td>
        <td className="px-3 py-2">
          <Input
            type="number"
            step="0.01"
            value={atendimentoEditado.ganhos_adicionais}
            onChange={(e) => setAtendimentoEditado({ ...atendimentoEditado, ganhos_adicionais: e.target.value })}
            className="w-full text-sm"
          />
        </td>
        <td className="px-3 py-2">
          <Input
            type="number"
            step="0.01"
            value={atendimentoEditado.despesas_os}
            onChange={(e) => setAtendimentoEditado({ ...atendimentoEditado, despesas_os: e.target.value })}
            className="w-full text-sm"
          />
        </td>
        <td className="px-3 py-2">
          <Input
            type="number"
            step="0.01"
            value={atendimentoEditado.adiantamento_recebido}
            onChange={(e) => setAtendimentoEditado({ ...atendimentoEditado, adiantamento_recebido: e.target.value })}
            className="w-full text-sm"
          />
        </td>
        <td className="px-3 py-2">
          <span className="text-sm font-medium">
            {calcularValorBruto(atendimentoEditado).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </td>
        <td className="px-3 py-2">
          <span className="text-sm font-medium">
            {calcularValorLiquido(atendimentoEditado).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </td>
        <td className="px-3 py-2">
          <Select
            value={atendimentoEditado.status}
            onValueChange={(value) => setAtendimentoEditado({ ...atendimentoEditado, status: value })}
          >
            <SelectTrigger className="w-full text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOpcoes.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </td>
        <td className="px-3 py-2">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => handleSalvarEdicao(atendimento.id, atendimentoEditado)}
            >
              <Save className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditandoId(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr key={atendimento.id} className="hover:bg-accent transition-colors">
      <td className="px-3 py-2 text-sm">{dataAtendimentoFormatada}</td>
      <td className="px-3 py-2 text-sm">{atendimento.checkin}</td>
      <td className="px-3 py-2 text-sm">{atendimento.checkout}</td>
      <td className="px-3 py-2 text-sm font-medium">
        {calcularHoras(atendimento.checkin, atendimento.checkout)}h
      </td>
      <td className="px-3 py-2 text-sm">{atendimento.numero_os}</td>
      <td className="px-3 py-2 text-sm">{atendimento.nome_cliente}</td>
      <td className="px-3 py-2 text-sm">
        <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
          {atendimento.plataforma}
        </span>
      </td>
      <td className="px-3 py-2 text-sm">
          {dataPrevistaPagamentoFormatada}
      </td>
      <td className="px-3 py-2 text-sm">
        {parseFloat(atendimento.valor_chamado || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      </td>
      <td className="px-3 py-2 text-sm">
        {parseFloat(atendimento.ganhos_adicionais || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      </td>
      <td className="px-3 py-2 text-sm">
        {parseFloat(atendimento.despesas_os || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      </td>
      <td className="px-3 py-2 text-sm">
        {parseFloat(atendimento.adiantamento_recebido || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      </td>
      <td className="px-3 py-2 text-sm font-medium">
        {calcularValorBruto(atendimento).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      </td>
      <td className="px-3 py-2 text-sm font-medium">
        {calcularValorLiquido(atendimento).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      </td>
      <td className="px-3 py-2 text-sm">
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          atendimento.status === 'Pago' ? 'bg-green-100/10 text-green-400' :
          atendimento.status === 'Aguardando Pagamento' ? 'bg-yellow-100/10 text-yellow-400' :
          'bg-muted text-muted-foreground'
        }`}>
          {atendimento.status}
        </span>
      </td>
      <td className="px-3 py-2">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditandoId(atendimento.id)}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleExcluir(atendimento.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  )
}

function Extrato({ atendimentos, setAtendimentos }) {
  const [editandoId, setEditandoId] = useState(null);
  const [filtroMes, setFiltroMes] = useState('');
  const [filtroPlataforma, setFiltroPlataforma] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [novoAtendimento, setNovoAtendimento] = useState({
    data_atendimento: '',
    checkin: '',
    checkout: '',
    numero_os: '',
    nome_cliente: '',
    plataforma: '',
    data_prevista_pagamento: '',
    valor_chamado: '',
    ganhos_adicionais: '',
    despesas_os: '',
    adiantamento_recebido: '',
    status: 'Prox Atendimento'
  })

  // Adicionar novo atendimento
  const handleAdicionar = () => {
    if (!novoAtendimento.data_atendimento || !novoAtendimento.numero_os) {
      alert('Por favor, preencha pelo menos a data e o número da OS')
      return
    }

    const atendimento = {
      ...novoAtendimento,
      id: Date.now().toString()
    }

    setAtendimentos([...atendimentos, atendimento])
    setNovoAtendimento({
      id: null,
      data_atendimento: '',
      checkin: '',
      checkout: '',
      numero_os: '',
      nome_cliente: '',
      plataforma: '',
      data_prevista_pagamento: '',
      valor_chamado: '',
      ganhos_adicionais: '',
      despesas_os: '',
      adiantamento_recebido: '',
      status: 'Prox Atendimento',
    });
  }

  const meses = [
    { value: '', label: 'Todos os Meses' },
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];

  const plataformasComTodos = [{ value: '', label: 'Todas as Plataformas' }, ...plataformas.map(p => ({ value: p, label: p }))];
  const statusComTodos = [{ value: '', label: 'Todos os Status' }, ...statusOpcoes.map(s => ({ value: s, label: s }))];

  const atendimentosFiltrados = useMemo(() => {
    return atendimentos.filter(atendimento => {
      const dataAtendimento = new Date(atendimento.data_atendimento + 'T03:00:00Z'); // Usar UTC para evitar problemas de fuso horário
      const mesAtendimento = (dataAtendimento.getMonth() + 1).toString().padStart(2, '0');

      const mesCorresponde = filtroMes === '' || mesAtendimento === filtroMes;
      const plataformaCorresponde = filtroPlataforma === '' || atendimento.plataforma === filtroPlataforma;
      const statusCorresponde = filtroStatus === '' || atendimento.status === filtroStatus;

      return mesCorresponde && plataformaCorresponde && statusCorresponde;
    });
  }, [atendimentos, filtroMes, filtroPlataforma, filtroStatus]);
    return atendimentos.filter(atendimento => {
      const dataAtendimento = new Date(atendimento.data_atendimento + 'T00:00:00')
      const mesAtendimento = (dataAtendimento.getMonth() + 1).toString().padStart(2, '0')

      const mesCorresponde = filtroMes === '' || mesAtendimento === filtroMes
      const plataformaCorresponde = filtroPlataforma === '' || atendimento.plataforma === filtroPlataforma
      const statusCorresponde = filtroStatus === '' || atendimento.status === filtroStatus

      return mesCorresponde && plataformaCorresponde && statusCorresponde
    })
  }, [atendimentos, filtroMes, filtroPlataforma, filtroStatus]) [
    { value: '', label: 'Todos os Meses' },
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ]

  const plataformasComTodos = [{ value: '', label: 'Todas as Plataformas' }, ...plataformas.map(p => ({ value: p, label: p }))]
  const statusComTodos = [{ value: '', label: 'Todos os Status' }, ...statusOpcoes.map(s => ({ value: s, label: s }))]

  const atendimentosFiltrados = useMemo(() => {
    return atendimentos.filter(atendimento => {
      const dataAtendimento = new Date(atendimento.data_atendimento + 'T00:00:00')
      const mesAtendimento = (dataAtendimento.getMonth() + 1).toString().padStart(2, '0')

      const mesCorresponde = filtroMes === '' || mesAtendimento === filtroMes
      const plataformaCorresponde = filtroPlataforma === '' || atendimento.plataforma === filtroPlataforma
      const statusCorresponde = filtroStatus === '' || atendimento.status === filtroStatus

      return mesCorresponde && plataformaCorresponde && statusCorresponde
    })
  }, [atendimentos, filtroMes, filtroPlataforma, filtroStatus])

  // Salvar edição
  const handleSalvarEdicao = (id, atendimentoEditado) => {
    setAtendimentos(atendimentos.map(a => a.id === id ? atendimentoEditado : a))
    setEditandoId(null)
  }

  // Excluir atendimento
  const handleExcluir = (id) => {
    if (confirm('Tem certeza que deseja excluir este atendimento?')) {
      setAtendimentos(atendimentos.filter(a => a.id !== id))
    }
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Extrato de Atendimentos</h2>
        <p className="mt-1 text-sm text-muted-foreground">Adicione, edite e visualize todos os seus atendimentos</p>>
      </div>

      {/* Formulário de novo atendimento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Novo Atendimento
          </CardTitle>
          <CardDescription>Adicione um novo atendimento ao sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-foreground">
            <div>
              <Label htmlFor="data_atendimento">Data do Atendimento *</Label>
              <Input
                id="data_atendimento"
                type="date"
                value={novoAtendimento.data_atendimento}
                onChange={(e) => setNovoAtendimento({ ...novoAtendimento, data_atendimento: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="checkin">Check-in</Label>
              <Input
                id="checkin"
                type="time"
                value={novoAtendimento.checkin}
                onChange={(e) => setNovoAtendimento({ ...novoAtendimento, checkin: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="checkout">Check-out</Label>
              <Input
                id="checkout"
                type="time"
                value={novoAtendimento.checkout}
                onChange={(e) => setNovoAtendimento({ ...novoAtendimento, checkout: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="numero_os">Número da OS *</Label>
              <Input
                id="numero_os"
                value={novoAtendimento.numero_os}
                onChange={(e) => setNovoAtendimento({ ...novoAtendimento, numero_os: e.target.value })}
                placeholder="Ex: OS-2024-001"
              />
            </div>

            <div>
              <Label htmlFor="nome_cliente">Nome do Cliente</Label>
              <Input
                id="nome_cliente"
                value={novoAtendimento.nome_cliente}
                onChange={(e) => setNovoAtendimento({ ...novoAtendimento, nome_cliente: e.target.value })}
                placeholder="Nome do cliente final"
              />
            </div>

            <div>
              <Label htmlFor="plataforma">Plataforma</Label>
              <Select
                value={novoAtendimento.plataforma}
                onValueChange={(value) => setNovoAtendimento({ ...novoAtendimento, plataforma: value })}
              >
                <SelectTrigger id="plataforma">
                  <SelectValue placeholder="Selecione a plataforma" />
                </SelectTrigger>
                <SelectContent>
                  {plataformas.map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="data_prevista_pagamento">Data Prevista do Pagamento</Label>
              <Input
                id="data_prevista_pagamento"
                type="date"
                value={novoAtendimento.data_prevista_pagamento}
                onChange={(e) => setNovoAtendimento({ ...novoAtendimento, data_prevista_pagamento: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="valor_chamado">Valor do Chamado (R$)</Label>
              <Input
                id="valor_chamado"
                type="number"
                step="0.01"
                value={novoAtendimento.valor_chamado}
                onChange={(e) => setNovoAtendimento({ ...novoAtendimento, valor_chamado: e.target.value })}
                placeholder="0,00"
              />
            </div>

            <div>
              <Label htmlFor="ganhos_adicionais">Ganhos Adicionais (R$)</Label>
              <Input
                id="ganhos_adicionais"
                type="number"
                step="0.01"
                value={novoAtendimento.ganhos_adicionais}
                onChange={(e) => setNovoAtendimento({ ...novoAtendimento, ganhos_adicionais: e.target.value })}
                placeholder="0,00"
              />
            </div>

            <div>
              <Label htmlFor="despesas_os">Despesas da OS (R$)</Label>
              <Input
                id="despesas_os"
                type="number"
                step="0.01"
                value={novoAtendimento.despesas_os}
                onChange={(e) => setNovoAtendimento({ ...novoAtendimento, despesas_os: e.target.value })}
                placeholder="0,00"
              />
            </div>

            <div>
              <Label htmlFor="adiantamento_recebido">Adiantamento Recebido (R$)</Label>
              <Input
                id="adiantamento_recebido"
                type="number"
                step="0.01"
                value={novoAtendimento.adiantamento_recebido}
                onChange={(e) => setNovoAtendimento({ ...novoAtendimento, adiantamento_recebido: e.target.value })}
                placeholder="0,00"
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={novoAtendimento.status}
                onValueChange={(value) => setNovoAtendimento({ ...novoAtendimento, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOpcoes.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={handleAdicionar} className="w-full md:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Atendimento
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de atendimentos */}
      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtrar Atendimentos</CardTitle>
          <CardDescription>Use os filtros abaixo para refinar a lista de atendimentos.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="filtroMes">Mês</Label>
              <Select value={filtroMes} onValueChange={setFiltroMes}>
                <SelectTrigger id="filtroMes" className="w-full">
                  <SelectValue placeholder="Todos os Meses" />
                </SelectTrigger>
                <SelectContent>
                  {meses.map(mes => (
                    <SelectItem key={mes.value} value={mes.value}>{mes.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filtroPlataforma">Plataforma</Label>
              <Select value={filtroPlataforma} onValueChange={setFiltroPlataforma}>
                <SelectTrigger id="filtroPlataforma" className="w-full">
                  <SelectValue placeholder="Todas as Plataformas" />
                </SelectTrigger>
                <SelectContent>
                  {plataformasComTodos.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filtroStatus">Status</Label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger id="filtroStatus" className="w-full">
                  <SelectValue placeholder="Todos os Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusComTodos.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de atendimentos */}
      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtrar Atendimentos</CardTitle>
          <CardDescription>Use os filtros abaixo para refinar a lista de atendimentos.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="filtroMes">Mês</Label>
              <Select value={filtroMes} onValueChange={setFiltroMes}>
                <SelectTrigger id="filtroMes" className="w-full">
                  <SelectValue placeholder="Todos os Meses" />
                </SelectTrigger>
                <SelectContent>
                  {meses.map(mes => (
                    <SelectItem key={mes.value} value={mes.value}>{mes.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filtroPlataforma">Plataforma</Label>
              <Select value={filtroPlataforma} onValueChange={setFiltroPlataforma}>
                <SelectTrigger id="filtroPlataforma" className="w-full">
                  <SelectValue placeholder="Todas as Plataformas" />
                </SelectTrigger>
                <SelectContent>
                  {plataformasComTodos.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filtroStatus">Status</Label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger id="filtroStatus" className="w-full">
                  <SelectValue placeholder="Todos os Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusComTodos.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de atendimentos */}
      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtrar Atendimentos</CardTitle>
          <CardDescription>Use os filtros abaixo para refinar a lista de atendimentos.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="filtroMes">Mês</Label>
              <Select value={filtroMes} onValueChange={setFiltroMes}>
                <SelectTrigger id="filtroMes" className="w-full">
                  <SelectValue placeholder="Todos os Meses" />
                </SelectTrigger>
                <SelectContent>
                  {meses.map(mes => (
                    <SelectItem key={mes.value} value={mes.value}>{mes.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filtroPlataforma">Plataforma</Label>
              <Select value={filtroPlataforma} onValueChange={setFiltroPlataforma}>
                <SelectTrigger id="filtroPlataforma" className="w-full">
                  <SelectValue placeholder="Todas as Plataformas" />
                </SelectTrigger>
                <SelectContent>
                  {plataformasComTodos.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filtroStatus">Status</Label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger id="filtroStatus" className="w-full">
                  <SelectValue placeholder="Todos os Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusComTodos.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de atendimentos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Atendimentos</CardTitle>
          <CardDescription>
            {atendimentosFiltrados.length} {atendimentosFiltrados.length === 1 ? 'atendimento registrado' : 'atendimentos registrados'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-accent">
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Data</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Check-in</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Check-out</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Horas</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Nº OS</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Cliente</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Plataforma</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Prev. Pgto</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor OS</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Adicionais</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Despesas</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Adiantamento</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor Bruto</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor Líquido</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {atendimentosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="16" className="px-3 py-8 text-center text-muted-foreground">
                      Nenhum atendimento registrado. Adicione um novo atendimento acima.
                    </td>
                  </tr>
                ) : (
                  atendimentosFiltrados
                      .sort((a, b) => new Date(b.data_atendimento + 'T03:00:00Z') - new Date(a.data_atendimento + 'T03:00:00Z'))
                    .map(atendimento => (
                      <AtendimentoRow
                        key={atendimento.id}
                        atendimento={atendimento}
                        handleSalvarEdicao={handleSalvarEdicao}
                        handleExcluir={handleExcluir}
                        editandoId={editandoId}
                        setEditandoId={setEditandoId}
                      />
                    ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Extrato

