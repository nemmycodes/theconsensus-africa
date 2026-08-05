import { useEffect, useState } from "react";
import { CloudOff, RefreshCw, Wifi } from "lucide-react";
import { flushQueue, listQueued, subscribeQueue } from "@/lib/offlineQueue";

const OfflineBanner = () => {
  const [online, setOnline] = useState(navigator.onLine);
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const refresh = async () => setPending((await listQueued()).length);

  useEffect(() => {
    refresh();
    const unsub = subscribeQueue(() => void refresh());
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      unsub();
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  if (online && pending === 0) return null;

  const handleSync = async () => {
    setSyncing(true);
    await flushQueue();
    await refresh();
    setSyncing(false);
  };

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[100] px-4">
      <div className="flex items-center gap-3 rounded-full bg-[#0d1f15] text-white shadow-lg px-4 py-2 text-xs sm:text-sm">
        {online ? <Wifi className="w-4 h-4 text-emerald-400" /> : <CloudOff className="w-4 h-4 text-amber-400" />}
        <span className="font-semibold">
          {online
            ? `${pending} saved submission${pending === 1 ? "" : "s"} waiting to sync`
            : pending > 0
              ? `Offline — ${pending} submission${pending === 1 ? "" : "s"} saved on this device`
              : "Offline — you can keep filling forms"}
        </span>
        {online && pending > 0 && (
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center gap-1 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 px-3 py-1 font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            Sync
          </button>
        )}
      </div>
    </div>
  );
};

export default OfflineBanner;
