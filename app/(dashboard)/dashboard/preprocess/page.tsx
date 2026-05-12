import type { Metadata } from "next";
import PreprocessManager from "@/components/dashboard/PreprocessManager";
import { mlFetch } from "@/lib/api-client";
import type { Dataset, WeatherDataset } from "@/types/dataset";

export const metadata: Metadata = {
  title: "Pre-processing",
  description:
    "Run the data preprocessing pipeline — impute, detect outliers, engineer features, and split.",
};

/**
 * Server component wrapper to hydrate the preprocessing manager with initial data.
 */
export default async function PreprocessPage() {
  let initialDatasets: Dataset[] = [];
  let initialWeatherDatasets: WeatherDataset[] = [];
  let initialError: string | null = null;

  try {
    // Load datasets on the server to reduce client-side requests.
    const [datasets, weatherDatasets] = await Promise.all([
      mlFetch<Dataset[]>("/api/v1/datasets"),
      mlFetch<WeatherDataset[]>("/api/v1/datasets/weather"),
    ]);
    initialDatasets = datasets;
    initialWeatherDatasets = weatherDatasets;
  } catch (error) {
    initialError =
      error instanceof Error ? error.message : "Failed to load datasets";
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pre-processing</h1>
        <p className="mt-1 text-muted-foreground">
          Run the preprocessing pipeline on your uploaded dataset. Includes
          missing value imputation, outlier detection, feature engineering,
          normalisation, and train/val/test splitting.
        </p>
      </div>
      <PreprocessManager
        initialDatasets={initialDatasets}
        initialWeatherDatasets={initialWeatherDatasets}
        initialError={initialError}
      />
    </div>
  );
}
