import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit2, Trash2, Save, X, Download, Upload } from 'lucide-react'

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
// Função para mapear plataforma para classes de cor Tailwind
const getPlataformaColorClass = (plataforma) => {
  switch (plataforma) {
    case 'FINDUP':
      return 'bg-blue-100 text-blue-800';
    case 'EUNERD':
      return 'bg-green-100 text-green-800';
    case 'QUALLITY':
      return 'bg-purple-100 text-purple-800';
    case 'NS SUPORTE':
      return 'bg-red-100 text-red-800';
    case 'ONIX SUPORTE':
      return 'bg-yellow-100 text-yellow-800';
    case 'CO&BE':
      return 'bg-indigo-100 text-indigo-800';
    case 'LVO TI':
      return 'bg-pink-100 text-pink-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

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
              {statusOpcoes.map(p => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
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
        <span className={`px-2 py-1 rounded text-xs font-medium ${getPlataformaColorClass(atendimento.plataforma)}`}>
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

function Extrato({ atendimentos: propAtendimentos = [], setAtendimentos: setPropAtendimentos = () => {} }) {
  const [editandoId, setEditandoId] = useState(null);
    const [filtroMes, setFiltroMes] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [filtroPlataforma, setFiltroPlataforma] = useState('all');
  const [filtroStatus, setFiltroStatus] = useState('all');
  const [localAtendimentos, setLocalAtendimentos] = useState(propAtendimentos);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setLocalAtendimentos(propAtendimentos);
  }, [propAtendimentos]);

  useEffect(() => {
    setPropAtendimentos(localAtendimentos);
  }, [localAtendimentos, setPropAtendimentos]);

  // Lógica de Exportação
  const handleExportar = () => {
    const dataStr = JSON.stringify(localAtendimentos, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

    const exportFileDefaultName = 'extrato_atendimentos.json'

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  // Lógica de Importação
  const handleImportar = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result)
        if (Array.isArray(importedData)) {
          setLocalAtendimentos(importedData)
          alert('Dados importados com sucesso!')
        } else {
          alert('Formato de arquivo inválido. Esperado um array de atendimentos.')
        }
      } catch (error) {
        alert('Erro ao ler o arquivo: ' + error.message)
      }
    }
    reader.readAsText(file)
  }

  // Função para acionar o input de arquivo
  const handleImportClick = () => {
    fileInputRef.current.click()
  }

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

    setLocalAtendimentos([...localAtendimentos, atendimento])
    setNovoAtendimento({
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
      status: 'Prox Atendimento',
    });
  }

  const meses = [
    { value: 'all', label: 'Todos os Meses' },
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

  const plataformasComTodos = [{ value: 'all', label: 'Todas as Plataformas' }, ...plataformas.map(p => ({ value: p, label: p }))];
  const statusComTodos = [{ value: 'all', label: 'Todos os Status' }, ...statusOpcoes.map(s => ({ value: s, label: s }))];

  const atendimentosFiltrados = useMemo(() => {
    const atendimentosFiltrados = localAtendimentos.filter(atendimento => {
      const dataAtendimento = atendimento.data_atendimento ? new Date(atendimento.data_atendimento + 'T03:00:00Z') : null;
      const mesAtendimento = dataAtendimento ? (dataAtendimento.getMonth() + 1).toString().padStart(2, '0') : '';

      const mesCorresponde = filtroMes === 'all' || (dataAtendimento && mesAtendimento === filtroMes);
      const plataformaCorresponde = filtroPlataforma === 'all' || atendimento.plataforma === filtroPlataforma;
      const statusCorresponde = filtroStatus === 'all' || atendimento.status === filtroStatus;

      return mesCorresponde && plataformaCorresponde && statusCorresponde;
    });

    // Ordenar por data (crescente) e check-in (crescente)
    return [...atendimentosFiltrados].sort((a, b) => {
      // 1. Comparar a data
      const dataA = new Date(a.data_atendimento);
      const dataB = new Date(b.data_atendimento);

      if (dataA.getTime() !== dataB.getTime()) {
        return dataA.getTime() - dataB.getTime(); // Crescente por data
      }

      // 2. Se as datas forem iguais, comparar o check-in (formato HH:MM)
      const checkinA = a.checkin;
      const checkinB = b.checkin;

      if (checkinA < checkinB) return -1;
      if (checkinA > checkinB) return 1;
      return 0;
    });
  }, [localAtendimentos, filtroMes, filtroPlataforma, filtroStatus]);

  const totalLiquidoFiltrado = atendimentosFiltrados.reduce((acc, atendimento) => acc + calcularValorLiquido(atendimento), 0);

  const handleSalvarEdicao = (id, atendimentoAtualizado) => {
    setLocalAtendimentos(localAtendimentos.map(att => att.id === id ? atendimentoAtualizado : att));
    setEditandoId(null);
  };

  const handleExcluir = (id) => {
    setLocalAtendimentos(localAtendimentos.filter(att => att.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Extrato de Atendimentos</h1>
        <div className="flex space-x-2">
          <Button onClick={handleExportar} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportar}
            accept=".json"
            style={{ display: 'none' }}
          />
          <Button onClick={handleImportClick} variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
        </div>
      </div>
      <Card>
		        <CardHeader className="flex flex-row items-center justify-between">
		          <div>
		            <CardTitle className="text-xl font-bold">Filtros e Resumo</CardTitle>
		            <CardDescription>Filtre os atendimentos e veja o resumo financeiro.</CardDescription>
		          </div>

		        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Filtrar por Mês</Label>
            <Select value={filtroMes} onValueChange={setFiltroMes}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o Mês" />
              </SelectTrigger>
              <SelectContent>
                {meses.map(m => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Filtrar por Plataforma</Label>
            <Select value={filtroPlataforma} onValueChange={setFiltroPlataforma}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a Plataforma" />
              </SelectTrigger>
              <SelectContent>
                {plataformasComTodos.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Filtrar por Status</Label>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o Status" />
              </SelectTrigger>
              <SelectContent>
                {statusComTodos.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 flex flex-col justify-end">
            <Label className="text-lg font-semibold">Total Líquido Filtrado</Label>
            <span className="text-2xl font-bold text-green-500">
              {totalLiquidoFiltrado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
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
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Adicionais</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Despesas</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Adiant.</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Bruto</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Líquido</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody>
            {atendimentosFiltrados.map(atendimento => (
              <AtendimentoRow
                key={atendimento.id}
                atendimento={atendimento}
                handleSalvarEdicao={handleSalvarEdicao}
                handleExcluir={handleExcluir}
                editandoId={editandoId}
                setEditandoId={setEditandoId}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Formulário para Adicionar Novo Atendimento */}
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Novo Atendimento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          </div>
          <div className="mt-4">
            <Button onClick={handleAdicionar}><Plus className="w-4 h-4 mr-2" />Adicionar Atendimento</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Extrato;
