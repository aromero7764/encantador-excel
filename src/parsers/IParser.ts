import type { Reporte, ReporteConsolidado } from './types'

export interface IParser {
  readonly nombre: string
  readonly label: string
  puedeParsear(headerRaw: string[]): boolean
  parsear(rawData: unknown[][]): ReporteConsolidado
  generarReportes(datos: ReporteConsolidado): Reporte[]
}
