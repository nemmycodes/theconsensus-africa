import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useInecStates, useInecLgas, useInecWards, useInecPollingUnits } from "@/hooks/useInecData";
import { useEffect, useMemo, useState } from "react";

export interface ElectionLocationValue {
  state: string;
  senatorialZone: string;
  lga: string;
  ward: string;
  pu: string;
}

interface Props {
  value: ElectionLocationValue;
  onChange: (v: ElectionLocationValue) => void;
  showPU?: boolean;
  required?: boolean;
}

/**
 * Full cascading filter:  State → Senatorial Zone → LGA → Ward → Polling Unit.
 * Currently only Plateau has detailed LGA/Ward/PU data seeded; other states show
 * the State + Zone selection but cascades will be empty until seeded.
 */
const ElectionLocationFilter = ({ value, onChange, showPU = true, required = false }: Props) => {
  const { states } = useInecStates();
  const selectedState = useMemo(() => states.find(s => s.name === value.state) || null, [states, value.state]);

  // Only fetch Plateau LGAs (others not seeded). For Plateau, filter by senatorial zone.
  const showLgaCascade = value.state === "Plateau";
  const { lgas } = useInecLgas(showLgaCascade && value.senatorialZone ? value.senatorialZone : null);

  const [lgaId, setLgaId] = useState<string | null>(null);
  const [wardId, setWardId] = useState<string | null>(null);
  const { wards } = useInecWards(lgaId);
  const { pus } = useInecPollingUnits(wardId);

  // Sync selected lga/ward names → ids for re-display
  useEffect(() => {
    if (!value.lga) { setLgaId(null); return; }
    const m = lgas.find(l => l.name.toLowerCase() === value.lga.toLowerCase());
    if (m) setLgaId(m.id);
  }, [value.lga, lgas]);

  useEffect(() => {
    if (!value.ward) { setWardId(null); return; }
    const m = wards.find(w => w.name.toLowerCase() === value.ward.toLowerCase());
    if (m) setWardId(m.id);
  }, [value.ward, wards]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. State */}
      <div>
        <Label>State {required && <span className="text-destructive">*</span>}</Label>
        <Select
          value={value.state}
          onValueChange={(name) => {
            onChange({ state: name, senatorialZone: "", lga: "", ward: "", pu: "" });
            setLgaId(null); setWardId(null);
          }}
        >
          <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
          <SelectContent className="max-h-72">
            {states.map(s => (<SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      {/* 2. Senatorial Zone */}
      <div>
        <Label>Senatorial Zone</Label>
        <Select
          value={value.senatorialZone}
          disabled={!selectedState}
          onValueChange={(zone) => {
            onChange({ ...value, senatorialZone: zone, lga: "", ward: "", pu: "" });
            setLgaId(null); setWardId(null);
          }}
        >
          <SelectTrigger><SelectValue placeholder={selectedState ? "Select Zone" : "Pick state first"} /></SelectTrigger>
          <SelectContent>
            {(selectedState?.senatorial_zones || []).map(z => (
              <SelectItem key={z} value={z}>{z}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 3. LGA */}
      <div>
        <Label>LGA</Label>
        <Select
          value={lgaId || ""}
          disabled={!showLgaCascade || !value.senatorialZone || lgas.length === 0}
          onValueChange={(id) => {
            const lga = lgas.find(l => l.id === id);
            setLgaId(id); setWardId(null);
            onChange({ ...value, lga: lga?.name || "", ward: "", pu: "" });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={
              !showLgaCascade ? "LGAs (Plateau only)" :
              !value.senatorialZone ? "Select Zone" :
              lgas.length === 0 ? "No LGAs" : "Select LGA"
            } />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {lgas.map(l => (<SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      {/* 4. Ward */}
      <div>
        <Label>Ward / RA</Label>
        <Select
          value={wardId || ""}
          disabled={!lgaId || wards.length === 0}
          onValueChange={(id) => {
            const w = wards.find(x => x.id === id);
            setWardId(id);
            onChange({ ...value, ward: w?.name || "", pu: "" });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={lgaId ? (wards.length ? "Select Ward" : "No wards yet") : "Select LGA first"} />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {wards.map(w => (<SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      {/* 5. Polling Unit */}
      {showPU && (
        <div>
          <Label>Polling Unit</Label>
          <Select
            value={value.pu}
            disabled={!wardId || pus.length === 0}
            onValueChange={(name) => onChange({ ...value, pu: name })}
          >
            <SelectTrigger>
              <SelectValue placeholder={wardId ? (pus.length ? "Select PU" : "No PUs yet") : "Select Ward first"} />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {pus.map(p => (<SelectItem key={p.id} value={p.name}>{p.code} — {p.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default ElectionLocationFilter;
