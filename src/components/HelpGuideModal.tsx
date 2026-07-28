import React, { useState } from "react";
import { HelpCircle, X, ExternalLink, Key, Github, Sparkles } from "lucide-react";

interface HelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpGuideModal: React.FC<HelpGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"api" | "github">("api");

  if (!isOpen) return null;

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div class="organic-card max-w-2xl w-full p-6 sm:p-8 bg-white relative max-h-[90vh] overflow-y-auto scrollbar-thin">
        <button
          onClick={onClose}
          class="absolute top-5 right-5 text-[#5d4037]/60 hover:text-[#5d4037] p-1 rounded-full hover:bg-slate-100 transition"
        >
          <X class="w-5 h-5" />
        </button>

        <div class="flex items-center gap-3 mb-6">
          <div class="w-12 h-12 rounded-2xl bg-[#fff9c4] flex items-center justify-center text-[#5d4037] font-bold border border-[#f0e68c]">
            <HelpCircle class="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <h2 class="text-2xl font-bold text-[#5d4037] font-['Jua']">
              초보 교사를 위한 친절 가이드 📘
            </h2>
            <p class="text-xs text-[#5d4037]/70 font-medium">
              Gemini API Key 무료 발급 방법과 GitHub Pages 배포 방법을 차근차근 확인하세요!
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div class="flex gap-2 p-1.5 bg-[#fffdf5] rounded-2xl mb-6 border border-[#e0f2f1]">
          <button
            onClick={() => setActiveTab("api")}
            class={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "api"
                ? "bg-[#ffd1dc] text-[#5d4037] shadow-xs border border-[#e6b8c4]"
                : "text-[#5d4037]/70 hover:text-[#5d4037]"
            }`}
          >
            <Key class="w-4 h-4" />
            1. Gemini API Key 무료 발급법
          </button>
          <button
            onClick={() => setActiveTab("github")}
            class={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "github"
                ? "bg-[#e0f2f1] text-[#5d4037] shadow-xs border border-[#b2d8d5]"
                : "text-[#5d4037]/70 hover:text-[#5d4037]"
            }`}
          >
            <Github class="w-4 h-4" />
            2. GitHub Pages에 무료 배포하기
          </button>
        </div>

        {/* Content Section 1: API Key */}
        {activeTab === "api" && (
          <div class="space-y-4 text-xs text-[#5d4037] leading-relaxed">
            <div class="p-4 bg-[#ffd1dc]/40 rounded-2xl border border-[#e6b8c4] space-y-2">
              <h3 class="font-bold text-[#5d4037] text-sm flex items-center gap-1.5 font-['Jua']">
                <Sparkles class="w-4 h-4 text-amber-600" />
                Google AI Studio API Key 발급 Step-by-Step
              </h3>
              <p class="text-[#5d4037]/80 font-medium">
                구글 계정만 있다면 1분 만에 무료로 Gemini AI API 키를 발급받아 명세서 OCR 및 AI 튜터 기능을 자유롭게 사용할 수 있습니다!
              </p>
            </div>

            <ol class="space-y-3 pl-1 font-medium">
              <li class="flex gap-3 items-start">
                <span class="w-6 h-6 rounded-full bg-[#ffd1dc] text-[#5d4037] font-bold flex items-center justify-center shrink-0 text-xs border border-[#e6b8c4]">1</span>
                <div>
                  <p class="font-bold text-[#5d4037]">Google AI Studio 웹사이트 접속</p>
                  <p class="text-[#5d4037]/70">
                    <a
                      href="https://aistudio.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-amber-800 underline font-semibold inline-flex items-center gap-1 mt-0.5"
                    >
                      https://aistudio.google.com 접속 <ExternalLink class="w-3 h-3" />
                    </a>
                    후 본인의 구글 계정으로 로그인합니다.
                  </p>
                </div>
              </li>

              <li class="flex gap-3 items-start">
                <span class="w-6 h-6 rounded-full bg-[#ffd1dc] text-[#5d4037] font-bold flex items-center justify-center shrink-0 text-xs border border-[#e6b8c4]">2</span>
                <div>
                  <p class="font-bold text-[#5d4037]">'Get API key' 메뉴 클릭</p>
                  <p class="text-[#5d4037]/70">화면 왼쪽 상단 또는 메뉴의 <strong>Get API key</strong> 버튼을 누릅니다.</p>
                </div>
              </li>

              <li class="flex gap-3 items-start">
                <span class="w-6 h-6 rounded-full bg-[#ffd1dc] text-[#5d4037] font-bold flex items-center justify-center shrink-0 text-xs border border-[#e6b8c4]">3</span>
                <div>
                  <p class="font-bold text-[#5d4037]">'Create API key' 생성</p>
                  <p class="text-[#5d4037]/70">파란색 <strong>Create API key</strong> 버튼을 누른 후 새 프로젝트 또는 기존 프로젝트를 선택합니다.</p>
                </div>
              </li>

              <li class="flex gap-3 items-start">
                <span class="w-6 h-6 rounded-full bg-[#ffd1dc] text-[#5d4037] font-bold flex items-center justify-center shrink-0 text-xs border border-[#e6b8c4]">4</span>
                <div>
                  <p class="font-bold text-[#5d4037]">생성된 API Key 복사 및 앱 입력</p>
                  <p class="text-[#5d4037]/70">
                    생성된 문자열 (<code>AIzaSy...</code>)을 복사하여 본 웹사이트 상단 <strong>[API Key]</strong> 버튼을 누르고 붙여넣기 하면 완료! ✨
                  </p>
                </div>
              </li>
            </ol>
          </div>
        )}

        {/* Content Section 2: GitHub Pages */}
        {activeTab === "github" && (
          <div class="space-y-4 text-xs text-[#5d4037] leading-relaxed">
            <div class="p-4 bg-[#e0f2f1]/50 rounded-2xl border border-[#b2d8d5] space-y-2">
              <h3 class="font-bold text-[#5d4037] text-sm flex items-center gap-1.5 font-['Jua']">
                <Github class="w-4 h-4 text-teal-700" />
                GitHub Pages 깃허브 웹 배포 Step-by-Step (Option B)
              </h3>
              <p class="text-[#5d4037]/80 font-medium">
                별도 서버 비용 없이 깃허브 무료 웹 호스팅 서비스로 단 1분 만에 선생님만의 전용 웹사이트로 배포할 수 있습니다!
              </p>
            </div>

            <ol class="space-y-3 pl-1 font-medium">
              <li class="flex gap-3 items-start">
                <span class="w-6 h-6 rounded-full bg-[#e0f2f1] text-[#5d4037] font-bold flex items-center justify-center shrink-0 text-xs border border-[#b2d8d5]">1</span>
                <div>
                  <p class="font-bold text-[#5d4037]">GitHub 회원가입 및 새 저장소 생성</p>
                  <p class="text-[#5d4037]/70">
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-teal-800 underline font-semibold inline-flex items-center gap-1"
                    >
                      https://github.com <ExternalLink class="w-3 h-3" />
                    </a>
                    접속 로그인 후 오른쪽 상단 <strong>[+] -&gt; 'New repository'</strong>를 누릅니다.
                  </p>
                </div>
              </li>

              <li class="flex gap-3 items-start">
                <span class="w-6 h-6 rounded-full bg-[#e0f2f1] text-[#5d4037] font-bold flex items-center justify-center shrink-0 text-xs border border-[#b2d8d5]">2</span>
                <div>
                  <p class="font-bold text-[#5d4037]">Repository 설정</p>
                  <p class="text-[#5d4037]/70">
                    Repository name에 <code>teacher-salary-tutor</code> 입력 후 <strong>Public</strong>을 선택하고 <strong>Create repository</strong> 버튼을 누릅니다.
                  </p>
                </div>
              </li>

              <li class="flex gap-3 items-start">
                <span class="w-6 h-6 rounded-full bg-[#e0f2f1] text-[#5d4037] font-bold flex items-center justify-center shrink-0 text-xs border border-[#b2d8d5]">3</span>
                <div>
                  <p class="font-bold text-[#5d4037]">index.html 파일 업로드</p>
                  <p class="text-[#5d4037]/70">
                    생성된 화면에서 <strong>'uploading an existing file'</strong> 링크를 누르고, 다운로드받은 <code>index.html</code> (빌드본)을 드래그 앤 드롭 후 [Commit changes] 클릭!
                  </p>
                </div>
              </li>

              <li class="flex gap-3 items-start">
                <span class="w-6 h-6 rounded-full bg-[#e0f2f1] text-[#5d4037] font-bold flex items-center justify-center shrink-0 text-xs border border-[#b2d8d5]">4</span>
                <div>
                  <p class="font-bold text-[#5d4037]">GitHub Pages 설정 활성화</p>
                  <p class="text-[#5d4037]/70">
                    저장소 상단 <strong>[Settings]</strong> -&gt; 왼쪽 메뉴 <strong>[Pages]</strong> 선택 후, Source를 'Deploy from a branch', Branch를 <strong>'main'</strong>으로 설정하고 [Save] 누르면 완성! 🎉
                  </p>
                </div>
              </li>
            </ol>
          </div>
        )}

        <div class="mt-8 text-center pt-4 border-t border-[#e0f2f1]">
          <button
            onClick={onClose}
            class="pudding-btn pudding-btn-yellow text-xs py-2.5 px-6"
          >
            확인했습니다! 💖
          </button>
        </div>
      </div>
    </div>
  );
};
