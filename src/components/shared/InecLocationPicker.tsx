import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useInecLgas, useInecWards, useInecPollingUnits } from "@/hooks/useInecData";
import { useEffect, useState } from "react";

interface Props {
  lgaName: string;
  wardName?: string;
  puName?: string;
  onChange: (v: { lga: string; ward: string; pu: string }) => void;
  showWard?: boolean;
  showPU?: boolean;
  required?: boolean;
  labels?: { lga?: string; ward?: string; pu?: string };
}

/**
 * Cascading INEC picker: LGA → Ward → Polling Unit.
 * Stores names (strings) in the parent form for compatibility with existing schemas.
 */
const InecLocationPicker = ({
  lgaName, wardName = "", puName = "", onChange,
  showWard = true, showPU = false, required = false,
  labels = {},
}: Props) => {
  const { lgas } = useInecLgas();
  const [lgaId, setLgaId] = useState<string | null>(null);
  const [wardId, setWardId] = useState<string | null>(null);
  const { wards } = useInecWards(lgaId);
  const { pus } = useInecPollingUnits(wardId);

  // Sync IDs from incoming names (so editing pre-populated forms works)
  useEffect(() => {
    if (!lgaName) { setLgaId(null); return; }
    const match = lgas.find(l => l.name.toLowerCase() === lgaName.toLowerCase());
    if (match) setLgaId(match.id);
  }, [lgaName, lgas]);

  useEffect(() => {
    if (!wardName) { setWardId(null); return; }
    const match = wards.find(w => w.name.toLowerCase() === wardName.toLowerCase());
    if (match) setWardId(match.id);
  }, [wardName, wards]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label>{labels.lga || "LGA"} {required && <span className="text-destructive">*</span>}</Label>
        <Select
          value={lgaId || ""}
          onValueChange={(id) => {
            setLgaId(id);
            setWardId(null);
            const lga = lgas.find(l => l.id === id);
            onChange({ lga: lga?.name || "", ward: "", pu: "" });
          }}
        >
          <SelectTrigger><SelectValue placeholder="Select LGA" /></SelectTrigger>
          <SelectContent className="max-h-72">
            {lgas.map(l => (<SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      {showWard && (
        <div>
          <Label>{labels.ward || "Ward / RA"}</Label>
          <Select
            value={wardId || ""}
            disabled={!lgaId || wards.length === 0}
            onValueChange={(id) => {
              setWardId(id);
              const w = wards.find(x => x.id === id);
              onChange({ lga: lgaName, ward: w?.name || "", pu: "" });
            }}
          >
            <SelectTrigger><SelectValue placeholder={lgaId ? (wards.length ? "Select Ward" : "No wards yet") : "Select LGA first"} /></SelectTrigger>
            <SelectContent className="max-h-72">
              {wards.map(w => (<SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      )}

      {showPU && (
        <div>
          <Label>{labels.pu || "Polling Unit"}</Label>
          <Select
            value={puName || ""}
            disabled={!wardId || pus.length === 0}
            onValueChange={(name) => {
              onChange({ lga: lgaName, ward: wardName, pu: name });
            }}
          >
            <SelectTrigger><SelectValue placeholder={wardId ? (pus.length ? "Select PU" : "No PUs yet") : "Select Ward first"} /></SelectTrigger>
            <SelectContent className="max-h-72">
              {pus.map(p => (<SelectItem key={p.id} value={p.name}>{p.code} — {p.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default InecLocationPicker;
