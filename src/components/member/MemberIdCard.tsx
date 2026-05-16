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
const TPL_H = 540;
const PASSPORT_FRAME = {
  left: 83 / TPL_W,
  top: 160 / TPL_H,
  width: 188 / TPL_W,
  height: 190 / TPL_H,
};

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
      className="relative w-full overflow-hidden rounded-xl shadow-2xl [container-type:inline-size]"
      style={{ aspectRatio: `${TPL_W} / ${TPL_H}` }}
    >
      <img src={FRONT_TEMPLATE} alt="" className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none" />

      {/* Passport photo — sits inside the green-bordered square */}
      <div
        className="absolute"
        style={{
          left: `${PASSPORT_FRAME.left * 100}%`,
          top: `${PASSPORT_FRAME.top * 100}%`,
          width: `${PASSPORT_FRAME.width * 100}%`,
          height: `${PASSPORT_FRAME.height * 100}%`,
        }}
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

      {/* Name overlay — kept above the printed labels so it never collides */}
      <div
        className="absolute text-emerald-900 font-black uppercase truncate leading-none"
        style={{ left: "37.2%", top: "39%", maxWidth: "43%", fontSize: "clamp(10px, 1.8cqw, 18px)" }}
      >
        {displayName}
      </div>

      {/* Field values — locked to the printed label rows with enough left/right space */}
      {[
        { value: memberId, left: "51.5%", top: "49.7%", width: "29%" },
        { value: "Plateau State", left: "47.2%", top: "56.5%", width: "33%" },
        { value: `${lga} / ${ward}`, left: "52.4%", top: "62.6%", width: "32%" },
        { value: "ACTIVE", left: "47.2%", top: "69.1%", width: "26%", active: true },
        { value: issuedDate, left: "52.5%", top: "74.9%", width: "26%" },
        { value: validityDate, left: "49%", top: "80.6%", width: "28%" },
      ].map((row, index) => (
        <div
          key={index}
          className={`absolute font-bold whitespace-nowrap overflow-hidden text-ellipsis leading-none ${row.active ? "text-green-700" : "text-black"}`}
          style={{ left: row.left, top: row.top, width: row.width, fontSize: "clamp(9px, 1.55cqw, 15px)" }}
        >
          {row.value}
        </div>
      ))}
    </div>
  );

  const CardBack = (
    <div
      className="relative w-full overflow-hidden rounded-xl shadow-2xl [container-type:inline-size]"
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
          const x = TPL_W * PASSPORT_FRAME.left;
          const y = TPL_H * PASSPORT_FRAME.top;
          const w = TPL_W * PASSPORT_FRAME.width;
          const h = TPL_H * PASSPORT_FRAME.height;
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

      const fitText = (text: string, x: number, y: number, maxWidth: number, size: number, weight = "bold") => {
        let nextSize = size;
        ctx.font = `${weight} ${nextSize}px Arial`;
        while (ctx.measureText(text).width > maxWidth && nextSize > 10) {
          nextSize -= 1;
          ctx.font = `${weight} ${nextSize}px Arial`;
        }
        ctx.fillText(text, x, y);
      };

      ctx.fillStyle = "#0a3a1a";
      fitText(displayName.toUpperCase(), TPL_W * 0.372, TPL_H * 0.42, TPL_W * 0.43, 17, "900");

      ctx.fillStyle = "#000";
      const rows: [number, number, number, string][] = [
        [TPL_W * 0.515, TPL_H * 0.523, TPL_W * 0.29, memberId],
        [TPL_W * 0.472, TPL_H * 0.591, TPL_W * 0.33, "Plateau State"],
        [TPL_W * 0.524, TPL_H * 0.652, TPL_W * 0.32, `${lga} / ${ward}`],
        [TPL_W * 0.525, TPL_H * 0.775, TPL_W * 0.26, issuedDate],
        [TPL_W * 0.49, TPL_H * 0.832, TPL_W * 0.28, validityDate],
      ];
      rows.forEach(([x, y, maxWidth, t]) => fitText(t, x, y, maxWidth, 14));
      ctx.fillStyle = "#0a8a3a";
      fitText("ACTIVE", TPL_W * 0.472, TPL_H * 0.716, TPL_W * 0.26, 14);
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
