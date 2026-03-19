# Excel Encantador - Agent Guidelines

## Project Overview

Excel Encantador is a React application for processing Excel files and rendering user-friendly reports. Files are processed entirely in the frontend using the `xlsx` library. The application uses a plugin-based parser system for extensibility.

## Commands

### Development
```bash
npm run dev          # Start development server (http://localhost:5173)
npm run preview      # Preview production build
```

### Build & Type Check
```bash
npm run build        # Type check + production build
npx tsc -b          # TypeScript compilation only
```

### Linting
```bash
npm run lint         # Run ESLint on src/
```

## Code Style Guidelines

### General Principles
- Use **TypeScript** for all files (`.ts`, `.tsx`)
- Prefer functional components with hooks in React
- Use explicit types; avoid `any` unless absolutely necessary
- Handle errors gracefully with user-friendly messages

### Imports
```typescript
// Use path aliases (@/) for internal imports
import { Button } from '@/components/ui/button'
import type { Reporte } from '@/parsers/types'

// Group imports: external → internal → types
import { useState, useCallback } from 'react'
import { Download, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Reporte } from '@/parsers/types'
```

### File Naming
- Components: `PascalCase.tsx` (e.g., `FileUploader.tsx`, `ReportCard.tsx`)
- Utilities/Libraries: `camelCase.ts` (e.g., `excel.ts`, `utils.ts`)
- Parser modules: `camelCase.ts` in their respective folders

### TypeScript Conventions
```typescript
// Use interfaces for object shapes, types for unions/primitives
interface Reporte {
  id: string
  titulo: string
  columnas: Columna[]
  datos: Record<string, unknown>[]
}

// Use readonly for immutable data
interface Columna {
  readonly key: string
  readonly label: string
}

// Prefer explicit return types for functions
export function exportarAExcel(reporte: Reporte, nombreArchivo: string): void {
  // implementation
}
```

### React Conventions
```typescript
// Use named exports for components
export function FileUploader({ onFileProcessed }: FileUploaderProps) {
  // implementation
}

// Destructure props with explicit types
interface FileUploaderProps {
  readonly onFileProcessed: (result: ParseResult) => void
}

// Use useCallback for event handlers passed as props
const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (file) {
    procesarArchivo(file)
  }
}, [procesarArchivo])
```

### Error Handling
```typescript
// User-facing errors should be friendly messages
if (ext !== 'xls' && ext !== 'xlsx') {
  setError('Este Archivo no esta permitido verifique el formato')
}

// Internal errors should use proper Error objects
try {
  const rawData = await leerExcelComoJson(file)
  const result = ParserRegistry.procesar(rawData)
} catch (error) {
  throw new Error(`Error processing file: ${error instanceof Error ? error.message : 'Unknown'}`)
}

// Use empty catch blocks when intentionally ignoring errors
} catch {
  setError('Este Archivo no esta permitido verifique el formato')
}
```

### Tailwind CSS
```typescript
// Use shadcn/ui components for consistent styling
// Custom styles only when necessary
<div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg">

// Use CSS custom properties for theme values
background-color: hsl(var(--background))
```

## Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # shadcn/ui components (button, card, table, badge)
│   └── FileUploader.tsx  # Main upload + report viewer component
├── lib/                  # Utilities
│   ├── excel.ts         # Excel read/write functions
│   └── utils.ts         # cn() utility for Tailwind
├── parsers/              # Parser system (extensible)
│   ├── types.ts         # Shared TypeScript interfaces
│   ├── IParser.ts       # Parser interface definition
│   ├── ParserRegistry.ts # Parser registration and detection
│   └── consumo/          # Parser for consumo.xls
│       ├── index.ts     # Parser implementation
│       └── reportes.ts  # Report generators
├── App.tsx               # Main application layout
├── main.tsx              # Entry point
└── index.css            # Tailwind + theme variables
```

## Adding a New Parser

To add support for a new Excel format:

1. **Create parser directory**: `src/parsers/nuevo-formato/`
2. **Implement the parser** following `IParser` interface:
   ```typescript
   export class NuevoParser implements IParser {
     readonly nombre = 'nuevo-formato'
     readonly label = 'Nombre del Reporte'
     
     puedeParsear(headerRaw: string[]): boolean {
       // Return true if this parser can handle the file
     }
     
     parsear(rawData: unknown[][]): ReporteConsolidado {
       // Extract and structure the data
     }
     
     generarReportes(datos: ReporteConsolidado): Reporte[] {
       // Return array of reports to display
     }
   }
   ```
3. **Register in ParserRegistry**: `src/parsers/ParserRegistry.ts`
   ```typescript
   constructor() {
     this.register(new ConsumoParser())
     this.register(new NuevoParser())
   }
   ```

### Report Object Structure
```typescript
interface Reporte {
  id: string              // Unique identifier (e.g., 'totales_por_persona')
  titulo: string          // Display title
  descripcion?: string    // Optional description
  columnas: Columna[]      // Table headers
  datos: Record<string, unknown>[] | string[][]  // Table data
}

interface Columna {
  key: string    // Data field name
  label: string  // Display label
}
```

## Dependencies

- **React 19** - UI framework
- **Vite** - Build tool
- **TypeScript 5.9** - Type safety
- **Tailwind CSS 4** - Styling
- **xlsx** - Excel parsing (frontend)
- **lucide-react** - Icons
- **shadcn/ui** - UI component primitives (button, card, table, badge)

## File Validation Rules

- Extensions: `.xls`, `.xlsx` only
- Maximum size: 20MB
- Invalid files show: "Este Archivo no esta permitido verifique el formato"
