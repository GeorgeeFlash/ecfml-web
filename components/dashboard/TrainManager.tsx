"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useJobPoller } from "@/hooks/use-job-poller";
import type {
  JobStatus,
  ModelType,
  RFHyperparams,
  SVRHyperparams,
} from "@/types/model";

interface PreprocessJobRecord {
  job_id: string;
  status: JobStatus;
  created_at: string;
  result_summary?: {
    row_count?: number;
    feature_count?: number;
    missing_values_before?: number;
    missing_values_after?: number;
    outlier_count?: number;
    outlier_percentage?: number;
  } | null;
  processed_file_path?: string;
}

interface TrainingHistoryRecord {
  job_id: string;
  status: JobStatus;
  model_type: ModelType;
  created_at: string;
  training_time_secs?: number;
  error?: string;
}

const STATUS_STYLES: Record<JobStatus, string> = {
  PENDING: "text-muted-foreground",
  RUNNING: "text-blue-500 dark:text-blue-400",
  COMPLETE: "text-emerald-500 dark:text-emerald-400",
  FAILED: "text-red-500 dark:text-red-400",
  WARNING: "text-amber-500 dark:text-amber-400",
};

const DEFAULT_RF_PARAMS: RFHyperparams = {
  n_estimators: 200,
  max_depth: null,
  min_samples_split: 2,
  enable_grid_search: false,
};

const DEFAULT_SVR_PARAMS: SVRHyperparams = {
  kernel: "rbf",
  C: 1.0,
  epsilon: 0.1,
  gamma: "scale",
};

/**
 * Component for configuring and training ML models.
 */
export default function TrainManager() {
  const [jobs, setJobs] = useState<PreprocessJobRecord[]>([]);
  const [trainingHistory, setTrainingHistory] = useState<
    TrainingHistoryRecord[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] =
    useState<ModelType>("RANDOM_FOREST");
  const [isTraining, setIsTraining] = useState(false);
  const [currentTrainingJobId, setCurrentTrainingJobId] = useState<
    string | null
  >(null);

  // Hyperparameters
  const [rfParams, setRfParams] = useState<RFHyperparams>(DEFAULT_RF_PARAMS);
  const [svrParams, setSvrParams] =
    useState<SVRHyperparams>(DEFAULT_SVR_PARAMS);

  // Fetch preprocessing jobs on mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/preprocess/jobs");
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(
            payload.error ?? "Failed to fetch preprocessing jobs",
          );
        }
        const { data } = await res.json();
        // Filter to only completed jobs
        const completed = (Array.isArray(data) ? data : []).filter(
          (job: PreprocessJobRecord) => job.status === "COMPLETE",
        );
        setJobs(completed);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load jobs";
        toast.error(message);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Fetch training history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/models/jobs");
        if (!res.ok) {
          // If endpoint doesn't exist, silently fail
          return;
        }
        const { data } = await res.json();
        setTrainingHistory(Array.isArray(data) ? data : []);
      } catch {
        // Silently fail if training history endpoint doesn't exist
      }
    };

    fetchHistory();
  }, []);

  const selectedJob = useMemo(
    () => jobs.find((job) => job.job_id === selectedJobId) ?? null,
    [jobs, selectedJobId],
  );

  const handleStartTraining = useCallback(async () => {
    if (!selectedJob) {
      toast.error("Select a preprocessing job to train");
      return;
    }

    try {
      setIsTraining(true);
      const hyperparams =
        selectedModel === "RANDOM_FOREST" ? rfParams : svrParams;

      const payload = {
        job_id: `train_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        preprocess_job_id: selectedJob.job_id,
        model_type: selectedModel,
        hyperparams,
        processed_file_path: selectedJob.processed_file_path,
      };

      const res = await fetch("/api/models/train", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to start training");
      }

      const data = await res.json();
      // response is wrapped as { data: ... }
      const returned = data?.data ?? data ?? {};
      const returnedJobId = returned.job_id ?? returned.jobId ?? payload.job_id;
      setCurrentTrainingJobId(returnedJobId ?? null);
      toast.success("Training started");
      // Optionally update history
      setTrainingHistory((prev) => [
        {
          job_id: payload.job_id,
          status: "PENDING",
          model_type: selectedModel,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to start training";
      toast.error(message);
    } finally {
      setIsTraining(false);
    }
  }, [selectedJob, selectedModel, rfParams, svrParams]);

  // Poll training job status
  const trainingState = useJobPoller(currentTrainingJobId);

  useEffect(() => {
    if (!currentTrainingJobId || !trainingState) return;
    // Update history when status changes
    if (trainingState.status) {
      setTrainingHistory((prev) => {
        const exists = prev.find((p) => p.job_id === currentTrainingJobId);
        const entry = {
          job_id: currentTrainingJobId,
          status: trainingState.status as JobStatus,
          model_type: selectedModel,
          created_at: new Date().toISOString(),
          training_time_secs: undefined,
          error: trainingState.error,
        } as TrainingHistoryRecord;
        if (exists) {
          return prev.map((p) =>
            p.job_id === currentTrainingJobId ? { ...p, ...entry } : p,
          );
        }
        return [entry, ...prev];
      });
    }

    if (trainingState.status === "COMPLETE") {
      toast.success("Training completed");
      setCurrentTrainingJobId(null);
    } else if (trainingState.status === "FAILED") {
      toast.error(trainingState.error ?? "Training failed");
      setCurrentTrainingJobId(null);
    }
  }, [currentTrainingJobId, trainingState, selectedModel]);

  const updateRFParam = (key: keyof RFHyperparams, value: unknown) => {
    setRfParams((prev) => ({ ...prev, [key]: value }));
  };

  const updateSVRParam = (key: keyof SVRHyperparams, value: unknown) => {
    setSvrParams((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Model configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Model Configuration</CardTitle>
          <CardDescription>
            Select a preprocessing job and configure hyperparameters.
          </CardDescription>
        </CardHeader>
        {(currentTrainingJobId || isTraining) && (
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                Training job: {currentTrainingJobId ?? "pending"}
              </div>
              <div
                className={`text-sm ${STATUS_STYLES[(trainingState?.status ?? "PENDING") as JobStatus]}`}
              >
                {trainingState?.status ?? (isTraining ? "PENDING" : "IDLE")}
              </div>
            </div>
            <div className="mt-3">
              <Progress
                value={Math.round((trainingState?.progress ?? 0) * 100)}
              />
            </div>
            {trainingState?.error && (
              <p className="mt-2 text-sm text-red-500">{trainingState.error}</p>
            )}
          </div>
        )}
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="job-select">Pre-processing Job</Label>
            <Select
              value={selectedJobId ?? undefined}
              onValueChange={setSelectedJobId}
            >
              <SelectTrigger id="job-select" className="w-full">
                <SelectValue placeholder="Select a completed preprocessing job" />
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    Loading jobs...
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No completed preprocessing jobs
                  </div>
                ) : (
                  jobs.map((job) => (
                    <SelectItem key={job.job_id} value={job.job_id}>
                      {job.job_id} ({job.status})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedJob?.result_summary && (
              <div className="rounded-md bg-muted p-2 text-xs">
                <p>
                  <strong>Rows:</strong>{" "}
                  {selectedJob.result_summary.row_count ?? 0}
                </p>
                <p>
                  <strong>Features:</strong>{" "}
                  {selectedJob.result_summary.feature_count ?? 0}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Select Model</Label>
            <div className="flex gap-3">
              <Badge
                variant={
                  selectedModel === "RANDOM_FOREST" ? "default" : "secondary"
                }
                className="cursor-pointer px-4 py-1.5"
                onClick={() => setSelectedModel("RANDOM_FOREST")}
              >
                Random Forest
              </Badge>
              <Badge
                variant={selectedModel === "SVR" ? "default" : "secondary"}
                className="cursor-pointer px-4 py-1.5"
                onClick={() => setSelectedModel("SVR")}
              >
                SVR
              </Badge>
            </div>
          </div>

          {/* RF Hyperparameters */}
          {selectedModel === "RANDOM_FOREST" && (
            <div className="space-y-3 rounded-lg border p-4">
              <p className="text-sm font-medium">
                Random Forest Hyperparameters
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    N Estimators
                  </label>
                  <Input
                    type="number"
                    value={rfParams.n_estimators}
                    onChange={(e) =>
                      updateRFParam(
                        "n_estimators",
                        parseInt(e.target.value) || 200,
                      )
                    }
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    Max Depth
                  </label>
                  <Input
                    type="number"
                    placeholder="None"
                    value={rfParams.max_depth ?? ""}
                    onChange={(e) =>
                      updateRFParam(
                        "max_depth",
                        e.target.value ? parseInt(e.target.value) : null,
                      )
                    }
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    Min Samples Split
                  </label>
                  <Input
                    type="number"
                    value={rfParams.min_samples_split}
                    onChange={(e) =>
                      updateRFParam(
                        "min_samples_split",
                        parseInt(e.target.value) || 2,
                      )
                    }
                    className="h-9"
                  />
                </div>
              </div>
            </div>
          )}

          {selectedModel === "SVR" && (
            <div className="space-y-3 rounded-lg border p-4">
              <p className="text-sm font-medium">SVR Hyperparameters</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    Kernel
                  </label>
                  <Input
                    value={svrParams.kernel}
                    onChange={(e) => updateSVRParam("kernel", e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">C</label>
                  <Input
                    type="number"
                    value={svrParams.C}
                    onChange={(e) =>
                      updateSVRParam("C", parseFloat(e.target.value) || 1.0)
                    }
                    className="h-9"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mt-2">
            <Button
              className="w-full"
              onClick={handleStartTraining}
              disabled={isTraining || !selectedJobId}
            >
              Start Training
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Training history */}
      <Card>
        <CardHeader>
          <CardTitle>Training History</CardTitle>
          <CardDescription>View previous training runs</CardDescription>
        </CardHeader>
        <CardContent>
          {trainingHistory.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No training runs yet
            </div>
          ) : (
            <div className="space-y-2">
              {trainingHistory.slice(0, 5).map((h) => (
                <div key={h.job_id} className="rounded-lg border p-2">
                  <div className="text-sm">{h.job_id}</div>
                  <div className="text-xs text-muted-foreground">
                    {h.model_type} — {h.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
