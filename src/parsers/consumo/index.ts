import type { IParser } from '../IParser'
import type { ReporteConsolidado, Reporte, Transaccion, ReporteHeader } from '../types'
import {
  calcularResumen,
  generarTotalesPorPersona,
  generarTotalesPorSucursal,
  generarTotalesPorFecha,
  crearReporteResumen,
  crearReporteTotalesPorPersona,
  crearReporteTotalesPorSucursal,
  crearReporteTotalesPorFecha,
  crearReporteDetalleTransacciones
} from './reportes'

export class ConsumoParser implements IParser {
  readonly nombre = 'consumo'
  readonly label = 'Reporte de Consumo Wallet'

  puedeParsear(headerRaw: string[]): boolean {
    const headerText = headerRaw.join(' ').toUpperCase()
    return (
      headerText.includes('EMPORIUM') ||
      headerText.includes('TRANSACCIONES WALLET') ||
      headerText.includes('COD. WALLET')
    )
  }

  parsear(rawData: unknown[][]): ReporteConsolidado {
    const header = this.extraerHeader(rawData as unknown[][])
    const transacciones = this.extraerTransacciones(rawData as unknown[][])
    const resumen = calcularResumen(transacciones)

    return { header, transacciones, resumen }
  }

  generarReportes(datos: ReporteConsolidado): Reporte[] {
    return [
      crearReporteResumen(datos),
      crearReporteTotalesPorPersona(generarTotalesPorPersona(datos.transacciones)),
      crearReporteTotalesPorSucursal(generarTotalesPorSucursal(datos.transacciones)),
      crearReporteTotalesPorFecha(generarTotalesPorFecha(datos.transacciones)),
      crearReporteDetalleTransacciones(datos.transacciones)
    ]
  }

  private extraerHeader(rawData: unknown[][]): ReporteHeader {
    const header: ReporteHeader = {
      empresa: '', rif: '', ubicacion: '', telefono: '',
      fecha: '', hora: '', tipoReporte: ''
    }

    for (let i = 0; i < Math.min(5, rawData.length); i++) {
      const row = rawData[i] || []

      for (let j = 0; j < row.length; j++) {
        const text = String(row[j] || '').trim()

        if (text === 'EMPORIUM') {
          header.empresa = text
        } else if (text.startsWith('J-')) {
          header.rif = text
        } else if (text.includes('Turmero')) {
          header.ubicacion = text
        } else if (text === 'FECHA:' && row[j + 1]) {
          header.fecha = String(row[j + 1])
        } else if (text === 'HORA:' && row[j + 1]) {
          header.hora = this.formatearHora(row[j + 1])
        } else if (text === 'TRANSACCIONES WALLET') {
          header.tipoReporte = text
        }
      }
    }

    return header
  }

  private extraerTransacciones(rawData: unknown[][]): Transaccion[] {
    const transacciones: Transaccion[] = []
    let currentEmpleado: { codWallet: string; cedulaRif: string; nombre: string } | null = null
    let esperandoDatosEmpleado = false
    let esperandoTransacciones = false

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i] || []

      const esEncabezadoEmpleado = this.esFilaEncabezadoEmpleado(row)
      const esDatosEmpleado = this.esFilaDatosEmpleado(row)
      const esEncabezadoTransaccion = this.esFilaEncabezadoTransaccion(row)
      const esTransaccion = this.esFilaTransaccion(row)

      if (esEncabezadoEmpleado) {
        esperandoDatosEmpleado = true
        esperandoTransacciones = false
        continue
      }

      if (esperandoDatosEmpleado && esDatosEmpleado) {
        currentEmpleado = this.extraerDatosEmpleado(row)
        esperandoDatosEmpleado = false
        continue
      }

      if (esEncabezadoTransaccion) {
        esperandoTransacciones = true
        continue
      }

      if (esperandoTransacciones && esTransaccion && currentEmpleado) {
        const transaccion = this.extraerDatosTransaccion(row, currentEmpleado)
        if (transaccion) {
          transacciones.push(transaccion)
        }
        continue
      }

      if (esEncabezadoEmpleado) {
        esperandoDatosEmpleado = true
        esperandoTransacciones = false
        currentEmpleado = null
      }
    }

    return transacciones
  }

  private esFilaEncabezadoEmpleado(row: unknown[]): boolean {
    const col0 = String(row[0] || '').trim()
    const col1 = String(row[1] || '').trim()
    const col2 = String(row[2] || '').trim()
    return col0 === 'Cod. Wallet' && col1 === 'Cedula/Rif' && col2 === 'Nombre'
  }

  private esFilaDatosEmpleado(row: unknown[]): boolean {
    const col0 = String(row[0] || '').trim()
    const col1 = String(row[1] || '').trim()
    const col2 = String(row[2] || '').trim()

    const esWallet = /^\d{20,}$/.test(col0)
    const esCedula = /^V-\d{7,8}$/.test(col1) || /^J-\d{7,8}$/.test(col1)
    const esNombre = col2.length > 2 && !col0.includes('T') && !col0.includes('Transaccion')

    return esWallet && esCedula && esNombre
  }

  private esFilaEncabezadoTransaccion(row: unknown[]): boolean {
    const col0 = String(row[0] || '').trim()
    return col0 === 'Fecha Transaccion'
  }

  private esFilaTransaccion(row: unknown[]): boolean {
    const col0 = row[0]

    if (col0 instanceof Date) {
      return true
    }

    const text = String(col0 || '')
    if (text.includes('T') && text.match(/^\d{4}-\d{2}-\d{2}/)) {
      return true
    }

    return false
  }

  private extraerDatosEmpleado(row: unknown[]): { codWallet: string; cedulaRif: string; nombre: string } {
    return {
      codWallet: String(row[0] || '').trim(),
      cedulaRif: String(row[1] || '').trim(),
      nombre: String(row[2] || '').trim()
    }
  }

  private extraerDatosTransaccion(row: unknown[], empleado: { codWallet: string; cedulaRif: string; nombre: string }): Transaccion | null {
    if (!empleado.cedulaRif || !empleado.nombre) {
      return null
    }

    let fechaTransaccion: Date | string
    if (row[0] instanceof Date) {
      fechaTransaccion = row[0]
    } else {
      const dateStr = String(row[0] || '')
      fechaTransaccion = dateStr.includes('T') ? new Date(dateStr) : dateStr
    }

    return {
      codWallet: empleado.codWallet,
      cedulaRif: empleado.cedulaRif,
      nombre: empleado.nombre,
      fechaTransaccion,
      nroReferencia: String(row[1] || '').trim(),
      sucursal: String(row[2] || '').trim(),
      usuarioCaja: String(row[3] || '').trim(),
      accion: String(row[4] || '').trim(),
      comentario: String(row[5] || '').trim(),
      monto: typeof row[6] === 'number' ? row[6] : 0,
      moneda: String(row[7] || 'Bs').trim()
    }
  }

  private formatearHora(value: unknown): string {
    if (value instanceof Date) {
      const h = value.getHours().toString().padStart(2, '0')
      const m = value.getMinutes().toString().padStart(2, '0')
      const s = value.getSeconds().toString().padStart(2, '0')
      return `${h}:${m}:${s}`
    }
    return String(value || '')
  }
}
