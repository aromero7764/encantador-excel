export interface Columna {
  key: string
  label: string
  numFmt?: string
}

export interface Reporte {
  id: string
  titulo: string
  descripcion?: string
  columnas: Columna[]
  datos: Record<string, unknown>[] | string[][]
}

export interface ReporteConsolidado {
  header: ReporteHeader
  transacciones: Transaccion[]
  resumen: Resumen
}

export interface ReporteHeader {
  empresa: string
  rif: string
  ubicacion: string
  telefono: string
  fecha: string
  hora: string
  tipoReporte: string
}

export interface Transaccion {
  codWallet?: string
  cedulaRif: string
  nombre: string
  fechaTransaccion: Date | string | number
  nroReferencia: string
  sucursal: string
  usuarioCaja?: string
  comentario?: string
  accion: string
  monto: number
  moneda: string
}

export interface Resumen {
  totalTransacciones: number
  totalMonto: number
  porSucursal: Record<string, number>
  porAccion: Record<string, number>
}

export interface ParseResult {
  valido: boolean
  parserNombre?: string
  parserLabel?: string
  datos?: ReporteConsolidado
  reportes?: Reporte[]
  error?: string
}

export interface TotalesPorPersona {
  cedulaRif: string
  nombre: string
  totalConsumo: number
  cantidadTransacciones: number
  promedioPorTransaccion: number
}

export interface TotalesPorSucursal {
  sucursal: string
  totalConsumo: number
  cantidadTransacciones: number
  cantidadEmpleados: number
}

export interface TotalesPorFecha {
  fecha: string
  totalConsumo: number
  cantidadTransacciones: number
}

export interface DetalleEmpleado {
  cedulaRif: string
  nombre: string
  codWallet: string
  transacciones: {
    fecha: string
    monto: number
    sucursal: string
    referencia: string
    accion: string
  }[]
  totalConsumo: number
  cantidadTransacciones: number
}
