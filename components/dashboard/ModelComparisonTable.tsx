import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { EvaluationResult, SourceType } from '@/types/model'

interface Props {
  results: EvaluationResult[]
}

const SOURCE_LABELS: Record<SourceType, string> = {
  RF: 'Random Forest',
  SVR: 'SVR',
  AGENT: 'LLM Agent',
}

export function ModelComparisonTable({ results }: Props) {
  if (results.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">
          No evaluation results yet.
        </p>
      </div>
    )
  }

  // Find best (lowest) MAPE
  const bestMape = Math.min(...results.map((r) => r.mape))

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Engine</TableHead>
          <TableHead className="text-right">RMSE</TableHead>
          <TableHead className="text-right">MAE</TableHead>
          <TableHead className="text-right">MAPE</TableHead>
          <TableHead className="text-right">R²</TableHead>
          <TableHead className="text-right">Test Size</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {results.map((r) => {
          const isBest = r.mape === bestMape
          const mapeWarning = r.mape > 20

          return (
            <TableRow key={r.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {isBest && <span className="text-yellow-500">★</span>}
                  {SOURCE_LABELS[r.sourceType]}
                  {mapeWarning && (
                    <Badge variant="destructive" className="text-[10px] px-1.5">
                      MAPE &gt; 20%
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right font-mono text-sm">
                {r.rmse.toFixed(1)}
              </TableCell>
              <TableCell className="text-right font-mono text-sm">
                {r.mae.toFixed(1)}
              </TableCell>
              <TableCell className={`text-right font-mono text-sm ${
                mapeWarning ? 'text-destructive' : isBest ? 'text-green-600' : ''
              }`}>
                {r.mape.toFixed(1)}%
              </TableCell>
              <TableCell className="text-right font-mono text-sm">
                {r.r2.toFixed(3)}
              </TableCell>
              <TableCell className="text-right font-mono text-sm">
                {r.testSetSize}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
