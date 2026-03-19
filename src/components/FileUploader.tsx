import { useCallback, useState } from 'react'
import { Upload, FileUp, AlertCircle, CheckCircle, FileSpreadsheet } from 'lucide-react'
import { cn } from '@/lib/utils'
import { leerExcelComoJson, exportarAExcel } from '@/lib/excel'
import { ParserRegistry } from '@/parsers'
import type { Reporte, ParseResult } from '@/parsers/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const MAX_SIZE_MB = 20
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

interface FileUploaderProps {
  onFileProcessed: (result: ParseResult) => void
}

export function FileUploader({ onFileProcessed }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const procesarArchivo = useCallback(async (file: File) => {
    setError(null)
    setIsProcessing(true)

    try {
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (ext !== 'xls' && ext !== 'xlsx') {
        setError('Este Archivo no esta permitido verifique el formato')
        setIsProcessing(false)
        return
      }

      if (file.size > MAX_SIZE_BYTES) {
        setError(`El archivo excede el límite de ${MAX_SIZE_MB}MB`)
        setIsProcessing(false)
        return
      }

      const rawData = await leerExcelComoJson(file)
      const result = ParserRegistry.procesar(rawData)

      onFileProcessed(result)

      if (!result.valido) {
        setError(result.error || 'Este Archivo no esta permitido verifique el formato')
      }
    } catch {
      setError('Este Archivo no esta permitido verifique el formato')
    } finally {
      setIsProcessing(false)
    }
  }, [onFileProcessed])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      procesarArchivo(file)
    }
  }, [procesarArchivo])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      procesarArchivo(file)
    }
  }, [procesarArchivo])

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative rounded-3xl p-12 text-center transition-all duration-500 cursor-pointer overflow-hidden",
          "border-2 border-dashed",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border/50 bg-white/40 backdrop-blur-xl",
          isProcessing && "pointer-events-none opacity-60"
        )}
      >
        {/* Background decoration */}
        <div className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-500",
          isDragging && "opacity-100"
        )}>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <input
          type="file"
          accept=".xls,.xlsx"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          disabled={isProcessing}
        />

        <div className="relative z-10 flex flex-col items-center gap-6">
          {/* Icon */}
          <div className={cn(
            "relative transition-all duration-500",
            isDragging && "scale-110"
          )}>
            <div className={cn(
              "absolute inset-0 bg-primary/20 rounded-3xl blur-xl transition-opacity duration-500",
              isDragging ? "opacity-100" : "opacity-0"
            )} />
            <div className={cn(
              "relative p-5 rounded-3xl transition-all duration-300",
              isDragging 
                ? "bg-primary/15 border border-primary/30" 
                : "bg-muted/80 border border-border/50"
            )}>
              {isProcessing ? (
                <FileUp className="w-12 h-12 text-primary animate-pulse" />
              ) : (
                <Upload className={cn(
                  "w-12 h-12 transition-colors duration-300",
                  isDragging ? "text-primary" : "text-muted-foreground"
                )} />
              )}
            </div>
          </div>

          {/* Text */}
          <div className="space-y-2">
            <p className="text-xl font-medium">
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                  Procesando archivo...
                </span>
              ) : isDragging ? (
                <span className="text-primary">¡Suelta el archivo aquí!</span>
              ) : (
                'Arrastra tu archivo aquí'
              )}
            </p>
            <p className="text-sm text-muted-foreground">
              o haz clic para seleccionar un archivo
            </p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <Badge variant="outline" className="text-xs">
                .xls
              </Badge>
              <Badge variant="outline" className="text-xs">
                .xlsx
              </Badge>
              <span className="text-xs text-muted-foreground/60">
                máx. {MAX_SIZE_MB}MB
              </span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 animate-scale-in">
          <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/20 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-destructive">
              <div className="p-2 rounded-xl bg-destructive/10">
                <AlertCircle className="w-5 h-5" />
              </div>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface ReportCardProps {
  reporte: Reporte
  parserNombre: string
}

const formatearValor = (valor: unknown, numFmt?: string): string => {
  if (numFmt && typeof valor === 'number') {
    return Math.abs(valor).toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }
  return String(valor ?? '')
}

export function ReportCard({ reporte, parserNombre }: ReportCardProps) {
  const handleDescargar = () => {
    const nombreArchivo = `${parserNombre}_${reporte.id}`
    exportarAExcel(reporte, nombreArchivo)
  }

  return (
    <Card className="animate-fade-in-up overflow-hidden hover-lift">
      <CardHeader className="relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-start justify-between gap-4 relative">
          <div className="space-y-1">
            <CardTitle className="text-xl">{reporte.titulo}</CardTitle>
            {reporte.descripcion && (
              <CardDescription className="text-sm">{reporte.descripcion}</CardDescription>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDescargar}
            className="shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto max-h-[500px]">
          <Table>
            <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10">
              <TableRow className="border-b border-border/30">
                {reporte.columnas.map((col) => (
                  <TableHead key={col.key}>
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {(reporte.datos as Record<string, unknown>[]).map((row, i) => (
                <TableRow key={i}>
                  {reporte.columnas.map((col) => (
                    <TableCell key={col.key}>
                      {formatearValor(row[col.key], col.numFmt)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {(reporte.datos as Record<string, unknown>[]).length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={reporte.columnas.length}
                    className="text-center text-muted-foreground py-12"
                  >
                    No hay datos disponibles
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

interface ReportViewerProps {
  result: ParseResult
}

export function ReportViewer({ result }: ReportViewerProps) {
  if (!result.valido || !result.reportes) {
    return null
  }

  return (
    <div className="w-full space-y-8">
      {/* Success header */}
      <div className="flex items-center gap-4 animate-fade-in-up">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl" />
          <div className="relative p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          </div>
        </div>
        <div>
          <h2 className="font-display text-2xl font-semibold">
            ¡Archivo procesado exitosamente!
          </h2>
          <p className="text-muted-foreground">
            Se generaron <span className="font-medium text-foreground">{result.reportes.length}</span> reportes disponibles
          </p>
        </div>
      </div>

      {/* Parser badge */}
      <div className="animate-fade-in-up delay-100">
        <Badge variant="outline" className="text-sm px-4 py-2">
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          {result.parserLabel}
        </Badge>
      </div>

      {/* Reports grid */}
      <div className="grid gap-6">
        {result.reportes.map((reporte, index) => (
          <div 
            key={reporte.id} 
            className="animate-fade-in-up"
            style={{ animationDelay: `${(index + 2) * 100}ms` }}
          >
            <ReportCard
              reporte={reporte}
              parserNombre={result.parserNombre!}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
