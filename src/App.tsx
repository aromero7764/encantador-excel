import { useState } from 'react'
import { FileSpreadsheet, Heart, Sparkles } from 'lucide-react'
import { FileUploader, ReportViewer } from '@/components/FileUploader'
import type { ParseResult } from '@/parsers/types'

function App() {
  const [result, setResult] = useState<ParseResult | null>(null)

  return (
    <div className="min-h-screen gradient-warm noise relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-primary/5 via-transparent to-transparent rounded-full blur-3xl animate-float-delayed pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 border-b border-border/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center gap-4 animate-fade-in-up">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl" />
              <div className="relative p-3.5 bg-primary/10 rounded-2xl border border-primary/20">
                <FileSpreadsheet className="w-7 h-7 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight">
                Formateador de Excel
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Transforma tus archivos Excel en reportes elegantes
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 container mx-auto px-4 py-12">
        {/* Hero upload section */}
        <div className="mb-16 animate-fade-in-up delay-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-sm text-primary mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Procesamiento en tiempo real</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight mb-4">
              Carga tu archivo Excel
            </h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Soporta archivos .xls y .xlsx hasta 20MB. 
              Detectamos automáticamente el formato y generamos los mejores reportes.
            </p>
          </div>
          
          <FileUploader onFileProcessed={setResult} />
        </div>

        {/* Reports section */}
        {result && result.valido && (
          <div className="animate-fade-in-up delay-200">
            <ReportViewer result={result} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 py-6">
          <p className="text-sm text-muted-foreground text-center">
            El Encantador de Excels — Hecho con 
            <span className="inline-flex items-center gap-1 mx-1">
               <Heart className="w-3 h-3 text-primary" />
            </span>
            para simplificar tus reportes
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
