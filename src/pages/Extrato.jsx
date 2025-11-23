import { useState, useMemo, useEffect } from 'react';

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
      const dataAtendimento = atendimento.data_atendimento ? new Date(atendimento.data_atendimento + 'T03:00:00Z') : null; // Usar UTC para evitar problemas de fuso horário
      const mesAtendimento = dataAtendimento ? (dataAtendimento.getMonth() + 1).toString().padStart(2, '0') : '';

      const mesCorresponde = filtroMes === '' || (dataAtendimento && mesAtendimento === filtroMes);
      const plataformaCorresponde = filtroPlataforma === '' || atendimento.plataforma === filtroPlataforma;
      const statusCorresponde = filtroStatus === '' || atendimento.status === filtroStatus;

      return mesCorresponde && plataformaCorresponde && statusCorresponde;
    });
  }, [atendimentos, filtroMes, filtroPlataforma, filtroStatus]);

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filtro de Mês */}
          <Select value={filtroMes} onValueChange={(value) => setFiltroMes(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por mês" />
            </SelectTrigger>
            <SelectContent>
              {meses.map((mes) => (
                <SelectItem key={mes.value} value={mes.value}>
                  {mes.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtro de Plataforma */}
          <Select value={filtroPlataforma} onValueChange={(value) => setFiltroPlataforma(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por plataforma" />
            </SelectTrigger>
            <SelectContent>
              {plataformasComTodos.map((plataforma) => (
                <SelectItem key={plataforma.value} value={plataforma.value}>
                  {plataforma.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtro de Status */}
          <Select value={filtroStatus} onValueChange={(value) => setFiltroStatus(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              {statusComTodos.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Lista de Atendimentos */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-accent">
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Data</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Check-in</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Check-out</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Horas</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">OS</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Cliente</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Plataforma</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Prev. Pag.</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Adicionais</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Despesas</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Adiant.</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Bruto</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Líquido</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {atendimentosFiltrados.map((atendimento) => (
              <AtendimentoRow
                key={atendimento.id}
                atendimento={atendimento}
                handleSalvarEdicao={(id, atendimentoEditado) => {
                  const novosAtendimentos = atendimentos.map(a => a.id === id ? atendimentoEditado : a)
                  setAtendimentos(novosAtendimentos)
                  setEditandoId(null)
                }}
                handleExcluir={(id) => {
                  const novosAtendimentos = atendimentos.filter(a => a.id !== id)
                  setAtendimentos(novosAtendimentos)
                }}
                editandoId={editandoId}
                setEditandoId={setEditandoId}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Adicionar Novo Atendimento */}
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Novo Atendimento</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Data</Label>
            <Input type="date" value={novoAtendimento.data_atendimento} onChange={(e) => setNovoAtendimento({ ...novoAtendimento, data_atendimento: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Check-in</Label>
            <Input type="time" value={novoAtendimento.checkin} onChange={(e) => setNovoAtendimento({ ...novoAtendimento, checkin: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Check-out</Label>
            <Input type="time" value={novoAtendimento.checkout} onChange={(e) => setNovoAtendimento({ ...novoAtendimento, checkout: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Número da OS</Label>
            <Input value={novoAtendimento.numero_os} onChange={(e) => setNovoAtendimento({ ...novoAtendimento, numero_os: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Nome do Cliente</Label>
            <Input value={novoAtendimento.nome_cliente} onChange={(e) => setNovoAtendimento({ ...novoAtendimento, nome_cliente: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Plataforma</Label>
            <Select value={novoAtendimento.plataforma} onValueChange={(value) => setNovoAtendimento({ ...novoAtendimento, plataforma: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {plataformas.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Previsão de Pagamento</Label>
            <Input type="date" value={novoAtendimento.data_prevista_pagamento} onChange={(e) => setNovoAtendimento({ ...novoAtendimento, data_prevista_pagamento: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Valor do Chamado</Label>
            <Input type="number" step="0.01" value={novoAtendimento.valor_chamado} onChange={(e) => setNovoAtendimento({ ...novoAtendimento, valor_chamado: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Ganhos Adicionais</Label>
            <Input type="number" step="0.01" value={novoAtendimento.ganhos_adicionais} onChange={(e) => setNovoAtendimento({ ...novoAtendimento, ganhos_adicionais: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Despesas na OS</Label>
            <Input type="number" step="0.01" value={novoAtendimento.despesas_os} onChange={(e) => setNovoAtendimento({ ...novoAtendimento, despesas_os: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Adiantamento Recebido</Label>
            <Input type="number" step="0.01" value={novoAtendimento.adiantamento_recebido} onChange={(e) => setNovoAtendimento({ ...novoAtendimento, adiantamento_recebido: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={novoAtendimento.status} onValueChange={(value) => setNovoAtendimento({ ...novoAtendimento, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOpcoes.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleAdicionar} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Atendimento
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Extrato
