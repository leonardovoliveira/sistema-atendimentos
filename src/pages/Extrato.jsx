import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Plus, Edit2, Trash2, Save, X, Download, Upload, Calendar, Info, ExternalLink } from 'lucide-react'

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

const getPlataformaColorClass = (plataforma) => {
  switch (plataforma) {
    case 'FINDUP': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'EUNERD': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'QUALLITY': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    case 'NS SUPORTE': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'ONIX SUPORTE': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'CO&BE': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
    case 'LVO TI': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
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

const AtendimentoRow = ({ 
  atendimento, 
  handleExcluir, 
  isSelected,
  toggleSelection,
  onViewDetails
}) => {
  const dataAtendimentoFormatada = atendimento.data_atendimento ? new Date(atendimento.data_atendimento + 'T03:00:00Z').toLocaleDateString('pt-BR') : '';
  
  return (
    <tr 
      key={atendimento.id} 
      className={`hover:bg-accent/50 transition-colors cursor-pointer ${isSelected ? 'bg-accent/50' : ''}`}
      onClick={() => onViewDetails(atendimento)}
    >
      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
        <Checkbox 
          checked={isSelected} 
          onCheckedChange={() => toggleSelection(atendimento.id)}
        />
      </td>
      <td className="px-3 py-3 text-sm">{dataAtendimentoFormatada}</td>
      <td className="px-3 py-3 text-sm font-medium">{atendimento.numero_os}</td>
      <td className="px-3 py-3 text-sm">{atendimento.nome_cliente}</td>
      <td className="px-3 py-3 text-sm">
        <span className={`px-2 py-1 rounded text-xs font-medium ${getPlataformaColorClass(atendimento.plataforma)}`}>
          {atendimento.plataforma}
        </span>
      </td>
      <td className="px-3 py-3 text-sm font-bold text-green-500">
        {calcularValorLiquido(atendimento).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      </td>
      <td className="px-3 py-3 text-sm">
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          atendimento.status === 'Pago' ? 'bg-green-100/10 text-green-400' :
          atendimento.status === 'Aguardando Pagamento' ? 'bg-yellow-100/10 text-yellow-400' :
          'bg-muted text-muted-foreground'
        }`}>
          {atendimento.status}
        </span>
      </td>
      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onViewDetails(atendimento)}
          >
            <Info className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const [dataInicio, setDataInicio] = useState(firstDay);
  const [dataFim, setDataFim] = useState(lastDay);
  const [filtroPlataforma, setFiltroPlataforma] = useState('all');
  const [filtroStatus, setFiltroStatus] = useState('all');
  const [localAtendimentos, setLocalAtendimentos] = useState(propAtendimentos);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('');
  const [atendimentoDetalhe, setAtendimentoDetalhe] = useState(null);
  const [isEditando, setIsEditando] = useState(false);
  const [atendimentoEditado, setAtendimentoEditado] = useState(null);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    setLocalAtendimentos(propAtendimentos);
  }, [propAtendimentos]);

  useEffect(() => {
    setPropAtendimentos(localAtendimentos);
  }, [localAtendimentos, setPropAtendimentos]);

  const handleExportar = () => {
    const dataStr = JSON.stringify(localAtendimentos, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', 'extrato_atendimentos.json')
    linkElement.click()
  }

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
        }
      } catch (error) {
        alert('Erro ao ler o arquivo: ' + error.message)
      }
    }
    reader.readAsText(file)
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

  const handleAdicionar = () => {
    if (!novoAtendimento.data_atendimento || !novoAtendimento.numero_os) {
      alert('Por favor, preencha pelo menos a data e o número da OS')
      return
    }
    const atendimento = { ...novoAtendimento, id: Date.now().toString() }
    setLocalAtendimentos([...localAtendimentos, atendimento])
    setNovoAtendimento({
      data_atendimento: '', checkin: '', checkout: '', numero_os: '', nome_cliente: '',
      plataforma: plataformas[0], data_prevista_pagamento: '', valor_chamado: '0',
      ganhos_adicionais: '0', despesas_os: '0', adiantamento_recebido: '0', status: 'Prox Atendimento'
    });
  }

  const atendimentosFiltrados = useMemo(() => {
    return localAtendimentos.filter(atendimento => {
      const dataAtendimentoStr = atendimento.data_atendimento;
      const dataCorresponde = (!dataInicio || dataAtendimentoStr >= dataInicio) && (!dataFim || dataAtendimentoStr <= dataFim);
      const plataformaCorresponde = filtroPlataforma === 'all' || atendimento.plataforma === filtroPlataforma;
      const statusCorresponde = filtroStatus === 'all' || atendimento.status === filtroStatus;
      return dataCorresponde && plataformaCorresponde && statusCorresponde;
    }).sort((a, b) => new Date(a.data_atendimento) - new Date(b.data_atendimento));
  }, [localAtendimentos, dataInicio, dataFim, filtroPlataforma, filtroStatus]);

  const totalBrutoFiltrado = atendimentosFiltrados.reduce((acc, atendimento) => acc + calcularValorBruto(atendimento), 0);

  const handleExcluir = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este atendimento?')) {
      setLocalAtendimentos(localAtendimentos.filter(att => att.id !== id));
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    }
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === atendimentosFiltrados.length ? [] : atendimentosFiltrados.map(a => a.id));
  };

  const handleBulkStatusUpdate = () => {
    if (!bulkStatus) return;
    setLocalAtendimentos(localAtendimentos.map(att => selectedIds.includes(att.id) ? { ...att, status: bulkStatus } : att));
    setSelectedIds([]);
    setBulkStatus('');
  };

  const handleSalvarEdicao = () => {
    setLocalAtendimentos(localAtendimentos.map(att => att.id === atendimentoEditado.id ? atendimentoEditado : att));
    setAtendimentoDetalhe(atendimentoEditado);
    setIsEditando(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Extrato de Atendimentos</h1>
        <div className="flex space-x-2">
          <Button onClick={handleExportar} variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Exportar</Button>
          <input type="file" ref={fileInputRef} onChange={handleImportar} accept=".json" style={{ display: 'none' }} />
          <Button onClick={() => fileInputRef.current.click()} variant="outline" size="sm"><Upload className="w-4 h-4 mr-2" />Importar</Button>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <Card className="bg-primary/5 border-primary/20 sticky top-4 z-10 shadow-lg">
          <CardContent className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-primary">{selectedIds.length} itens selecionados</span>
              <div className="flex items-center gap-2">
                <Select value={bulkStatus} onValueChange={setBulkStatus}>
                  <SelectTrigger className="w-[200px] h-9"><SelectValue placeholder="Alterar status para..." /></SelectTrigger>
                  <SelectContent>{statusOpcoes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
                <Button size="sm" onClick={handleBulkStatusUpdate} disabled={!bulkStatus}>Aplicar</Button>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>Cancelar</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-6">
          <div className="space-y-2">
            <Label>Data Início</Label>
            <div className="relative">
              <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="pl-10" />
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Data Fim</Label>
            <div className="relative">
              <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="pl-10" />
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Plataforma</Label>
            <Select value={filtroPlataforma} onValueChange={setFiltroPlataforma}>
              <SelectTrigger><SelectValue placeholder="Plataforma" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {plataformas.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {statusOpcoes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 flex flex-col justify-end">
            <Label className="text-sm font-medium text-muted-foreground">Total Bruto</Label>
            <span className="text-2xl font-bold text-blue-500">
              {totalBrutoFiltrado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-3 py-3 text-left w-10">
                <Checkbox checked={atendimentosFiltrados.length > 0 && selectedIds.length === atendimentosFiltrados.length} onCheckedChange={toggleSelectAll} />
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Data</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase">OS</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Cliente</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Plataforma</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Líquido</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {atendimentosFiltrados.map(atendimento => (
              <AtendimentoRow 
                key={atendimento.id} 
                atendimento={atendimento} 
                handleExcluir={handleExcluir} 
                isSelected={selectedIds.includes(atendimento.id)} 
                toggleSelection={toggleSelection}
                onViewDetails={(att) => { setAtendimentoDetalhe(att); setAtendimentoEditado(att); setIsEditando(false); }}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Detalhes */}
      <Dialog open={!!atendimentoDetalhe} onOpenChange={(open) => !open && setAtendimentoDetalhe(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Detalhes do Atendimento</span>
              {!isEditando && (
                <Button size="sm" variant="outline" onClick={() => setIsEditando(true)}>
                  <Edit2 className="w-4 h-4 mr-2" /> Editar
                </Button>
              )}
            </DialogTitle>
            <DialogDescription>OS: {atendimentoDetalhe?.numero_os} - {atendimentoDetalhe?.nome_cliente}</DialogDescription>
          </DialogHeader>
          
          {atendimentoDetalhe && (
            <div className="grid grid-cols-2 gap-6 py-4">
              {isEditando ? (
                <>
                  <div className="space-y-2"><Label>Data</Label><Input type="date" value={atendimentoEditado.data_atendimento} onChange={e => setAtendimentoEditado({...atendimentoEditado, data_atendimento: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Cliente</Label><Input value={atendimentoEditado.nome_cliente} onChange={e => setAtendimentoEditado({...atendimentoEditado, nome_cliente: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Check-in</Label><Input type="time" value={atendimentoEditado.checkin} onChange={e => setAtendimentoEditado({...atendimentoEditado, checkin: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Check-out</Label><Input type="time" value={atendimentoEditado.checkout} onChange={e => setAtendimentoEditado({...atendimentoEditado, checkout: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Plataforma</Label>
                    <Select value={atendimentoEditado.plataforma} onValueChange={v => setAtendimentoEditado({...atendimentoEditado, plataforma: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{plataformas.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Status</Label>
                    <Select value={atendimentoEditado.status} onValueChange={v => setAtendimentoEditado({...atendimentoEditado, status: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{statusOpcoes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Valor Chamado</Label><Input type="number" value={atendimentoEditado.valor_chamado} onChange={e => setAtendimentoEditado({...atendimentoEditado, valor_chamado: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Ganhos Adicionais</Label><Input type="number" value={atendimentoEditado.ganhos_adicionais} onChange={e => setAtendimentoEditado({...atendimentoEditado, ganhos_adicionais: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Despesas OS</Label><Input type="number" value={atendimentoEditado.despesas_os} onChange={e => setAtendimentoEditado({...atendimentoEditado, despesas_os: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Adiantamento</Label><Input type="number" value={atendimentoEditado.adiantamento_recebido} onChange={e => setAtendimentoEditado({...atendimentoEditado, adiantamento_recebido: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Prev. Pagamento</Label><Input type="date" value={atendimentoEditado.data_prevista_pagamento} onChange={e => setAtendimentoEditado({...atendimentoEditado, data_prevista_pagamento: e.target.value})} /></div>
                </>
              ) : (
                <>
                  <div className="space-y-1"><Label className="text-muted-foreground">Data</Label><p className="font-medium">{new Date(atendimentoDetalhe.data_atendimento + 'T03:00:00Z').toLocaleDateString('pt-BR')}</p></div>
                  <div className="space-y-1"><Label className="text-muted-foreground">Horário</Label><p className="font-medium">{atendimentoDetalhe.checkin} às {atendimentoDetalhe.checkout} ({calcularHoras(atendimentoDetalhe.checkin, atendimentoDetalhe.checkout)}h)</p></div>
                  <div className="space-y-1"><Label className="text-muted-foreground">Plataforma</Label><p className="font-medium">{atendimentoDetalhe.plataforma}</p></div>
                  <div className="space-y-1"><Label className="text-muted-foreground">Status</Label><p className="font-medium">{atendimentoDetalhe.status}</p></div>
                  <div className="space-y-1"><Label className="text-muted-foreground">Valor Bruto</Label><p className="font-medium text-blue-500">{calcularValorBruto(atendimentoDetalhe).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p></div>
                  <div className="space-y-1"><Label className="text-muted-foreground">Valor Líquido</Label><p className="font-medium text-green-500">{calcularValorLiquido(atendimentoDetalhe).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p></div>
                  <div className="space-y-1"><Label className="text-muted-foreground">Despesas</Label><p className="font-medium text-red-500">{parseFloat(atendimentoDetalhe.despesas_os || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p></div>
                  <div className="space-y-1"><Label className="text-muted-foreground">Adiantamento</Label><p className="font-medium text-orange-500">{parseFloat(atendimentoDetalhe.adiantamento_recebido || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p></div>
                  <div className="space-y-1"><Label className="text-muted-foreground">Previsão de Pagamento</Label><p className="font-medium">{atendimentoDetalhe.data_prevista_pagamento ? new Date(atendimentoDetalhe.data_prevista_pagamento + 'T03:00:00Z').toLocaleDateString('pt-BR') : '-'}</p></div>
                </>
              )}
            </div>
          )}
          
          <DialogFooter>
            {isEditando ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditando(false)}>Cancelar</Button>
                <Button onClick={handleSalvarEdicao}>Salvar Alterações</Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setAtendimentoDetalhe(null)}>Fechar</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader><CardTitle>Adicionar Novo Atendimento</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2"><Label>Data</Label><Input type="date" value={novoAtendimento.data_atendimento} onChange={(e) => setNovoAtendimento({ ...novoAtendimento, data_atendimento: e.target.value })} /></div>
            <div className="space-y-2"><Label>Check-in</Label><Input type="time" value={novoAtendimento.checkin} onChange={(e) => setNovoAtendimento({ ...novoAtendimento, checkin: e.target.value })} /></div>
            <div className="space-y-2"><Label>Check-out</Label><Input type="time" value={novoAtendimento.checkout} onChange={(e) => setNovoAtendimento({ ...novoAtendimento, checkout: e.target.value })} /></div>
            <div className="space-y-2"><Label>Número da OS</Label><Input value={novoAtendimento.numero_os} onChange={(e) => setNovoAtendimento({ ...novoAtendimento, numero_os: e.target.value })} /></div>
            <div className="space-y-2"><Label>Nome do Cliente</Label><Input value={novoAtendimento.nome_cliente} onChange={(e) => setNovoAtendimento({ ...novoAtendimento, nome_cliente: e.target.value })} /></div>
            <div className="space-y-2"><Label>Plataforma</Label>
              <Select value={novoAtendimento.plataforma} onValueChange={(v) => setNovoAtendimento({ ...novoAtendimento, plataforma: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{plataformas.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Previsão de Pagamento</Label><Input type="date" value={novoAtendimento.data_prevista_pagamento} onChange={(e) => setNovoAtendimento({ ...novoAtendimento, data_prevista_pagamento: e.target.value })} /></div>
            <div className="space-y-2"><Label>Valor do Chamado</Label><Input type="number" value={novoAtendimento.valor_chamado} onChange={(e) => setNovoAtendimento({ ...novoAtendimento, valor_chamado: e.target.value })} /></div>
            <div className="space-y-2"><Label>Ganhos Adicionais</Label><Input type="number" value={novoAtendimento.ganhos_adicionais} onChange={(e) => setNovoAtendimento({ ...novoAtendimento, ganhos_adicionais: e.target.value })} /></div>
            <div className="space-y-2"><Label>Despesas na OS</Label><Input type="number" value={novoAtendimento.despesas_os} onChange={(e) => setNovoAtendimento({ ...novoAtendimento, despesas_os: e.target.value })} /></div>
            <div className="space-y-2"><Label>Adiantamento</Label><Input type="number" value={novoAtendimento.adiantamento_recebido} onChange={(e) => setNovoAtendimento({ ...novoAtendimento, adiantamento_recebido: e.target.value })} /></div>
            <div className="space-y-2"><Label>Status</Label>
              <Select value={novoAtendimento.status} onValueChange={(v) => setNovoAtendimento({ ...novoAtendimento, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{statusOpcoes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4"><Button onClick={handleAdicionar}><Plus className="w-4 h-4 mr-2" />Adicionar Atendimento</Button></div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Extrato;
