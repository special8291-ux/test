import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  Sparkles,
  PieChart as PieChartIcon,
  TrendingUp,
  Award,
  HelpCircle,
  PlusCircle,
  Coins,
} from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { AllowanceItem, DeductionItem, SalarySummary } from "../types";
import {
  TEACHER_PAY_SCALE,
  DEFAULT_ALLOWANCES,
  DEFAULT_DEDUCTIONS,
  TEACHER_PRESETS,
} from "../data/teacherSalaryData";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

interface SalaryCalculatorProps {
  step: number;
  setStep: (step: number) => void;
  baseSalary: number;
  setBaseSalary: (val: number) => void;
  allowances: AllowanceItem[];
  setAllowances: React.Dispatch<React.SetStateAction<AllowanceItem[]>>;
  deductions: DeductionItem[];
  setDeductions: React.Dispatch<React.SetStateAction<DeductionItem[]>>;
  summary: SalarySummary;
  onApplyPreset: (presetId: string) => void;
  onResetToDefaults: () => void;
}

export const SalaryCalculator: React.FC<SalaryCalculatorProps> = ({
  step,
  setStep,
  baseSalary,
  setBaseSalary,
  allowances,
  setAllowances,
  deductions,
  setDeductions,
  summary,
  onApplyPreset,
  onResetToDefaults,
}) => {
  // Modal for Adding/Editing Allowance
  const [showAllowanceModal, setShowAllowanceModal] = useState(false);
  const [allowanceForm, setAllowanceForm] = useState({ name: "", amount: 50000, desc: "" });
  const [editingAllowanceId, setEditingAllowanceId] = useState<string | null>(null);

  // Modal for Adding/Editing Deduction
  const [showDeductionModal, setShowDeductionModal] = useState(false);
  const [deductionForm, setDeductionForm] = useState({ name: "", amount: 10000, desc: "" });
  const [editingDeductionId, setEditingDeductionId] = useState<string | null>(null);

  // Handle Step Select Change
  const handleStepChange = (newStep: number) => {
    setStep(newStep);
    if (TEACHER_PAY_SCALE[newStep]) {
      setBaseSalary(TEACHER_PAY_SCALE[newStep]);
    }
  };

  // Toggle Allowance
  const toggleAllowance = (id: string) => {
    setAllowances((prev) =>
      prev.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item))
    );
  };

  // Toggle Deduction
  const toggleDeduction = (id: string) => {
    setDeductions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item))
    );
  };

  // Allowance Add / Edit
  const handleSaveAllowance = () => {
    if (!allowanceForm.name.trim()) return;

    if (editingAllowanceId) {
      setAllowances((prev) =>
        prev.map((item) =>
          item.id === editingAllowanceId
            ? { ...item, name: allowanceForm.name, amount: Number(allowanceForm.amount), description: allowanceForm.desc }
            : item
        )
      );
    } else {
      const newItem: AllowanceItem = {
        id: "custom_allowance_" + Date.now(),
        name: allowanceForm.name,
        amount: Number(allowanceForm.amount),
        category: "custom",
        isCustom: true,
        description: allowanceForm.desc || "선생님 커스텀 추가 수당",
        enabled: true,
      };
      setAllowances((prev) => [...prev, newItem]);
    }

    setShowAllowanceModal(false);
    setAllowanceForm({ name: "", amount: 50000, desc: "" });
    setEditingAllowanceId(null);
  };

  const handleDeleteAllowance = (id: string) => {
    setAllowances((prev) => prev.filter((item) => item.id !== id));
  };

  const handleOpenEditAllowance = (item: AllowanceItem) => {
    setEditingAllowanceId(item.id);
    setAllowanceForm({ name: item.name, amount: item.amount, desc: item.description || "" });
    setShowAllowanceModal(true);
  };

  // Deduction Add / Edit
  const handleSaveDeduction = () => {
    if (!deductionForm.name.trim()) return;

    if (editingDeductionId) {
      setDeductions((prev) =>
        prev.map((item) =>
          item.id === editingDeductionId
            ? { ...item, name: deductionForm.name, amount: Number(deductionForm.amount), description: deductionForm.desc }
            : item
        )
      );
    } else {
      const newItem: DeductionItem = {
        id: "custom_deduction_" + Date.now(),
        name: deductionForm.name,
        amount: Number(deductionForm.amount),
        category: "custom",
        isCustom: true,
        description: deductionForm.desc || "선생님 커스텀 추가 공제",
        enabled: true,
      };
      setDeductions((prev) => [...prev, newItem]);
    }

    setShowDeductionModal(false);
    setDeductionForm({ name: "", amount: 10000, desc: "" });
    setEditingDeductionId(null);
  };

  const handleDeleteDeduction = (id: string) => {
    setDeductions((prev) => prev.filter((item) => item.id !== id));
  };

  const handleOpenEditDeduction = (item: DeductionItem) => {
    setEditingDeductionId(item.id);
    setDeductionForm({ name: item.name, amount: item.amount, desc: item.description || "" });
    setShowDeductionModal(true);
  };

  // Chart Data Setup
  const doughnutData = {
    labels: ["월 실수령액 (Net Pay)", "총 공제액 (Deductions)", "각종 수당 (Allowances)"],
    datasets: [
      {
        data: [summary.netPay, summary.totalDeductions, summary.totalAllowances],
        backgroundColor: ["#ffd1dc", "#e0f2f1", "#fff9c4"],
        hoverBackgroundColor: ["#f7bac7", "#c2e5e3", "#f2ea9d"],
        borderWidth: 3,
        borderColor: "#FFFFFF",
      },
    ],
  };

  const enabledAllowances = allowances.filter((a) => a.enabled !== false);
  const barAllowanceData = {
    labels: enabledAllowances.map((a) => a.name),
    datasets: [
      {
        label: "수당 금액 (원)",
        data: enabledAllowances.map((a) => a.amount),
        backgroundColor: "#ffd1dc",
        borderRadius: 12,
      },
    ],
  };

  return (
    <div class="space-y-8 animate-fadeIn">
      
      {/* Top Banner & Quick Presets */}
      <div class="organic-card p-6 sm:p-8 relative overflow-hidden bg-white border-2 border-dashed border-[#ffd1dc]">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fff9c4] text-[#5d4037] text-xs font-bold shadow-sm mb-2">
              <Sparkles class="w-3.5 h-3.5 text-amber-600" />
              선생님 월급 지킴이 ✨
            </div>
            <h2 class="text-2xl sm:text-3xl font-black text-[#5d4037] font-['Jua']">
              교사 월급 &amp; 수당 정밀 계산기 🧮
            </h2>
            <p class="text-xs sm:text-sm text-[#5d4037]/80 mt-1 font-medium">
              호봉별 기본급과 수당, 공제 항목을 자유롭게 계산하고 이번 달 실수령액을 한눈에 확인해보세요!
            </p>
          </div>

          {/* Preset Buttons */}
          <div class="flex flex-col gap-2">
            <span class="text-xs font-bold text-[#5d4037] flex items-center gap-1">
              <Award class="w-3.5 h-3.5 text-amber-700" /> 빠른 호봉 프로필 적용:
            </span>
            <div class="flex flex-wrap gap-2">
              {TEACHER_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => onApplyPreset(preset.id)}
                  class="px-3 py-1.5 rounded-2xl bg-[#fff9c4] text-[#5d4037] border border-[#f0e68c] text-xs font-bold hover:bg-[#ffd1dc] transition shadow-xs"
                >
                  {preset.badge} ({preset.step}호봉)
                </button>
              ))}
              <button
                onClick={onResetToDefaults}
                class="px-2.5 py-1.5 rounded-2xl bg-[#e0f2f1] text-[#5d4037] hover:bg-[#b2d8d5] text-xs font-bold flex items-center gap-1 transition"
                title="초기화"
              >
                <RotateCcw class="w-3 h-3" /> 초기화
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards Row */}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Base Pay */}
        <div class="organic-card p-5 hover:scale-[1.01] transition">
          <span class="text-xs font-bold text-[#5d4037]/70 block mb-1">💼 호봉 기준 기본급</span>
          <div class="flex items-baseline justify-between">
            <span class="text-2xl font-black text-[#5d4037] font-['Jua']">
              {summary.baseSalary.toLocaleString()}
            </span>
            <span class="text-xs font-bold text-[#5d4037]">원</span>
          </div>
          <span class="text-[11px] text-[#5d4037]/60 mt-1 block">
            현재 선택: {step}호봉 (2026 교원 봉급표)
          </span>
        </div>

        {/* Total Allowances */}
        <div class="organic-card p-5 bg-[#fff9c4]/30 hover:scale-[1.01] transition">
          <span class="text-xs font-bold text-amber-900 block mb-1">🎁 총 각종 수당</span>
          <div class="flex items-baseline justify-between">
            <span class="text-2xl font-black text-amber-900 font-['Jua']">
              +{summary.totalAllowances.toLocaleString()}
            </span>
            <span class="text-xs font-bold text-amber-900">원</span>
          </div>
          <span class="text-[11px] text-[#5d4037]/60 mt-1 block">
            선택된 수당 {allowances.filter((a) => a.enabled !== false).length}개 항목 합산
          </span>
        </div>

        {/* Total Deductions */}
        <div class="organic-card p-5 bg-[#e0f2f1]/40 hover:scale-[1.01] transition">
          <span class="text-xs font-bold text-teal-900 block mb-1">💸 총 공제 항목</span>
          <div class="flex items-baseline justify-between">
            <span class="text-2xl font-black text-teal-900 font-['Jua']">
              -{summary.totalDeductions.toLocaleString()}
            </span>
            <span class="text-xs font-bold text-teal-900">원</span>
          </div>
          <span class="text-[11px] text-[#5d4037]/60 mt-1 block">
            연금, 보험, 세금 및 공제회 구좌
          </span>
        </div>

        {/* Net Take Home */}
        <div class="organic-card p-5 bg-[#ffd1dc] border-2 border-[#e6b8c4] hover:scale-[1.01] transition relative overflow-hidden">
          <span class="text-xs font-bold text-[#5d4037] block mb-1">💖 월 예상 실수령액</span>
          <div class="flex items-baseline justify-between">
            <span class="text-3xl font-black font-['Jua'] text-[#5d4037]">
              {summary.netPay.toLocaleString()}
            </span>
            <span class="text-xs font-bold text-[#5d4037]">원</span>
          </div>
          <span class="text-[11px] text-[#5d4037]/80 mt-1 block font-bold">
            연간 환산 예상액: 약 {Math.round(summary.annualNetPay / 10000).toLocaleString()}만원
          </span>
        </div>
      </div>

      {/* Main Form Grid */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 7 Columns: Step & Allowance/Deduction Editors */}
        <div class="lg:col-span-7 space-y-8">
          
          {/* Step / Pay Scale Selector */}
          <div class="organic-card p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="font-bold text-[#5d4037] text-base flex items-center gap-2 font-['Jua']">
                <span class="w-7 h-7 rounded-xl bg-[#ffd1dc] text-[#5d4037] font-bold flex items-center justify-center text-xs">1</span>
                교원 호봉 및 기본급 설정 🎒
              </h3>
              <span class="text-xs text-[#5d4037] font-bold bg-[#fff9c4] px-3 py-1 rounded-full border border-[#f0e68c]">
                2026 봉급표 반영
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-[#5d4037]/80 mb-1.5">
                  교원 호봉 선택 (1~40호봉)
                </label>
                <select
                  value={step}
                  onChange={(e) => handleStepChange(Number(e.target.value))}
                  class="w-full px-4 py-3 rounded-2xl border-2 border-[#e0f2f1] bg-[#fffdf5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ffd1dc] text-sm font-bold text-[#5d4037]"
                >
                  {Object.entries(TEACHER_PAY_SCALE).map(([st, sal]) => (
                    <option key={st} value={st}>
                      {st}호봉 - {sal.toLocaleString()}원
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-[#5d4037]/80 mb-1.5">
                  기본급 직접 수정 (원)
                </label>
                <input
                  type="number"
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(Number(e.target.value))}
                  class="w-full px-4 py-3 rounded-2xl border-2 border-[#e0f2f1] bg-[#fffdf5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ffd1dc] text-sm font-bold text-[#5d4037]"
                />
              </div>
            </div>
          </div>

          {/* Allowance Items List */}
          <div class="organic-card p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="font-bold text-[#5d4037] text-base flex items-center gap-2 font-['Jua']">
                <span class="w-7 h-7 rounded-xl bg-[#fff9c4] text-[#5d4037] font-bold flex items-center justify-center text-xs">2</span>
                각종 수당 항목 🎁
              </h3>
              <button
                onClick={() => {
                  setEditingAllowanceId(null);
                  setAllowanceForm({ name: "", amount: 50000, desc: "" });
                  setShowAllowanceModal(true);
                }}
                class="pudding-btn pudding-btn-yellow text-xs py-1.5 px-3"
              >
                <Plus class="w-3.5 h-3.5" /> 수당 추가하기
              </button>
            </div>

            <p class="text-xs text-[#5d4037]/70 font-medium">
              체크박스로 이번 달 포함 여부를 설정하거나, 선생님만의 추가 수당(방과후, 동아리 등)을 자유롭게 등록하세요!
            </p>

            <div class="space-y-2.5 max-h-96 overflow-y-auto pr-1 scrollbar-thin">
              {allowances.map((item) => (
                <div
                  key={item.id}
                  class={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    item.enabled !== false
                      ? "bg-[#fff9c4]/30 border-[#f0e68c]"
                      : "bg-slate-50 border-slate-200 opacity-60"
                  }`}
                >
                  <div class="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.enabled !== false}
                      onChange={() => toggleAllowance(item.id)}
                      class="w-4 h-4 rounded text-amber-600 focus:ring-amber-400 cursor-pointer accent-[#5d4037]"
                    />
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-xs sm:text-sm text-[#5d4037]">
                          {item.name}
                        </span>
                        {item.isCustom && (
                          <span class="text-[10px] bg-[#fff9c4] text-[#5d4037] font-bold px-1.5 py-0.2 rounded-full border border-[#f0e68c]">
                            커스텀
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <span class="text-[11px] text-[#5d4037]/60 block">
                          {item.description}
                        </span>
                      )}
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <span class="font-bold text-xs sm:text-sm text-amber-900">
                      +{item.amount.toLocaleString()}원
                    </span>
                    <div class="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditAllowance(item)}
                        class="p-1 text-[#5d4037]/60 hover:text-[#5d4037] rounded-lg hover:bg-white"
                        title="수정"
                      >
                        <Edit2 class="w-3.5 h-3.5" />
                      </button>
                      {item.isCustom && (
                        <button
                          onClick={() => handleDeleteAllowance(item.id)}
                          class="p-1 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-white"
                          title="삭제"
                        >
                          <Trash2 class="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deduction Items List */}
          <div class="organic-card p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="font-bold text-[#5d4037] text-base flex items-center gap-2 font-['Jua']">
                <span class="w-7 h-7 rounded-xl bg-[#e0f2f1] text-[#5d4037] font-bold flex items-center justify-center text-xs">3</span>
                공제 및 연금/보험 항목 💸
              </h3>
              <button
                onClick={() => {
                  setEditingDeductionId(null);
                  setDeductionForm({ name: "", amount: 10000, desc: "" });
                  setShowDeductionModal(true);
                }}
                class="pudding-btn pudding-btn-mint text-xs py-1.5 px-3"
              >
                <Plus class="w-3.5 h-3.5" /> 공제 추가하기
              </button>
            </div>

            <p class="text-xs text-[#5d4037]/70 font-medium">
              공무원연금, 건강보험, 소득세 및 교직원공제회 장기저축구좌, 교원단체 회비를 자유롭게 관리하세요!
            </p>

            <div class="space-y-2.5 max-h-96 overflow-y-auto pr-1 scrollbar-thin">
              {deductions.map((item) => (
                <div
                  key={item.id}
                  class={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    item.enabled !== false
                      ? "bg-[#e0f2f1]/30 border-[#b2d8d5]"
                      : "bg-slate-50 border-slate-200 opacity-60"
                  }`}
                >
                  <div class="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.enabled !== false}
                      onChange={() => toggleDeduction(item.id)}
                      class="w-4 h-4 rounded text-teal-600 focus:ring-teal-400 cursor-pointer accent-[#5d4037]"
                    />
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-xs sm:text-sm text-[#5d4037]">
                          {item.name}
                        </span>
                        {item.isCustom && (
                          <span class="text-[10px] bg-[#e0f2f1] text-[#5d4037] font-bold px-1.5 py-0.2 rounded-full border border-[#b2d8d5]">
                            커스텀
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <span class="text-[11px] text-[#5d4037]/60 block">
                          {item.description}
                        </span>
                      )}
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <span class="font-bold text-xs sm:text-sm text-teal-900">
                      -{item.amount.toLocaleString()}원
                    </span>
                    <div class="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditDeduction(item)}
                        class="p-1 text-[#5d4037]/60 hover:text-[#5d4037] rounded-lg hover:bg-white"
                        title="수정"
                      >
                        <Edit2 class="w-3.5 h-3.5" />
                      </button>
                      {item.isCustom && (
                        <button
                          onClick={() => handleDeleteDeduction(item.id)}
                          class="p-1 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-white"
                          title="삭제"
                        >
                          <Trash2 class="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Charts & Visual Breakdown */}
        <div class="lg:col-span-5 space-y-8">
          
          {/* Chart 1: Doughnut Pay Ratio */}
          <div class="organic-card p-6 space-y-4">
            <h3 class="font-bold text-[#5d4037] text-base flex items-center gap-2 font-['Jua']">
              <PieChartIcon class="w-5 h-5 text-pink-500" />
              급여 구조 비율 분석 (Doughnut) 📊
            </h3>

            <div class="relative w-60 h-60 mx-auto my-2">
              <Doughnut
                data={doughnutData}
                options={{
                  plugins: {
                    legend: { display: false },
                  },
                  cutout: "68%",
                }}
              />
              <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span class="text-xs text-[#5d4037]/60 font-bold">실수령 비중</span>
                <span class="text-xl font-black text-[#5d4037] font-['Jua']">
                  {Math.round((summary.netPay / (summary.totalGross || 1)) * 100)}%
                </span>
              </div>
            </div>

            <div class="space-y-2 text-xs pt-2">
              <div class="flex items-center justify-between p-2.5 rounded-2xl bg-[#ffd1dc]/60 text-[#5d4037] font-bold">
                <span class="flex items-center gap-1.5">
                  <span class="w-3 h-3 rounded-full bg-[#ffd1dc] border border-[#e6b8c4]"></span> 월 실수령액
                </span>
                <span>{summary.netPay.toLocaleString()}원</span>
              </div>
              <div class="flex items-center justify-between p-2.5 rounded-2xl bg-[#fff9c4]/80 text-[#5d4037] font-bold">
                <span class="flex items-center gap-1.5">
                  <span class="w-3 h-3 rounded-full bg-[#fff9c4] border border-[#f0e68c]"></span> 총 각종 수당
                </span>
                <span>+{summary.totalAllowances.toLocaleString()}원</span>
              </div>
              <div class="flex items-center justify-between p-2.5 rounded-2xl bg-[#e0f2f1]/80 text-[#5d4037] font-bold">
                <span class="flex items-center gap-1.5">
                  <span class="w-3 h-3 rounded-full bg-[#e0f2f1] border border-[#b2d8d5]"></span> 총 공제 항목
                </span>
                <span>-{summary.totalDeductions.toLocaleString()}원</span>
              </div>
            </div>
          </div>

          {/* Chart 2: Allowance Breakdown Bar */}
          <div class="organic-card p-6 space-y-4">
            <h3 class="font-bold text-[#5d4037] text-base flex items-center gap-2 font-['Jua']">
              <TrendingUp class="w-5 h-5 text-amber-600" />
              수당별 금액 비교 📈
            </h3>

            <div class="h-48">
              <Bar
                data={barAllowanceData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    x: { ticks: { font: { size: 10 } } },
                    y: { display: false },
                  },
                }}
              />
            </div>
          </div>

          {/* Encouragement Mascot Card */}
          <div class="speech-bubble bg-[#e0f2f1]/50 border-2 border-[#b2d8d5] flex items-center gap-4">
            <img src="/mascot-bunny.jpg" alt="토끼 튜터" class="w-14 h-14 rounded-full object-cover shadow border-2 border-white shrink-0" />
            <div>
              <p class="text-xs font-bold text-[#5d4037] font-['Jua'] text-sm">
                "선생님, 월급 산출을 마치셨나요? 🐰✨"
              </p>
              <p class="text-xs text-[#5d4037]/80 mt-0.5 font-medium">
                [AI 재정 &amp; 투자 튜터] 탭으로 이동하시면 실수령액 기준 포실이/알밤이의 비밀 투자 처방전을 받아보실 수 있어요!
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Modal for Allowance Edit/Add */}
      {showAllowanceModal && (
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div class="organic-card max-w-md w-full p-6 space-y-4 bg-white">
            <h3 class="text-lg font-bold text-[#5d4037] font-['Jua']">
              {editingAllowanceId ? "수당 수정하기 ✏️" : "새 수당 항목 추가하기 ➕"}
            </h3>

            <div class="space-y-3 text-xs">
              <div>
                <label class="block font-bold text-[#5d4037] mb-1">수당 이름</label>
                <input
                  type="text"
                  placeholder="예: 방과후학교 지도비, 동아리 지도 수당 등"
                  value={allowanceForm.name}
                  onChange={(e) => setAllowanceForm({ ...allowanceForm, name: e.target.value })}
                  class="w-full px-3.5 py-2.5 rounded-2xl border-2 border-[#e0f2f1] text-xs font-bold text-[#5d4037]"
                />
              </div>

              <div>
                <label class="block font-bold text-[#5d4037] mb-1">월 금액 (원)</label>
                <input
                  type="number"
                  value={allowanceForm.amount}
                  onChange={(e) => setAllowanceForm({ ...allowanceForm, amount: Number(e.target.value) })}
                  class="w-full px-3.5 py-2.5 rounded-2xl border-2 border-[#e0f2f1] text-xs font-bold text-[#5d4037]"
                />
              </div>

              <div>
                <label class="block font-bold text-[#5d4037] mb-1">설명 / 메모 (선택)</label>
                <input
                  type="text"
                  placeholder="예: 매월 15일 지급"
                  value={allowanceForm.desc}
                  onChange={(e) => setAllowanceForm({ ...allowanceForm, desc: e.target.value })}
                  class="w-full px-3.5 py-2.5 rounded-2xl border-2 border-[#e0f2f1] text-xs font-medium text-[#5d4037]"
                />
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAllowanceModal(false)}
                class="px-4 py-2 rounded-2xl text-xs font-bold text-[#5d4037] bg-slate-100 hover:bg-slate-200"
              >
                취소
              </button>
              <button
                onClick={handleSaveAllowance}
                class="pudding-btn pudding-btn-yellow text-xs py-2 px-4"
              >
                저장하기 ✨
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Deduction Edit/Add */}
      {showDeductionModal && (
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div class="organic-card max-w-md w-full p-6 space-y-4 bg-white">
            <h3 class="text-lg font-bold text-[#5d4037] font-['Jua']">
              {editingDeductionId ? "공제 항목 수정하기 ✏️" : "새 공제 항목 추가하기 ➕"}
            </h3>

            <div class="space-y-3 text-xs">
              <div>
                <label class="block font-bold text-[#5d4037] mb-1">공제 항목 이름</label>
                <input
                  type="text"
                  placeholder="예: 교직원공제회구좌, 친목회비, 급식비 등"
                  value={deductionForm.name}
                  onChange={(e) => setDeductionForm({ ...deductionForm, name: e.target.value })}
                  class="w-full px-3.5 py-2.5 rounded-2xl border-2 border-[#e0f2f1] text-xs font-bold text-[#5d4037]"
                />
              </div>

              <div>
                <label class="block font-bold text-[#5d4037] mb-1">월 공제 금액 (원)</label>
                <input
                  type="number"
                  value={deductionForm.amount}
                  onChange={(e) => setDeductionForm({ ...deductionForm, amount: Number(e.target.value) })}
                  class="w-full px-3.5 py-2.5 rounded-2xl border-2 border-[#e0f2f1] text-xs font-bold text-[#5d4037]"
                />
              </div>

              <div>
                <label class="block font-bold text-[#5d4037] mb-1">설명 / 메모 (선택)</label>
                <input
                  type="text"
                  placeholder="예: 공제회 10구좌"
                  value={deductionForm.desc}
                  onChange={(e) => setDeductionForm({ ...deductionForm, desc: e.target.value })}
                  class="w-full px-3.5 py-2.5 rounded-2xl border-2 border-[#e0f2f1] text-xs font-medium text-[#5d4037]"
                />
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDeductionModal(false)}
                class="px-4 py-2 rounded-2xl text-xs font-bold text-[#5d4037] bg-slate-100 hover:bg-slate-200"
              >
                취소
              </button>
              <button
                onClick={handleSaveDeduction}
                class="pudding-btn pudding-btn-mint text-xs py-2 px-4"
              >
                저장하기 ✨
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
