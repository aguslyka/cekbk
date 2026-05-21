"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft, Download, CheckCircle2, AlertCircle, Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth, apiFetch, FIELD_CONFIG, KopSurat, ProfilSiswa, handlePrintPDF, type ResponseData } from "@/lib/app-shared";

export default function ResultDetail({ response, onBack }: { response: ResponseData; onBack: () => void }) {
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
    { name: "IYA", value: iyaCount, fill: "#f59e0b" },       // IYA = problem (amber)
    { name: "TIDAK", value: tidakCount, fill: "#10b981" },    // TIDAK = no problem (emerald)
  ];

  // Category breakdown - group questions by patterns
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
        <div className="ml-auto">
          <Button variant="outline" size="sm" onClick={() => handlePrintPDF("result-detail-content")}>
            <Download className="h-4 w-4 mr-2" /> Download PDF
          </Button>
        </div>
      </div>

      <div id="result-detail-content" className="bg-white rounded-lg p-6 shadow-sm">
        <KopSurat schoolSettings={schoolSettings} />
        {user && <ProfilSiswa student={{ name: user.name, grade: user.grade, jenisKelamin: user.jenisKelamin, whatsapp: user.whatsapp, email: user.email, createdAt: user.createdAt }} />}
        <h2 className="text-center font-bold text-base uppercase mb-4">LAPORAN HASIL ANALISA DAFTAR CEK MASALAH (DCM)</h2>
        <p className="text-center text-sm text-gray-600 mb-6">Bidang: {cfg.label}</p>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500">Total Pernyataan</p>
              <p className="text-3xl font-bold">{response.answers.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500">Jawaban IYA</p>
              <p className="text-3xl font-bold text-amber-600">{iyaCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500">Jawaban TIDAK</p>
              <p className="text-3xl font-bold text-emerald-600">{tidakCount}</p>
            </CardContent>
          </Card>
          <Card className={riskBg}>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500">Tingkat Masalah</p>
              <p className={`text-3xl font-bold ${riskColor}`}>{riskLevel}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Diagram Lingkaran (Pie Chart)</CardTitle>
            </CardHeader>
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
            <CardHeader>
              <CardTitle className="text-base">Diagram Batang (Bar Chart)</CardTitle>
            </CardHeader>
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

        {/* Problem Analysis */}
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

        {/* Recommendation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-5 w-5 text-teal-500" />
              Rekomendasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`p-4 rounded-xl ${riskBg}`}>
              {iyaPercentage > 50 ? (
                <div>
                  <p className={`font-semibold ${riskColor}`}>Tingkat Masalah: Tinggi ({iyaPercentage}% IYA)</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Kamu mengalami banyak masalah di bidang {cfg.label.toLowerCase()}. Sangat disarankan untuk segera berkonsultasi
                    dengan Guru BK di sekolahmu untuk mendapatkan bantuan dan dukungan yang tepat.
                  </p>
                </div>
              ) : iyaPercentage > 25 ? (
                <div>
                  <p className={`font-semibold ${riskColor}`}>Tingkat Masalah: Sedang ({iyaPercentage}% IYA)</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Kamu mengalami beberapa masalah di bidang {cfg.label.toLowerCase()}. Disarankan untuk berdiskusi
                    dengan Guru BK untuk mendapatkan panduan mengatasi masalah yang kamu hadapi.
                  </p>
                </div>
              ) : (
                <div>
                  <p className={`font-semibold ${riskColor}`}>Tingkat Masalah: Rendah ({iyaPercentage}% IYA)</p>
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
