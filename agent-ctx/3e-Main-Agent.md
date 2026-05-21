# Task 3e: Add recommendation system to AdminAnalysis & AdminAnalysisDetail with pie charts

## Work Summary

### Part 1: AdminAnalysis.tsx
- Added `calculateOverallPercentage`, `getGradeInfo`, `FieldName` imports from `@/lib/recommendations`
- Added per-student overall percentage calculation using `calculateOverallPercentage(fieldPercentages)`
- Added "Rata-rata" column showing average of Pribadi%, Sosial%, Belajar%, Karir%
- Added "Rekomendasi" column showing color-coded grade badge (A-E) with label text
- Handles incomplete assessments gracefully (only shows overall when at least one field has data)

### Part 2: AdminAnalysisDetail.tsx - Keseluruhan tab
- Added all recommendation module imports
- Calculates `overallPercentage`, `overallGradeInfo`, `overallRecommendation`, `studentKelas`
- Restructured pie chart: side-by-side layout (pie left, grade+percentage right)
- Added "Rekomendasi Keseluruhan" card with grade badge, range, and saran text
- Updated summary cards to use `getGradeInfo()` for richer "Grade A — Baik" labels
- Added "Ringkasan Rekomendasi Per Bidang" section: 2-col grid with field-specific recommendations using `getFieldRecommendation(field, studentKelas, pct)`
- Updated Matriks Rekomendasi table to use kelas-specific saran text

### Part 3: AdminAnalysisDetail.tsx - Per Bidang tab
- Updated grade badge to "Grade X — Label" format
- Added "Rekomendasi" card per field with: AlertCircle icon, grade badge, percentage, range, full saran text
- Restructured layout: recommendation card on top, problem list below
- All recommendations print-friendly

### Verification
- Lint passes clean
- Dev server compiles without errors
- Existing print/PDF, KopSurat, ProfilSiswa, Download PDF preserved
