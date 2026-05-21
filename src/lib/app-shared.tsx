"use client";

import React, { createContext, useContext } from "react";
import {
  Heart, Users, BookOpen, Briefcase,
  CheckCircle2, XCircle, Calendar,
} from "lucide-react";

// ==================== TYPES ====================
export type View = "landing" | "dashboard" | "dcm" | "survey" | "results" | "result-detail" | "profile" | "certificate" | "admin-dashboard" | "admin-users" | "admin-surveys" | "admin-import" | "admin-counseling" | "admin-analysis" | "admin-analysis-detail" | "admin-certificate" | "admin-report" | "admin-monitoring" | "admin-settings" | "student-report";

export interface UserData {
  id: string;
  name: string;
  email: string;
  whatsapp?: string;
  jenisKelamin?: string;
  grade: number;
  role: string;
  image?: string;
  createdAt?: string;
}

export interface SurveyData {
  id: string;
  title: string;
  description: string;
  grade: number;
  field: string;
  active: boolean;
  _count?: { questions: number; responses: number };
  questions?: QuestionData[];
  responses?: { id: string; completed: boolean; completedAt: string | null }[];
}

export interface QuestionData {
  id: string;
  text: string;
  order: number;
}

export interface ResponseData {
  id: string;
  userId: string;
  surveyId: string;
  completed: boolean;
  completedAt: string | null;
  survey: { id: string; title: string; grade: number; field: string; description?: string };
  answers: AnswerData[];
}

export interface AnswerData {
  id: string;
  questionId: string;
  value: string;
  question: { id: string; text: string; order: number };
}

export interface CounselingData {
  id: string;
  studentId: string;
  date: string;
  topic: string;
  field: string;
  topicItems?: string | null;
  ringkasan: string | null;
  notes: string | null;
  followUp: string | null;
  solusi: string | null;
  status: string;
  bkOfficer: string;
  createdAt: string;
  student: { id: string; name: string; email: string; grade: number; whatsapp: string | null; jenisKelamin?: string | null; createdAt?: string };
}

// ==================== AUTH CONTEXT ====================
interface AuthContextType {
  user: UserData | null;
  setUser: (u: UserData | null) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

// ==================== API HELPER ====================
export async function apiFetch(path: string, options: RequestInit = {}, userId?: string, userRole?: string, userGrade?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (userId) headers["x-user-id"] = userId;
  if (userRole) headers["x-user-role"] = userRole;
  if (userGrade) headers["x-user-grade"] = String(userGrade);

  const res = await fetch(path, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || "Terjadi kesalahan");
  return data;
}

// ==================== FIELD CONFIG ====================
export const FIELD_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bgColor: string; description: string }> = {
  PRIBADI: {
    label: "Bidang Pribadi",
    icon: <Heart className="h-5 w-5" />,
    color: "text-rose-600",
    bgColor: "bg-rose-50 border-rose-200 hover:bg-rose-100",
    description: "Mengenali masalah pribadi dan emosi",
  },
  SOSIAL: {
    label: "Bidang Sosial",
    icon: <Users className="h-5 w-5" />,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
    description: "Memahami hubungan sosial dan teman",
  },
  BELAJAR: {
    label: "Bidang Belajar",
    icon: <BookOpen className="h-5 w-5" />,
    color: "text-amber-600",
    bgColor: "bg-amber-50 border-amber-200 hover:bg-amber-100",
    description: "Mengatasi kesulitan belajar",
  },
  KARIR: {
    label: "Bidang Karir",
    icon: <Briefcase className="h-5 w-5" />,
    color: "text-violet-600",
    bgColor: "bg-violet-50 border-violet-200 hover:bg-violet-100",
    description: "Merencanakan masa depan dan karir",
  },
};

export const CHART_COLORS = ["#e11d48", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#f97316"];

// ==================== STATUS CONFIG (Counseling) ====================
export const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; borderColor: string; icon: React.ReactNode }> = {
  TERJADWAL: { label: "Terjadwal", color: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-300", icon: <Calendar className="h-3.5 w-3.5" /> },
  SELESAI: { label: "Selesai", color: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-300", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  DIBATALKAN: { label: "Dibatalkan", color: "text-rose-700", bgColor: "bg-rose-50", borderColor: "border-rose-300", icon: <XCircle className="h-3.5 w-3.5" /> },
};

// ==================== MODULE-LEVEL STATE (shared selection state) ====================
// Using a simple store pattern for cross-component state
let _selectedAnalysisUserId = "";
let _selectedReportUserId = "";

export function getSelectedAnalysisUserId() { return _selectedAnalysisUserId; }
export function setSelectedAnalysisUserId(id: string) { _selectedAnalysisUserId = id; }
export function getSelectedReportUserId() { return _selectedReportUserId; }
export function setSelectedReportUserId(id: string) { _selectedReportUserId = id; }

// ==================== KOP SURAT HELPER ====================
export function KopSurat({ schoolSettings }: { schoolSettings: Record<string, string> }) {
  const hasLogo = !!schoolSettings.schoolLogo;
  return (
    <div className="border-b-2 border-black pb-3 mb-4">
      <div className="flex items-center gap-4">
        {/* Left: School Logo */}
        {hasLogo ? (
          <div className="w-16 h-16 shrink-0 flex items-center justify-center">
            <img
              src={schoolSettings.schoolLogo}
              alt="Logo Sekolah"
              className="max-w-16 max-h-16 object-contain"
            />
          </div>
        ) : (
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
            BK
          </div>
        )}
        {/* Center: School Info — centered in remaining space */}
        <div className="flex-1 text-center pr-14">
          <h2 className="text-lg font-bold uppercase">{schoolSettings.schoolName || 'SMP Negeri 1 Contoh'}</h2>
          <p className="text-xs">{schoolSettings.schoolAddress || 'Jl. Pendidikan No. 1'}</p>
          <div className="flex items-center justify-center gap-3 text-xs mt-0.5">
            {schoolSettings.schoolPhone && <span>Telp: {schoolSettings.schoolPhone}</span>}
            {schoolSettings.schoolEmail && <span>Email: {schoolSettings.schoolEmail}</span>}
          </div>
          {schoolSettings.schoolNpsn && <p className="text-xs">NPSN: {schoolSettings.schoolNpsn}</p>}
        </div>
      </div>
    </div>
  );
}

// ==================== PROFIL SISWA HELPER ====================
export function ProfilSiswa({ student }: { student: { name: string; grade: number; jenisKelamin?: string | null; whatsapp?: string | null; email: string; createdAt?: string } }) {
  // Format hari, tanggal, bulan, tahun dari waktu registrasi dalam Bahasa Indonesia
  const regDate = student.createdAt ? new Date(student.createdAt) : null;
  const isValidDate = regDate && !isNaN(regDate.getTime());
  const hariNama = isValidDate ? ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][regDate!.getDay()] : null;
  const tanggalStr = isValidDate
    ? `${regDate!.getDate()} ${['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][regDate!.getMonth()]} ${regDate!.getFullYear()}`
    : null;

  return (
    <div className="mb-4">
      <h3 className="font-bold text-sm uppercase mb-2 border-b pb-1">PROFIL SISWA</h3>
      <table className="w-full text-sm">
        <tbody>
          <tr><td className="py-1 w-40 text-gray-600">Nama Siswa</td><td className="py-1">: {student.name}</td></tr>
          <tr><td className="py-1 text-gray-600">Kelas</td><td className="py-1">: {student.grade}</td></tr>
          <tr><td className="py-1 text-gray-600">Jenis Kelamin</td><td className="py-1">: {student.jenisKelamin || '-'}</td></tr>
          <tr><td className="py-1 text-gray-600">No. WhatsApp</td><td className="py-1">: {student.whatsapp || '-'}</td></tr>
          <tr><td className="py-1 text-gray-600">Email</td><td className="py-1">: {student.email}</td></tr>
          <tr><td className="py-1 text-gray-600">Hari</td><td className="py-1">: {hariNama || '-'}</td></tr>
          <tr><td className="py-1 text-gray-600">Tanggal</td><td className="py-1">: {tanggalStr || '-'}</td></tr>
        </tbody>
      </table>
    </div>
  );
}

// ==================== PRINT PDF HELPER ====================
export function handlePrintPDF(elementId: string) {
  const content = document.getElementById(elementId);
  if (!content) return;
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  const styles = Array.from(document.styleSheets).map(sheet => {
    try { return Array.from(sheet.cssRules).map(r => r.cssText).join('\n'); }
    catch(e) { return ''; }
  }).join('\n');
  const contentClone = content.cloneNode(true) as HTMLElement;

  // Step 1: Remove ALL "hidden" classes from elements that should be visible in print
  // This is critical — Tailwind's .hidden { display: none } can override inline styles
  const allElements = contentClone.querySelectorAll('*');
  allElements.forEach((el: Element) => {
    const htmlEl = el as HTMLElement;
    const classList = htmlEl.classList;
    if (!classList) return;

    // If element has print:block, it should be VISIBLE — remove hidden class entirely
    if (Array.from(classList).some((c: string) => c.includes('print:') && c.includes('block'))) {
      classList.remove('hidden');
      // Also remove Tailwind responsive hidden classes
      classList.remove('sm:hidden', 'md:hidden', 'lg:hidden');
      htmlEl.style.display = 'block';
      htmlEl.removeAttribute('hidden');
    }

    // If element has print:hidden, hide it completely
    if (Array.from(classList).some((c: string) => c.includes('print:') && c.includes('hidden'))) {
      htmlEl.style.display = 'none !important';
      htmlEl.setAttribute('data-print-hidden', 'true');
    }
  });

  // Step 2: Remove max-height, overflow restrictions so ALL content is visible
  const restrictedEls = contentClone.querySelectorAll('[class*="max-h-"], [class*="overflow-hidden"], [class*="overflow-y-auto"], [class*="overflow-auto"]');
  restrictedEls.forEach((el: Element) => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.maxHeight = 'none';
    htmlEl.style.overflow = 'visible';
    htmlEl.style.overflowY = 'visible';
    htmlEl.style.overflowX = 'visible';
  });

  // Step 3: Also remove inline style restrictions that may have been set by ScrollArea etc.
  allElements.forEach((el: Element) => {
    const htmlEl = el as HTMLElement;
    const style = htmlEl.getAttribute('style') || '';
    if (style.includes('max-height') || style.includes('overflow')) {
      htmlEl.style.maxHeight = 'none';
      htmlEl.style.overflow = 'visible';
      htmlEl.style.overflowY = 'visible';
      htmlEl.style.overflowX = 'visible';
    }
  });

  // Step 4: Handle tab content for printing
  // Show ALL tab panels
  const tabPanels = contentClone.querySelectorAll('[data-slot="tabs-content"], [role="tabpanel"]');
  tabPanels.forEach((el: Element) => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.display = 'block';
    htmlEl.removeAttribute('hidden');
    htmlEl.removeAttribute('data-state');
  });

  // Hide inactive tab content to prevent duplicate rendering in print
  const inactiveTabs = contentClone.querySelectorAll('[data-state="inactive"]');
  inactiveTabs.forEach((el: Element) => { (el as HTMLElement).style.display = 'none'; });

  // Hide tab navigation buttons in print (they're interactive UI, not content)
  const tabsLists = contentClone.querySelectorAll('[data-slot="tabs-list"]');
  tabsLists.forEach((el: Element) => { (el as HTMLElement).style.display = 'none'; });

  // Remove hidden attribute from tab panels
  contentClone.querySelectorAll('[hidden]').forEach((el: Element) => {
    if (el.getAttribute('role') === 'tabpanel' || el.hasAttribute('data-slot')) {
      el.removeAttribute('hidden');
    }
  });

  // Step 5: Fix ScrollArea components — they use [data-radix-scroll-area-viewport]
  const scrollAreaViewports = contentClone.querySelectorAll('[data-radix-scroll-area-viewport]');
  scrollAreaViewports.forEach((el: Element) => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.maxHeight = 'none';
    htmlEl.style.overflow = 'visible';
    htmlEl.style.overflowY = 'visible';
  });

  // Detect if this is a certificate print (has certificate-content id)
  const isCertificate = elementId === 'certificate-content';

  // Print-specific CSS overrides — placed AFTER all other CSS to ensure highest priority
  const printStyles = isCertificate ? `
    @page {
      size: A4;
      margin: 0.5cm;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: 210mm;
      height: 297mm;
      overflow: hidden;
    }
    body {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #certificate-content {
      width: 100%;
      page-break-inside: avoid;
      break-inside: avoid;
      overflow: hidden;
      max-height: 100%;
    }
    #certificate-content > div {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    @media print {
      body { margin: 0; padding: 0; overflow: hidden; }
      #certificate-content {
        transform-origin: top center;
      }
      .print\\:hidden { display: none !important; }
    }
  ` : `
    html, body {
      margin: 0;
      padding: 0;
      background: white;
      color: #1a1a1a;
      font-family: system-ui, -apple-system, sans-serif;
    }
    body {
      padding: 20px;
    }
    /* ===== CRITICAL: Override Tailwind's .hidden class ===== */
    /* Elements with print:block must be visible even outside @media print */
    [class*="print:block"],
    [class*="print\\:block"] {
      display: block !important;
    }
    /* Elements with print:hidden must be hidden */
    [class*="print:hidden"],
    [class*="print\\:hidden"],
    [data-print-hidden="true"] {
      display: none !important;
    }
    /* Force all scroll/overflow containers to show content */
    [class*="max-h-"],
    [class*="overflow-hidden"],
    [class*="overflow-y-auto"],
    [class*="overflow-auto"],
    [data-radix-scroll-area-viewport] {
      max-height: none !important;
      overflow: visible !important;
    }
    /* Show all tab panels */
    [role="tabpanel"],
    [data-slot="tabs-content"] {
      display: block !important;
    }
    /* Ensure cards and containers don't clip */
    .rounded-lg, .rounded-xl, .rounded-2xl,
    .card, [class*="Card"] {
      overflow: visible !important;
    }
    /* Basic table styling for print */
    table {
      border-collapse: collapse;
      width: 100%;
    }
    td, th {
      padding: 4px 8px;
      border-bottom: 1px solid #e5e7eb;
    }
    /* Page break hints */
    h2, h3 {
      page-break-after: avoid;
    }
    img {
      max-width: 100%;
    }
    @media print {
      body { margin: 0; padding: 10px; font-size: 12px; background: white; }
      /* Hide interactive elements */
      [data-state="inactive"] { display: none !important; }
      [data-slot="tabs-list"] { display: none !important; }
      [data-slot="tabs-trigger"] { display: none !important; }
      .print\\:hidden { display: none !important; }
      /* Show print:block elements */
      [class*="print:block"],
      [class*="print\\:block"] {
        display: block !important;
      }
      /* Force overflow visible for all elements during print */
      * {
        max-height: none !important;
        overflow: visible !important;
      }
      /* Ensure background colors print */
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
    @page {
      margin: 1.5cm;
      size: A4;
    }
  `;

  printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Cetak</title><style>${styles}${printStyles}</style></head><body>${contentClone.innerHTML}</body></html>`);
  printWindow.document.close();

  // Auto-scale certificate content to fit A4 page
  if (isCertificate) {
    const certEl = printWindow.document.getElementById('certificate-content');
    if (certEl) {
      // A4 page height in pixels (at 96dpi): ~1123px for 297mm
      // With 0.5cm margin top+bottom: ~1085px available
      const pageHeight = 1085;
      const contentHeight = certEl.scrollHeight;
      if (contentHeight > pageHeight) {
        const scale = pageHeight / contentHeight;
        certEl.style.transform = `scale(${scale})`;
        certEl.style.transformOrigin = 'top center';
        certEl.style.width = `${100 / scale}%`;
        certEl.style.marginBottom = `-${contentHeight - contentHeight * scale}px`;
      }
    }
  }

  // Wait longer for content to render before printing
  setTimeout(() => { printWindow.print(); }, 800);
}

// ==================== GRADE HELPER ====================
export function getGrade(tidakPercentage: number): { grade: string; color: string; bgColor: string; label: string; keterangan: string; saran: string } {
  // TIDAK-based: higher TIDAK% = fewer problems = better grade
  // 100% TIDAK = A (Baik) — siswa tidak memiliki masalah
  // 0-49% TIDAK = E (Kurang Sekali) — siswa memiliki banyak masalah
  if (tidakPercentage === 100) return { grade: "A", color: "text-emerald-700", bgColor: "bg-emerald-50", label: "Baik", keterangan: "Tidak ada masalah", saran: "Siswa dalam kondisi sangat baik. Tetap berikan dukungan dan pantau perkembangan secara berkala." };
  if (tidakPercentage >= 90) return { grade: "B", color: "text-teal-700", bgColor: "bg-teal-50", label: "Cukup Baik", keterangan: "Masalah ringan", saran: "Siswa memiliki beberapa masalah ringan. Berikan perhatian khusus dan lakukan monitoring rutin." };
  if (tidakPercentage >= 75) return { grade: "C", color: "text-amber-700", bgColor: "bg-amber-50", label: "Cukup", keterangan: "Masalah sedang", saran: "Siswa mengalami masalah sedang. Disarankan konseling berkala dan intervensi pada bidang yang bermasalah." };
  if (tidakPercentage >= 50) return { grade: "D", color: "text-orange-700", bgColor: "bg-orange-50", label: "Kurang", keterangan: "Masalah signifikan", saran: "Siswa mengalami masalah signifikan. Diperlukan konseling intensif dan melibatkan orang tua/wali." };
  return { grade: "E", color: "text-rose-700", bgColor: "bg-rose-50", label: "Kurang Sekali", keterangan: "Masalah berat", saran: "Siswa memerlukan penanganan segera. Libatkan orang tua/wali dan pertimbangkan rujukan ke psikolog." };
}
