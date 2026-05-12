/** Dataset-related TypeScript types */

export type ValidationStatus = 'PENDING' | 'VALID' | 'INVALID' | 'WARNING'

export interface Dataset {
  id: string
  userId: string
  name: string
  uploadthingUrl: string
  uploadthingKey: string
  rowCount: number | null
  validationStatus: ValidationStatus
  validationReport: ValidationReport | null
  createdAt: string
  deletedAt: string | null
}

export interface ValidationReport {
  hasRequiredColumns: boolean
  missingColumns: string[]
  rowCount: number
  dateRange: [string, string] | null
  warnings: string[]
}

export interface WeatherDataset {
  id: string
  userId: string
  datasetId: string
  uploadthingUrl: string
  uploadthingKey: string
  createdAt: string
}

export interface DatasetUploadPayload {
  name: string
  uploadthingUrl: string
  uploadthingKey: string
}

export interface DatasetPreview {
  columns: string[]
  rows: Record<string, string | number | null>[]
  totalRows: number
}
