import type { IParser } from './IParser'
import type { ParseResult } from './types'
import { ConsumoParser } from './consumo'

class ParserRegistryClass {
  private parsers: Map<string, IParser> = new Map()

  constructor() {
    this.register(new ConsumoParser())
  }

  register(parser: IParser): void {
    this.parsers.set(parser.nombre, parser)
  }

  getParser(nombre: string): IParser | undefined {
    return this.parsers.get(nombre)
  }

  getAllParsers(): IParser[] {
    return Array.from(this.parsers.values())
  }

  detectarParser(rawData: unknown[][]): IParser | null {
    const headerText = rawData.slice(0, 5).flat().map(v => String(v))
    
    for (const parser of this.parsers.values()) {
      if (parser.puedeParsear(headerText)) {
        return parser
      }
    }
    return null
  }

  procesar(rawData: unknown[][]): ParseResult {
    const parser = this.detectarParser(rawData)

    if (!parser) {
      return {
        valido: false,
        error: 'Este Archivo no esta permitido verifique el formato'
      }
    }

    try {
      const datos = parser.parsear(rawData)
      const reportes = parser.generarReportes(datos)

      return {
        valido: true,
        parserNombre: parser.nombre,
        parserLabel: parser.label,
        datos,
        reportes
      }
    } catch (error) {
      return {
        valido: false,
        error: error instanceof Error ? error.message : 'Error al procesar el archivo'
      }
    }
  }
}

export const ParserRegistry = new ParserRegistryClass()
