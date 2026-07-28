import React, { useState } from "react";
import { GoogleGenAI, Type } from "@google/genai";
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";
import { OCRResult } from "../types";

interface OCRScannerProps {
  apiKey: string;
  onApplyOCRData: (ocrData: OCRResult) => void;
  onSwitchToCalculator: () => void;
}

export const OCRScanner: React.FC<OCRScannerProps> = ({
  apiKey,
  onApplyOCRData,
  onSwitchToCalculator,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<OCRResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // File Upload Handlers
  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      setErrorMsg("이미지 파일(PNG, JPG, WebP)을 업로드해 주세요.");
      return;
    }
    setErrorMsg(null);
    setScanResult(null);

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // OCR Scan Action
  const handleScanImage = async () => {
    if (!selectedImage) return;

    setIsScanning(true);
    setErrorMsg(null);

    try {
      let resultData: OCRResult | null = null;

      // 1. Try server endpoint first
      try {
        const res = await fetch("/api/gemini/ocr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: selectedImage,
            customApiKey: apiKey,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            resultData = data.data;
          }
        }
      } catch (e) {
        console.warn("Server OCR API endpoint call failed, trying direct client-side SDK:", e);
      }

      // 2. Direct client-side SDK call fallback
      if (!resultData) {
        if (!apiKey || apiKey.trim().length === 0) {
          throw new Error("Gemini API 키가 설정되지 않았습니다. 상단 [API 키 설정] 버튼을 눌러 키를 입력해 주세요!");
        }

        const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
        const prompt = `
당신은 대한민국 교원(유/초/중/고 교사) 월급 명세서 전문 분석 AI입니다.
업로드된 월급 명세서 이미지 또는 문서를 정밀 분석하여 다음 항목을 정확하게 추출해주세요:
1. 기본급 (호봉 기준 기본급 금액, 원 단위)
2. 추정 호봉 (인식 가능할 경우 1~40 중 숫자, 없으면 0)
3. 수당 항목 목록 (항목명과 금액)
4. 공제 항목 목록 (항목명과 금액)
5. 인식 소평 및 친절한 안내 메시지

금액은 숫자로만(원 단위, 컴마 제외) 추출해야 합니다.
`;

        const mimeMatch = selectedImage.match(/^data:(image\/\w+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : "image/png";

        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: selectedImage.replace(/^data:image\/\w+;base64,/, ""),
                },
              },
              { text: prompt },
            ],
          },
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                baseSalary: { type: Type.NUMBER, description: "기본급 금액 (원)" },
                step: { type: Type.NUMBER, description: "추정 호봉" },
                allowances: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING, description: "수당 이름" },
                      amount: { type: Type.NUMBER, description: "수당 금액 (원)" },
                    },
                    required: ["name", "amount"],
                  },
                },
                deductions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING, description: "공제 항목 이름" },
                      amount: { type: Type.NUMBER, description: "공제 금액 (원)" },
                    },
                    required: ["name", "amount"],
                  },
                },
                notes: { type: Type.STRING, description: "인식 소평 및 선생님께 전달하는 메시지" },
              },
              required: ["baseSalary", "allowances", "deductions"],
            },
          },
        });

        const jsonText = response.text || "{}";
        resultData = JSON.parse(jsonText);
      }

      setScanResult(resultData);
    } catch (err: any) {
      console.error("OCR Error:", err);
      setErrorMsg(err.message || "이미지 분석 중 오류가 발생했습니다. API 키 및 이미지 선명도를 확인해 주세요.");
    } finally {
      setIsScanning(false);
    }
  };

  // Apply OCR to Calculator State
  const handleApply = () => {
    if (scanResult) {
      onApplyOCRData(scanResult);
      onSwitchToCalculator();
    }
  };

  return (
    <div class="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      
      {/* Banner */}
      <div class="organic-card p-6 sm:p-8 relative overflow-hidden bg-white border-2 border-dashed border-[#f0e68c]">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-[#fff9c4] text-[#5d4037] flex items-center justify-center font-bold text-2xl shadow-sm shrink-0 border border-[#f0e68c]">
            📄
          </div>
          <div>
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fff9c4] text-[#5d4037] text-xs font-bold shadow-sm mb-1 border border-[#f0e68c]">
              <Sparkles class="w-3.5 h-3.5 text-amber-600" />
              Gemini Multimodal Vision AI OCR
            </div>
            <h2 class="text-2xl sm:text-3xl font-black text-[#5d4037] font-['Jua']">
              급여명세서 파일 업로드 &amp; AI 자동 인식 📄✨
            </h2>
            <p class="text-xs sm:text-sm text-[#5d4037]/80 mt-1 font-medium">
              선생님의 월급 명세서 사진을 쏙! 던져주시면 Gemini AI가 수당과 공제 금액을 찰칵 찾아드려요!
            </p>
          </div>
        </div>
      </div>

      {/* Main Upload Dropzone & Preview */}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left: Dropzone */}
        <div class="space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            class={`border-3 border-dashed rounded-3xl p-8 text-center transition-all flex flex-col items-center justify-center min-h-[320px] cursor-pointer ${
              dragActive
                ? "border-amber-400 bg-[#fff9c4]/80 scale-[1.01]"
                : selectedImage
                ? "border-teal-400 bg-[#e0f2f1]/30"
                : "border-[#f0e68c] bg-[#fff9c4]/30 hover:bg-[#fff9c4]/60"
            }`}
            onClick={() => document.getElementById("fileInput")?.click()}
          >
            <input
              id="fileInput"
              type="file"
              accept="image/*,.pdf"
              class="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
            />

            {selectedImage ? (
              <div class="space-y-3 w-full">
                <div class="relative max-h-56 overflow-hidden rounded-2xl border-2 border-[#b2d8d5] bg-black/5 mx-auto">
                  <img
                    src={selectedImage}
                    alt="업로드된 명세서"
                    class="w-full h-full object-contain max-h-56 mx-auto rounded-2xl"
                  />
                </div>
                <p class="text-xs font-bold text-teal-800 flex items-center justify-center gap-1">
                  <CheckCircle2 class="w-4 h-4 text-teal-600" /> 명세서 이미지가 준비되었습니다!
                </p>
                <p class="text-[11px] text-[#5d4037]/60">클릭하여 다른 이미지로 교체할 수 있습니다.</p>
              </div>
            ) : (
              <div class="space-y-3">
                <div class="w-16 h-16 rounded-3xl bg-[#fff9c4] text-[#5d4037] flex items-center justify-center mx-auto shadow-sm border border-[#f0e68c]">
                  <UploadCloud class="w-8 h-8 text-amber-700" />
                </div>
                <p class="font-bold text-[#5d4037] text-base font-['Jua']">
                  📄 여기에 명세서 사진을 쏙! 던져주세요 ✨
                </p>
                <p class="text-xs text-[#5d4037]/70 max-w-xs mx-auto font-medium">
                  클릭하거나 명세서 이미지(PNG, JPG, WebP)를 드래그 앤 드롭해 주세요.
                </p>
              </div>
            )}
          </div>

          {/* Action Scan Button */}
          {selectedImage && (
            <button
              onClick={handleScanImage}
              disabled={isScanning}
              class="pudding-btn pudding-btn-yellow w-full py-4 text-sm sm:text-base flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isScanning ? (
                <>
                  <Loader2 class="w-5 h-5 animate-spin" />
                  Gemini AI가 수당 항목을 분석 중입니다... 🔍✨
                </>
              ) : (
                <>
                  <Sparkles class="w-5 h-5" />
                  AI 분석 시작하기 ✨
                </>
              )}
            </button>
          )}

          {errorMsg && (
            <div class="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle class="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p class="font-bold">분석 오류</p>
                <p>{errorMsg}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Scan Results */}
        <div class="organic-card p-6 space-y-4 bg-white">
          <h3 class="font-bold text-[#5d4037] text-base flex items-center gap-2 font-['Jua']">
            <FileText class="w-5 h-5 text-amber-600" />
            AI 인식 추출 결과 🪄
          </h3>

          {scanResult ? (
            <div class="space-y-4 animate-fadeIn">
              
              {/* Note banner */}
              <div class="p-3 bg-[#fff9c4]/60 rounded-2xl border border-[#f0e68c] text-xs text-[#5d4037] font-medium">
                <span class="font-bold">💡 AI 메시지: </span>
                {scanResult.notes || "명세서 항목과 금액을 성공적으로 추출했습니다!"}
              </div>

              {/* Base Salary Extracted */}
              <div class="p-3.5 bg-[#e0f2f1]/40 rounded-2xl border border-[#b2d8d5] flex items-center justify-between">
                <span class="text-xs font-bold text-[#5d4037]">기본급 (Base Salary)</span>
                <span class="font-black text-[#5d4037] text-sm font-['Jua']">
                  {scanResult.baseSalary?.toLocaleString() || 0} 원
                </span>
              </div>

              {/* Allowances Extracted */}
              <div>
                <span class="text-xs font-bold text-amber-900 block mb-2">
                  🎁 인식된 수당 목록 ({scanResult.allowances?.length || 0}개)
                </span>
                <div class="space-y-1.5 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
                  {scanResult.allowances?.map((item, idx) => (
                    <div
                      key={idx}
                      class="flex items-center justify-between p-2.5 rounded-xl bg-[#fff9c4]/50 border border-[#f0e68c] text-xs font-medium"
                    >
                      <span class="text-[#5d4037] font-bold">{item.name}</span>
                      <span class="text-amber-900 font-bold">+{item.amount.toLocaleString()}원</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deductions Extracted */}
              <div>
                <span class="text-xs font-bold text-teal-900 block mb-2">
                  💸 인식된 공제 목록 ({scanResult.deductions?.length || 0}개)
                </span>
                <div class="space-y-1.5 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
                  {scanResult.deductions?.map((item, idx) => (
                    <div
                      key={idx}
                      class="flex items-center justify-between p-2.5 rounded-xl bg-[#e0f2f1]/50 border border-[#b2d8d5] text-xs font-medium"
                    >
                      <span class="text-[#5d4037] font-bold">{item.name}</span>
                      <span class="text-teal-900 font-bold">-{item.amount.toLocaleString()}원</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Auto fill button */}
              <button
                onClick={handleApply}
                class="pudding-btn pudding-btn-mint w-full py-3.5 text-xs sm:text-sm flex items-center justify-center gap-2"
              >
                <Sparkles class="w-4 h-4" />
                계산기에 자동 채우기 적용! 🪄
              </button>

            </div>
          ) : (
            <div class="flex flex-col items-center justify-center py-16 text-center space-y-3 text-[#5d4037]/50">
              <div class="w-12 h-12 rounded-2xl bg-[#fff9c4] flex items-center justify-center text-[#5d4037] border border-[#f0e68c]">
                <ImageIcon class="w-6 h-6" />
              </div>
              <p class="text-xs font-medium">
                왼쪽 영역에 명세서 사진을 올리신 후 [AI 분석 시작하기]를 눌러주세요.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
