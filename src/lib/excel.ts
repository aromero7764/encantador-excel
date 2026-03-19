import * as XLSX from 'xlsx'
import type { Reporte } from '@/parsers/types'

export function exportarAExcel(reporte: Reporte, nombreArchivo: string): void {
  const ws = XLSX.utils.json_to_sheet(reporte.datos as Record<string, unknown>[])

  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
  for (let col = range.s.c; col <= range.e.c; col++) {
    const column = reporte.columnas[col]
    if (column?.numFmt) {
      for (let row = range.s.r + 1; row <= range.e.r; row++) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: col })
        if (ws[cellRef]) {
          ws[cellRef].z = column.numFmt
        }
      }
    }
  }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, reporte.titulo)

  XLSX.writeFile(wb, `${nombreArchivo}.xlsx`)
}

export function leerExcelComoJson(file: File): Promise<unknown[][]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'array', cellDates: true })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        resolve(jsonData as unknown[][])
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'))
    }

    reader.readAsArrayBuffer(file)
  })
}
