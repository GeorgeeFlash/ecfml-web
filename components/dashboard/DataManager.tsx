"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { UploadDropzone } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  Dataset,
  DatasetPreview,
  ValidationStatus,
} from "@/types/dataset";

interface UploadedFile {
  name: string;
  key: string;
  url?: string;
  ufsUrl?: string;
}

interface DataManagerProps {
  initialDatasets: Dataset[];
  initialError?: string | null;
}

const STATUS_STYLES: Record<ValidationStatus, string> = {
  VALID: "text-emerald-500 dark:text-emerald-400",
  INVALID: "text-red-500 dark:text-red-400",
  WARNING: "text-amber-500 dark:text-amber-400",
  PENDING: "text-muted-foreground",
};

/**
 * Data management UI for dataset uploads, validation, and preview.
 */
export default function DataManager({
  initialDatasets,
  initialError = null,
}: DataManagerProps) {
  const [datasets, setDatasets] = useState<Dataset[]>(initialDatasets);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [preview, setPreview] = useState<DatasetPreview | null>(null);
  const [previewFor, setPreviewFor] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [weatherTargetDatasetId, setWeatherTargetDatasetId] = useState<
    string | null
  >(() => (initialDatasets.length === 1 ? initialDatasets[0].id : null));

  const selectedDataset = useMemo(
    () => datasets.find((dataset) => dataset.id === previewFor) ?? null,
    [datasets, previewFor],
  );

  /**
   * Load consumption datasets from the FastAPI proxy route.
   */
  const loadDatasets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/datasets");
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error ?? "Failed to load datasets");
      }
      const data: Dataset[] = await res.json();
      setDatasets(data);
      setWeatherTargetDatasetId((current) => {
        // Preserve the existing selection if it still exists.
        if (current && data.some((dataset) => dataset.id === current)) {
          return current;
        }
        return data.length === 1 ? data[0].id : null;
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load datasets";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a consumption dataset record after UploadThing completes.
   */
  const createDatasetRecord = useCallback(async (file: UploadedFile) => {
    const uploadthingUrl = file.ufsUrl ?? file.url;
    if (!uploadthingUrl || !file.key) {
      throw new Error("Upload response missing file data");
    }
    const res = await fetch("/api/datasets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: file.name,
        uploadthingUrl,
        uploadthingKey: file.key,
      }),
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      throw new Error(payload.error ?? "Failed to create dataset record");
    }
  }, []);

  /**
   * Create a weather dataset record linked to a consumption dataset.
   */
  const createWeatherDatasetRecord = useCallback(
    async (file: UploadedFile, datasetId: string) => {
      const uploadthingUrl = file.ufsUrl ?? file.url;
      if (!uploadthingUrl || !file.key) {
        throw new Error("Upload response missing file data");
      }
      const res = await fetch("/api/weather-datasets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datasetId,
          uploadthingUrl,
          uploadthingKey: file.key,
        }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error ?? "Failed to create weather dataset");
      }
    },
    [],
  );

  const handleConsumptionComplete = useCallback(
    async (files: UploadedFile[] | undefined) => {
      const file = files?.[0];
      if (!file) return;
      try {
        await createDatasetRecord(file);
        toast.success("Consumption dataset uploaded");
        await loadDatasets();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to save dataset";
        toast.error(message);
      }
    },
    [createDatasetRecord, loadDatasets],
  );

  const handleWeatherComplete = useCallback(
    async (files: UploadedFile[] | undefined) => {
      const file = files?.[0];
      if (!file) return;
      const resolvedDatasetId =
        weatherTargetDatasetId ??
        (datasets.length === 1 ? datasets[0].id : null);
      if (!resolvedDatasetId) {
        toast.error("Select a dataset before uploading weather data");
        return;
      }
      try {
        await createWeatherDatasetRecord(file, resolvedDatasetId);
        toast.success("Weather dataset uploaded");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to save weather dataset";
        toast.error(message);
      }
    },
    [createWeatherDatasetRecord, datasets, weatherTargetDatasetId],
  );

  const handleValidate = useCallback(
    async (datasetId: string) => {
      try {
        setActionId(datasetId);
        const res = await fetch(`/api/datasets/${datasetId}/validate`, {
          method: "POST",
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload.error ?? "Validation failed");
        }
        toast.success("Validation started");
        await loadDatasets();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Validation failed";
        toast.error(message);
      } finally {
        setActionId(null);
      }
    },
    [loadDatasets],
  );

  const handlePreview = useCallback(async (datasetId: string) => {
    try {
      setPreviewLoading(true);
      setPreviewFor(datasetId);
      const res = await fetch(`/api/datasets/${datasetId}/preview?rows=10`);
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error ?? "Preview failed");
      }
      const data: DatasetPreview = await res.json();
      setPreview(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Preview failed";
      toast.error(message);
      setPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  const resolvedWeatherTargetId =
    weatherTargetDatasetId ?? (datasets.length === 1 ? datasets[0].id : null);
  const weatherUploadDisabled =
    datasets.length === 0 || !resolvedWeatherTargetId;

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Consumption Dataset</CardTitle>
            <CardDescription>
              Upload ENEO electricity consumption data (CSV or Excel). Required
              columns: date/timestamp, consumption_kwh.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-4">
              <UploadDropzone
                endpoint="consumptionDataset"
                className="ut-label:text-sm ut-allowed-content:text-xs ut-allowed-content:text-muted-foreground"
                onClientUploadComplete={handleConsumptionComplete}
                onUploadError={(uploadError: Error) => {
                  toast.error(uploadError.message);
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weather Dataset</CardTitle>
            <CardDescription>
              Upload ERA5 weather data (temperature, humidity, rainfall) in CSV
              format. Optional — improves forecast accuracy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Attach to Dataset
                </p>
                <Select
                  value={resolvedWeatherTargetId ?? undefined}
                  onValueChange={(value) => setWeatherTargetDatasetId(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a consumption dataset" />
                  </SelectTrigger>
                  <SelectContent>
                    {datasets.map((dataset) => (
                      <SelectItem key={dataset.id} value={dataset.id}>
                        {dataset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {datasets.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Upload a consumption dataset before attaching weather data.
                  </p>
                ) : null}
              </div>

              <div
                className={cn(
                  "rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 transition-opacity",
                  weatherUploadDisabled && "opacity-60",
                )}
              >
                <div
                  className={
                    weatherUploadDisabled ? "pointer-events-none" : undefined
                  }
                >
                  <UploadDropzone
                    endpoint="weatherDataset"
                    className="ut-label:text-sm ut-allowed-content:text-xs ut-allowed-content:text-muted-foreground"
                    onClientUploadComplete={handleWeatherComplete}
                    onUploadError={(uploadError: Error) => {
                      toast.error(uploadError.message);
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Datasets</CardTitle>
          <CardDescription>
            Manage your uploaded datasets. Validate and preview before
            processing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex h-24 items-center justify-center rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground">
                Loading datasets...
              </p>
            </div>
          ) : error ? (
            <div className="flex h-24 items-center justify-center rounded-lg border border-dashed">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ) : datasets.length === 0 ? (
            <div className="flex h-24 items-center justify-center rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground">
                No datasets uploaded yet. Upload a consumption dataset to get
                started.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Rows</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {datasets.map((dataset) => (
                  <TableRow key={dataset.id}>
                    <TableCell className="max-w-60 truncate">
                      {dataset.name}
                    </TableCell>
                    <TableCell>{dataset.rowCount ?? "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={STATUS_STYLES[dataset.validationStatus]}
                      >
                        {dataset.validationStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(dataset.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="xs"
                          variant="outline"
                          disabled={actionId === dataset.id}
                          onClick={() => handleValidate(dataset.id)}
                        >
                          Validate
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          disabled={previewLoading && previewFor === dataset.id}
                          onClick={() => handlePreview(dataset.id)}
                        >
                          Preview
                        </Button>
                        {dataset.uploadthingUrl ? (
                          <Button size="xs" variant="ghost" asChild>
                            <a
                              href={dataset.uploadthingUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              View
                            </a>
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            Inspect the first few rows and validation details before
            preprocessing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {previewLoading ? (
            <div className="flex h-24 items-center justify-center rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground">
                Loading preview...
              </p>
            </div>
          ) : preview ? (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    {preview.columns.map((column) => (
                      <TableHead key={column}>{column}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.rows.map((row, rowIndex) => (
                    <TableRow key={`${previewFor ?? "preview"}-${rowIndex}`}>
                      {preview.columns.map((column) => (
                        <TableCell key={`${column}-${rowIndex}`}>
                          {row[column] ?? "—"}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {selectedDataset?.validationReport ? (
                <div className="rounded-lg border p-4 text-sm">
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">
                        Rows
                      </p>
                      <p className="font-medium">
                        {selectedDataset.validationReport.rowCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">
                        Missing Columns
                      </p>
                      <p className="font-medium">
                        {selectedDataset.validationReport.missingColumns
                          .length > 0
                          ? selectedDataset.validationReport.missingColumns.join(
                              ", ",
                            )
                          : "None"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">
                        Warnings
                      </p>
                      <p className="font-medium">
                        {selectedDataset.validationReport.warnings.length > 0
                          ? selectedDataset.validationReport.warnings.join(", ")
                          : "None"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex h-24 items-center justify-center rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground">
                Select a dataset to preview sample rows.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
