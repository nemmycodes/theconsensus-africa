import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CreditCard, Download, RotateCcw, Camera } from "lucide-react";
import { toast } from "sonner";

interface MemberIdCardProps {
  profile: any;
  open: boolean;
  onClose: () => void;
}

const FRONT_TEMPLATE = "/id-card-front-template.jpg";
const BACK_TEMPLATE = "/id-card-back-template.jpg";

// Reference template width used for relative coordinate math
const TPL_W = 900;
const TPL_H = 556;

const MemberIdCard = ({ profile: profileProp, open, onClose }: MemberIdCardProps) => {
  const { user } = useAuth();
  const [flipped, setFlipped] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<any>(profileProp);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => setProfile(profileProp), [profileProp]);

  const displayName =
    profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Member";
  const lga = profile?.lga || user?.user_metadata?.lga || "—";
  const ward = profile?.ward || user?.user_metadata?.ward || "—";
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || "";
  const issuedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-GB")
    : new Date().toLocaleDateString("en-GB");
  const validityDate = user?.created_at
    ? new Date(new Date(user.created_at).setFullYear(new Date(user.created_at).getFullYear() + 2)).toLocaleDateString("en-GB")
    : "—";
  const memberId = `TPC-${new Date(user?.created_at || Date.now()).getFullYear()}-${(user?.id?.slice(0, 6) || "000000").toUpperCase()}`;

  if (!open) return null;

  const uploadPassport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) {
      toast.error("Upload failed");
      setUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = `${publicUrl}?t=${Date.now()}`;
    await supabase.from("profiles").update({ avatar_url: url }).eq("user_id", user.id);
    setProfile((p: any) => ({ ...(p || {}), avatar_url: url }));
    toast.success("Passport photo updated");
    setUploading(false);
  };

  // ===== Card UI (HTML overlay on top of the template image) =====
  // All overlay positions are percentages relative to the template image.
  const CardFront = (
    <div
      className="relative w-full overflow-hidden rounded-xl shadow-2xl"
      style={{ aspectRatio: `${TPL_W} / ${TPL_H}` }}
    >
      <img src={FRONT_TEMPLATE} alt="" className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none" />

      {/* Passport photo — sits inside the green-bordered square */}
      <div
        className="absolute"
        style={{ left: "9.5%", top: "26%", width: "24.5%", height: "44%" }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
          />
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full h-full bg-white/80 hover:bg-white flex flex-col items-center justify-center text-emerald-800 transition"
          >
            <Camera className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold">Add Passport</span>
          </button>
        )}
      </div>

      {/* Field values — aligned to the labels printed on template */}
      <div
        className="absolute text-black font-semibold"
        style={{ left: "47%", top: "47%", fontSize: "clamp(9px, 1.6cqw, 16px)" }}
      >
        {memberId}
      </div>
      <div
        className="absolute text-black font-semibold"
        style={{ left: "40%", top: "55.5%", fontSize: "clamp(9px, 1.6cqw, 16px)" }}
      >
        Plateau State
      </div>
      <div
        className="absolute text-black font-semibold"
        style={{ left: "47%", top: "62.5%", fontSize: "clamp(9px, 1.5cqw, 16px)" }}
      >
        {lga} / {ward}
      </div>
      <div
        className="absolute font-bold"
        style={{ left: "42%", top: "70%", fontSize: "clamp(9px, 1.6cqw, 16px)", color: "#0a8a3a" }}
      >
        ACTIVE
      </div>
      <div
        className="absolute text-black font-semibold"
        style={{ left: "47.5%", top: "77%", fontSize: "clamp(9px, 1.6cqw, 16px)" }}
      >
        {issuedDate}
      </div>
      <div
        className="absolute text-black font-semibold"
        style={{ left: "44%", top: "84%", fontSize: "clamp(9px, 1.6cqw, 16px)" }}
      >
        {validityDate}
      </div>

      {/* Name overlay (small, above MEMBER ID row) */}
      <div
        className="absolute text-emerald-800 font-black uppercase tracking-wide truncate"
        style={{ left: "37%", top: "39%", maxWidth: "55%", fontSize: "clamp(11px, 1.9cqw, 19px)" }}
      >
        {displayName}
      </div>
    </div>
  );

  const CardBack = (
    <div
      className="relative w-full overflow-hidden rounded-xl shadow-2xl"
      style={{ aspectRatio: `${TPL_W} / ${TPL_H}` }}
    >
      <img src={BACK_TEMPLATE} alt="" className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none" />
    </div>
  );

  // ===== Download (canvas) =====
  const downloadSide = async (side: "front" | "back") => {
    const canvas = document.createElement("canvas");
    canvas.width = TPL_W * 2;
    canvas.height = TPL_H * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(2, 2);

    const loadImg = (src: string): Promise<HTMLImageElement> =>
      new Promise((res, rej) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => res(img);
        img.onerror = () => rej(new Error("img"));
        img.src = src;
      });

    const tpl = await loadImg(side === "front" ? FRONT_TEMPLATE : BACK_TEMPLATE);
    ctx.drawImage(tpl, 0, 0, TPL_W, TPL_H);

    if (side === "front") {
      // Passport photo
      if (avatarUrl) {
        try {
          const av = await loadImg(avatarUrl);
          const x = TPL_W * 0.095;
          const y = TPL_H * 0.26;
          const w = TPL_W * 0.245;
          const h = TPL_H * 0.44;
          ctx.save();
          ctx.beginPath();
          ctx.rect(x, y, w, h);
          ctx.clip();
          ctx.drawImage(av, x, y, w, h);
          ctx.restore();
        } catch {
          /* skip */
        }
      }

      ctx.fillStyle = "#0a3a1a";
      ctx.font = "900 19px Arial";
      ctx.fillText(displayName.toUpperCase(), TPL_W * 0.37, TPL_H * 0.42);

      ctx.fillStyle = "#000";
      ctx.font = "bold 15px Arial";
      const rows: [number, number, string][] = [
        [TPL_W * 0.47, TPL_H * 0.495, memberId],
        [TPL_W * 0.4, TPL_H * 0.58, "Plateau State"],
        [TPL_W * 0.47, TPL_H * 0.65, `${lga} / ${ward}`],
        [TPL_W * 0.475, TPL_H * 0.795, issuedDate],
        [TPL_W * 0.44, TPL_H * 0.865, validityDate],
      ];
      rows.forEach(([x, y, t]) => ctx.fillText(t, x, y));
      ctx.fillStyle = "#0a8a3a";
      ctx.font = "bold 15px Arial";
      ctx.fillText("ACTIVE", TPL_W * 0.42, TPL_H * 0.725);
    }

    const link = document.createElement("a");
    link.download = `TPC-ID-${side}-${displayName.replace(/\s+/g, "_")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-neutral-950 text-white rounded-2xl p-4 md:p-6 w-full max-w-2xl max-h-[92vh] overflow-y-auto border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-emerald-400" />
            <div>
              <h3 className="font-bold">Membership ID Card</h3>
              <p className="text-xs text-neutral-400">Tap card to flip · Front & Back</p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white text-xl">✕</button>
        </div>

        <div className="[perspective:1400px] cursor-pointer" onClick={() => setFlipped(!flipped)}>
          <div
            className={`relative w-full transition-transform duration-700 [transform-style:preserve-3d] ${
              flipped ? "[transform:rotateY(180deg)]" : ""
            }`}
            style={{ aspectRatio: `${TPL_W} / ${TPL_H}` }}
          >
            <div className={`absolute inset-0 [backface-visibility:hidden] ${flipped ? "invisible" : ""}`}>
              {CardFront}
            </div>
            <div
              className={`absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden] ${
                flipped ? "" : "invisible"
              }`}
            >
              {CardBack}
            </div>
          </div>
        </div>

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadPassport} />

        <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); setFlipped(!flipped); }}
              className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {flipped ? "Show Front" : "Show Back"}
            </button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1 text-xs bg-transparent border-white/20 text-white hover:bg-white/10"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              <Camera className="w-3.5 h-3.5" /> {avatarUrl ? "Change Photo" : "Upload Passport"}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-xs bg-transparent border-white/20 text-white hover:bg-white/10"
              onClick={() => downloadSide("front")}
            >
              <Download className="w-3.5 h-3.5" /> Front
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-xs bg-transparent border-white/20 text-white hover:bg-white/10"
              onClick={() => downloadSide("back")}
            >
              <Download className="w-3.5 h-3.5" /> Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberIdCard;
