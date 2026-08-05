import { get, set, del, keys } from "idb-keyval";
import { supabase } from "@/integrations/supabase/client";

export type QueuedSubmission = {
  id: string;
  kind: "election_report";
  createdAt: number;
  label: string;
  userId: string;
  /** Rows to insert into situation_updates */
  situationUpdate: Record<string, any>;
  /** Rows to insert into election_reports */
  reportRows: Record<string, any>[];
  /** Optional evidence file to upload before insert */
  file?: { bucket: string; path: string; blob: Blob };
};

const PREFIX = "offline-queue:";
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((l) => l());

export function subscribeQueue(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function listQueued(): Promise<QueuedSubmission[]> {
  const allKeys = (await keys()) as string[];
  const mine = allKeys.filter((k) => typeof k === "string" && k.startsWith(PREFIX));
  const items = await Promise.all(mine.map((k) => get<QueuedSubmission>(k)));
  return items.filter(Boolean).sort((a, b) => a!.createdAt - b!.createdAt) as QueuedSubmission[];
}

export async function enqueue(item: Omit<QueuedSubmission, "id" | "createdAt">) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const record: QueuedSubmission = { ...item, id, createdAt: Date.now() };
  await set(PREFIX + id, record);
  notify();
  return record;
}

export async function removeQueued(id: string) {
  await del(PREFIX + id);
  notify();
}

async function sendOne(item: QueuedSubmission) {
  let evidencePath: string | null = null;

  if (item.file) {
    const { error } = await supabase.storage
      .from(item.file.bucket)
      .upload(item.file.path, item.file.blob, { upsert: false });
    if (!error) evidencePath = item.file.path;
  }

  const { error: suErr } = await supabase.from("situation_updates").insert(item.situationUpdate as any);
  if (suErr) throw suErr;

  if (item.reportRows.length > 0) {
    const rows = item.reportRows.map((r) => ({ ...r, ec8a_url: r.ec8a_url ?? evidencePath }));
    const { error: rErr } = await supabase.from("election_reports").insert(rows as any);
    if (rErr) throw rErr;
  }
}

let syncing = false;

/** Try to push everything queued. Returns number of items synced. */
export async function flushQueue(): Promise<number> {
  if (syncing || !navigator.onLine) return 0;
  syncing = true;
  let synced = 0;
  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return 0;
    const items = await listQueued();
    for (const item of items) {
      try {
        await sendOne(item);
        await removeQueued(item.id);
        synced += 1;
      } catch {
        break; // stop on first failure, retry later
      }
    }
  } finally {
    syncing = false;
    notify();
  }
  return synced;
}

/** Start background auto-sync when connectivity returns. */
export function startQueueAutoSync() {
  const attempt = () => void flushQueue();
  window.addEventListener("online", attempt);
  window.setInterval(attempt, 60_000);
  attempt();
}
