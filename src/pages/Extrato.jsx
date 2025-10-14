import { useState, useEffect } from 'react'
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
  const isEditando = editandoId === atendimento.id
  const [atendimentoEditado, setAtendimentoEditado] = useState(atendimento)

  // Efeito para atualizar o estado interno quando o atendimento externo muda (ex: após salvar)
  useEffect(() => {
    setAtendimentoEditado(atendimento)
  }, [atendimento])

  if (isEditando) {
    return (
      <tr key={atendimento.id} className="bg-blue-50">
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
    <tr key={atendimento.id} className="hover:bg-gray-50 transition-colors">
      <td className="px-3 py-2 text-sm">
        {new Date(atendimento.data_atendimento).toLocaleDateString('pt-BR')}
      </td>
      <td className="px-3 py-2 text-sm">{atendimento.checkin}</td>
      <td className="px-3 py-2 text-sm">{atendimento.checkout}</td>
      <td className="px-3 py-2 text-sm font-medium">
        {calcularHoras(atendimento.checkin, atendimento.checkout)}h
      </td>
      <td className="px-3 py-2 text-sm">{atendimento.numero_os}</td>
      <td className="px-3 py-2 text-sm">{atendimento.nome_cliente}</td>
      <td className="px-3 py-2 text-sm">
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
          {atendimento.plataforma}
        </span>
      </td>
      <td className="px-3 py-2 text-sm">
          {atendimento.data_prevista_pagamento ? 
            new Date(atendimento.data_prevista_pagamento).toLocaleDateString('pt-BR') : '-'}
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
          atendimento.status === 'Pago' ? 'bg-green-100 text-green-800' :
          atendimento.status === 'Aguardando Pagamento' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
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
  const [editandoId, setEditandoId] = useState(null)
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
  }

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
        <h2 className="text-3xl font-bold text-gray-900">Extrato de Atendimentos</h2>
        <p className="mt-1 text-sm text-gray-500">Gerencie todos os seus atendimentos e ordens de serviço</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      <Card>
        <CardHeader>
          <CardTitle>Lista de Atendimentos</CardTitle>
          <CardDescription>
            {atendimentos.length} {atendimentos.length === 1 ? 'atendimento registrado' : 'atendimentos registrados'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-out</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horas</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nº OS</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plataforma</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prev. Pgto</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor OS</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adicionais</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Despesas</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adiantamento</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Bruto</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Líquido</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {atendimentos.length === 0 ? (
                  <tr>
                    <td colSpan="16" className="px-3 py-8 text-center text-gray-500">
                      Nenhum atendimento registrado. Adicione um novo atendimento acima.
                    </td>
                  </tr>
                ) : (
                  atendimentos
                    .sort((a, b) => new Date(b.data_atendimento) - new Date(a.data_atendimento))
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

