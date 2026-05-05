import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import {
  CheckCircle2,
  CloudUpload,
  Database,
  RefreshCw,
  ServerCrash,
  SkipForward,
} from "lucide-react";
import { toast } from "sonner";
import { listBackups, triggerBackup } from "./backup.action";
import type { BackupFile } from "./backup.action";

// ---------- Helpers ----------

function getDateFromFilename(name: string): string {
  // e.g. "backup-2026-05-05.dump" → "2026-05-05"
  const match = name.match(/backup-(\d{4}-\d{2}-\d{2})\.dump/);
  if (!match) return name;
  try {
    return format(parseISO(match[1]), "dd MMM yyyy");
  } catch {
    return match[1];
  }
}

function isToday(name: string): boolean {
  const match = name.match(/backup-(\d{4}-\d{2}-\d{2})\.dump/);
  if (!match) return false;
  return match[1] === format(new Date(), "yyyy-MM-dd");
}

// ---------- Backup List Item ----------

function BackupItem({ file, index }: { file: BackupFile; index: number }) {
  const todayBadge = isToday(file.name);
  return (
    <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3 shadow-sm transition-colors hover:bg-gray-50/80">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
          <Database className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">
            {getDateFromFilename(file.name)}
            {todayBadge && (
              <Badge className="ml-2 rounded-full border border-green-300 bg-green-50 px-2 py-0 text-[0.6rem] text-green-700">
                Today
              </Badge>
            )}
          </p>
          <p className="text-xs text-muted-foreground">{file.name}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge
          variant="secondary"
          className="text-xs capitalize"
        >
          {file.status ?? "uploaded"}
        </Badge>
        <span className="text-xs text-muted-foreground">#{index + 1}</span>
      </div>
    </div>
  );
}

// ---------- Empty State ----------

function EmptyBackups() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
      <ServerCrash className="h-12 w-12 opacity-30" />
      <p className="text-sm font-medium">No backups found</p>
      <p className="text-xs">
        Trigger a backup manually or wait for the next scheduled run.
      </p>
    </div>
  );
}

// ---------- Main Backup Page ----------

function BackupPage() {
  const queryClient = useQueryClient();

  const {
    data: backupData,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["backup-list"],
    queryFn: async () => {
      const { response, error } = await listBackups();
      if (error) throw error;
      return response!.result.payload as BackupFile[];
    },
  });

  const { mutate: runBackup, isPending } = useMutation({
    mutationFn: async () => {
      const { response, error } = await triggerBackup();
      if (error) throw error;
      return response!.result.payload;
    },
    onSuccess: (result) => {
      if (result.skipped) {
        toast.info("Backup already exists", {
          description: result.message,
          icon: <SkipForward className="h-4 w-4" />,
        });
      } else {
        toast.success("Backup completed!", {
          description: result.message,
          icon: <CheckCircle2 className="h-4 w-4" />,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["backup-list"] });
    },
    onError: (err: any) => {
      toast.error("Backup failed", {
        description:
          err?.error?.detailMessage ?? err?.message ?? "Unknown error occurred",
      });
    },
  });

  const backups = backupData ?? [];
  const hasToday = backups.some((f) => isToday(f.name));

  return (
    <Card className="m-6">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Database Backups
          </CardTitle>
          <CardDescription className="mt-1">
            Backups are uploaded to UploadThing automatically on app startup and
            daily at 2 AM. Each backup is a full PostgreSQL dump (.dump).
          </CardDescription>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => runBackup()}
            disabled={isPending}
            id="trigger-backup-btn"
          >
            <CloudUpload className="h-4 w-4" />
            {isPending ? "Backing up…" : "Backup Now"}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Status Banner */}
        {!isLoading && !isError && (
          <div
            className={`mb-4 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
              hasToday
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-yellow-200 bg-yellow-50 text-yellow-800"
            }`}
          >
            {hasToday ? (
              <>
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>
                  Today&apos;s backup already exists. Next automatic check on
                  next app start.
                </span>
              </>
            ) : (
              <>
                <CloudUpload className="h-4 w-4 shrink-0" />
                <span>
                  No backup for today yet. Click{" "}
                  <strong>Backup Now</strong> to run one manually.
                </span>
              </>
            )}
          </div>
        )}

        {/* Backup List */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-lg bg-gray-100"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load backup list. Make sure{" "}
            <code className="font-mono">UPLOADTHING_SECRET</code> is configured
            in the backend.
          </div>
        ) : backups.length === 0 ? (
          <EmptyBackups />
        ) : (
          <ScrollArea className="h-[55vh] pr-2">
            <div className="space-y-2">
              {backups.map((file, i) => (
                <BackupItem key={file.key ?? file.name} file={file} index={i} />
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Footer info */}
        {!isLoading && !isError && backups.length > 0 && (
          <p className="mt-3 text-right text-xs text-muted-foreground">
            {backups.length} backup{backups.length > 1 ? "s" : ""} stored in
            UploadThing
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default BackupPage;
