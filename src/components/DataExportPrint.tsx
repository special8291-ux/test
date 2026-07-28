import React from "react";
import { Download, Upload, Printer, CheckCircle, Save, FileSpreadsheet, RotateCcw } from "lucide-react";
import { SalarySummary, AllowanceItem, DeductionItem } from "../types";

interface DataExportPrintProps {
  step: number;
  baseSalary: number;
  allowances: AllowanceItem[];
  deductions: DeductionItem[];
  summary: SalarySummary;
  onRestoreData: (data: any) => void;
  onResetToDefaults: () => void;
}

export const DataExportPrint: React.FC<DataExportPrintProps> = ({
  step,
  baseSalary,
  allowances,
  deductions,
  summary,
  onRestoreData,
  onResetToDefaults,
}) => {
  // Export JSON file
  const handleExportJSON = () => {
    const exportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      step,
      baseSalary,
      allowances,
      deductions,
      summary,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `교사_월급명세_백업_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON file
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.allowances && parsed.deductions) {
          onRestoreData(parsed);
          alert("백업 데이터가 성공적으로 복원되었습니다! ✨");
        } else {
          alert("올바르지 않은 백업 파일 형식이 아닙니다.");
        }
      } catch (err) {
        alert("JSON 파일 파싱에 실패했습니다.");
      }
    };
    reader.readAsText(file);
  };

  // Print Window
  const handlePrint = () => {
    window.print();
  };

  return (
    <div class="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      
      {/* Banner */}
      <div class="organic-card p-6 sm:p-8 relative overflow-hidden bg-white border-2 border-dashed border-[#e6b8c4]">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-[#ffd1dc] text-[#5d4037] flex items-center justify-center font-bold text-2xl shadow-sm shrink-0 border border-[#e6b8c4]">
            💾
          </div>
          <div>
            <h2 class="text-2xl sm:text-3xl font-black text-[#5d4037] font-['Jua']">
              데이터 저장 &amp; 월급 명세서 인쇄/백업 💾📄
            </h2>
            <p class="text-xs sm:text-sm text-[#5d4037]/80 mt-1 font-medium">
              작성하신 수당 및 공제 정보는 브라우저 LocalStorage에 안전하게 자동 저장되며, 언제든 JSON 백업 또는 인쇄/PDF 출력이 가능합니다.
            </p>
          </div>
        </div>
      </div>

      {/* Action Cards Grid */}
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* Backup JSON */}
        <div class="organic-card p-6 space-y-4 bg-white">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-[#fff9c4] text-[#5d4037] flex items-center justify-center font-bold border border-[#f0e68c]">
              <Download class="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 class="font-bold text-[#5d4037] text-base font-['Jua']">
                급여 데이터 JSON 백업
              </h3>
              <p class="text-xs text-[#5d4037]/70 font-medium">
                현재 세팅된 수당 및 공제 세팅을 파일로 저장합니다.
              </p>
            </div>
          </div>

          <button
            onClick={handleExportJSON}
            class="pudding-btn pudding-btn-yellow w-full py-3 text-xs flex items-center justify-center gap-2"
          >
            <Download class="w-4 h-4" /> 백업 파일 내보내기 (.json)
          </button>
        </div>

        {/* Restore JSON */}
        <div class="organic-card p-6 space-y-4 bg-white">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-[#e0f2f1] text-[#5d4037] flex items-center justify-center font-bold border border-[#b2d8d5]">
              <Upload class="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <h3 class="font-bold text-[#5d4037] text-base font-['Jua']">
                백업 데이터 불러오기
              </h3>
              <p class="text-xs text-[#5d4037]/70 font-medium">
                기존에 내보낸 백업 파일(.json)을 불러와 복원합니다.
              </p>
            </div>
          </div>

          <label class="pudding-btn pudding-btn-mint w-full py-3 text-xs flex items-center justify-center gap-2 cursor-pointer">
            <Upload class="w-4 h-4" /> 백업 파일 업로드하기
            <input type="file" accept=".json" class="hidden" onChange={handleImportJSON} />
          </label>
        </div>

      </div>

      {/* Print Preview Report Area */}
      <div class="organic-card p-8 space-y-6 bg-white print:p-0 print:border-none print:shadow-none">
        
        <div class="flex items-center justify-between border-b-2 border-dashed border-[#e0f2f1] pb-4">
          <div>
            <h3 class="text-xl font-bold text-[#5d4037] font-['Jua']">
              2026년 교원 월급 산출 명세서 📄
            </h3>
            <p class="text-xs text-[#5d4037]/60 font-medium">
              출력 날짜: {new Date().toLocaleDateString("ko-KR")}
            </p>
          </div>

          <button
            onClick={handlePrint}
            class="pudding-btn text-xs py-2.5 px-5 flex items-center gap-2 print:hidden"
          >
            <Printer class="w-4 h-4" /> 인쇄 / PDF 저장하기
          </button>
        </div>

        {/* Report Content Grid */}
        <div class="grid grid-cols-2 gap-4 text-xs">
          <div class="p-4 bg-[#fffdf5] rounded-2xl border border-[#e0f2f1]">
            <span class="text-[#5d4037]/70 block font-medium">선택 호봉</span>
            <span class="font-bold text-[#5d4037] text-sm font-['Jua']">{step} 호봉</span>
          </div>
          <div class="p-4 bg-[#fffdf5] rounded-2xl border border-[#e0f2f1]">
            <span class="text-[#5d4037]/70 block font-medium">호봉 기본급</span>
            <span class="font-bold text-[#5d4037] text-sm font-['Jua']">{summary.baseSalary.toLocaleString()} 원</span>
          </div>
          <div class="p-4 bg-[#fff9c4]/50 rounded-2xl border border-[#f0e68c]">
            <span class="text-amber-900 block font-medium">총 수당 합계</span>
            <span class="font-bold text-amber-900 text-sm font-['Jua']">+{summary.totalAllowances.toLocaleString()} 원</span>
          </div>
          <div class="p-4 bg-[#e0f2f1]/50 rounded-2xl border border-[#b2d8d5]">
            <span class="text-teal-900 block font-medium">총 공제 합계</span>
            <span class="font-bold text-teal-900 text-sm font-['Jua']">-{summary.totalDeductions.toLocaleString()} 원</span>
          </div>
        </div>

        <div class="p-5 bg-[#ffd1dc] border-2 border-[#e6b8c4] text-[#5d4037] rounded-2xl flex items-center justify-between">
          <span class="font-bold text-sm">월 실수령액 (Net Pay)</span>
          <span class="font-black text-2xl font-['Jua']">{summary.netPay.toLocaleString()} 원</span>
        </div>

        <div class="text-[11px] text-[#5d4037]/60 text-center pt-2 font-medium">
          본 명세서는 [교사 월급 관리 &amp; AI 투자 튜터] 웹 앱에서 생성되었습니다. ✨
        </div>

      </div>

    </div>
  );
};
