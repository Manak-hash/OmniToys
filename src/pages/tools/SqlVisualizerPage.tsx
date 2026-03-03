import { useState, useCallback, useEffect, useMemo } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { InputPane } from '@/components/tools/InputPane'
import { OutputPane } from '@/components/tools/OutputPane'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { Database, Table, Key, Link2, Download, Eye } from 'lucide-react'
import { toast } from 'sonner'

interface Column {
  name: string
  type: string
  isPrimary: boolean
  isForeign: boolean
  nullable: boolean
}

interface Table {
  name: string
  columns: Column[]
}

interface Relationship {
  fromTable: string
  fromColumn: string
  toTable: string
  toColumn: string
}

const EXAMPLE_SQL = `CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP
);

CREATE TABLE posts (
    id INT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE comments (
    id INT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    comment_text TEXT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);`

export default function SqlVisualizerPage() {
  const [sqlInput, setSqlInput] = useState(EXAMPLE_SQL)
  const [tables, setTables] = useState<Table[]>([])
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [showPreview, setShowPreview] = useState(false)

  // Parse SQL CREATE statements
  const parseSQL = useCallback((sql: string) => {
    const parsedTables: Table[] = []
    const parsedRelationships: Relationship[] = []

    // Split by CREATE TABLE statements
    const createStatements = sql.match(/CREATE\s+TABLE\s+(\w+)\s*\(([\s\S]*?)\);/gi) || []

    createStatements.forEach((statement: string) => {
      const tableNameMatch = statement.match(/CREATE\s+TABLE\s+(\w+)/i)
      if (!tableNameMatch) return

      const tableName = tableNameMatch[1]
      const columnsBlockMatch = statement.match(/\(([\s\S]*)\)/)
      const columnsBlock = columnsBlockMatch?.[1] || ''

      // Parse columns
      const lines = columnsBlock.split(',').map((l) => l.trim())
      const columns: Column[] = []

      lines.forEach((line) => {
        // Skip constraints that span multiple lines
        if (line.startsWith('PRIMARY KEY') || line.startsWith('FOREIGN KEY') || line.startsWith('CONSTRAINT')) {
          // Parse foreign key relationships
          const fkMatch = line.match(/FOREIGN KEY\s+\((\w+)\)\s+REFERENCES\s+(\w+)\((\w+)\)/i)
          if (fkMatch) {
            parsedRelationships.push({
              fromTable: tableName,
              fromColumn: fkMatch[1],
              toTable: fkMatch[2],
              toColumn: fkMatch[3],
            })
          }
          return
        }

        const parts = line.split(/\s+/)
        if (parts.length < 2) return

        const name = parts[0]
        const type = parts[1]
        const rest = parts.slice(2).join(' ').toUpperCase()

        columns.push({
          name,
          type,
          isPrimary: rest.includes('PRIMARY KEY'),
          isForeign: rest.includes('FOREIGN KEY'),
          nullable: !rest.includes('NOT NULL'),
        })
      })

      // Also check for inline foreign keys
      lines.forEach((line) => {
        const inlineFkMatch = line.match(/(\w+)\s+\w+.*REFERENCES\s+(\w+)\((\w+)\)/i)
        if (inlineFkMatch) {
          const existingRel = parsedRelationships.find(
            (r) => r.fromTable === tableName && r.fromColumn === inlineFkMatch[1]
          )
          if (!existingRel) {
            parsedRelationships.push({
              fromTable: tableName,
              fromColumn: inlineFkMatch[1],
              toTable: inlineFkMatch[2],
              toColumn: inlineFkMatch[3],
            })
          }
        }
      })

      parsedTables.push({ name: tableName, columns })
    })

    setTables(parsedTables)
    setRelationships(parsedRelationships)
  }, [])

  // Parse on mount and input change
  useEffect(() => {
    parseSQL(sqlInput)
  }, [sqlInput, parseSQL])

  // Export as Mermaid diagram
  const exportMermaid = useCallback(() => {
    let mermaid = 'erDiagram\n'

    tables.forEach((table) => {
      table.columns.forEach((col) => {
        const colType = col.isPrimary ? 'PK' : col.isForeign ? 'FK' : ''
        mermaid += `    ${table.name} {
${colType ? '        ' + colType + ' ' : ''}${col.name} ${col.type}\n`
        })
      })

    relationships.forEach((rel) => {
      mermaid += `    ${rel.fromTable} ||--o{ ${rel.toTable} : "${rel.fromColumn} -> ${rel.toColumn}"\n`
    })

    return mermaid
  }, [tables, relationships])

  const handleExport = useCallback(() => {
    const mermaid = exportMermaid()
    navigator.clipboard.writeText(mermaid)
    toast.success('Mermaid diagram copied to clipboard!')
  }, [exportMermaid])

  // Calculate positions for tables in a simple grid layout
  const tablePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {}
    const cols = Math.ceil(Math.sqrt(tables.length))
    tables.forEach((table, i) => {
      positions[table.name] = {
        x: (i % cols) * 320,
        y: Math.floor(i / cols) * 250,
      }
    })
    return positions
  }, [tables])

  return (
    <ToolLayout
      title="SQL Schema Visualizer"
      description="Convert CREATE TABLE statements to entity-relationship diagrams"
      icon={<Database className="w-8 h-8" />}
      actions={
        <ActionToolbar
          onReset={() => {
            setSqlInput(EXAMPLE_SQL)
            setShowPreview(false)
          }}
        />
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-[500px]">
        {/* Input Panel */}
        <InputPane title="SQL Input">
          <div className="flex flex-col h-full">
            <textarea
              value={sqlInput}
              onChange={(e) => setSqlInput(e.target.value)}
              placeholder="Paste your SQL CREATE TABLE statements here..."
              className="flex-1 w-full bg-transparent border-none text-sm font-mono text-omni-text p-4 focus:outline-none resize-none"
              spellCheck={false}
            />
          </div>
        </InputPane>

        {/* Output Panel */}
        <OutputPane title="ER Diagram" rightElement={<button onClick={() => setShowPreview(!showPreview)} className="p-2 hover:bg-omni-text/5 rounded-lg transition-colors" title="Toggle view">
            <Eye className="w-4 h-4 text-omni-text/50" />
          </button>}>
        <div className="flex flex-col h-full">
          {showPreview ? (
            // Mermaid Code View
            <div className="flex-1 p-4 overflow-auto">
              <pre className="text-xs font-mono text-omni-text/70 whitespace-pre-wrap">{exportMermaid()}</pre>
            </div>
          ) : (
            // Visual Diagram View
            <div className="flex-1 p-6 overflow-auto relative bg-omni-bg/40">
              {tables.length === 0 ? (
                <div className="flex items-center justify-center h-full text-omni-text/30">
                  <div className="text-center">
                    <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No valid CREATE TABLE statements found</p>
                  </div>
                </div>
              ) : (
                <div className="relative min-w-[600px] min-h-[400px]">
                  {/* Connection Lines (SVG) */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                    {relationships.map((rel, idx) => {
                      const fromPos = tablePositions[rel.fromTable]
                      const toPos = tablePositions[rel.toTable]
                      if (!fromPos || !toPos) return null

                      // Simple line from center to center
                      const fromX = fromPos.x + 150
                      const fromY = fromPos.y + 100
                      const toX = toPos.x + 150
                      const toY = toPos.y + 100

                      return (
                        <g key={idx}>
                          <line
                            x1={fromX}
                            y1={fromY}
                            x2={toX}
                            y2={toY}
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-omni-primary/50"
                            strokeDasharray="5,5"
                          />
                          <circle cx={fromX} cy={fromY} r="4" className="fill-omni-primary" />
                          <circle cx={toX} cy={toY} r="4" className="fill-omni-primary" />
                        </g>
                      )
                    })}
                  </svg>

                  {/* Table Cards */}
                  {tables.map((table) => {
                    const pos = tablePositions[table.name]
                    if (!pos) return null

                    return (
                      <div
                        key={table.name}
                        className="absolute glass-card rounded-xl overflow-hidden border border-omni-text/10 shadow-lg"
                        style={{
                          left: pos.x,
                          top: pos.y,
                          width: '280px',
                          zIndex: 1,
                        }}
                      >
                        {/* Table Header */}
                        <div className="bg-omni-primary/10 border-b border-omni-text/10 px-4 py-3 flex items-center gap-2">
                          <Table className="w-4 h-4 text-omni-primary" />
                          <h3 className="font-bold text-omni-text">{table.name}</h3>
                        </div>

                        {/* Columns */}
                        <div className="p-3 space-y-1">
                          {table.columns.map((col) => (
                            <div
                              key={col.name}
                              className="flex items-center gap-2 text-xs p-2 rounded bg-omni-text/5"
                            >
                              <div className="flex items-center gap-1 min-w-[40px]">
                                {col.isPrimary && <Key className="w-3 h-3 text-yellow-500" />}
                                {col.isForeign && <Link2 className="w-3 h-3 text-omni-primary" />}
                              </div>
                              <span className="font-mono font-medium flex-1">{col.name}</span>
                              <span className="text-omni-text/50 text-[10px]">{col.type}</span>
                              {!col.nullable && <span className="text-red-400 text-[10px]">NOT NULL</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Relationships List */}
          {relationships.length > 0 && (
            <div className="border-t border-omni-text/5 p-4 bg-omni-bg/40">
              <h4 className="text-xs font-bold text-omni-text/50 uppercase tracking-wider mb-3">
                Relationships ({relationships.length})
              </h4>
              <div className="space-y-2 max-h-32 overflow-auto">
                {relationships.map((rel, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs bg-omni-text/5 p-2 rounded">
                    <span className="font-mono font-medium text-omni-primary">{rel.fromTable}.{rel.fromColumn}</span>
                    <Link2 className="w-3 h-3 text-omni-text/30" />
                    <span className="font-mono font-medium text-omni-primary">{rel.toTable}.{rel.toColumn}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Export Button */}
          <div className="border-t border-omni-text/5 p-4 flex gap-3">
            <button
              onClick={handleExport}
              className="flex-1 py-3 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-omni-primary/20 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Copy Mermaid
            </button>
          </div>
        </div>
      </OutputPane>
    </div>
    </ToolLayout>
  )
}
