import React, { useState } from "react";
import { Key, X, ExternalLink, Check, ShieldAlert } from "lucide-react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
}) => {
  const [inputKey, setInputKey] = useState(apiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(inputKey.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div class="organic-card max-w-lg w-full p-6 bg-white relative">
        <button
          onClick={onClose}
          class="absolute top-5 right-5 text-[#5d4037]/60 hover:text-[#5d4037] p-1 rounded-full hover:bg-slate-100 transition"
        >
          <X class="w-5 h-5" />
        </button>

        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-2xl bg-[#ffd1dc] flex items-center justify-center text-[#5d4037] font-bold border border-[#e6b8c4]">
            <Key class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-[#5d4037] font-['Jua']">
              Gemini API 키 설정 🔑
            </h2>
            <p class="text-xs text-[#5d4037]/70 font-medium">
              구글 AI 스튜디오 무료 발급 키를 입력하면 OCR &amp; AI 튜터를 이용할 수 있습니다.
            </p>
          </div>
        </div>

        <div class="space-y-4 my-4">
          <div>
            <label class="block text-xs font-bold text-[#5d4037] mb-1">
              Gemini API Key (AIzaSy...)
            </label>
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="Google AI Studio에서 발급받은 API 키를 입력하세요"
              class="w-full px-4 py-3 rounded-2xl border-2 border-[#e0f2f1] focus:outline-none focus:ring-2 focus:ring-[#ffd1dc] font-mono text-xs font-bold text-[#5d4037] bg-[#fffdf5]"
            />
          </div>

          <div class="p-3 bg-[#fff9c4]/60 rounded-2xl border border-[#f0e68c] text-xs text-[#5d4037] space-y-1 font-medium">
            <div class="flex items-center gap-1.5 font-bold text-[#5d4037]">
              <ShieldAlert class="w-4 h-4 text-amber-700" />
              보안 및 개인정보 안내
            </div>
            <p class="leading-relaxed">
              입력하신 API 키는 서버로 유출되지 않으며, 오직 브라우저의 안전한 <strong>LocalStorage</strong>에만 보관됩니다.
            </p>
          </div>

          <div class="pt-1">
            <a
              href="https://aistudio.google.com"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-900 underline"
            >
              Google AI Studio 무료 키 발급받기
              <ExternalLink class="w-3 h-3" />
            </a>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            class="px-4 py-2.5 rounded-2xl text-xs font-bold text-[#5d4037] bg-slate-100 hover:bg-slate-200 transition"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            class="pudding-btn pudding-btn-yellow text-xs py-2.5 px-5 flex items-center gap-2"
          >
            {savedSuccess ? (
              <>
                <Check class="w-4 h-4" /> 저장 완료! ✨
              </>
            ) : (
              "API 키 저장하기 💾"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
