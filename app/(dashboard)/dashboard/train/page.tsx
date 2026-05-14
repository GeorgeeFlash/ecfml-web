import type { Metadata } from "next";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import TrainManager from "@/components/dashboard/TrainManager";

export const metadata: Metadata = {
  title: "Model Training",
  description: "Train Random Forest and SVR models on preprocessed data.",
};

export default function TrainPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Model Training</h1>
        <p className="mt-1 text-muted-foreground">
          Train Random Forest and SVR models. ANN and LSTM have been removed in
          v3.0 — use the LangGraph Agent on the Forecast page for LLM-based
          forecasting.
        </p>
      </div>

      <Alert>
        <AlertDescription>
          <strong>v3.0 Note:</strong> Only Random Forest and SVR are available
          for training. The LangGraph Agent engine does not require training —
          access it from the{" "}
          <a
            href="/dashboard/forecast"
            className="font-medium underline underline-offset-4"
          >
            Forecast
          </a>{" "}
          page.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Model configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Model Configuration</CardTitle>
            <CardDescription>
              Select a preprocessing job and configure hyperparameters.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TrainManager />
          </CardContent>
        </Card>

        {/* Previous runs */}
        <Card>
          <CardHeader>
            <CardTitle>Training History</CardTitle>
            <CardDescription>
              View previous model training runs and their status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">No history yet</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
