import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface InecLga { id: string; name: string; code: string }
export interface InecWard { id: string; lga_id: string; name: string; code: string }
export interface InecPollingUnit { id: string; ward_id: string; name: string; code: string }

export const useInecLgas = () => {
  const [lgas, setLgas] = useState<InecLga[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from("inec_lgas").select("id,name,code").order("name").then(({ data }) => {
      setLgas(data || []);
      setLoading(false);
    });
  }, []);
  return { lgas, loading };
};

export const useInecWards = (lgaId: string | null) => {
  const [wards, setWards] = useState<InecWard[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!lgaId) { setWards([]); return; }
    setLoading(true);
    supabase.from("inec_wards").select("id,lga_id,name,code").eq("lga_id", lgaId).order("name")
      .then(({ data }) => { setWards(data || []); setLoading(false); });
  }, [lgaId]);
  return { wards, loading };
};

export const useInecPollingUnits = (wardId: string | null) => {
  const [pus, setPus] = useState<InecPollingUnit[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!wardId) { setPus([]); return; }
    setLoading(true);
    supabase.from("inec_polling_units").select("id,ward_id,name,code").eq("ward_id", wardId).order("code")
      .then(({ data }) => { setPus(data || []); setLoading(false); });
  }, [wardId]);
  return { pus, loading };
};
