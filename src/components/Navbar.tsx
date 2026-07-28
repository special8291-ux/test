import React from "react";
import { Key, HelpCircle, Sparkles, BookmarkCheck, Calculator, Bot, FileText, Download } from "lucide-react";

interface NavbarProps {
  activeTab: "calc" | "ocr" | "tutor" | "export";
  setActiveTab: (tab: "calc" | "ocr" | "tutor" | "export") => void;
  onOpenApiKeyModal: () => void;
  onOpenHelpModal: () => void;
  hasApiKey: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenApiKeyModal,
  onOpenHelpModal,
  hasApiKey,
}) => {
  return (
    <header class="sticky top-0 z-40 bg-[#fffdf5]/95 backdrop-blur-md border-b-2 border-dashed border-[#ffd1dc] shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20">
          
          {/* Logo & Title */}
          <div class="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("calc")}>
            <div class="relative w-12 h-12 rounded-full bg-white p-0.5 shadow-md border-2 border-[#ffd1dc] hover:scale-105 transition-transform flex items-center justify-center shrink-0">
              <img
                src="/mascot-bunny.jpg"
                alt="튜터 마스코트"
                class="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <span class="absolute -bottom-1 -right-1 bg-[#fff9c4] text-xs px-1.5 py-0.5 rounded-full shadow text-[#5d4037] font-bold">✨</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-xl sm:text-2xl font-black text-[#5d4037] font-['Jua'] tracking-wide">
                  <span>🐰</span> 교사 월급 관리 <span class="text-pink-400">&amp;</span> AI 튜터
                </h1>
                <span class="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold bg-[#e0f2f1] text-[#5d4037] px-2.5 py-0.5 rounded-full border border-[#b2d8d5]">
                  <BookmarkCheck class="w-3 h-3 text-[#5d4037]" />
                  2026 교원 봉급표
                </span>
              </div>
              <p class="text-xs text-[#5d4037]/70 hidden sm:block font-medium">
                선생님의 소중한 월급 계산부터 AI 튜터 포실이/알밤이의 따뜻한 재정 처방까지! 💖
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div class="flex items-center gap-2">
            {/* API Key Modal Button */}
            <button
              onClick={onOpenApiKeyModal}
              class={`pudding-btn text-xs py-2 px-3.5 ${
                hasApiKey ? "pudding-btn-mint" : "pudding-btn"
              }`}
              title="Gemini API 키 설정"
            >
              <Key class="w-3.5 h-3.5" />
              <span class="hidden md:inline">API 키 설정</span>
              {hasApiKey ? (
                <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
              ) : (
                <span class="text-[10px] font-bold text-rose-700">⚙️</span>
              )}
            </button>

            {/* Help & Deploy Guide Button */}
            <button
              onClick={onOpenHelpModal}
              class="pudding-btn pudding-btn-yellow text-xs py-2 px-3.5"
            >
              <HelpCircle class="w-3.5 h-3.5" />
              <span class="hidden sm:inline">사용 가이드 &amp; 배포</span>
              <span class="sm:hidden">도움말</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav class="flex items-center gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-none">
          <button
            onClick={() => setActiveTab("calc")}
            class={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === "calc"
                ? "bg-[#ffd1dc] text-[#5d4037] shadow-[0_4px_0_#e6b8c4] font-black scale-[1.02]"
                : "bg-white text-[#5d4037]/80 hover:bg-[#ffd1dc]/40 border border-[#5d4037]/10"
            }`}
          >
            <Calculator class="w-4 h-4" />
            🧮 월급 &amp; 수당 계산기
          </button>

          <button
            onClick={() => setActiveTab("ocr")}
            class={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === "ocr"
                ? "bg-[#ffd1dc] text-[#5d4037] shadow-[0_4px_0_#e6b8c4] font-black scale-[1.02]"
                : "bg-white text-[#5d4037]/80 hover:bg-[#ffd1dc]/40 border border-[#5d4037]/10"
            }`}
          >
            <FileText class="w-4 h-4" />
            📄 명세서 AI 자동 인식(OCR)
          </button>

          <button
            onClick={() => setActiveTab("tutor")}
            class={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === "tutor"
                ? "bg-[#e0f2f1] text-[#5d4037] shadow-[0_4px_0_#b2d8d5] font-black scale-[1.02]"
                : "bg-white text-[#5d4037]/80 hover:bg-[#e0f2f1]/50 border border-[#5d4037]/10"
            }`}
          >
            <Bot class="w-4 h-4" />
            🐰 AI 재정 &amp; 투자 튜터
          </button>

          <button
            onClick={() => setActiveTab("export")}
            class={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === "export"
                ? "bg-[#fff9c4] text-[#5d4037] shadow-[0_4px_0_#f0e68c] font-black scale-[1.02]"
                : "bg-white text-[#5d4037]/80 hover:bg-[#fff9c4]/50 border border-[#5d4037]/10"
            }`}
          >
            <Download class="w-4 h-4" />
            💾 저장 &amp; 명세서 출력
          </button>
        </nav>
      </div>
    </header>
  );
};
