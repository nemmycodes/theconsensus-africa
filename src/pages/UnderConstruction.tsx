import { useEffect } from "react";

const UnderConstruction = () => {
  useEffect(() => {
    document.title = "Site Under Construction — The Plateau Consensus";
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-[#faf8f5] text-[#0d1b0d]">
      <img
        src="/brand-logo.png"
        alt="The Plateau Consensus"
        className="w-[76px] h-[76px] object-contain mb-8"
      />
      <div className="inline-flex items-center gap-2 bg-[#2d5a3d] text-white font-['Space_Grotesk',sans-serif] font-semibold text-sm px-5 py-2.5 rounded-full tracking-widest uppercase">
        <span className="w-2 h-2 bg-[#a0c49d] rounded-full animate-pulse" />
        Under Construction
      </div>
      <h1 className="font-['Space_Grotesk',sans-serif] text-[clamp(1.75rem,4vw,2.75rem)] font-bold leading-tight mt-6 mb-4 tracking-tight">
        We're Building Something Great
      </h1>
      <p className="text-base md:text-lg text-gray-500 max-w-xl leading-relaxed mb-8">
        The Plateau Consensus platform is currently undergoing updates. We'll be
        back online shortly. Thank you for your patience.
      </p>
      <footer className="mt-auto pt-8 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} The Plateau Consensus. All rights
        reserved.
      </footer>
    </div>
  );
};

export default UnderConstruction;
