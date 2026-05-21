"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, ChevronRight, BarChart3, PieChart as PieChartIcon, Award, AlertCircle, TrendingUp, Download, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useAuth, apiFetch, FIELD_CONFIG, type View, type ResponseData, KopSurat, ProfilSiswa, handlePrintPDF, getGrade, getRecommendation, getOverallRecommendation } from "@/lib/app-shared";

// ==================== RESULT DETAIL ====================
function ResultDetail({ response, onBack }: { response: ResponseData; onBack: () => void }) {
  const { user } = useAuth();
  const [schoolSettings, setSchoolSettings] = useState<Record<string, string>>({});
  const survey = response.survey;
  const cfg = FIELD_CONFIG[survey.field] || FIELD_CONFIG.PRIBADI;
  const iyaCount = response.answers.filter((a) => a.value === "IYA").length;
  const tidakCount = response.answers.filter((a) => a.value === "TIDAK").length;

  useEffect(() => {
    if (!user) return;
    apiFetch("/api/analysis", {}, user.id, user.role, String(user.grade))
      .then((data) => setSchoolSettings(data.schoolSettings || {}))
      .catch(() => {});
  }, [user]);

  const pieData = [
    { name: "IYA", value: iyaCount, fill: "#ef4444" },      // IYA = problem (red)
    { name: "TIDAK", value: tidakCount, fill: "#10b981" },   // TIDAK = no problem (emerald)
  ];

  const questionAnalysis = response.answers.map((a) => ({
    question: a.question.text,
    answer: a.value,
    isProblem: a.value === "IYA",  // IYA = siswa memiliki masalah
  }));

  const problemQuestions = questionAnalysis.filter((q) => q.isProblem);
  const tidakPercentage = Math.round((tidakCount / response.answers.length) * 100);
  const iyaPercentage = 100 - tidakPercentage;  // IYA% = problem rate

  // Risk level based on IYA% (higher IYA% = more problems = higher risk)
  let riskLevel = "Rendah";
  let riskColor = "text-emerald-600";
  let riskBg = "bg-emerald-50";
  if (iyaPercentage > 50) {
    riskLevel = "Tinggi";
    riskColor = "text-rose-600";
    riskBg = "bg-rose-50";
  } else if (iyaPercentage > 25) {
    riskLevel = "Sedang";
    riskColor = "text-amber-600";
    riskBg = "bg-amber-50";
  } else if (iyaPercentage >= 11) {
    riskLevel = "Ringan";
    riskColor = "text-teal-600";
    riskBg = "bg-teal-50";
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6 print:hidden">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Hasil Analisa</h2>
          <p className="text-gray-500">{survey.title}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handlePrintPDF("result-detail-content")} className="gap-1.5">
            <FileDown className="h-4 w-4" />
            Cetak
          </Button>
          <Button variant="outline" size="sm" onClick={() => handlePrintPDF("result-detail-content")} className="gap-1.5">
            <Download className="h-4 w-4" />
            Simpan PDF
          </Button>
        </div>
      </div>

      <div id="result-detail-content" className="bg-white rounded-lg p-6 shadow-sm">
        <KopSurat schoolSettings={schoolSettings} />
        {user && <ProfilSiswa student={{ name: user.name, grade: user.grade, jenisKelamin: user.jenisKelamin, whatsapp: user.whatsapp, email: user.email, createdAt: user.createdAt }} />}
        <h2 className="text-center font-bold text-base uppercase mb-4">LAPORAN HASIL ANALISA DAFTAR CEK MASALAH (DCM)</h2>
        <p className="text-center text-sm text-gray-600 mb-6">Bidang: {cfg.label}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="p-4 text-center"><p className="text-sm text-gray-500">Total Pernyataan</p><p className="text-3xl font-bold">{response.answers.length}</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-sm text-gray-500">Jawaban TIDAK</p><p className="text-3xl font-bold text-rose-600">{tidakCount}</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-sm text-gray-500">Jawaban IYA</p><p className="text-3xl font-bold text-slate-500">{iyaCount}</p></CardContent></Card>
          <Card className={riskBg}><CardContent className="p-4 text-center"><p className="text-sm text-gray-500">Tingkat Masalah</p><p className={`text-3xl font-bold ${riskColor}`}>{riskLevel}</p></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Diagram Lingkaran (Pie Chart)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Diagram Batang (Bar Chart)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={pieData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {problemQuestions.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Masalah yang Teridentifikasi
                <Badge className="bg-red-100 text-red-700 border-red-300 hover:bg-red-100 text-xs ml-1">{problemQuestions.length} pernyataan</Badge>
              </CardTitle>
              <p className="text-xs text-gray-500 mt-1">Pernyataan yang dijawab <strong className="text-red-700">IYA</strong> menunjukkan masalah yang perlu perhatian</p>
            </CardHeader>
            <CardContent>
              <div className="border rounded-xl overflow-hidden">
                <div className="bg-amber-50 px-4 py-2 border-b flex items-center gap-2">
                  <span className="text-xs font-semibold text-amber-800 w-8 text-center">No</span>
                  <span className="text-xs font-semibold text-amber-800 flex-1">Pernyataan Masalah</span>
                  <span className="text-xs font-semibold text-amber-800 w-20 text-center">Jawaban</span>
                </div>
                <div className="min-w-0">
                  {problemQuestions.map((pq, i) => (
                    <div key={i} className={`flex items-start gap-2 px-4 py-3 border-b last:border-b-0 min-w-0 ${i % 2 === 0 ? 'bg-white' : 'bg-amber-50/30'}`}>
                      <span className="text-sm font-medium text-gray-500 w-8 text-center shrink-0 mt-0.5">{i + 1}.</span>
                      <p className="text-sm text-gray-800 flex-1 leading-relaxed min-w-0 break-words">{pq.question}</p>
                      <Badge className="bg-red-100 text-red-700 border-red-300 hover:bg-red-100 text-xs shrink-0 mt-0.5">IYA</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-5 w-5 text-teal-500" />
              Rekomendasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`p-4 rounded-xl ${riskBg}`}>
              {tidakPercentage > 50 ? (
                <div>
                  <p className={`font-semibold ${riskColor}`}>Tingkat Masalah: Tinggi ({tidakPercentage}% TIDAK)</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Kamu mengalami banyak masalah di bidang {cfg.label.toLowerCase()}. Sangat disarankan untuk segera berkonsultasi
                    dengan Guru BK di sekolahmu untuk mendapatkan bantuan dan dukungan yang tepat.
                  </p>
                </div>
              ) : tidakPercentage > 25 ? (
                <div>
                  <p className={`font-semibold ${riskColor}`}>Tingkat Masalah: Sedang ({tidakPercentage}% TIDAK)</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Kamu mengalami beberapa masalah di bidang {cfg.label.toLowerCase()}. Disarankan untuk berdiskusi
                    dengan Guru BK untuk mendapatkan panduan mengatasi masalah yang kamu hadapi.
                  </p>
                </div>
              ) : (
                <div>
                  <p className={`font-semibold ${riskColor}`}>Tingkat Masalah: Rendah ({tidakPercentage}% TIDAK)</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Kamu tampaknya tidak mengalami masalah signifikan di bidang {cfg.label.toLowerCase()}. 
                    Tetap jaga kesehatan mental dan jangan ragu untuk berkonsultasi jika membutuhkan.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ==================== OVERALL ANALYSIS ====================
function OverallAnalysis({ responses }: { responses: ResponseData[] }) {
  const { user } = useAuth();
  const [schoolSettings, setSchoolSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    apiFetch("/api/analysis", {}, user.id, user.role, String(user.grade))
      .then((data) => setSchoolSettings(data.schoolSettings || {}))
      .catch(() => {});
  }, [user]);

  const fieldGroups: Record<string, ResponseData[]> = {};
  responses.forEach((r) => {
    const field = r.survey.field;
    if (!fieldGroups[field]) fieldGroups[field] = [];
    fieldGroups[field].push(r);
  });

  const fieldStats = Object.entries(FIELD_CONFIG).map(([key, cfg]) => {
    const group = fieldGroups[key] || [];
    const allAnswers = group.flatMap((r) => r.answers);
    const iyaCount = allAnswers.filter((a) => a.value === "IYA").length;
    const tidakCount = allAnswers.filter((a) => a.value === "TIDAK").length;
    const total = allAnswers.length;
    const percentage = total > 0 ? Math.round((tidakCount / total) * 100) : 0;
    return { key, label: cfg.label, icon: cfg.icon, color: cfg.color, bgColor: cfg.bgColor, iyaCount, tidakCount, total, percentage, completed: group.length > 0 };
  });

  const totalIya = responses.flatMap((r) => r.answers).filter((a) => a.value === "IYA").length;
  const totalTidak = responses.flatMap((r) => r.answers).filter((a) => a.value === "TIDAK").length;
  const totalAll = responses.flatMap((r) => r.answers).length;
  const tidakPercentage = totalAll > 0 ? Math.round((totalTidak / totalAll) * 100) : 0;

  const iyaPercentage = totalAll > 0 ? Math.round((totalIya / totalAll) * 100) : 0;

  let overallRiskLevel = "Rendah";
  let overallRiskColor = "text-emerald-600";
  let overallRiskBg = "bg-emerald-50";
  if (iyaPercentage > 50) {
    overallRiskLevel = "Tinggi";
    overallRiskColor = "text-rose-600";
    overallRiskBg = "bg-rose-50";
  } else if (iyaPercentage > 25) {
    overallRiskLevel = "Sedang";
    overallRiskColor = "text-amber-600";
    overallRiskBg = "bg-amber-50";
  } else if (iyaPercentage >= 11) {
    overallRiskLevel = "Ringan";
    overallRiskColor = "text-teal-600";
    overallRiskBg = "bg-teal-50";
  }

  const gradeInfo = getGrade(tidakPercentage);
  const barChartData = fieldStats.map((fs) => ({
    name: fs.label.replace("Bidang ", ""),
    IYA: fs.iyaCount,
    TIDAK: fs.tidakCount,
    percentage: fs.percentage,
  }));

  const overallPieData = [
    { name: "IYA", value: totalIya, fill: "#ef4444" },      // IYA = problem (red)
    { name: "TIDAK", value: totalTidak, fill: "#10b981" },   // TIDAK = no problem (emerald)
  ];

  const comparisonData = fieldStats.map((fs) => ({
    name: fs.label.replace("Bidang ", ""),
    Persentase: fs.percentage,
  }));

  const problemsByField = Object.entries(fieldGroups).map(([field, group]) => {
    const cfg = FIELD_CONFIG[field] || FIELD_CONFIG.PRIBADI;
    const problems = group.flatMap((r) =>
      r.answers.filter((a) => a.value === "IYA").map((a) => a.question.text)
    );
    return { field, label: cfg.label, icon: cfg.icon, color: cfg.color, bgColor: cfg.bgColor, problems };
  }).filter((p) => p.problems.length > 0);

  const highestField = fieldStats.filter(f => f.completed).sort((a, b) => b.percentage - a.percentage)[0];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div id="overall-analysis-content" className="bg-white rounded-lg p-6 shadow-sm">
        <KopSurat schoolSettings={schoolSettings} />
        {user && <ProfilSiswa student={{ name: user.name, grade: user.grade, jenisKelamin: user.jenisKelamin, whatsapp: user.whatsapp, email: user.email, createdAt: user.createdAt }} />}
        <h2 className="text-center font-bold text-base uppercase mb-2">LAPORAN HASIL ANALISA KESELURUHAN</h2>
        <h3 className="text-center text-sm text-gray-600 mb-6">DAFTAR CEK MASALAH (DCM) — SEMUA BIDANG</h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card><CardContent className="p-4 text-center"><p className="text-sm text-gray-500">Total Pernyataan</p><p className="text-3xl font-bold">{totalAll}</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-sm text-gray-500">Total TIDAK</p><p className="text-3xl font-bold text-rose-600">{totalTidak}</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-sm text-gray-500">Total IYA</p><p className="text-3xl font-bold text-slate-500">{totalIya}</p></CardContent></Card>
          <Card className={overallRiskBg}><CardContent className="p-4 text-center"><p className="text-sm text-gray-500">Tingkat Masalah</p><p className={`text-3xl font-bold ${overallRiskColor}`}>{overallRiskLevel}</p></CardContent></Card>
          <Card className={gradeInfo.bgColor}><CardContent className="p-4 text-center"><p className="text-sm text-gray-500">Grade</p><p className={`text-3xl font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</p><p className="text-xs text-gray-500 mt-1">{tidakPercentage}% TIDAK</p></CardContent></Card>
        </div>

        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-5 w-5 text-teal-500" />Ringkasan Per Bidang</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {fieldStats.map((fs) => {
                const g = getGrade(fs.percentage);
                return (
                  <div key={fs.key} className={`rounded-xl border-2 p-4 ${fs.completed ? fs.bgColor : "bg-gray-50 border-gray-200 opacity-60"}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`p-1.5 rounded-lg ${fs.color} bg-white/80`}>{fs.icon}</div>
                      <h4 className="font-semibold text-sm">{fs.label}</h4>
                    </div>
                    {fs.completed ? (
                      <>
                        <div className="space-y-1 text-sm mb-3">
                          <div className="flex justify-between"><span className="text-gray-500">TIDAK</span><span className="font-semibold text-rose-600">{fs.tidakCount}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">IYA</span><span className="font-semibold text-slate-500">{fs.iyaCount}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Persentase TIDAK</span><span className={`font-bold ${g.color}`}>{fs.percentage}%</span></div>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all" style={{ width: `${fs.percentage}%` }} />
                        </div>
                        <div className="mt-2 text-center"><Badge className={`${g.bgColor} ${g.color} border-0`}>Grade {g.grade}</Badge></div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Belum dikerjakan</p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Diagram Lingkaran Keseluruhan</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={overallPieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {overallPieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Perbandingan TIDAK/IYA Per Bidang</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="IYA" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="TIDAK" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-5 w-5 text-teal-500" />Persentase Masalah Per Bidang</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => `${value}%`} />
                <Bar dataKey="Persentase" radius={[0, 8, 8, 0]} fill="#10b981">
                  {comparisonData.map((entry, index) => {
                    const pct = entry.Persentase;
                    let fill = "#10b981";
                    if (pct >= 51) fill = "#f43f5e";
                    else if (pct >= 26) fill = "#f97316";
                    else if (pct >= 11) fill = "#f59e0b";
                    return <Cell key={`cell-${index}`} fill={fill} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {problemsByField.length > 0 && (
          <Card className="mb-6">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertCircle className="h-5 w-5 text-amber-500" />Masalah Teridentifikasi Per Bidang</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {problemsByField.map((pf) => (
                <div key={pf.field} className="border rounded-xl overflow-hidden">
                  <div className="bg-amber-50 px-4 py-2.5 border-b flex items-center gap-2">
                    <div className={`p-1 rounded-lg ${pf.color} bg-white/80`}>{pf.icon}</div>
                    <h4 className="font-semibold text-sm text-amber-800">{pf.label}</h4>
                    <Badge className="bg-red-100 text-red-700 border-red-300 hover:bg-red-100 text-xs">{pf.problems.length} masalah</Badge>
                  </div>
                  <div className="min-w-0">
                    {pf.problems.map((problem, i) => (
                      <div key={i} className={`flex items-start gap-2 px-4 py-2.5 border-b last:border-b-0 min-w-0 ${i % 2 === 0 ? 'bg-white' : 'bg-amber-50/30'}`}>
                        <span className="text-sm font-medium text-gray-500 w-6 text-center shrink-0 mt-0.5">{i + 1}.</span>
                        <p className="text-sm text-gray-800 leading-relaxed min-w-0 break-words">{problem}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Award className="h-5 w-5 text-teal-500" />Rekomendasi & Saran Keseluruhan</CardTitle></CardHeader>
          <CardContent>
            {(() => {
              const overallRec = getOverallRecommendation(tidakPercentage);
              const og = getGrade(tidakPercentage);
              return (
                <div className={`p-4 rounded-xl ${og.bgColor} mb-4`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`${og.bgColor} ${og.color} border-0 text-base px-3 py-1`}>Grade {og.grade}</Badge>
                    <span className={`font-semibold ${og.color}`}>{tidakPercentage}% TIDAK</span>
                  </div>
                  <p className={`font-medium text-sm ${og.color}`}>Keterangan: {overallRec.keterangan}</p>
                  <div className="mt-2 p-3 bg-white/70 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">💡 Saran:</p>
                    <p className="text-sm text-gray-600 mt-1">{overallRec.saran}</p>
                  </div>
                  {highestField && <p className="text-xs text-gray-500 mt-2">Bidang paling memerlukan perhatian: <strong>{highestField.label}</strong> ({highestField.percentage}%)</p>}
                </div>
              );
            })()}

            <h4 className="font-semibold text-sm text-gray-700 mb-3">Rekomendasi Per Bidang:</h4>
            <div className="space-y-3">
              {fieldStats.filter(f => f.completed).map((fs) => {
                const fg = getGrade(fs.percentage);
                const rec = getRecommendation(fs.key, user?.grade || 7, fs.percentage);
                return (
                  <div key={fs.key} className={`p-3 rounded-lg ${fg.bgColor} flex items-start gap-3`}>
                    <div className={`p-1.5 rounded ${fs.color} bg-white/80 mt-0.5`}>{fs.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`${fg.bgColor} ${fg.color} border-0`}>Grade {fg.grade}</Badge>
                        <span className={`font-medium text-sm ${fg.color}`}>{fs.label} — {fs.percentage}%</span>
                      </div>
                      <p className="text-xs text-gray-600 font-medium">{rec.keterangan}</p>
                      <div className="mt-1.5 p-2 bg-white/60 rounded text-xs text-gray-600">
                        <span className="font-medium">💡 Saran:</span> {rec.saran}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-2 print:hidden">
        <Button variant="outline" onClick={() => handlePrintPDF("overall-analysis-content")} className="gap-1.5">
          <FileDown className="h-4 w-4" />
          Cetak
        </Button>
        <Button variant="outline" onClick={() => handlePrintPDF("overall-analysis-content")} className="gap-1.5">
          <Download className="h-4 w-4" />
          Simpan PDF
        </Button>
      </div>
    </motion.div>
  );
}

// ==================== RESULTS PAGE ====================
function ResultsPage({ onNavigate, surveyIdFilter }: { onNavigate: (view: View) => void; surveyIdFilter?: string }) {
  const { user } = useAuth();
  const [responses, setResponses] = useState<ResponseData[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<ResponseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysisMode, setAnalysisMode] = useState<"per-bidang" | "keseluruhan">("per-bidang");

  useEffect(() => {
    if (!user) return;
    apiFetch("/api/responses", {}, user.id, user.role, String(user.grade))
      .then((data) => {
        const resps = (data.responses || []).filter((r: ResponseData) => r.completed);
        setResponses(resps);
        if (surveyIdFilter) {
          const found = resps.find((r: ResponseData) => r.surveyId === surveyIdFilter);
          if (found) setSelectedResponse(found);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, surveyIdFilter]);

  if (selectedResponse) {
    return <ResultDetail response={selectedResponse} onBack={() => setSelectedResponse(null)} />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => onNavigate("dashboard")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Hasil Analisa</h2>
          <p className="text-gray-500">Hasil assessment yang telah diselesaikan</p>
        </div>
        {!loading && responses.length > 0 && (
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setAnalysisMode("per-bidang")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                analysisMode === "per-bidang" ? "bg-white text-teal-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Per Bidang
            </button>
            <button
              onClick={() => setAnalysisMode("keseluruhan")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                analysisMode === "keseluruhan" ? "bg-white text-teal-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <PieChartIcon className="h-4 w-4" />
              Keseluruhan
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-4 bg-gray-200 rounded w-3/4" /></CardContent></Card>)}</div>
      ) : responses.length === 0 ? (
        <div className="text-center py-12">
          <PieChartIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">Belum ada hasil assessment</p>
          <Button onClick={() => onNavigate("dcm")} className="mt-4 bg-teal-600 hover:bg-teal-700">Mulai Assessment</Button>
        </div>
      ) : analysisMode === "keseluruhan" ? (
        <OverallAnalysis responses={responses} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {responses.map((response) => {
            const cfg = FIELD_CONFIG[response.survey.field] || FIELD_CONFIG.PRIBADI;
            const iyaCount = response.answers.filter((a) => a.value === "IYA").length;
            const tidakCount = response.answers.filter((a) => a.value === "TIDAK").length;
            const total = response.answers.length;
            const percentage = Math.round((tidakCount / total) * 100);

            return (
              <motion.div key={response.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-2 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedResponse(response)}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-xl ${cfg.color} bg-white/80`}>{cfg.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{response.survey.title}</h4>
                        <p className="text-xs text-gray-500">
                          {response.completedAt && new Date(response.completedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-rose-600 font-medium">TIDAK: {tidakCount}</span>
                          <span className="text-slate-500 font-medium">IYA: {iyaCount}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Detail <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ResultsPage;
