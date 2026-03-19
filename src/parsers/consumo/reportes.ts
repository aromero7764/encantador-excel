import type {
  ReporteConsolidado,
  Reporte,
  Transaccion,
  TotalesPorPersona,
  TotalesPorSucursal,
  TotalesPorFecha,
  DetalleEmpleado,
} from '../types'

export function calcularResumen(transacciones: Transaccion[]) {
  const porSucursal: Record<string, number> = {}
  const porAccion: Record<string, number> = {}
  let totalMonto = 0

  transacciones.forEach(t => {
    const monto = Math.abs(t.monto)
    totalMonto += monto

    if (t.sucursal) {
      porSucursal[t.sucursal] = (porSucursal[t.sucursal] || 0) + monto
    }
    if (t.accion) {
      porAccion[t.accion] = (porAccion[t.accion] || 0) + monto
    }
  })

  return {
    totalTransacciones: transacciones.length,
    totalMonto,
    porSucursal,
    porAccion
  }
}

export function generarTotalesPorPersona(transacciones: Transaccion[]): TotalesPorPersona[] {
  const map = new Map<string, TotalesPorPersona>()

  transacciones.forEach(t => {
    const key = t.cedulaRif
    const existente = map.get(key)

    if (existente) {
      existente.totalConsumo += Math.abs(t.monto)
      existente.cantidadTransacciones += 1
    } else {
      map.set(key, {
        cedulaRif: t.cedulaRif,
        nombre: t.nombre,
        totalConsumo: Math.abs(t.monto),
        cantidadTransacciones: 1,
        promedioPorTransaccion: Math.abs(t.monto)
      })
    }
  })

  map.forEach(p => {
    p.promedioPorTransaccion = p.totalConsumo / p.cantidadTransacciones
  })

  return Array.from(map.values()).sort((a, b) => b.totalConsumo - a.totalConsumo)
}

export function generarTotalesPorSucursal(transacciones: Transaccion[]): TotalesPorSucursal[] {
  const map = new Map<string, TotalesPorSucursal>()
  const empleadosPorSucursal = new Map<string, Set<string>>()

  transacciones.forEach(t => {
    const key = t.sucursal
    const existente = map.get(key)

    if (!empleadosPorSucursal.has(t.sucursal)) {
      empleadosPorSucursal.set(t.sucursal, new Set())
    }
    empleadosPorSucursal.get(t.sucursal)!.add(t.cedulaRif)

    if (existente) {
      existente.totalConsumo += Math.abs(t.monto)
      existente.cantidadTransacciones += 1
    } else {
      map.set(key, {
        sucursal: key,
        totalConsumo: Math.abs(t.monto),
        cantidadTransacciones: 1,
        cantidadEmpleados: 0
      })
    }
  })

  map.forEach((v, k) => {
    v.cantidadEmpleados = empleadosPorSucursal.get(k)?.size || 0
  })

  return Array.from(map.values()).sort((a, b) => b.totalConsumo - a.totalConsumo)
}

export function generarTotalesPorFecha(transacciones: Transaccion[]): TotalesPorFecha[] {
  const map = new Map<string, TotalesPorFecha>()

  transacciones.forEach(t => {
    const fecha = t.fechaTransaccion instanceof Date
      ? t.fechaTransaccion.toISOString().split('T')[0]
      : String(t.fechaTransaccion).split('T')[0]
    
    const existente = map.get(fecha)

    if (existente) {
      existente.totalConsumo += Math.abs(t.monto)
      existente.cantidadTransacciones += 1
    } else {
      map.set(fecha, {
        fecha,
        totalConsumo: Math.abs(t.monto),
        cantidadTransacciones: 1
      })
    }
  })

  return Array.from(map.values()).sort((a, b) => a.fecha.localeCompare(b.fecha))
}

export function generarDetalleEmpleado(transacciones: Transaccion[]): DetalleEmpleado[] {
  const map = new Map<string, DetalleEmpleado>()

  transacciones.forEach(t => {
    const key = t.cedulaRif
    const existente = map.get(key)

    const transaccion = {
      fecha: t.fechaTransaccion instanceof Date
        ? t.fechaTransaccion.toISOString().split('T')[0]
        : String(t.fechaTransaccion).split('T')[0],
      monto: Math.abs(t.monto),
      sucursal: t.sucursal,
      referencia: t.nroReferencia,
      accion: t.accion
    }

    if (existente) {
      existente.transacciones.push(transaccion)
      existente.totalConsumo += Math.abs(t.monto)
      existente.cantidadTransacciones += 1
    } else {
      map.set(key, {
        cedulaRif: t.cedulaRif,
        nombre: t.nombre,
        codWallet: t.codWallet || '',
        transacciones: [transaccion],
        totalConsumo: Math.abs(t.monto),
        cantidadTransacciones: 1
      })
    }
  })

  return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre))
}

export function crearReporteTotalesPorPersona(personas: TotalesPorPersona[]): Reporte {
  return {
    id: 'totales_por_persona',
    titulo: 'Totales por Persona',
    descripcion: 'Consumo total agrupado por empleado',
    columnas: [
      { key: 'posicion', label: '#' },
      { key: 'cedulaRif', label: 'Cédula/RIF' },
      { key: 'nombre', label: 'Nombre' },
      { key: 'totalConsumo', label: 'Total Consumo (Bs)', numFmt: '#,##0.00' },
      { key: 'cantidadTransacciones', label: 'Transacciones' },
      { key: 'promedioPorTransaccion', label: 'Promedio (Bs)', numFmt: '#,##0.00' }
    ],
    datos: personas.map((p, i) => ({
      posicion: i + 1,
      cedulaRif: p.cedulaRif,
      nombre: p.nombre,
      totalConsumo: Math.abs(p.totalConsumo),
      cantidadTransacciones: p.cantidadTransacciones,
      promedioPorTransaccion: Math.abs(p.promedioPorTransaccion)
    }))
  }
}

export function crearReporteTotalesPorSucursal(sucursales: TotalesPorSucursal[]): Reporte {
  return {
    id: 'totales_por_sucursal',
    titulo: 'Totales por Sucursal',
    descripcion: 'Consumo total agrupado por sucursal',
    columnas: [
      { key: 'sucursal', label: 'Sucursal' },
      { key: 'totalConsumo', label: 'Total Consumo (Bs)', numFmt: '#,##0.00' },
      { key: 'cantidadTransacciones', label: 'Transacciones' },
      { key: 'cantidadEmpleados', label: 'Empleados' }
    ],
    datos: sucursales.map(s => ({
      sucursal: s.sucursal,
      totalConsumo: Math.abs(s.totalConsumo),
      cantidadTransacciones: s.cantidadTransacciones,
      cantidadEmpleados: s.cantidadEmpleados
    }))
  }
}

export function crearReporteTotalesPorFecha(fechas: TotalesPorFecha[]): Reporte {
  return {
    id: 'totales_por_fecha',
    titulo: 'Totales por Fecha',
    descripcion: 'Consumo total agrupado por fecha',
    columnas: [
      { key: 'fecha', label: 'Fecha' },
      { key: 'totalConsumo', label: 'Total Consumo (Bs)', numFmt: '#,##0.00' },
      { key: 'cantidadTransacciones', label: 'Transacciones' }
    ],
    datos: fechas.map(f => ({
      fecha: f.fecha,
      totalConsumo: Math.abs(f.totalConsumo),
      cantidadTransacciones: f.cantidadTransacciones
    }))
  }
}

export function crearReporteDetalleTransacciones(transacciones: Transaccion[]): Reporte {
  return {
    id: 'detalle_transacciones',
    titulo: 'Detalle de Transacciones',
    descripcion: 'Todas las transacciones registradas',
    columnas: [
      { key: 'cedulaRif', label: 'Cédula/RIF' },
      { key: 'nombre', label: 'Nombre' },
      { key: 'fechaTransaccion', label: 'Fecha' },
      { key: 'sucursal', label: 'Sucursal' },
      { key: 'nroReferencia', label: 'Referencia' },
      { key: 'accion', label: 'Acción' },
      { key: 'monto', label: 'Monto (Bs)', numFmt: '#,##0.00' }
    ],
    datos: transacciones.map(t => ({
      cedulaRif: t.cedulaRif,
      nombre: t.nombre,
      fechaTransaccion: t.fechaTransaccion instanceof Date
        ? t.fechaTransaccion.toISOString().split('T')[0]
        : String(t.fechaTransaccion).split('T')[0],
      sucursal: t.sucursal,
      nroReferencia: t.nroReferencia,
      accion: t.accion,
      monto: Math.abs(t.monto)
    }))
  }
}

export function crearReporteResumen(datos: ReporteConsolidado): Reporte {
  const fmtMonto = (n: number) => Math.abs(n).toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })

  return {
    id: 'resumen_general',
    titulo: 'Resumen General',
    descripcion: `Reporte de ${datos.header.empresa} - ${datos.header.tipoReporte}`,
    columnas: [
      { key: 'metrica', label: 'Métrica' },
      { key: 'valor', label: 'Valor' }
    ],
    datos: [
      { metrica: 'Empresa', valor: datos.header.empresa },
      { metrica: 'RIF', valor: datos.header.rif },
      { metrica: 'Ubicación', valor: datos.header.ubicacion },
      { metrica: 'Fecha', valor: String(datos.header.fecha) },
      { metrica: 'Hora', valor: datos.header.hora },
      { metrica: 'Tipo de Reporte', valor: datos.header.tipoReporte },
      { metrica: 'Total Transacciones', valor: datos.resumen.totalTransacciones },
      { metrica: 'Total Monto', valor: `Bs ${fmtMonto(datos.resumen.totalMonto)}` }
    ]
  }
}
