import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, TrendingUp, Clock, DollarSign, FileText } from 'lucide-react'

function Relatorios({ atendimentos }) {
  // Inicializar com o primeiro e último dia do mês atual
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const [dataInicio, setDataInicio] = useState(firstDay);
  const [dataFim, setDataFim] = useState(lastDay);

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

  // Filtrar atendimentos pelo período selecionado
  const atendimentosFiltrados = useMemo(() => {
    return atendimentos.filter(atendimento => {
      const dataAtendimentoStr = atendimento.data_atendimento;
      return (!dataInicio || dataAtendimentoStr >= dataInicio) && 
             (!dataFim || dataAtendimentoStr <= dataFim);
    });
  }, [atendimentos, dataInicio, dataFim]);

  // Processar dados mensais baseados nos atendimentos filtrados
  const dadosMensais = useMemo(() => {
    const meses = {}
    
    atendimentosFiltrados.forEach(atendimento => {
      if (atendimento.data_atendimento) {
        const mesKey = atendimento.data_atendimento.substring(0, 7) // YYYY-MM
        if (!meses[mesKey]) {
          const [ano, mes] = mesKey.split('-')
          meses[mesKey] = {
            mes: new Date(parseInt(ano), parseInt(mes) - 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' }),
            mesKey: mesKey,
            quantidadeOS: 0,
            faturamentoTotal: 0,
            horasTrabalhadas: 0,
            atendimentos: []
          }
        }
        
        const bruto = calcularValorBruto(atendimento)
        const horas = calcularHoras(atendimento.checkin, atendimento.checkout)
        
        meses[mesKey].quantidadeOS += 1
        meses[mesKey].faturamentoTotal += bruto
        meses[mesKey].horasTrabalhadas += horas
        meses[mesKey].atendimentos.push(atendimento)
      }
    })

    // Calcular médias e converter para array ordenado
    return Object.values(meses)
      .sort((a, b) => a.mesKey.localeCompare(b.mesKey))
      .map(mes => ({
        ...mes,
        valorMedioOS: mes.quantidadeOS > 0 ? mes.faturamentoTotal / mes.quantidadeOS : 0,
        valorMedioPorHora: mes.horasTrabalhadas > 0 ? mes.faturamentoTotal / mes.horasTrabalhadas : 0
      }))
  }, [atendimentosFiltrados])

  // Calcular totais do período
  const totaisPeriodo = useMemo(() => {
    return atendimentosFiltrados.reduce((acc, atendimento) => {
      const bruto = calcularValorBruto(atendimento)
      const horas = calcularHoras(atendimento.checkin, atendimento.checkout)
      return {
        quantidadeOS: acc.quantidadeOS + 1,
        faturamentoTotal: acc.faturamentoTotal + bruto,
        horasTrabalhadas: acc.horasTrabalhadas + horas
      }
    }, { quantidadeOS: 0, faturamentoTotal: 0, horasTrabalhadas: 0 })
  }, [atendimentosFiltrados])

  const mediasPeriodo = useMemo(() => {
    return {
      valorMedioOS: totaisPeriodo.quantidadeOS > 0 ? totaisPeriodo.faturamentoTotal / totaisPeriodo.quantidadeOS : 0,
      valorMedioPorHora: totaisPeriodo.horasTrabalhadas > 0 ? totaisPeriodo.faturamentoTotal / totaisPeriodo.horasTrabalhadas : 0
    }
  }, [totaisPeriodo])

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Relatórios de Atendimentos</h2>
          <p className="mt-1 text-sm text-muted-foreground">Análise detalhada dos atendimentos no período selecionado</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="space-y-1">
            <Label className="text-xs">Início</Label>
            <div className="relative">
              <Input 
                type="date" 
                value={dataInicio} 
                onChange={(e) => setDataInicio(e.target.value)} 
                className="pl-9 h-9 text-sm"
              />
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Fim</Label>
            <div className="relative">
              <Input 
                type="date" 
                value={dataFim} 
                onChange={(e) => setDataFim(e.target.value)} 
                className="pl-9 h-9 text-sm"
              />
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Cards de resumo do período */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de OS</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totaisPeriodo.quantidadeOS}</div>
            <p className="text-xs text-muted-foreground">no período selecionado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totaisPeriodo.faturamentoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-muted-foreground">no período selecionado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Trabalhadas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totaisPeriodo.horasTrabalhadas.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">no período selecionado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Médio/OS</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mediasPeriodo.valorMedioOS.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-muted-foreground">média do período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Médio/Hora</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mediasPeriodo.valorMedioPorHora.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-muted-foreground">média do período</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de relatórios mensais */}
      <Card>
        <CardHeader>
          <CardTitle>Agrupamento Mensal</CardTitle>
          <CardDescription>Dados agrupados por mês dentro do período selecionado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-accent">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Mês
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade de OS
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Faturamento Total
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horas Trabalhadas
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Médio da OS
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Médio por Hora
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dadosMensais.length > 0 ? (
                  dadosMensais.map((mes, index) => (
                    <tr 
                      key={index} 
                      className="hover:bg-accent/50 transition-colors bg-background"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-foreground capitalize">
                        {mes.mes}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {mes.quantidadeOS}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        {mes.faturamentoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        {`${mes.horasTrabalhadas.toFixed(1)}h`}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        {mes.valorMedioOS.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        {mes.valorMedioPorHora.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-muted-foreground">
                      Nenhum atendimento encontrado no período selecionado.
                    </td>
                  </tr>
                )}
              </tbody>
              {dadosMensais.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-border bg-accent/30 font-bold">
                    <td className="px-4 py-3 text-sm text-foreground">
                      Total do Período
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-white">
                        {totaisPeriodo.quantidadeOS}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-foreground">
                      {totaisPeriodo.faturamentoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-foreground">
                      {totaisPeriodo.horasTrabalhadas.toFixed(1)}h
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-foreground">
                      {mediasPeriodo.valorMedioOS.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-foreground">
                      {mediasPeriodo.valorMedioPorHora.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights e observações */}
      {totaisPeriodo.quantidadeOS > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Insights do Período</CardTitle>
            <CardDescription>Análise automática dos dados selecionados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p className="text-sm text-foreground">
                  Você realizou <strong>{totaisPeriodo.quantidadeOS}</strong> atendimentos no período, 
                  totalizando <strong>{totaisPeriodo.horasTrabalhadas.toFixed(1)} horas</strong> de trabalho.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p className="text-sm text-foreground">
                  O faturamento total foi de <strong>
                    {totaisPeriodo.faturamentoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </strong>, com valor médio de <strong>
                    {mediasPeriodo.valorMedioOS.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </strong> por OS.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <p className="text-sm text-foreground">
                  Seu valor médio por hora trabalhada é de <strong>
                    {mediasPeriodo.valorMedioPorHora.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </strong>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Relatorios
