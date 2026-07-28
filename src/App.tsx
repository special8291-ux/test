import React, { useState, useEffect, useMemo } from "react";
import { Navbar } from "./components/Navbar";
import { SalaryCalculator } from "./components/SalaryCalculator";
import { OCRScanner } from "./components/OCRScanner";
import { AITutor } from "./components/AITutor";
import { DataExportPrint } from "./components/DataExportPrint";
import { ApiKeyModal } from "./components/ApiKeyModal";
import { HelpGuideModal } from "./components/HelpGuideModal";
import { AllowanceItem, DeductionItem, SalarySummary, OCRResult } from "./types";
import {
  TEACHER_PAY_SCALE,
  DEFAULT_ALLOWANCES,
  DEFAULT_DEDUCTIONS,
  TEACHER_PRESETS,
} from "./data/teacherSalaryData";

const STORAGE_KEY_DATA = "teacher_salary_app_data_v1";
const STORAGE_KEY_API_KEY = "teacher_salary_gemini_api_key";

export default function App() {
  const [activeTab, setActiveTab] = useState<"calc" | "ocr" | "tutor" | "export">("calc");

  // State
  const [step, setStep] = useState<number>(9);
  const [baseSalary, setBaseSalary] = useState<number>(TEACHER_PAY_SCALE[9] || 2724400);
  const [allowances, setAllowances] = useState<AllowanceItem[]>(DEFAULT_ALLOWANCES);
  const [deductions, setDeductions] = useState<DeductionItem[]>(DEFAULT_DEDUCTIONS);

  // API Key & Modals
  const [apiKey, setApiKey] = useState<string>("");
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem(STORAGE_KEY_API_KEY);
      if (savedKey) setApiKey(savedKey);

      const savedData = localStorage.getItem(STORAGE_KEY_DATA);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.step) setStep(parsed.step);
        if (parsed.baseSalary) setBaseSalary(parsed.baseSalary);
        if (parsed.allowances) setAllowances(parsed.allowances);
        if (parsed.deductions) setDeductions(parsed.deductions);
      }
    } catch (e) {
      console.warn("LocalStorage load error:", e);
    }
  }, []);

  // 2. Auto-save state to LocalStorage
  useEffect(() => {
    try {
      const dataToSave = {
        step,
        baseSalary,
        allowances,
        deductions,
      };
      localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(dataToSave));
    } catch (e) {
      console.warn("LocalStorage save error:", e);
    }
  }, [step, baseSalary, allowances, deductions]);

  // Save API Key
  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    try {
      localStorage.setItem(STORAGE_KEY_API_KEY, key);
    } catch (e) {
      console.warn("Failed to save API key:", e);
    }
  };

  // 3. Salary Summary Math
  const summary: SalarySummary = useMemo(() => {
    const totalAllowances = allowances
      .filter((item) => item.enabled !== false)
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);

    const totalGross = baseSalary + totalAllowances;

    const totalDeductions = deductions
      .filter((item) => item.enabled !== false)
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);

    const netPay = Math.max(0, totalGross - totalDeductions);

    // Annual Net Pay Estimation (includes 2 holiday bonuses of 60% base pay = +1.2 base pay)
    const annualNetPay = netPay * 12 + Math.round(baseSalary * 1.2);

    return {
      baseSalary,
      totalAllowances,
      totalGross,
      totalDeductions,
      netPay,
      annualNetPay,
    };
  }, [baseSalary, allowances, deductions]);

  // Preset Applicator
  const handleApplyPreset = (presetId: string) => {
    const preset = TEACHER_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setStep(preset.step);
    if (TEACHER_PAY_SCALE[preset.step]) {
      setBaseSalary(TEACHER_PAY_SCALE[preset.step]);
    }

    setAllowances((prev) =>
      prev.map((item) => ({
        ...item,
        enabled: preset.allowanceIds.includes(item.id) || item.isCustom,
      }))
    );
  };

  // Reset to Defaults
  const handleResetToDefaults = () => {
    if (window.confirm("기본 수당 및 공제 항목을 처음 상태로 초기화하시겠습니까?")) {
      setStep(9);
      setBaseSalary(TEACHER_PAY_SCALE[9]);
      setAllowances(DEFAULT_ALLOWANCES);
      setDeductions(DEFAULT_DEDUCTIONS);
    }
  };

  // OCR Apply Handler
  const handleApplyOCRData = (ocrData: OCRResult) => {
    if (ocrData.baseSalary && ocrData.baseSalary > 0) {
      setBaseSalary(ocrData.baseSalary);
    }
    if (ocrData.step && ocrData.step >= 1 && ocrData.step <= 40) {
      setStep(ocrData.step);
    }

    // Merge OCR Allowances
    if (ocrData.allowances && ocrData.allowances.length > 0) {
      const newAllowances: AllowanceItem[] = ocrData.allowances.map((item, i) => ({
        id: `ocr_allowance_${i}_${Date.now()}`,
        name: item.name,
        amount: item.amount,
        category: "custom",
        isCustom: true,
        enabled: true,
        description: "명세서 AI OCR 추출 항목",
      }));
      setAllowances(newAllowances);
    }

    // Merge OCR Deductions
    if (ocrData.deductions && ocrData.deductions.length > 0) {
      const newDeductions: DeductionItem[] = ocrData.deductions.map((item, i) => ({
        id: `ocr_deduction_${i}_${Date.now()}`,
        name: item.name,
        amount: item.amount,
        category: "custom",
        isCustom: true,
        enabled: true,
        description: "명세서 AI OCR 추출 항목",
      }));
      setDeductions(newDeductions);
    }
  };

  // Data Restore Handler
  const handleRestoreData = (parsed: any) => {
    if (parsed.step) setStep(parsed.step);
    if (parsed.baseSalary) setBaseSalary(parsed.baseSalary);
    if (parsed.allowances) setAllowances(parsed.allowances);
    if (parsed.deductions) setDeductions(parsed.deductions);
  };

  return (
    <div class="min-h-screen bg-[#FFFDF9] text-slate-800 pb-20">
      
      {/* Header Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenHelpModal={() => setIsHelpModalOpen(true)}
        hasApiKey={Boolean(apiKey && apiKey.length > 5)}
      />

      {/* Main Content Area */}
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {activeTab === "calc" && (
          <SalaryCalculator
            step={step}
            setStep={setStep}
            baseSalary={baseSalary}
            setBaseSalary={setBaseSalary}
            allowances={allowances}
            setAllowances={setAllowances}
            deductions={deductions}
            setDeductions={setDeductions}
            summary={summary}
            onApplyPreset={handleApplyPreset}
            onResetToDefaults={handleResetToDefaults}
          />
        )}

        {activeTab === "ocr" && (
          <OCRScanner
            apiKey={apiKey}
            onApplyOCRData={handleApplyOCRData}
            onSwitchToCalculator={() => setActiveTab("calc")}
          />
        )}

        {activeTab === "tutor" && (
          <AITutor apiKey={apiKey} salarySummary={summary} />
        )}

        {activeTab === "export" && (
          <DataExportPrint
            step={step}
            baseSalary={baseSalary}
            allowances={allowances}
            deductions={deductions}
            summary={summary}
            onRestoreData={handleRestoreData}
            onResetToDefaults={handleResetToDefaults}
          />
        )}

      </main>

      {/* Modals */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />

      <HelpGuideModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      {/* Cute Footer */}
      <footer class="mt-20 border-t border-pink-100 py-8 text-center text-xs text-slate-400">
        <p class="font-bold text-slate-500 font-['Jua']">
          교사 월급 관리 &amp; AI 투자 튜터 🐰🪙
        </p>
        <p class="mt-1">
          2026년 교원 봉급표 기준 적용 • 대한민국 선생님들의 행복한 재정 자립을 응원합니다! 💖
        </p>
      </footer>

    </div>
  );
}
