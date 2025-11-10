import { useMemo, useState } from 'react'
import { PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAtendimentos } from '@/hooks/useAtendimentos'

export default function AtendimentosPage() {
  const { atendimentos, adicionarAtendimento, editarAtendimento } = useAtendimentos()

  const [filtroMes, setFiltroMes] = useState('')
  const [filtroPlataforma, setFiltroPlataforma] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')

  // Filtragem dos atendimentos
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

  const plataformas = ['WhatsApp', 'Instagram', 'Facebook', 'Telefone']
  const statusList = ['Aberto', 'Em andamento', 'Concluído', 'Cancelado']

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Atendimentos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Adicione, edite e visualize todos os seus atendimentos
          </p>
        </div>
        <Button className="flex items-center gap-2" onClick={adicionarAtendimento}>
          <PlusCircle className="h-4 w-4" />
          Novo Atendimento
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrar Atendimentos</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Mês */}
          <Select value={filtroMes} onValueChange={setFiltroMes}>
            <SelectTrigger>
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {meses.map((mes) => (
                <SelectItem key={mes.valor} value={mes.valor}>
                  {mes.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Plataforma */}
          <Select value={filtroPlataforma} onValueChange={setFiltroPlataforma}>
            <SelectTrigger>
              <SelectValue placeholder="Plataforma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas</SelectItem>
              {plataformas.map((plataforma) => (
                <SelectItem key={plataforma} value={plataforma}>
                  {plataforma}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status */}
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {statusList.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Busca (opcional) */}
          <Input placeholder="Buscar por cliente..." />
        </CardContent>
      </Card>

      {/* Lista de atendimentos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Atendimentos</CardTitle>
        </CardHeader>
        <CardContent>
          {atendimentosFiltrados.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhum atendimento encontrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b text-sm text-muted-foreground">
                    <th className="text-left py-2 px-3 font-medium">Data</th>
                    <th className="text-left py-2 px-3 font-medium">Cliente</th>
                    <th className="text-left py-2 px-3 font-medium">Plataforma</th>
                    <th className="text-left py-2 px-3 font-medium">Status</th>
                    <th className="text-right py-2 px-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {atendimentosFiltrados.map((at) => (
                    <tr key={at.id} className="border-b last:border-none">
                      <td className="py-2 px-3 text-sm">
                        {new Date(at.data_atendimento).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-2 px-3 text-sm">{at.cliente}</td>
                      <td className="py-2 px-3 text-sm">{at.plataforma}</td>
                      <td className="py-2 px-3 text-sm">{at.status}</td>
                      <td className="py-2 px-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => editarAtendimento(at.id)}
                        >
                          Editar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
