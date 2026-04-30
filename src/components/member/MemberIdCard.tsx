import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Download,
  RotateCcw,
  Calendar,
  MapPin,
  ShieldCheck,
  IdCard,
  Landmark,
  Globe,
  Mail,
  Map as MapIcon,
} from "lucide-react";

interface MemberIdCardProps {
  profile: any;
  open: boolean;
  onClose: () => void;
}

const MemberIdCard = ({ profile, open, onClose }: MemberIdCardProps) => {
  const { user } = useAuth();
  const [flipped, setFlipped] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Member";
  const lga = profile?.lga || user?.user_metadata?.lga || "—";
  const ward = profile?.ward || user?.user_metadata?.ward || "—";
  const interests: string[] = profile?.interests || user?.user_metadata?.interests || [];
  const joinedDate = user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US") : "—";
  const memberId = `TPC-${new Date(user?.created_at || Date.now()).getFullYear()}-${(user?.id?.slice(0, 6) || "000000").toUpperCase()}`;
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || "";

  // Per-member verification URL encoded into the QR
  const verifyUrl = `https://www.theconsensus.africa/verify/${user?.id || "unknown"}`;

  useEffect(() => {
    if (!open) return;
    QRCode.toDataURL(verifyUrl, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 360,
      color: { dark: "#0a0f0a", light: "#ffffff" },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [open, verifyUrl]);

  if (!open) return null;

  // ===== SHARED PIECES (kept identical between preview and download) =====
  const FRONT_TAGLINE = "Economic Freedom · Political Consciousness · Shared Prosperity";

  // ============== DOWNLOAD (canvas mirror of UI) ==============
  const downloadCard = async (side: "front" | "back" | "both") => {
    const w = 1080;
    const h = 660;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawBackdrop = () => {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "#0d2818");
      grad.addColorStop(1, "#04140a");
      ctx.fillStyle = grad;
      (ctx as any).roundRect(0, 0, w, h, 28);
      ctx.fill();

      // soft green flourish
      ctx.fillStyle = "rgba(34,197,94,0.10)";
      ctx.beginPath();
      ctx.ellipse(w * 0.78, h * 0.55, 280, 200, -0.5, 0, Math.PI * 2);
      ctx.fill();

      // gold curve at bottom-right
      ctx.fillStyle = "#f5b836";
      ctx.beginPath();
      ctx.moveTo(w, h - 90);
      ctx.quadraticCurveTo(w * 0.65, h, w, h);
      ctx.closePath();
      ctx.fill();
    };

    const drawLogoMark = (x: number, y: number, scale = 1) => {
      // gold + green leaf abstraction
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.fillStyle = "#f5b836";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(18, 18, 8, 48);
      ctx.quadraticCurveTo(2, 30, 0, 0);
      ctx.fill();
      ctx.fillStyle = "#22c55e";
      ctx.beginPath();
      ctx.moveTo(14, 4);
      ctx.quadraticCurveTo(34, 22, 22, 52);
      ctx.quadraticCurveTo(18, 32, 14, 4);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(38, 2); ctx.lineTo(38, 52); ctx.stroke();
      ctx.restore();
    };

    const drawWordmark = (x: number, y: number) => {
      ctx.fillStyle = "#22c55e";
      ctx.font = "900 30px Arial";
      ctx.textAlign = "left";
      ctx.fillText("THE", x, y);
      ctx.fillText("PLATEAU", x + 70, y);
      ctx.fillText("CONSENSUS", x, y + 32);
    };

    const drawFront = async () => {
      drawBackdrop();
      drawLogoMark(50, 50, 1.1);
      drawWordmark(118, 78);

      // top-right meta
      ctx.fillStyle = "#cbd5cf";
      ctx.font = "12px Arial";
      ctx.textAlign = "right";
      ctx.fillText("MEMBER CARD", w - 50, 56);
      ctx.fillStyle = "#f5b836";
      ctx.font = "bold 26px Arial";
      ctx.fillText("2025 — 2027", w - 50, 90);
      ctx.textAlign = "left";

      // avatar
      const avX = 50, avY = 175, avS = 140;
      ctx.save();
      (ctx as any).roundRect(avX - 4, avY - 4, avS + 8, avS + 8, 22);
      ctx.fillStyle = "#22c55e";
      ctx.fill();
      ctx.restore();

      const drawPlaceholder = () => {
        ctx.fillStyle = "#1e3a2a";
        (ctx as any).roundRect(avX, avY, avS, avS, 18);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "bold 64px Arial";
        ctx.textAlign = "center";
        ctx.fillText(displayName[0]?.toUpperCase() || "M", avX + avS / 2, avY + avS / 2 + 22);
        ctx.textAlign = "left";
      };

      if (avatarUrl) {
        try {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = avatarUrl;
          await new Promise<void>((res, rej) => {
            img.onload = () => res();
            img.onerror = () => rej();
            setTimeout(() => rej(), 3500);
          });
          ctx.save();
          (ctx as any).roundRect(avX, avY, avS, avS, 18);
          ctx.clip();
          ctx.drawImage(img, avX, avY, avS, avS);
          ctx.restore();
        } catch {
          drawPlaceholder();
        }
      } else drawPlaceholder();

      // Name + verified
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 40px Arial";
      ctx.fillText(displayName.toUpperCase(), 220, 220);
      ctx.fillStyle = "#22c55e";
      ctx.font = "16px Arial";
      ctx.fillText("Verified Member", 220, 246);
      ctx.strokeStyle = "rgba(34,197,94,0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(220, 258); ctx.lineTo(560, 258); ctx.stroke();

      // 2x2 info grid (matches reference)
      const items: { label: string; value: string }[] = [
        { label: "MEMBER ID", value: memberId },
        { label: "STATE", value: "Plateau State" },
        { label: "LGA / WARD", value: `${lga} / ${ward}` },
        { label: "STATUS", value: "ACTIVE" },
        { label: "DATE ISSUED", value: joinedDate },
      ];
      const colX = [220, 460];
      let row = 0, col = 0;
      items.forEach((it) => {
        const x = colX[col];
        const y = 295 + row * 70;
        ctx.fillStyle = "#cbd5cf";
        ctx.font = "bold 11px Arial";
        ctx.fillText(it.label, x, y);
        ctx.fillStyle = it.value === "ACTIVE" ? "#22c55e" : "#ffffff";
        ctx.font = "bold 18px Arial";
        ctx.fillText(it.value, x, y + 24);
        col++;
        if (col >= 2) { col = 0; row++; }
      });

      // Bottom tagline strip
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      (ctx as any).roundRect(0, h - 56, w, 56, 0);
      ctx.fill();
      // gold pin line
      ctx.fillStyle = "#f5b836";
      ctx.fillRect(0, h - 60, w, 4);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center";
      ctx.fillText(FRONT_TAGLINE, w / 2, h - 22);
      ctx.textAlign = "left";
    };

    const drawBack = async () => {
      drawBackdrop();
      drawLogoMark(50, 50, 1.1);
      drawWordmark(118, 78);

      ctx.fillStyle = "#22c55e";
      ctx.font = "bold 13px Arial";
      ctx.textAlign = "right";
      ctx.fillText("THE PLATEAU CONSENSUS", w - 50, 60);
      ctx.fillStyle = "#cbd5cf";
      ctx.font = "12px Arial";
      ctx.fillText("MEMBERSHIP CARD — BACK", w - 50, 80);
      ctx.textAlign = "left";

      // Skills column
      ctx.fillStyle = "#f5b836";
      ctx.font = "bold 13px Arial";
      ctx.fillText("SKILLS & INTERESTS", 50, 200);
      ctx.fillStyle = "#ffffff";
      ctx.font = "15px Arial";
      const list = interests.length ? interests.slice(0, 5) : ["Governance", "Security & Peace"];
      list.forEach((s, i) => {
        ctx.fillStyle = "#22c55e";
        ctx.fillText("•", 50, 235 + i * 28);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(s, 70, 235 + i * 28);
      });

      // Terms column
      const tx = 460;
      ctx.fillStyle = "#f5b836";
      ctx.font = "bold 13px Arial";
      ctx.fillText("TERMS & CONDITIONS", tx, 200);
      ctx.fillStyle = "#e5e7eb";
      ctx.font = "13px Arial";
      [
        "1. This card is the property of The Plateau Consensus.",
        "2. It is non-transferable and valid only for the",
        "    named holder.",
        "3. Report lost or stolen cards immediately.",
        "4. Card must be presented at all official events.",
        "5. The organization reserves the right to revoke",
        "    membership.",
      ].forEach((t, i) => ctx.fillText(t, tx, 230 + i * 22));

      // QR
      if (qrDataUrl) {
        const qrImg = new Image();
        qrImg.src = qrDataUrl;
        await new Promise<void>((res) => { qrImg.onload = () => res(); });
        ctx.fillStyle = "#ffffff";
        (ctx as any).roundRect(50, 430, 130, 130, 12);
        ctx.fill();
        ctx.drawImage(qrImg, 60, 440, 110, 110);
        ctx.fillStyle = "#22c55e";
        ctx.font = "13px Arial";
        ctx.fillText("Scan to verify", 200, 480);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 15px Arial";
        ctx.fillText("membership", 200, 502);
      }

      // Bottom contact bar
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(0, h - 56, w, 56);
      ctx.fillStyle = "#f5b836";
      ctx.fillRect(0, h - 60, w, 4);
      ctx.fillStyle = "#ffffff";
      ctx.font = "13px Arial";
      ctx.fillText("🌐  www.theconsensus.africa", 50, h - 22);
      ctx.fillText("✉  info@theconsensus.africa", 430, h - 22);
      ctx.fillText("📍  Plateau State, Nigeria", 800, h - 22);
    };

    if (side === "front" || side === "both") {
      await drawFront();
      const link = document.createElement("a");
      link.download = `TPC-ID-Front-${displayName.replace(/\s+/g, "_")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
    if (side === "back" || side === "both") {
      ctx.clearRect(0, 0, w, h);
      await drawBack();
      const link = document.createElement("a");
      link.download = `TPC-ID-Back-${displayName.replace(/\s+/g, "_")}.png`;
      link.href = canvas.toDataURL("image/png");
      setTimeout(() => link.click(), side === "both" ? 600 : 0);
    }
  };

  // ============== UI ==============
  const Brand = () => (
    <div className="flex items-center gap-3">
      <img src="/brand-logo.png" alt="" className="w-11 h-11 object-contain shrink-0" />
      <div className="leading-none">
        <p className="text-[15px] font-black text-emerald-400 tracking-tight">THE</p>
        <p className="text-[15px] font-black text-emerald-400 -mt-1 tracking-tight">PLATEAU</p>
        <p className="text-[15px] font-black text-emerald-400 -mt-1 tracking-tight">CONSENSUS</p>
      </div>
    </div>
  );

  const cardBase =
    "relative w-full rounded-2xl p-5 md:p-6 text-white overflow-hidden shadow-[0_25px_60px_-20px_rgba(0,0,0,0.7)]";
  const cardBg =
    "bg-[radial-gradient(ellipse_at_bottom_right,rgba(34,197,94,0.18),transparent_55%),linear-gradient(135deg,#0d2818_0%,#04140a_100%)]";

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-neutral-950 text-white rounded-2xl p-4 md:p-6 w-full max-w-xl max-h-[92vh] overflow-y-auto border border-white/10"
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

        <div className="[perspective:1200px] cursor-pointer" onClick={() => setFlipped(!flipped)}>
          <div
            className={`relative w-full transition-transform duration-700 [transform-style:preserve-3d] ${
              flipped ? "[transform:rotateY(180deg)]" : ""
            }`}
          >
            {/* ===== FRONT ===== */}
            <div ref={frontRef} className={`${cardBase} ${cardBg} ${flipped ? "invisible" : ""}`}>
              {/* gold corner curve */}
              <div className="absolute -bottom-10 -right-10 w-56 h-56 bg-amber-400 rounded-full opacity-90 [clip-path:polygon(0_60%,100%_0,100%_100%,0_100%)]" />
              {/* leaf flourish */}
              <div className="absolute right-6 top-16 opacity-30">
                <svg width="160" height="200" viewBox="0 0 160 200" fill="none">
                  <path d="M30 10 C90 60, 130 100, 80 200 C70 130, 40 80, 30 10 Z" fill="#22c55e" />
                </svg>
              </div>

              <div className="flex items-start justify-between mb-5 relative z-10">
                <Brand />
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-neutral-300">MEMBER CARD</p>
                  <p className="text-amber-400 font-black text-xl mt-1">2025 — 2027</p>
                </div>
              </div>

              <div className="flex items-start gap-5 relative z-10">
                {/* Photo with gold ring */}
                <div className="shrink-0">
                  <div className="p-[3px] rounded-2xl bg-gradient-to-br from-emerald-400 to-amber-400">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName} className="w-24 h-24 rounded-2xl object-cover" />
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-emerald-900/60 flex items-center justify-center text-3xl font-black">
                        {displayName[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-2xl md:text-[26px] font-black tracking-tight uppercase truncate">
                    {displayName}
                  </p>
                  <p className="text-emerald-400 text-sm font-medium">Verified Member</p>
                  <div className="border-t border-emerald-500/30 mt-2 pt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-[11px]">
                    <Field icon={<IdCard className="w-3 h-3" />} label="MEMBER ID" value={memberId} />
                    <Field icon={<MapIcon className="w-3 h-3" />} label="STATE" value="Plateau State" />
                    <Field icon={<MapPin className="w-3 h-3" />} label="LGA / WARD" value={`${lga} / ${ward}`} />
                    <Field
                      icon={<ShieldCheck className="w-3 h-3" />}
                      label="STATUS"
                      value="ACTIVE"
                      valueClass="text-emerald-400"
                    />
                    <Field icon={<Calendar className="w-3 h-3" />} label="DATE ISSUED" value={joinedDate} />
                  </div>
                </div>
              </div>

              {/* Tagline strip */}
              <div className="absolute left-0 right-0 bottom-0">
                <div className="h-1 bg-amber-400" />
                <div className="bg-black/55 px-5 py-2 text-center text-[11px] font-medium tracking-wide">
                  Economic Freedom <span className="text-amber-400 mx-1">•</span> Political Consciousness{" "}
                  <span className="text-amber-400 mx-1">•</span> Shared Prosperity
                </div>
              </div>
            </div>

            {/* ===== BACK ===== */}
            <div
              ref={backRef}
              className={`${cardBase} ${cardBg} absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden] ${
                flipped ? "" : "invisible"
              }`}
            >
              {/* faint plateau outline */}
              <svg
                className="absolute right-2 top-12 opacity-15"
                width="260"
                height="260"
                viewBox="0 0 260 260"
                fill="none"
              >
                <path
                  d="M40 80 L80 40 L150 30 L210 70 L230 130 L210 200 L150 230 L80 220 L50 180 L30 130 Z"
                  stroke="#22c55e"
                  strokeWidth="2"
                  fill="rgba(34,197,94,0.05)"
                />
              </svg>

              <div className="flex items-start justify-between mb-5">
                <Brand />
                <div className="text-right">
                  <p className="text-[12px] font-bold text-emerald-400 tracking-wide">THE PLATEAU CONSENSUS</p>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-300">MEMBERSHIP CARD — BACK</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 relative z-10">
                <div>
                  <p className="text-amber-400 font-bold text-[11px] tracking-widest mb-2">SKILLS & INTERESTS</p>
                  <ul className="space-y-1.5 text-sm">
                    {(interests.length ? interests : ["Governance", "Security & Peace"]).slice(0, 5).map((s) => (
                      <li key={s} className="flex items-center gap-2">
                        <Landmark className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-amber-400 font-bold text-[11px] tracking-widest mb-2">TERMS & CONDITIONS</p>
                  <ol className="text-[11px] text-neutral-200 space-y-1 list-decimal pl-4">
                    <li>This card is the property of The Plateau Consensus.</li>
                    <li>It is non-transferable and valid only for the named holder.</li>
                    <li>Report lost or stolen cards immediately.</li>
                    <li>Card must be presented at all official events.</li>
                    <li>The organization reserves the right to revoke membership.</li>
                  </ol>
                </div>
              </div>

              {/* QR */}
              <div className="mt-5 flex items-center gap-3 relative z-10">
                <div className="bg-white p-2 rounded-lg shrink-0">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="Verify membership" className="w-20 h-20" />
                  ) : (
                    <div className="w-20 h-20 bg-neutral-200 animate-pulse rounded" />
                  )}
                </div>
                <div className="text-xs">
                  <p className="text-emerald-400">Scan to verify</p>
                  <p className="font-bold">membership</p>
                  <p className="text-[10px] text-neutral-400 break-all mt-1">{verifyUrl}</p>
                </div>
              </div>

              {/* Footer bar */}
              <div className="absolute left-0 right-0 bottom-0">
                <div className="h-1 bg-amber-400" />
                <div className="bg-black/55 px-4 py-2 grid grid-cols-3 gap-2 text-[10px] text-neutral-200">
                  <span className="flex items-center gap-1.5"><Globe className="w-3 h-3 text-emerald-400" /> www.theconsensus.africa</span>
                  <span className="flex items-center gap-1.5 justify-center"><Mail className="w-3 h-3 text-emerald-400" /> info@theconsensus.africa</span>
                  <span className="flex items-center gap-1.5 justify-end"><MapPin className="w-3 h-3 text-emerald-400" /> Plateau State, Nigeria</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <button
            onClick={(e) => { e.stopPropagation(); setFlipped(!flipped); }}
            className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {flipped ? "Show Front" : "Show Back"}
          </button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1 text-xs bg-transparent border-white/20 text-white hover:bg-white/10" onClick={() => downloadCard("front")}>
              <Download className="w-3.5 h-3.5" /> Front
            </Button>
            <Button variant="outline" size="sm" className="gap-1 text-xs bg-transparent border-white/20 text-white hover:bg-white/10" onClick={() => downloadCard("back")}>
              <Download className="w-3.5 h-3.5" /> Back
            </Button>
            <Button size="sm" className="gap-1 text-xs bg-emerald-600 hover:bg-emerald-700" onClick={() => downloadCard("both")}>
              <Download className="w-3.5 h-3.5" /> Both
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({
  icon,
  label,
  value,
  valueClass = "text-white",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) => (
  <div>
    <p className="text-emerald-400 flex items-center gap-1 text-[9px] font-bold tracking-widest">
      {icon}
      {label}
    </p>
    <p className={`font-bold text-[12px] mt-0.5 truncate ${valueClass}`}>{value}</p>
  </div>
);

export default MemberIdCard;
