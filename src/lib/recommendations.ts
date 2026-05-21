// ==================== RECOMMENDATION / SARAN GRADING SYSTEM ====================
// TIDAK-based: higher TIDAK% = fewer problems = better grade
// Grade A: 100% TIDAK — Baik (no problems)
// Grade B: 90-99% TIDAK — Cukup Baik
// Grade C: 75-89% TIDAK — Cukup
// Grade D: 50-74% TIDAK — Kurang
// Grade E: 0-49% TIDAK — Kurang Sekali

export type FieldName = "PRIBADI" | "SOSIAL" | "BELAJAR" | "KARIR";
export type GradeLevel = 7 | 8 | 9;

export interface GradeInfo {
  grade: string;
  label: string;
  color: string;
  bgColor: string;
  description: string;
}

export interface RecommendationInfo {
  grade: string;
  label: string;
  range: string;
  saran: string;
}

// Grade lookup based on TIDAK percentage (higher = better, lower = worse)
export function getGradeInfo(tidakPercentage: number): GradeInfo {
  if (isNaN(tidakPercentage) || tidakPercentage === null || tidakPercentage === undefined) {
    return { grade: "-", label: "Data Tidak Tersedia", color: "text-gray-500", bgColor: "bg-gray-50", description: "Data tidak tersedia untuk dinilai" };
  }
  if (tidakPercentage === 100) return { grade: "A", label: "Baik", color: "text-emerald-700", bgColor: "bg-emerald-50", description: "Siswa tidak memiliki masalah" };
  if (tidakPercentage >= 90) return { grade: "B", label: "Cukup Baik", color: "text-teal-700", bgColor: "bg-teal-50", description: "Siswa memiliki masalah ringan" };
  if (tidakPercentage >= 75) return { grade: "C", label: "Cukup", color: "text-amber-700", bgColor: "bg-amber-50", description: "Siswa memiliki masalah sedang" };
  if (tidakPercentage >= 50) return { grade: "D", label: "Kurang", color: "text-orange-700", bgColor: "bg-orange-50", description: "Siswa memiliki masalah yang signifikan" };
  return { grade: "E", label: "Kurang Sekali", color: "text-rose-700", bgColor: "bg-rose-50", description: "Siswa memerlukan penanganan segera" };
}

// Get the result grade letter based on TIDAK percentage
export function getResultGrade(tidakPercentage: number): string {
  if (tidakPercentage === 100) return "A";
  if (tidakPercentage >= 90) return "B";
  if (tidakPercentage >= 75) return "C";
  if (tidakPercentage >= 50) return "D";
  return "E";
}

// Calculate overall TIDAK percentage across all fields (average of TIDAK%)
export function calculateOverallPercentage(fieldPercentages: Record<FieldName, number>): number {
  const fields: FieldName[] = ["PRIBADI", "SOSIAL", "BELAJAR", "KARIR"];
  const validFields = fields.filter(f => {
    const val = fieldPercentages[f];
    return val !== undefined && !isNaN(val) && val >= 0;
  });

  if (validFields.length === 0) return 0;

  const sum = validFields.reduce((acc, f) => acc + fieldPercentages[f], 0);
  return Math.round(sum / validFields.length);
}

// Per-field, per-kelas recommendation with specific saran
const SARAN_PRIBADI: Record<string, string> = {
  A: "Siswa dalam kondisi sangat baik secara pribadi. Tidak ada masalah yang teridentifikasi. Tetap berikan dukungan dan perhatian agar kondisi positif ini dapat terjaga.",
  B: "Siswa memiliki masalah pribadi ringan. Lakukan monitoring berkala dan berikan motivasi untuk menjaga keseimbangan emosional.",
  C: "Siswa mengalami masalah pribadi sedang. Disarankan untuk melakukan konseling individual guna membantu siswa mengelola perasaan dan emosinya.",
  D: "Siswa mengalami masalah pribadi yang signifikan. Perlu dilakukan intervensi konseling yang lebih intensif dan melibatkan orang tua/wali.",
  E: "Siswa mengalami masalah pribadi yang berat. Diperlukan penanganan segera melalui konseling intensif, melibatkan orang tua/wali, dan mungkin membutuhkan rujukan ke psikolog.",
};

const SARAN_SOSIAL: Record<string, string> = {
  A: "Siswa memiliki hubungan sosial yang sangat baik. Tidak ada masalah yang teridentifikasi. Terus dorong partisipasi dalam kegiatan kelompok untuk memperkuat kemampuan sosial.",
  B: "Siswa memiliki sedikit hambatan sosial. Berikan kesempatan lebih banyak untuk berinteraksi dengan teman sebaya dalam kegiatan positif.",
  C: "Siswa mengalami masalah sosial sedang. Bantu siswa mengembangkan keterampilan sosial melalui konseling kelompok atau aktivitas kerjasama.",
  D: "Siswa mengalami masalah sosial yang signifikan. Perlu pendampingan intensif dalam berinteraksi dan mungkin mediasi konflik dengan teman sebaya.",
  E: "Siswa mengalami masalah sosial yang berat. Diperlukan intervensi segera, mediasi, dan melibatkan orang tua/wali untuk membantu siswa membangun hubungan sosial yang sehat.",
};

const SARAN_BELAJAR: Record<string, string> = {
  A: "Siswa tidak memiliki masalah dalam belajar. Tidak ada masalah yang teridentifikasi. Pertahankan strategi belajar yang efektif dan berikan tantangan akademis yang sesuai.",
  B: "Siswa memiliki sedikit kesulitan belajar. Berikan bimbingan tambahan dan bantu siswa mengembangkan strategi belajar yang lebih efektif.",
  C: "Siswa mengalami masalah belajar sedang. Lakukan identifikasi penyebab dan berikan bimbingan belajar yang terstruktur serta teknik manajemen waktu.",
  D: "Siswa mengalami kesulitan belajar yang signifikan. Perlu bimbingan intensif, identifikasi hambatan belajar, dan mungkin penyesuaian metode pembelajaran.",
  E: "Siswa mengalami masalah belajar yang berat. Diperlukan intervensi segera, asesmen belajar komprehensif, dan melibatkan pihak terkait untuk merancang program belajar khusus.",
};

const SARAN_KARIR: Record<string, string> = {
  A: "Siswa memiliki pemahaman karir yang sangat baik. Tidak ada masalah yang teridentifikasi. Lanjutkan eksplorasi minat dan bakat melalui kegiatan pengembangan diri.",
  B: "Siswa memerlukan sedikit bimbingan karir. Berikan informasi tentang berbagai pilihan karir dan bantu siswa mengenali potensi dirinya.",
  C: "Siswa mengalami kebingungan karir sedang. Lakukan konseling karir untuk membantu siswa mengenali minat, bakat, dan tujuan masa depannya.",
  D: "Siswa mengalami kebingungan karir yang signifikan. Perlu bimbingan karir intensif dan eksplorasi mendalam tentang pilihan masa depan.",
  E: "Siswa mengalami masalah karir yang berat. Diperlukan konseling karir intensif, asesmen minat-bakat, dan pendampingan dalam merencanakan masa depan.",
};

const FIELD_SARAN: Record<FieldName, Record<string, string>> = {
  PRIBADI: SARAN_PRIBADI,
  SOSIAL: SARAN_SOSIAL,
  BELAJAR: SARAN_BELAJAR,
  KARIR: SARAN_KARIR,
};

const GRADE_RANGES: Record<string, { label: string; range: string }> = {
  A: { label: "Baik", range: "100% TIDAK" },
  B: { label: "Cukup Baik", range: "90%-99% TIDAK" },
  C: { label: "Cukup", range: "75%-89% TIDAK" },
  D: { label: "Kurang", range: "50%-74% TIDAK" },
  E: { label: "Kurang Sekali", range: "0%-49% TIDAK" },
};

export function getFieldRecommendation(field: FieldName, _kelas: GradeLevel, tidakPercentage: number): RecommendationInfo {
  const gradeLetter = getResultGrade(tidakPercentage);
  const saran = FIELD_SARAN[field]?.[gradeLetter] || "Tidak ada rekomendasi spesifik.";
  const rangeInfo = GRADE_RANGES[gradeLetter] || { label: "-", range: "-" };

  return {
    grade: gradeLetter,
    label: rangeInfo.label,
    range: rangeInfo.range,
    saran,
  };
}

export function getOverallRecommendation(tidakPercentage: number): RecommendationInfo {
  const gradeLetter = getResultGrade(tidakPercentage);
  const rangeInfo = GRADE_RANGES[gradeLetter] || { label: "-", range: "-" };

  const overallSaran: Record<string, string> = {
    A: "Siswa dalam kondisi sangat baik secara keseluruhan. Tidak ada masalah yang teridentifikasi di semua bidang. Tetap berikan dukungan dan pantau perkembangan secara berkala.",
    B: "Siswa memiliki beberapa masalah ringan. Berikan perhatian khusus pada bidang yang memerlukan dan lakukan monitoring rutin.",
    C: "Siswa mengalami masalah sedang di beberapa bidang. Disarankan konseling berkala dan intervensi pada bidang yang bermasalah.",
    D: "Siswa mengalami masalah signifikan di beberapa bidang. Diperlukan konseling intensif, melibatkan orang tua/wali, dan koordinasi dengan pihak terkait.",
    E: "Siswa memerlukan penanganan segera dan komprehensif. Libatkan orang tua/wali, lakukan konseling intensif, dan pertimbangkan rujukan ke psikolog profesional.",
  };

  return {
    grade: gradeLetter,
    label: rangeInfo.label,
    range: rangeInfo.range,
    saran: overallSaran[gradeLetter] || "Tidak ada rekomendasi.",
  };
}
