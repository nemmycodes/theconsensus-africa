import { useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { CreditCard, Download, RotateCcw } from "lucide-react";

interface MemberIdCardProps {
  profile: any;
  open: boolean;
  onClose: () => void;
}

const MemberIdCard = ({ profile, open, onClose }: MemberIdCardProps) => {
  const { user } = useAuth();
  const [flipped, setFlipped] = useState(false);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  if (!open) return null;

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Member";
  const email = profile?.email || user?.email || "";
  const phone = profile?.phone || user?.user_metadata?.phone || "N/A";
  const dob = profile?.dob || user?.user_metadata?.dob || "N/A";
  const lga = profile?.lga || user?.user_metadata?.lga || "—";
  const ward = profile?.ward || user?.user_metadata?.ward || "—";
  const interests = profile?.interests || user?.user_metadata?.interests || [];
  const joinedDate = user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—";
  const memberId = `TPC-${new Date(user?.created_at || "").getFullYear()}-${user?.id?.slice(0, 6).toUpperCase() || "000000"}`;
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || "";

  const downloadCard = async (side: "front" | "back" | "both") => {
    // Using canvas-based approach for download
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = 900;
    const h = 540;
    canvas.width = w;
    canvas.height = h;

    const drawFront = () => {
      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "#047857");
      grad.addColorStop(0.5, "#065f46");
      grad.addColorStop(1, "#064e3b");
      ctx.fillStyle = grad;
      ctx.roundRect(0, 0, w, h, 20);
      ctx.fill();

      // Gold border
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 6;
      ctx.roundRect(8, 8, w - 16, h - 16, 16);
      ctx.stroke();

      // Decorative circles
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      ctx.beginPath();
      ctx.arc(w - 80, 60, 120, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(80, h - 60, 100, 0, Math.PI * 2);
      ctx.fill();

      // Header
      ctx.fillStyle = "#d4edda";
      ctx.font = "bold 12px Arial";
      ctx.letterSpacing = "3px";
      ctx.fillText("THE PLATEAU", 40, 50);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 28px Arial";
      ctx.fillText("CONSENSUS", 40, 82);
      ctx.fillStyle = "#d4edda";
      ctx.font = "12px Arial";
      ctx.fillText("MEMBERSHIP IDENTIFICATION CARD", 40, 102);

      // Right header
      ctx.fillStyle = "#d4edda";
      ctx.font = "10px Arial";
      ctx.textAlign = "right";
      ctx.fillText("MEMBER CARD", w - 40, 50);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 16px Arial";
      ctx.fillText("2025 – 2027", w - 40, 72);
      ctx.textAlign = "left";

      // Avatar
      if (avatarUrl) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = avatarUrl;
        try {
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject();
            setTimeout(() => resolve(), 3000);
          });
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(40, 130, 100, 100, 16);
          ctx.clip();
          ctx.drawImage(img, 40, 130, 100, 100);
          ctx.restore();
        } catch {
          ctx.fillStyle = "rgba(255,255,255,0.2)";
          ctx.beginPath();
          ctx.roundRect(40, 130, 100, 100, 16);
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 48px Arial";
          ctx.textAlign = "center";
          ctx.fillText(displayName[0]?.toUpperCase() || "M", 90, 198);
          ctx.textAlign = "left";
        }
      } else {
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.beginPath();
        ctx.roundRect(40, 130, 100, 100, 16);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 48px Arial";
        ctx.textAlign = "center";
        ctx.fillText(displayName[0]?.toUpperCase() || "M", 90, 198);
        ctx.textAlign = "left";
      }

      // Name
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 26px Arial";
      ctx.fillText(displayName.toUpperCase(), 160, 165);
      ctx.fillStyle = "#a7f3d0";
      ctx.font = "14px Arial";
      ctx.fillText("Verified Member", 160, 188);

      // Info grid
      const fields = [
        ["MEMBER ID", memberId],
        ["EMAIL", email],
        ["PHONE", phone],
        ["DATE OF BIRTH", dob],
        ["STATE", "Plateau State"],
        ["LGA / WARD", `${lga} / ${ward}`],
        ["DATE ISSUED", joinedDate],
        ["STATUS", "ACTIVE"],
      ];

      let y = 270;
      let col = 0;
      fields.forEach(([label, value], i) => {
        const x = col === 0 ? 40 : 460;
        ctx.fillStyle = "#a7f3d0";
        ctx.font = "bold 9px Arial";
        ctx.fillText(label, x, y);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 14px Arial";
        ctx.fillText(value || "N/A", x, y + 18);
        col++;
        if (col >= 2) {
          col = 0;
          y += 50;
        }
      });

      // Bottom bar
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.fillRect(0, h - 40, w, 40);
      ctx.fillStyle = "#a7f3d0";
      ctx.font = "10px Arial";
      ctx.fillText("www.theconsensus.africa  |  Economic Freedom · Political Consciousness · Shared Prosperity", 40, h - 16);
    };

    const drawBack = () => {
      // Background
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "#064e3b");
      grad.addColorStop(1, "#047857");
      ctx.fillStyle = grad;
      ctx.roundRect(0, 0, w, h, 20);
      ctx.fill();

      // Gold border
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 6;
      ctx.roundRect(8, 8, w - 16, h - 16, 16);
      ctx.stroke();

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px Arial";
      ctx.textAlign = "center";
      ctx.fillText("THE PLATEAU CONSENSUS", w / 2, 50);
      ctx.fillStyle = "#a7f3d0";
      ctx.font = "12px Arial";
      ctx.fillText("MEMBERSHIP CARD – BACK", w / 2, 72);
      ctx.textAlign = "left";

      // Interests
      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 12px Arial";
      ctx.fillText("SKILLS & INTERESTS", 40, 110);
      ctx.fillStyle = "#ffffff";
      ctx.font = "13px Arial";
      if (interests.length > 0) {
        interests.forEach((interest: string, i: number) => {
          ctx.fillText(`• ${interest}`, 40, 135 + i * 22);
        });
      } else {
        ctx.fillText("No interests specified", 40, 135);
      }

      // Terms
      const termsY = Math.max(135 + interests.length * 22 + 30, 280);
      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 12px Arial";
      ctx.fillText("TERMS & CONDITIONS", 40, termsY);
      ctx.fillStyle = "#d4edda";
      ctx.font = "11px Arial";
      const terms = [
        "1. This card is the property of The Plateau Consensus.",
        "2. It is non-transferable and valid only for the named holder.",
        "3. Report lost or stolen cards immediately.",
        "4. Card must be presented at all official events.",
        "5. The organization reserves the right to revoke membership.",
      ];
      terms.forEach((t, i) => {
        ctx.fillText(t, 40, termsY + 22 + i * 20);
      });

      // Contact info
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.fillRect(0, h - 60, w, 60);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Contact: info@theconsensus.africa  |  Plateau State, Nigeria", w / 2, h - 34);
      ctx.fillStyle = "#a7f3d0";
      ctx.font = "10px Arial";
      ctx.fillText("If found, please return to the nearest TPC office", w / 2, h - 16);
      ctx.textAlign = "left";
    };

    if (side === "front" || side === "both") {
      drawFront();
      const link = document.createElement("a");
      link.download = `TPC-ID-Front-${displayName.replace(/\s+/g, "_")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }

    if (side === "back" || side === "both") {
      ctx.clearRect(0, 0, w, h);
      drawBack();
      const link = document.createElement("a");
      link.download = `TPC-ID-Back-${displayName.replace(/\s+/g, "_")}.png`;
      link.href = canvas.toDataURL("image/png");
      setTimeout(() => link.click(), side === "both" ? 500 : 0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-4 md:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-emerald-600" />
            <div>
              <h3 className="font-bold text-gray-900">Membership ID Card</h3>
              <p className="text-xs text-gray-500">Click card to flip · Front & Back</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {/* Card with flip animation */}
        <div className="perspective-1000 cursor-pointer" onClick={() => setFlipped(!flipped)}>
          <div className={`relative w-full transition-transform duration-700 transform-style-preserve-3d ${flipped ? "[transform:rotateY(180deg)]" : ""}`}>
            {/* FRONT */}
            <div ref={frontRef} className={`${flipped ? "invisible" : ""} bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 rounded-2xl p-5 md:p-6 text-white border-4 border-amber-400 relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-emerald-200">The Plateau</p>
                  <p className="text-lg font-black uppercase">Consensus</p>
                  <p className="text-[9px] text-emerald-300 uppercase tracking-wider">Membership Identification Card</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase text-emerald-200">Member Card</p>
                  <p className="text-sm font-bold">2025 - 2027</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="w-16 h-16 rounded-xl object-cover shrink-0 border-2 border-white/30" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center text-2xl font-bold shrink-0">
                    {displayName[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-lg font-black">{displayName}</p>
                  <p className="text-xs text-emerald-200">Verified Member</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                <div><p className="text-emerald-300 uppercase text-[9px] font-bold">Member ID</p><p className="font-bold">{memberId}</p></div>
                <div><p className="text-emerald-300 uppercase text-[9px] font-bold">Email</p><p className="font-bold text-[11px] truncate">{email}</p></div>
                <div><p className="text-emerald-300 uppercase text-[9px] font-bold">Phone</p><p className="font-bold">{phone}</p></div>
                <div><p className="text-emerald-300 uppercase text-[9px] font-bold">Date of Birth</p><p className="font-bold">{dob}</p></div>
                <div><p className="text-emerald-300 uppercase text-[9px] font-bold">State / LGA</p><p className="font-bold">Plateau / {lga}</p></div>
                <div><p className="text-emerald-300 uppercase text-[9px] font-bold">Ward</p><p className="font-bold">{ward}</p></div>
                <div><p className="text-emerald-300 uppercase text-[9px] font-bold">Date Issued</p><p className="font-bold">{joinedDate}</p></div>
                <div><p className="text-emerald-300 uppercase text-[9px] font-bold">Status</p><p className="font-bold text-amber-400">ACTIVE ✓</p></div>
              </div>
            </div>

            {/* BACK */}
            {flipped && (
              <div ref={backRef} className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-600 rounded-2xl p-5 md:p-6 text-white border-4 border-amber-400 relative overflow-hidden">
                <div className="text-center mb-4">
                  <p className="text-lg font-black uppercase">The Plateau Consensus</p>
                  <p className="text-[10px] text-emerald-200 uppercase tracking-widest">Membership Card – Back</p>
                </div>

                {interests.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-2">Skills & Interests</p>
                    <div className="flex flex-wrap gap-1.5">
                      {interests.map((interest: string) => (
                        <span key={interest} className="px-2 py-1 rounded-full text-[10px] font-medium bg-white/10 border border-white/20">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-2">Terms & Conditions</p>
                  <div className="text-[10px] text-emerald-200 space-y-1">
                    <p>1. This card is the property of The Plateau Consensus.</p>
                    <p>2. Non-transferable and valid only for the named holder.</p>
                    <p>3. Report lost or stolen cards immediately.</p>
                    <p>4. Must be presented at all official events.</p>
                    <p>5. The organization reserves the right to revoke membership.</p>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-3 text-center">
                  <p className="text-[10px] font-bold text-white">Contact: info@theconsensus.africa</p>
                  <p className="text-[9px] text-emerald-300 mt-0.5">If found, please return to the nearest TPC office</p>
                  <p className="text-[9px] text-emerald-400 mt-0.5">Plateau State, Nigeria</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <button
            onClick={(e) => { e.stopPropagation(); setFlipped(!flipped); }}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {flipped ? "Show Front" : "Show Back"}
          </button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => downloadCard("front")}>
              <Download className="w-3.5 h-3.5" /> Front
            </Button>
            <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => downloadCard("back")}>
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

export default MemberIdCard;
