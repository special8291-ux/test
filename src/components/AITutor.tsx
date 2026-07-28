import React, { useState } from "react";
import { GoogleGenAI, Type } from "@google/genai";
import {
  Bot,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  Loader2,
  Lightbulb,
  Target,
  PieChart,
  HelpCircle,
  Coins,
  ArrowRight,
} from "lucide-react";
import { MascotType, InvestmentInclination, SalarySummary, TutorAdvice } from "../types";

interface AITutorProps {
  apiKey: string;
  salarySummary: SalarySummary;
}

export const AITutor: React.FC<AITutorProps> = ({ apiKey, salarySummary }) => {
  const [mascot, setMascot] = useState<MascotType>("bunny");
  const [inclination, setInclination] = useState<InvestmentInclination>("seed");
  const [targetGoal, setTargetGoal] = useState("1억원 목돈 모으기");
  const [livingCostRatio, setLivingCostRatio] = useState(50);

  const [isLoading, setIsLoading] = useState(false);
  const [tutorAdvice, setTutorAdvice] = useState<TutorAdvice | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const surplusFund = Math.max(0, Math.round(salarySummary.netPay * (1 - livingCostRatio / 100)));

  const handleFetchAdvice = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      let adviceData: TutorAdvice | null = null;

      // 1. Try server API
      try {
        const res = await fetch("/api/gemini/tutor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mascot,
            inclination,
            targetGoal,
            livingCostRatio,
            salarySummary,
            customApiKey: apiKey,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            adviceData = data.data;
          }
        }
      } catch (e) {
        console.warn("Server tutor API failed, trying direct client-side SDK:", e);
      }

      // 2. Direct client-side SDK fallback
      if (!adviceData) {
        if (!apiKey || apiKey.trim().length === 0) {
          throw new Error("Gemini API 키가 설정되지 않았습니다. 상단 우측 [API 키 설정] 버튼에서 키를 입력해 주세요!");
        }

        const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
        const mascotName = mascot === "squirrel" ? "알밤이(자산 관리 다람쥐 🐿️)" : "포실이(월급 튜터 토끼 🐰)";
        const inclinationMap: Record<string, string> = {
          seed: "🌱 차곡차곡 씨앗형 (원금보존 & 안정추구: 예적금, 교직원공제회, 국채 중심)",
          sprout: "🌿 스파클링 새싹형 (위험중립: 배당 ETF, 리츠, 채권혼합, 적립식 자산배분)",
          tree: "🌳 열매 팡팡형 (적극투자: 글로벌 지수 ETF, 성장주, 적극적 복리 자산배분)",
        };

        const prompt = `
당신은 대한민국 교사를 위한 귀엽고 앙증맞은 AI 재정 & 투자 튜터 마스코트 '${mascotName}'입니다.
선생님의 현재 월급 및 수당 산출 내역과 투자 성향을 기반으로 따뜻하고 다정하게 맞춤형 자산 배분 가이드와 교사 특화 절세 꿀팁을 제공해주세요.

[선생님 재정 정보]
- 월 총지급액: ${salarySummary.totalGross?.toLocaleString()}원
- 월 총공제액: ${salarySummary.totalDeductions?.toLocaleString()}원
- 월 실수령액: ${salarySummary.netPay?.toLocaleString()}원
- 예상 연간 실수령액(명절휴가비/정근수당 포함): ${salarySummary.annualNetPay?.toLocaleString()}원
- 선택된 투자 성향: ${inclinationMap[inclination] || inclination}
- 자산 관리 목표: ${targetGoal}
- 예상 월 생활비 비중: 실수령액의 ${livingCostRatio}% (여유 자금: 약 ${Math.round(salarySummary.netPay * (1 - livingCostRatio / 100))?.toLocaleString()}원)

[답변 요청사항]
1. mascotMessage: 마스코트의 귀엽고 다정한 말투("선생님! 오늘도 수업하시느라 너무 고생 많으셨어요~💕" 등)로 시작하는 총평 및 응원 메시지 (2~3문장)
2. financialHealthScore: 현재 월급 실수령액 대비 저축/여유 자금 비중 기준 재정 건강도 점수 (70~98점 사이)
3. allocation: 포트폴리오 비중 (합계 100%)
   - savings: 안전 자금 (예적금 / 교직원공제회 장기저축급여) 비중 (%)
   - dividendEtf: 배당주 / 배당 ETF / 리츠 비중 (%)
   - indexEtf: 지수 ETF / 주식형 펀드 비중 (%)
   - emergencyFund: 파킹통장 / 비상금 비중 (%)
4. teacherTips: 대한민국 교사 맞춤형 금융/절세/공제회 꿀팁 3~4개 (예: 교직원공제회 장기저축급여 복리혜택, 연금저축/IRP 세액공제, 고향사랑기부금 세액공제, 교원 전용 우대적금 활용 등)
5. actionPlan: 매월 실천할 3단계 액션 플랜 (1단계, 2단계, 3단계 항목 및 가이드)
6. encouragementQuote: 마스코트의 앙증맞은 한줄 포춘 쿠키 비법 수첩 메시지

반드시 지정된 JSON 형식으로 답변해 주세요.
`;

        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                mascotMessage: { type: Type.STRING },
                financialHealthScore: { type: Type.NUMBER },
                allocation: {
                  type: Type.OBJECT,
                  properties: {
                    savings: { type: Type.NUMBER },
                    dividendEtf: { type: Type.NUMBER },
                    indexEtf: { type: Type.NUMBER },
                    emergencyFund: { type: Type.NUMBER },
                  },
                  required: ["savings", "dividendEtf", "indexEtf", "emergencyFund"],
                },
                teacherTips: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                actionPlan: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      step: { type: Type.STRING },
                      desc: { type: Type.STRING },
                    },
                    required: ["step", "desc"],
                  },
                },
                encouragementQuote: { type: Type.STRING },
              },
              required: [
                "mascotMessage",
                "financialHealthScore",
                "allocation",
                "teacherTips",
                "actionPlan",
                "encouragementQuote",
              ],
            },
          },
        });

        const jsonText = response.text || "{}";
        adviceData = JSON.parse(jsonText);
      }

      setTutorAdvice(adviceData);
    } catch (err: any) {
      console.error("Tutor Error:", err);
      setErrorMsg(err.message || "AI 튜터 조언 생성 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div class="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      
      {/* Banner Header */}
      <div class="organic-card p-6 sm:p-8 relative overflow-hidden bg-white border-2 border-dashed border-[#b2d8d5]">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-sm shrink-0 bg-[#e0f2f1]">
            <img
              src={mascot === "squirrel" ? "/mascot-squirrel.jpg" : "/mascot-bunny.jpg"}
              alt="AI Mascot"
              class="w-full h-full object-cover"
            />
          </div>
          <div>
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e0f2f1] text-[#5d4037] text-xs font-bold shadow-sm mb-1 border border-[#b2d8d5]">
              <Sparkles class="w-3.5 h-3.5 text-teal-600" />
              Gemini AI 재정 &amp; 투자 튜터
            </div>
            <h2 class="text-2xl sm:text-3xl font-black text-[#5d4037] font-['Jua']">
              AI 튜터 {mascot === "squirrel" ? "알밤이 🐿️" : "포실이 🐰"}의 비밀 투자 처방전 ✨
            </h2>
            <p class="text-xs sm:text-sm text-[#5d4037]/80 mt-1 font-medium">
              선생님의 월 실수령액({salarySummary.netPay.toLocaleString()}원)과 투자 성향에 맞춘 따뜻하고 앙증맞은 맞춤 자산 관리 조언을 만나보세요!
            </p>
          </div>
        </div>
      </div>

      {/* Main Options Form */}
      <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left 6 Cols: Options */}
        <div class="md:col-span-6 space-y-6">
          
          {/* Mascot Persona Selection */}
          <div class="organic-card p-6 space-y-3 bg-white">
            <label class="block text-xs font-bold text-[#5d4037] font-['Jua'] text-sm">
              1. 나만의 AI 마스코트 튜터 선택 🐰🐿️
            </label>

            <div class="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMascot("bunny")}
                class={`p-4 rounded-2xl border-2 text-left transition flex items-center gap-3 ${
                  mascot === "bunny"
                    ? "bg-[#ffd1dc]/40 border-[#e6b8c4] ring-2 ring-[#ffd1dc]"
                    : "bg-[#fffdf5] border-[#e0f2f1] hover:bg-[#fff9c4]/30"
                }`}
              >
                <img src="/mascot-bunny.jpg" alt="토끼" class="w-12 h-12 rounded-xl object-cover shrink-0 shadow-xs border border-white" />
                <div>
                  <p class="font-bold text-xs sm:text-sm text-[#5d4037]">포실이 (토끼 🐰)</p>
                  <p class="text-[11px] text-[#5d4037]/70">따뜻하고 다정한 월급 튜터</p>
                </div>
              </button>

              <button
                onClick={() => setMascot("squirrel")}
                class={`p-4 rounded-2xl border-2 text-left transition flex items-center gap-3 ${
                  mascot === "squirrel"
                    ? "bg-[#e0f2f1]/60 border-[#b2d8d5] ring-2 ring-[#e0f2f1]"
                    : "bg-[#fffdf5] border-[#e0f2f1] hover:bg-[#e0f2f1]/30"
                }`}
              >
                <img src="/mascot-squirrel.jpg" alt="다람쥐" class="w-12 h-12 rounded-xl object-cover shrink-0 shadow-xs border border-white" />
                <div>
                  <p class="font-bold text-xs sm:text-sm text-[#5d4037]">알밤이 (다람쥐 🐿️)</p>
                  <p class="text-[11px] text-[#5d4037]/70">꼼꼼한 자산 관리 튜터</p>
                </div>
              </button>
            </div>
          </div>

          {/* Investment Inclination Selection */}
          <div class="organic-card p-6 space-y-3 bg-white">
            <label class="block text-xs font-bold text-[#5d4037] font-['Jua'] text-sm">
              2. 선생님의 투자 성향 선택 🌱🌿🌳
            </label>

            <div class="space-y-2.5">
              <button
                onClick={() => setInclination("seed")}
                class={`w-full p-3.5 rounded-2xl border-2 text-left transition ${
                  inclination === "seed"
                    ? "bg-[#fff9c4]/80 border-[#f0e68c] ring-2 ring-[#fff9c4]"
                    : "bg-[#fffdf5] border-[#e0f2f1] hover:bg-[#fff9c4]/30"
                }`}
              >
                <p class="font-bold text-xs sm:text-sm text-[#5d4037]">🌱 차곡차곡 씨앗형 (안정추구형)</p>
                <p class="text-[11px] text-[#5d4037]/70 mt-0.5 font-medium">
                  원금 손실 없이 예적금, 교직원공제회 장기저축, 국채 중심 차곡차곡 자산 모으기
                </p>
              </button>

              <button
                onClick={() => setInclination("sprout")}
                class={`w-full p-3.5 rounded-2xl border-2 text-left transition ${
                  inclination === "sprout"
                    ? "bg-[#e0f2f1]/80 border-[#b2d8d5] ring-2 ring-[#e0f2f1]"
                    : "bg-[#fffdf5] border-[#e0f2f1] hover:bg-[#e0f2f1]/30"
                }`}
              >
                <p class="font-bold text-xs sm:text-sm text-[#5d4037]">🌿 스파클링 새싹형 (위험중립형)</p>
                <p class="text-[11px] text-[#5d4037]/70 mt-0.5 font-medium">
                  안정적 현금흐름의 배당 ETF, 리츠, 적립식 지수 투자로 원금 보존과 성장 동시 추구
                </p>
              </button>

              <button
                onClick={() => setInclination("tree")}
                class={`w-full p-3.5 rounded-2xl border-2 text-left transition ${
                  inclination === "tree"
                    ? "bg-[#ffd1dc]/60 border-[#e6b8c4] ring-2 ring-[#ffd1dc]"
                    : "bg-[#fffdf5] border-[#e0f2f1] hover:bg-[#ffd1dc]/30"
                }`}
              >
                <p class="font-bold text-xs sm:text-sm text-[#5d4037]">🌳 열매 팡팡형 (적극투자형)</p>
                <p class="text-[11px] text-[#5d4037]/70 mt-0.5 font-medium">
                  글로벌 혁신 지수 ETF, 성장주 적립식 복리 투자로 자산 극대화
                </p>
              </button>
            </div>
          </div>

          {/* Goal & Living Cost Ratio Slider */}
          <div class="organic-card p-6 space-y-4 bg-white">
            <label class="block text-xs font-bold text-[#5d4037] font-['Jua'] text-sm">
              3. 자산 목표 &amp; 월 생활비 설정 🎯
            </label>

            <div>
              <label class="block text-xs font-bold text-[#5d4037]/80 mb-1">재정 목표 입력</label>
              <input
                type="text"
                value={targetGoal}
                onChange={(e) => setTargetGoal(e.target.value)}
                placeholder="예: 1억원 목돈 마련, 내 집 마련, 은퇴 준비"
                class="w-full px-4 py-2.5 rounded-2xl border-2 border-[#e0f2f1] text-xs font-bold text-[#5d4037] focus:outline-none focus:ring-2 focus:ring-[#ffd1dc] bg-[#fffdf5]"
              />
            </div>

            <div>
              <div class="flex items-center justify-between text-xs font-bold mb-1">
                <span class="text-[#5d4037]">월 예상 생활비 비중</span>
                <span class="text-teal-900 font-black">{livingCostRatio}%</span>
              </div>
              <input
                type="range"
                min={20}
                max={80}
                value={livingCostRatio}
                onChange={(e) => setLivingCostRatio(Number(e.target.value))}
                class="w-full accent-teal-600 cursor-pointer"
              />
              <div class="flex justify-between text-[11px] text-[#5d4037]/70 mt-1 font-medium">
                <span>월 생활비 약 {Math.round(salarySummary.netPay * (livingCostRatio / 100)).toLocaleString()}원</span>
                <span class="text-teal-900 font-bold">월 여유자금 약 {surplusFund.toLocaleString()}원</span>
              </div>
            </div>
          </div>

          {/* Trigger Button */}
          <button
            onClick={handleFetchAdvice}
            disabled={isLoading}
            class="pudding-btn pudding-btn-mint w-full py-4 text-sm sm:text-base flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 class="w-5 h-5 animate-spin" />
                {mascot === "squirrel" ? "알밤이" : "포실이"}가 선생님 맞춤 투자 처방을 작성 중입니다... 🐰✨
              </>
            ) : (
              <>
                <Sparkles class="w-5 h-5" />
                AI 튜터에게 맞춤 투자 처방받기 ✨
              </>
            )}
          </button>

          {errorMsg && (
            <p class="text-xs text-rose-600 font-bold text-center bg-rose-50 p-3 rounded-2xl border border-rose-200">
              {errorMsg}
            </p>
          )}

        </div>

        {/* Right 6 Cols: Advice Result Display */}
        <div class="md:col-span-6 space-y-6">
          
          {tutorAdvice ? (
            <div class="organic-card p-6 sm:p-8 space-y-6 animate-fadeIn bg-white">
              
              {/* Mascot Bubble Header */}
              <div class="speech-bubble bg-[#e0f2f1]/40 border-2 border-[#b2d8d5] flex items-start gap-4">
                <img
                  src={mascot === "squirrel" ? "/mascot-squirrel.jpg" : "/mascot-bunny.jpg"}
                  alt="Mascot"
                  class="w-16 h-16 rounded-2xl object-cover shadow-xs shrink-0 border-2 border-white"
                />
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="font-black text-sm text-[#5d4037] font-['Jua']">
                      {mascot === "squirrel" ? "알밤이 튜터 🐿️" : "포실이 튜터 🐰"}
                    </span>
                    <span class="text-[10px] font-bold bg-[#fff9c4] text-[#5d4037] px-2 py-0.5 rounded-full border border-[#f0e68c]">
                      재정 건강도 {tutorAdvice.financialHealthScore}점
                    </span>
                  </div>
                  <p class="text-xs text-[#5d4037] leading-relaxed font-medium">
                    "{tutorAdvice.mascotMessage}"
                  </p>
                </div>
              </div>

              {/* Portfolio Allocation Progress Bars */}
              <div class="space-y-3">
                <h4 class="font-bold text-[#5d4037] text-xs sm:text-sm flex items-center gap-1.5 font-['Jua']">
                  <PieChart class="w-4 h-4 text-teal-600" />
                  추천 포트폴리오 자산 배분 비중 📊
                </h4>

                <div class="space-y-2.5 text-xs">
                  <div>
                    <div class="flex justify-between font-bold mb-1 text-[#5d4037]">
                      <span>🏦 예적금 &amp; 교직원공제회</span>
                      <span>{tutorAdvice.allocation?.savings || 0}%</span>
                    </div>
                    <div class="w-full h-3 bg-[#e0f2f1]/50 rounded-full overflow-hidden border border-[#b2d8d5]">
                      <div
                        class="h-full bg-[#e0f2f1] rounded-full transition-all duration-500"
                        style={{ width: `${tutorAdvice.allocation?.savings || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div class="flex justify-between font-bold mb-1 text-[#5d4037]">
                      <span>💰 배당 ETF / 배당주</span>
                      <span>{tutorAdvice.allocation?.dividendEtf || 0}%</span>
                    </div>
                    <div class="w-full h-3 bg-[#fff9c4]/50 rounded-full overflow-hidden border border-[#f0e68c]">
                      <div
                        class="h-full bg-[#fff9c4] rounded-full transition-all duration-500"
                        style={{ width: `${tutorAdvice.allocation?.dividendEtf || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div class="flex justify-between font-bold mb-1 text-[#5d4037]">
                      <span>📈 지수 ETF / 성장주</span>
                      <span>{tutorAdvice.allocation?.indexEtf || 0}%</span>
                    </div>
                    <div class="w-full h-3 bg-[#ffd1dc]/50 rounded-full overflow-hidden border border-[#e6b8c4]">
                      <div
                        class="h-full bg-[#ffd1dc] rounded-full transition-all duration-500"
                        style={{ width: `${tutorAdvice.allocation?.indexEtf || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div class="flex justify-between font-bold mb-1 text-[#5d4037]">
                      <span>🛡️ 파킹통장 (비상금)</span>
                      <span>{tutorAdvice.allocation?.emergencyFund || 0}%</span>
                    </div>
                    <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        class="h-full bg-slate-300 rounded-full transition-all duration-500"
                        style={{ width: `${tutorAdvice.allocation?.emergencyFund || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Teacher Special Financial Tips */}
              <div class="space-y-2">
                <h4 class="font-bold text-[#5d4037] text-xs sm:text-sm flex items-center gap-1.5 font-['Jua']">
                  <Lightbulb class="w-4 h-4 text-amber-600" />
                  교사 맞춤 절세 &amp; 금융 꿀팁 💡
                </h4>
                <div class="space-y-2">
                  {tutorAdvice.teacherTips?.map((tip, idx) => (
                    <div key={idx} class="p-3 bg-[#fff9c4]/60 border border-[#f0e68c] rounded-2xl text-xs text-[#5d4037] flex items-start gap-2 font-medium">
                      <span class="w-5 h-5 rounded-full bg-[#fff9c4] text-[#5d4037] font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5 border border-[#f0e68c]">
                        {idx + 1}
                      </span>
                      <p class="leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3 Step Action Plan */}
              <div class="space-y-2">
                <h4 class="font-bold text-[#5d4037] text-xs sm:text-sm flex items-center gap-1.5 font-['Jua']">
                  <Target class="w-4 h-4 text-teal-700" />
                  월별 자산관리 3단계 실행 플랜 🗓️
                </h4>
                <div class="space-y-2">
                  {tutorAdvice.actionPlan?.map((plan, idx) => (
                    <div key={idx} class="p-3 bg-[#e0f2f1]/50 border border-[#b2d8d5] rounded-2xl text-xs text-[#5d4037] space-y-1">
                      <p class="font-bold text-[#5d4037] flex items-center gap-1">
                        <CheckCircle class="w-3.5 h-3.5 text-teal-600" />
                        {plan.step}
                      </p>
                      <p class="text-[#5d4037]/80 pl-4 leading-relaxed font-medium">{plan.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Encouragement Quote Box */}
              <div class="p-4 bg-[#ffd1dc]/40 rounded-2xl border-2 border-[#e6b8c4] text-center space-y-1">
                <span class="text-xs font-bold text-[#5d4037]">🎀 마스코트의 비밀 수첩 한줄 조언 🎀</span>
                <p class="text-xs font-bold text-[#5d4037] italic font-['Gowun_Dodum']">
                  "{tutorAdvice.encouragementQuote}"
                </p>
              </div>

            </div>
          ) : (
            <div class="organic-card p-8 text-center py-20 space-y-4 text-[#5d4037]/60 bg-white">
              <div class="w-16 h-16 rounded-3xl bg-[#e0f2f1] text-teal-700 flex items-center justify-center mx-auto border border-[#b2d8d5]">
                <Bot class="w-8 h-8" />
              </div>
              <h3 class="font-bold text-[#5d4037] text-base font-['Jua']">
                왼쪽 옵션을 선택한 후 버튼을 눌러주세요 🐰✨
              </h3>
              <p class="text-xs text-[#5d4037]/70 max-w-xs mx-auto font-medium">
                선생님의 투자 성향과 여유 자금을 분석하여 맞춤 포트폴리오와 교사 전용 절세 가이드를 생성해 드립니다!
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
