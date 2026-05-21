"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, XCircle,
  AlertCircle, RefreshCw, Sparkles, Heart, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { useAuth, apiFetch, FIELD_CONFIG, type View, type SurveyData, type QuestionData } from "@/lib/app-shared";

export default function SurveyPage({ surveyId, onNavigate }: { surveyId: string; onNavigate: (view: View) => void }) {
  const { user } = useAuth();
  const [survey, setSurvey] = useState<SurveyData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user || !surveyId) return;
    apiFetch(`/api/surveys/${surveyId}`, {}, user.id, user.role, String(user.grade))
      .then((data) => {
        setSurvey(data.survey);
        if (data.survey?.questions) {
          const initial: Record<string, string> = {};
          data.survey.questions.forEach((q: QuestionData) => { initial[q.id] = ""; });
          setAnswers(initial);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, surveyId]);

  const questions = survey?.questions || [];
  const progress = questions.length > 0 ? (Object.values(answers).filter((a) => a !== "").length / questions.length) * 100 : 0;

  const handleSubmit = async () => {
    if (!user || !surveyId) return;
    const unanswered = Object.values(answers).filter((a) => !a).length;
    if (unanswered > 0) {
      toast({ title: "Perhatian", description: `Masih ada ${unanswered} pernyataan belum dijawab`, variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const answerList = Object.entries(answers).map(([questionId, value]) => ({ questionId, value }));
      await apiFetch("/api/responses", {
        method: "POST",
        body: JSON.stringify({ surveyId, answers: answerList }),
      }, user.id, user.role, String(user.grade));
      toast({ title: "Berhasil!", description: "Assessment berhasil disimpan" });
      onNavigate("results");
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Terjadi kesalahan", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl w-3/4" />
          <div className="h-40 bg-gradient-to-r from-blue-50 to-pink-50 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-purple-400" />
        </div>
        <p className="text-gray-600 font-medium">Survey tidak ditemukan</p>
        <Button onClick={() => onNavigate("dcm")} className="mt-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-xl shadow-md">
          Kembali
        </Button>
      </div>
    );
  }

  const cfg = FIELD_CONFIG[survey.field] || FIELD_CONFIG.PRIBADI;
  const q = questions[currentQuestion];

  // Soft field-based gradient configs for SMP students
  const fieldTheme: Record<string, { cardBg: string; headerBg: string; headerText: string; accentLight: string; accentMed: string; welcomeBg: string; welcomeBorder: string; progressBg: string }> = {
    PRIBADI: {
      cardBg: "from-rose-50/60 via-pink-50/40 to-fuchsia-50/30",
      headerBg: "from-rose-400 to-pink-500",
      headerText: "text-rose-700",
      accentLight: "bg-rose-50",
      accentMed: "bg-rose-100",
      welcomeBg: "from-rose-50 via-pink-50 to-fuchsia-50",
      welcomeBorder: "border-rose-200/80",
      progressBg: "from-rose-400 to-pink-500",
    },
    SOSIAL: {
      cardBg: "from-sky-50/60 via-cyan-50/40 to-teal-50/30",
      headerBg: "from-sky-400 to-cyan-500",
      headerText: "text-sky-700",
      accentLight: "bg-sky-50",
      accentMed: "bg-sky-100",
      welcomeBg: "from-sky-50 via-cyan-50 to-teal-50",
      welcomeBorder: "border-sky-200/80",
      progressBg: "from-sky-400 to-cyan-500",
    },
    BELAJAR: {
      cardBg: "from-amber-50/60 via-yellow-50/40 to-orange-50/30",
      headerBg: "from-amber-400 to-orange-500",
      headerText: "text-amber-700",
      accentLight: "bg-amber-50",
      accentMed: "bg-amber-100",
      welcomeBg: "from-amber-50 via-yellow-50 to-orange-50",
      welcomeBorder: "border-amber-200/80",
      progressBg: "from-amber-400 to-orange-500",
    },
    KARIR: {
      cardBg: "from-violet-50/60 via-purple-50/40 to-fuchsia-50/30",
      headerBg: "from-violet-400 to-purple-500",
      headerText: "text-violet-700",
      accentLight: "bg-violet-50",
      accentMed: "bg-violet-100",
      welcomeBg: "from-violet-50 via-purple-50 to-fuchsia-50",
      welcomeBorder: "border-violet-200/80",
      progressBg: "from-violet-400 to-purple-500",
    },
  };

  const theme = fieldTheme[survey.field] || fieldTheme.PRIBADI;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => onNavigate("dcm")} className="rounded-xl hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl bg-gradient-to-br ${theme.headerBg} text-white shadow-md`}>
              {cfg.icon}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">{survey.title}</h2>
              <p className="text-sm text-gray-400">{survey.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Message - shown before first question */}
      {currentQuestion === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <div className={`rounded-2xl border-2 ${theme.welcomeBorder} bg-gradient-to-br ${theme.welcomeBg} overflow-hidden shadow-sm`}>
            {/* Decorative header strip */}
            <div className={`h-1.5 bg-gradient-to-r ${theme.headerBg}`} />
            <div className="p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-yellow-300 to-amber-400 flex items-center justify-center shadow-sm">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-bold text-gray-800">Selamat Datang di {cfg.label} Kelas {survey.grade}</h3>
              </div>
              <div className="space-y-2.5 text-sm text-gray-600 leading-relaxed">
                <p className="font-semibold text-gray-700 flex items-center gap-1.5">
                  <Heart className="h-4 w-4 text-pink-400" /> Halo, Siswa Sekalian!
                </p>
                <p>
                  Daftar Cek Masalah (DCM) ini dibuat untuk membantumu mengenali kondisi yang sedang kamu alami, baik terkait dirimu sendiri, pergaulan, kegiatan belajar, maupun rencana masa depan.
                </p>
                <p>
                  Cara mengisinya sangat mudah, kamu cukup meng-klik pada pilihan <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-semibold text-xs">IYA</span> jika pernyataan tersebut sesuai dengan kondisimu, atau pilihan <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-xs">TIDAK</span> jika tidak sesuai.
                </p>
                <p>
                  Tidak ada jawaban <span className="font-bold text-gray-800">BENAR</span> atau <span className="font-bold text-gray-800">SALAH</span>, jadi silakan jawab dengan jujur sesuai apa yang kamu rasakan dan alami.
                </p>
                <p>
                  Jawabanmu akan membantu Guru BK memberikan bimbingan yang tepat dan bermanfaat untukmu.
                </p>
                <div className="flex items-center gap-1.5 pt-1">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <p className="font-semibold text-teal-600">Terima kasih atas kejujuran dan partisipasimu!</p>
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Progress */}
      <div className="mb-5">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500 font-medium">Pernyataan <span className="text-gray-800">{currentQuestion + 1}</span> dari <span className="text-gray-800">{questions.length}</span></span>
          <span className={`font-semibold px-2.5 py-0.5 rounded-full text-xs ${theme.accentMed} ${theme.headerText}`}>
            {Math.round(progress)}% selesai
          </span>
        </div>
        <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${theme.progressBg} rounded-full`}
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-full" />
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className={`rounded-2xl border border-gray-200/80 bg-gradient-to-br ${theme.cardBg} shadow-lg shadow-gray-100/50 overflow-hidden`}>
            {/* Question number strip */}
            <div className={`h-1 bg-gradient-to-r ${theme.headerBg}`} />
            
            <div className="p-5 pb-3">
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br ${theme.headerBg} text-white text-xs font-bold shadow-sm`}>
                  {q?.order}
                </span>
                <span className="text-xs text-gray-400 font-medium">Pernyataan</span>
              </div>
              <h3 className="text-lg font-semibold leading-relaxed text-gray-800">{q?.text}</h3>
            </div>

            <div className="px-5 pb-4">
              <div className="grid grid-cols-2 gap-3">
                {/* IYA Button */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => q && setAnswers({ ...answers, [q.id]: "IYA" })}
                  className={`relative p-5 rounded-2xl border-2 transition-all text-center font-semibold group overflow-hidden ${
                    answers[q?.id || ""] === "IYA"
                      ? "border-rose-400 bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 text-rose-700 shadow-lg shadow-rose-100/50"
                      : "border-gray-200/80 bg-white/80 text-gray-500 hover:border-rose-300 hover:bg-rose-50/60"
                  }`}
                >
                  {answers[q?.id || ""] === "IYA" && (
                    <div className="absolute top-2 right-2">
                      <span className="w-5 h-5 rounded-full bg-rose-400 flex items-center justify-center">
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      </span>
                    </div>
                  )}
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-2xl flex items-center justify-center transition-all ${
                    answers[q?.id || ""] === "IYA"
                      ? "bg-gradient-to-br from-rose-400 to-pink-500 shadow-md"
                      : "bg-rose-100/60 group-hover:bg-rose-200/80"
                  }`}>
                    <CheckCircle2 className={`h-6 w-6 transition-all ${
                      answers[q?.id || ""] === "IYA" ? "text-white" : "text-rose-400 group-hover:text-rose-500"
                    }`} />
                  </div>
                  <span className="text-lg">IYA</span>
                  <p className="text-xs text-gray-400 mt-1">Ya, saya mengalami</p>
                </motion.button>

                {/* TIDAK Button */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => q && setAnswers({ ...answers, [q.id]: "TIDAK" })}
                  className={`relative p-5 rounded-2xl border-2 transition-all text-center font-semibold group overflow-hidden ${
                    answers[q?.id || ""] === "TIDAK"
                      ? "border-emerald-400 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 text-emerald-700 shadow-lg shadow-emerald-100/50"
                      : "border-gray-200/80 bg-white/80 text-gray-500 hover:border-emerald-300 hover:bg-emerald-50/60"
                  }`}
                >
                  {answers[q?.id || ""] === "TIDAK" && (
                    <div className="absolute top-2 right-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center">
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      </span>
                    </div>
                  )}
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-2xl flex items-center justify-center transition-all ${
                    answers[q?.id || ""] === "TIDAK"
                      ? "bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md"
                      : "bg-emerald-100/60 group-hover:bg-emerald-200/80"
                  }`}>
                    <XCircle className={`h-6 w-6 transition-all ${
                      answers[q?.id || ""] === "TIDAK" ? "text-white" : "text-emerald-400 group-hover:text-emerald-500"
                    }`} />
                  </div>
                  <span className="text-lg">TIDAK</span>
                  <p className="text-xs text-gray-400 mt-1">Tidak, saya tidak mengalami</p>
                </motion.button>
              </div>
            </div>

            {/* Footer Navigation */}
            <div className="px-5 pb-4 pt-1 flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className="rounded-xl border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Sebelumnya
              </Button>
              {currentQuestion === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || Object.values(answers).some((a) => !a)}
                  className={`bg-gradient-to-r ${theme.headerBg} hover:opacity-90 text-white rounded-xl shadow-md disabled:opacity-50`}
                >
                  {submitting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Selesai
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                  className={`bg-gradient-to-r ${theme.headerBg} hover:opacity-90 text-white rounded-xl shadow-md`}
                >
                  Selanjutnya <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Question Navigator */}
      <div className="mt-5">
        <div className={`rounded-2xl border border-gray-200/60 bg-white/70 backdrop-blur-sm shadow-sm overflow-hidden`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">Navigasi Pernyataan</p>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" /> Dijawab
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-200" /> Belum
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {questions.map((q, i) => {
                const isCurrent = i === currentQuestion;
                const isAnswered = !!answers[q.id];
                return (
                  <motion.button
                    key={q.id}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentQuestion(i)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all duration-200 ${
                      isCurrent
                        ? `bg-gradient-to-br ${theme.headerBg} text-white shadow-md scale-110`
                        : isAnswered
                        ? "bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600 shadow-sm hover:shadow"
                        : "bg-gray-100/80 text-gray-400 hover:bg-gray-200/80 hover:text-gray-500"
                    }`}
                  >
                    {i + 1}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
