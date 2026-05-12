import type { Metadata } from "next";
import DataManager from "@/components/dashboard/DataManager";
import { mlFetch } from "@/lib/api-client";
import type { Dataset } from "@/types/dataset";

export const metadata: Metadata = {
  title: "Data Management",
  description:
    "Upload and manage ENEO consumption datasets and ERA5 weather data.",
};

/**
 * Server component wrapper to hydrate the data manager with initial data.
 */
export default async function DataPage() {
  let initialDatasets: Dataset[] = [];
  let initialError: string | null = null;

  try {
    // Load datasets on the server to avoid client-side fetch churn.
    initialDatasets = await mlFetch("/api/v1/datasets");
  } catch (error) {
    initialError =
      error instanceof Error ? error.message : "Failed to load datasets";
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Management</h1>
        <p className="mt-1 text-muted-foreground">
          Upload consumption and weather datasets, then validate and preview.
        </p>
      </div>

      <DataManager
        initialDatasets={initialDatasets}
        initialError={initialError}
      />
    </div>
  );
}
