import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Helper to get Gemini AI Client
function getAiClient(userApiKey?: string) {
  const apiKey = userApiKey && userApiKey.trim().length > 0 ? userApiKey.trim() : process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY가 필요합니다. 상단 [Gemini API 키 설정] 버튼에서 API 키를 설정하거나 환경변수를 등록해주세요.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// 1. OCR API for Salary Slip Image
app.post("/api/gemini/ocr", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/png", customApiKey } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "급여명세서 이미지 데이터가 누락되었습니다." });
    }

    const ai = getAiClient(customApiKey);

    const prompt = `
당신은 대한민국 교원(유/초/중/고 교사) 월급 명세서 전문 분석 AI입니다.
업로드된 월급 명세서 이미지 또는 문서를 정밀 분석하여 다음 항목을 정확하게 추출해주세요:
1. 기본급 (호봉 기준 기본급 금액, 원 단위)
2. 추정 호봉 (인식 가능할 경우 1~40 중 숫자, 없으면 0)
3. 수당 항목 목록 (항목명과 금액):
   - 예: 담임수당, 보직수당, 교직수당, 시간외수당, 가족수당, 정급급식비, 명절휴가비, 정근수당, 교원연구비, 방과후학교지도비, 특수교육수당 등
4. 공제 항목 목록 (항목명과 금액):
   - 예: 공무원연금, 건강보험, 노인장기요양보험, 소득세, 지방소득세, 교직원공제회구좌, 교원단체회비, 학교친목회비, 급식비 등
5. 인식 소평 및 친절한 안내 메시지

금액은 숫자로만(원 단위, 컴마 제외) 추출해야 합니다.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
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
    const data = JSON.parse(jsonText);
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error("OCR API error:", err);
    return res.status(500).json({ error: err.message || "월급명세서 분석 중 오류가 발생했습니다." });
  }
});

// 2. AI Investment Tutor API
app.post("/api/gemini/tutor", async (req, res) => {
  try {
    const {
      mascot = "bunny",
      inclination = "seed",
      targetGoal = "1억 모으기",
      salarySummary,
      livingCostRatio = 50,
      customApiKey,
    } = req.body;

    const ai = getAiClient(customApiKey);

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
    const data = JSON.parse(jsonText);
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error("Tutor API error:", err);
    return res.status(500).json({ error: err.message || "AI 튜터 조언 생성 중 오류가 발생했습니다." });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
