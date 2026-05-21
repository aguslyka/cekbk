# Task: Rewrite "Tambah Sesi Konseling" Dialog

## Summary of Changes

### 1. TopicItem Interface Updated
- Added `checked: boolean` property to control which items appear in "Ringkasan Topik"

### 2. CounselingData Interface Updated
- Added `ringkasan: string | null` field

### 3. formData State Updated
- Added `ringkasan: ""` field
- Initial `topicItems` items now include `checked: true`

### 4. Dialog Form Field Order Restructured
New order:
1. **Pilih Siswa** — Shows problem students only (from problem-students API), with IYA count
2. **Tanggal Konseling** — datetime-local input
3. **Bidang** — Added "SEMUA" option alongside PRIBADI, SOSIAL, BELAJAR, KARIR
4. **Status** — Only "TERJADWAL" and "SELESAI" (removed DIBATALKAN)
5. **Topik Konseling** — With checkbox, editable text, IYA/TIDAK toggle, add/remove
6. **Petugas BK** — Text input
7. **Ringkasan Konseling** — Auto-generated from checked items, editable textarea
8. **Catatan** — Textarea with AI generation
9. **Tindak Lanjut** — Textarea with AI generation
10. **Solusi** — Textarea with AI generation

### 5. New Functions Added
- `toggleTopicChecked(index)` — Toggle checkbox for ringkasan inclusion
- `updateTopicItemText(index, text)` — Edit topic item text
- `fetchProblemStudents()` — Fetch students with IYA answers

### 6. handleSubmit Updated
- Auto-generates `topic` from checked items first, then falls back to IYA items
- Includes `ringkasan` in payload
- After successful POST, automatically opens Kartu Konseling dialog

### 7. parseTopicItems Updated
- Backward compatible: defaults `checked: true` for old records missing the property

### 8. Kartu Konseling Dialog Updated
- Added "Ringkasan Konseling" section
- Added "Lihat" (View) button alongside Cetak and Simpan PDF
- Handles "SEMUA" field display

### 9. API Changes

#### New: `/api/admin/counseling/problem-students/route.ts`
- Returns USER role students who have at least one IYA answer
- Includes iyaCount per student

#### Updated: `/api/admin/counseling/route.ts` (POST)
- Added `updateAnswersOnSelesai()` function
- When status is "SELESAI", updates Answer records for topicItems changed from IYA to TIDAK
- Handles `ringkasan` field

#### Updated: `/api/admin/counseling/[id]/route.ts` (PUT)
- Same answer update logic as POST
- Handles `ringkasan` field

### 10. Prisma Schema Updated
- Added `ringkasan String?` to Counseling model
- Updated field comment to include "SEMUA"
- Updated topicItems comment to include `checked:boolean`
- Ran `db:push` successfully

### Files Modified
1. `/home/z/my-project/src/app/page.tsx`
2. `/home/z/my-project/src/app/api/admin/counseling/route.ts`
3. `/home/z/my-project/src/app/api/admin/counseling/[id]/route.ts`
4. `/home/z/my-project/src/app/api/admin/counseling/problem-students/route.ts` (new)
5. `/home/z/my-project/prisma/schema.prisma`

### Lint Status
- `bun run lint` passes with no errors
