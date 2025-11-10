import React, { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

const Extrato = ({ atendimentos }) => {
  const [filtroMes, setFiltroMes] = useState('')
  const [filtroPlataforma, setFiltroPlataforma] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')

  const meses = [
    { valor: '01', nome: 'Janeiro' },
    { valor: '02', nome: 'Fevereiro' },
    { valor: '03', nome: 'Março' },
    { valor: '04', nome: 'Abril' },
    { valor: '05', nome: 'Maio' },
    { valor: '06', nome: 'Junho' },
    { valor: '07', nome: 'Julho' },
    { valor: '08', nome: 'Agosto' },
    { valor: '09', nome: 'Setembro' },
    { valor: '10', nome: 'Outubro' },
    { valor: '11', nome: 'Novembro' },
    { valor: '12', nome: 'Dezembro' },
  ]

  const atendimentosFiltrados = useMemo(() => {
    return atendimentos.filter((atendimento) => {
      const dataAtendimento = new Date(atendimento.data_atendimento + 'T00:00:00')
      const mesAtendimento = (dataAtendimento.getMonth() + 1).toString().padStart(2, '0')

      const mesCorresponde = filtroMes === '' || mesAtendimento === filtroMes
      const plataformaCorresponde =
        filtroPlataforma === '' || atendimento.plataforma === filtroPlataforma
      const statusCorresponde = filtroStatus === '' || atendimento.status === filtroStatus

      return mesCorresponde && plataformaCorresponde && statusCorresponde
    })
  }, [atendimentos, filtroMes, filtroPlataforma, filtroStatus])

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
              <SelectItem value="">Todos os Meses</SelectItem>
              {meses.map((mes) => (
                <SelectItem key={mes.valor} value={mes.valor}>
                  {mes.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtro de Plataforma */}
          <Input
            type="text"
            placeholder="Filtrar por plataforma"
            value={filtroPlataforma}
            onChange={(e) => setFiltroPlataforma(e.target.value)}
          />

          {/* Filtro de Status */}
          <Select value={filtroStatus} onValueChange={(value) => setFiltroStatus(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os Status</SelectItem>
              <SelectItem value="Pendente">Pendente</SelectItem>
              <SelectItem value="Concluído">Concluído</SelectItem>
              <SelectItem value="Cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Lista de Atendimentos */}
      <div className="grid gap-4">
        {atendimentosFiltrados.length === 0 ? (
          <p className="text-center text-gray-500">Nenhum atendimento encontrado.</p>
        ) : (
          atendimentosFiltrados.map((atendimento, index) => (
            <Card key={index} className="border border-gray-200">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{atendimento.nome}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(atendimento.data_atendimento).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-sm">{atendimento.plataforma}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-medium ${
                      atendimento.status === 'Concluído'
                        ? 'text-green-600'
                        : atendimento.status === 'Cancelado'
                        ? 'text-red-600'
                        : 'text-yellow-600'
                    }`}
                  >
                    {atendimento.status}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Botão de Exportar */}
      <div className="flex justify-end">
        <Button onClick={() => console.log('Exportar CSV')}>Exportar CSV</Button>
      </div>
    </div>
  )
}

export default Extrato
