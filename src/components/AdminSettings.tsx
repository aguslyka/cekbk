"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, Settings, RefreshCw, CheckCircle2, Bot, Zap, AlertCircle, Eye, EyeOff, Wifi, WifiOff, Globe, Upload, Trash2, Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useAuth, apiFetch, KopSurat, type View } from "@/lib/app-shared";

export default function AdminSettings({ onNavigate }: { onNavigate: (view: View) => void }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    schoolName: "",
    schoolNpsn: "",
    schoolAddress: "",
    schoolPhone: "",
    schoolEmail: "",
    bkCoordinator: "",
    bkCoordinatorNip: "",
    schoolPrincipal: "",
    schoolPrincipalNip: "",
    academicYear: "",
  });
  const [schoolLogo, setSchoolLogo] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Config state
  const [aiForm, setAiForm] = useState({
    aiProvider: "zai",
    aiApiKey: "",
    aiBaseUrl: "",
    aiModel: "",
  });
  const [testingAi, setTestingAi] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [aiStatus, setAiStatus] = useState<"unknown" | "connected" | "disconnected" | "testing">("unknown");

  useEffect(() => {
    if (!user) return;
    apiFetch("/api/admin/settings", {}, user.id, user.role, String(user.grade))
      .then((data) => {
        const s = data.settings || {};
        setSettings(s);
        setForm({
          schoolName: s.schoolName || "",
          schoolNpsn: s.schoolNpsn || "",
          schoolAddress: s.schoolAddress || "",
          schoolPhone: s.schoolPhone || "",
          schoolEmail: s.schoolEmail || "",
          bkCoordinator: s.bkCoordinator || "",
          bkCoordinatorNip: s.bkCoordinatorNip || "",
          schoolPrincipal: s.schoolPrincipal || "",
          schoolPrincipalNip: s.schoolPrincipalNip || "",
          academicYear: s.academicYear || "",
        });
        setSchoolLogo(s.schoolLogo || "");
        setAiForm({
          aiProvider: s.aiProvider || "zai",
          aiApiKey: s.aiApiKey || "",
          aiBaseUrl: s.aiBaseUrl || "",
          aiModel: s.aiModel || "",
        });

        // Auto-test AI connection on load
        const provider = s.aiProvider || "zai";
        if (provider === "zai" || (s.aiApiKey && s.aiBaseUrl)) {
          // Auto-test the connection silently
          setAiStatus("testing"); // Show testing state
          apiFetch("/api/admin/ai-config/test", {
            method: "POST",
          }, user!.id, user!.role, String(user!.grade))
            .then((result) => {
              if (result.success) {
                setAiStatus("connected");
                setTestResult({ success: true, message: result.message || "Z AI Service terhubung" });
              } else {
                setAiStatus("disconnected");
                setTestResult({ success: false, message: result.message || "Gagal terhubung" });
              }
            })
            .catch(() => {
              setAiStatus("disconnected");
              setTestResult({ success: false, message: "Gagal terhubung ke AI service" });
            });
        } else {
          setAiStatus("disconnected");
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ title: "Error", description: "File harus berupa gambar (PNG, JPG, SVG, dll)", variant: "destructive" });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Error", description: "Ukuran file terlalu besar. Maksimal 2MB.", variant: "destructive" });
      return;
    }

    setUploadingLogo(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target?.result as string;
        if (!user) return;

        const result = await apiFetch("/api/admin/settings/logo", {
          method: "POST",
          body: JSON.stringify({ logo: base64 }),
        }, user.id, user.role, String(user.grade));

        if (result.success) {
          setSchoolLogo(base64);
          toast({ title: "Berhasil", description: "Logo berhasil diupload" });
        }
      };
      reader.readAsDataURL(file);
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Gagal upload logo", variant: "destructive" });
    } finally {
      setUploadingLogo(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleLogoDelete = async () => {
    if (!user) return;
    try {
      const result = await apiFetch("/api/admin/settings/logo", {
        method: "DELETE",
      }, user.id, user.role, String(user.grade));
      if (result.success) {
        setSchoolLogo("");
        toast({ title: "Berhasil", description: "Logo berhasil dihapus" });
      }
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Gagal menghapus logo", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const data = await apiFetch("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify({ ...form, ...aiForm }),
      }, user.id, user.role, String(user.grade));
      setSettings(data.settings || {});
      toast({ title: "Berhasil", description: "Pengaturan berhasil disimpan" });
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Gagal menyimpan", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleTestAi = async () => {
    if (!user) return;
    setTestingAi(true);
    setTestResult(null);
    try {
      // First save the AI config
      await apiFetch("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify(aiForm),
      }, user.id, user.role, String(user.grade));

      // Then test the connection
      const result = await apiFetch("/api/admin/ai-config/test", {
        method: "POST",
      }, user.id, user.role, String(user.grade));

      // Test route returns 200 with success: true/false
      if (result.success) {
        setTestResult({ success: true, message: result.message || "Koneksi AI berhasil!" });
        setAiStatus("connected");
      } else {
        setTestResult({ success: false, message: result.message || "Gagal terhubung ke AI" });
        setAiStatus("disconnected");
      }
    } catch (err: unknown) {
      setTestResult({ success: false, message: err instanceof Error ? err.message : "Gagal terhubung ke AI" });
      setAiStatus("disconnected");
    } finally {
      setTestingAi(false);
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="h-64 bg-gray-200 rounded" /></div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => onNavigate("admin-dashboard")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Pengaturan</h2>
          <p className="text-gray-500">Kelola informasi profil sekolah</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-teal-600" />
            Profil Sekolah
          </CardTitle>
          <CardDescription>Informasi ini akan ditampilkan di kop surat laporan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Logo Upload */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Logo Sekolah</Label>
            <div className="flex items-start gap-4">
              {/* Logo Preview */}
              <div className="relative group">
                {schoolLogo ? (
                  <div className="w-20 h-20 rounded-xl border-2 border-gray-200 overflow-hidden bg-white shadow-sm">
                    <img
                      src={schoolLogo}
                      alt="Logo Sekolah"
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-2">
                <p className="text-xs text-gray-500">
                  Upload logo sekolah untuk kop surat dan sertifikat. Format: PNG, JPG, SVG. Maks: 2MB.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className="border-teal-200 text-teal-700 hover:bg-teal-50"
                  >
                    {uploadingLogo ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {uploadingLogo ? "Mengupload..." : "Upload Logo"}
                  </Button>
                  {schoolLogo && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleLogoDelete}
                      className="border-rose-200 text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Hapus
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-2" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama Sekolah</Label>
              <Input value={form.schoolName} onChange={(e) => setForm({ ...form, schoolName: e.target.value })} placeholder="SMP Negeri 1 Contoh" />
            </div>
            <div className="space-y-2">
              <Label>NPSN</Label>
              <Input value={form.schoolNpsn} onChange={(e) => setForm({ ...form, schoolNpsn: e.target.value })} placeholder="12345678" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Alamat</Label>
            <Textarea value={form.schoolAddress} onChange={(e) => setForm({ ...form, schoolAddress: e.target.value })} placeholder="Jl. Pendidikan No. 1" rows={2} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Telepon</Label>
              <Input value={form.schoolPhone} onChange={(e) => setForm({ ...form, schoolPhone: e.target.value })} placeholder="(021) 1234567" />
            </div>
            <div className="space-y-2">
              <Label>Email Sekolah</Label>
              <Input value={form.schoolEmail} onChange={(e) => setForm({ ...form, schoolEmail: e.target.value })} placeholder="sekolah@email.com" />
            </div>
          </div>

          <Separator className="my-4" />

          {/* Kepala Sekolah & Konselor Pendidikan Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Pejabat Penandatangan Sertifikat</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kepala Sekolah</Label>
                <Input value={form.schoolPrincipal} onChange={(e) => setForm({ ...form, schoolPrincipal: e.target.value })} placeholder="Nama Kepala Sekolah" />
              </div>
              <div className="space-y-2">
                <Label>NIP Kepala Sekolah</Label>
                <Input value={form.schoolPrincipalNip} onChange={(e) => setForm({ ...form, schoolPrincipalNip: e.target.value })} placeholder="NIP Kepala Sekolah" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label>Konselor Pendidikan</Label>
                <Input value={form.bkCoordinator} onChange={(e) => setForm({ ...form, bkCoordinator: e.target.value })} placeholder="Nama Konselor Pendidikan" />
              </div>
              <div className="space-y-2">
                <Label>NIP Konselor Pendidikan</Label>
                <Input value={form.bkCoordinatorNip} onChange={(e) => setForm({ ...form, bkCoordinatorNip: e.target.value })} placeholder="NIP Konselor Pendidikan" />
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tahun Ajaran</Label>
              <Input value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} placeholder="2024/2025" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => {
            setForm({ schoolName: settings.schoolName || "", schoolNpsn: settings.schoolNpsn || "", schoolAddress: settings.schoolAddress || "", schoolPhone: settings.schoolPhone || "", schoolEmail: settings.schoolEmail || "", bkCoordinator: settings.bkCoordinator || "", bkCoordinatorNip: settings.bkCoordinatorNip || "", schoolPrincipal: settings.schoolPrincipal || "", schoolPrincipalNip: settings.schoolPrincipalNip || "", academicYear: settings.academicYear || "" });
            setAiForm({ aiProvider: settings.aiProvider || "zai", aiApiKey: settings.aiApiKey || "", aiBaseUrl: settings.aiBaseUrl || "", aiModel: settings.aiModel || "" });
            setTestResult(null);
          }}>Reset</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-teal-600 hover:bg-teal-700">
            {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
            {saving ? "Menyimpan..." : "Simpan Pengaturan"}
          </Button>
        </CardFooter>
      </Card>

      {/* Preview KOP SURAT */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Preview Kop Surat</CardTitle>
        </CardHeader>
        <CardContent>
          <KopSurat schoolSettings={{ ...form, schoolLogo }} />
        </CardContent>
      </Card>

      {/* AI CONFIGURATION */}
      <Card className="mt-6 border-violet-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-violet-600" />
              Konfigurasi AI
            </CardTitle>
            {/* Connection Status Badge */}
            {aiStatus === "connected" && (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-100">
                <Wifi className="h-3 w-3 mr-1" /> Terhubung
              </Badge>
            )}
            {aiStatus === "disconnected" && (
              <Badge variant="outline" className="text-rose-600 border-rose-300 bg-rose-50">
                <WifiOff className="h-3 w-3 mr-1" /> Belum Terhubung
              </Badge>
            )}
            {(aiStatus === "unknown" || aiStatus === "testing") && (
              <Badge variant="outline" className={aiStatus === "testing" ? "text-violet-600 border-violet-300 bg-violet-50" : "text-gray-500 border-gray-300"}>
                {aiStatus === "testing" ? <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> : <Globe className="h-3 w-3 mr-1" />}
                {aiStatus === "testing" ? "Menguji..." : "Belum Dites"}
              </Badge>
            )}
          </div>
          <CardDescription>
            Pengaturan provider AI untuk fitur Generate AI Konseling. Jika menggunakan Z AI Service, biarkan default.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Provider Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Provider AI</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { value: "zai", label: "Z AI Service", desc: "Bawaan (default)", icon: "🚀" },
                { value: "openai", label: "OpenAI Compatible", desc: "ChatGPT, dll", icon: "🤖" },
                { value: "custom", label: "Custom API", desc: "Endpoint kustom", icon: "⚙️" },
              ].map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => { setAiForm({ ...aiForm, aiProvider: p.value }); setTestResult(null); }}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    aiForm.aiProvider === p.value
                      ? "border-violet-500 bg-violet-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{p.icon}</span>
                    <div>
                      <p className="text-sm font-semibold">{p.label}</p>
                      <p className="text-xs text-gray-500">{p.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* API Key */}
          {aiForm.aiProvider !== "zai" && (
            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="relative">
                <Input
                  type={showApiKey ? "text" : "password"}
                  value={aiForm.aiApiKey}
                  onChange={(e) => { setAiForm({ ...aiForm, aiApiKey: e.target.value }); setTestResult(null); }}
                  placeholder={aiForm.aiProvider === "openai" ? "sk-..." : "API_KEY_ANDA"}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500">Kunci API dari provider AI yang digunakan</p>
            </div>
          )}

          {/* Base URL */}
          {aiForm.aiProvider !== "zai" && (
            <div className="space-y-2">
              <Label>Base URL</Label>
              <Input
                value={aiForm.aiBaseUrl}
                onChange={(e) => { setAiForm({ ...aiForm, aiBaseUrl: e.target.value }); setTestResult(null); }}
                placeholder={aiForm.aiProvider === "openai" ? "https://api.openai.com/v1" : "http://localhost:8080/v1"}
              />
              <p className="text-xs text-gray-500">
                URL endpoint API (contoh: https://api.openai.com/v1)
              </p>
            </div>
          )}

          {/* Model */}
          {aiForm.aiProvider !== "zai" && (
            <div className="space-y-2">
              <Label>Model</Label>
              <Input
                value={aiForm.aiModel}
                onChange={(e) => { setAiForm({ ...aiForm, aiModel: e.target.value }); setTestResult(null); }}
                placeholder={aiForm.aiProvider === "openai" ? "gpt-3.5-turbo" : "default"}
              />
              <p className="text-xs text-gray-500">Nama model yang digunakan (opsional, gunakan default jika kosong)</p>
            </div>
          )}

          {/* Z AI Info */}
          {aiForm.aiProvider === "zai" && (
            <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center shrink-0">
                  <Zap className="h-5 w-5 text-violet-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-violet-800">Z AI Service (Bawaan)</p>
                    {aiStatus === "connected" && (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 text-[10px] px-1.5 py-0">
                        <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> Terhubung
                      </Badge>
                    )}
                    {aiStatus === "disconnected" && (
                      <Badge variant="outline" className="text-rose-600 border-rose-300 bg-rose-50 text-[10px] px-1.5 py-0">
                        <WifiOff className="h-2.5 w-2.5 mr-0.5" /> Gagal
                      </Badge>
                    )}
                    {aiStatus === "testing" && (
                      <Badge variant="outline" className="text-violet-600 border-violet-300 bg-violet-50 text-[10px] px-1.5 py-0">
                        <RefreshCw className="h-2.5 w-2.5 mr-0.5 animate-spin" /> Menguji...
                      </Badge>
                    )}
                    {(aiStatus === "unknown") && (
                      <Badge variant="outline" className="text-gray-500 border-gray-300 text-[10px] px-1.5 py-0">
                        <Globe className="h-2.5 w-2.5 mr-0.5" /> Belum Dites
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-violet-600 mt-1">
                    Menggunakan Z AI Service yang sudah terintegrasi. Tidak perlu konfigurasi tambahan — langsung bisa digunakan untuk Generate AI Konseling.
                  </p>
                  {aiStatus === "disconnected" && (
                    <p className="text-xs text-rose-600 mt-2 font-medium">
                      ⚠️ Z AI Service tidak tersedia di localhost. Silakan ganti ke <strong>OpenAI Compatible</strong> (Groq gratis) atau <strong>Custom API</strong>.
                    </p>
                  )}
                  {testResult && aiStatus === "connected" && (
                    <p className="text-xs text-emerald-600 mt-1 font-medium">
                      ✓ {testResult.message}
                    </p>
                  )}
                  {testResult && aiStatus === "disconnected" && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">
                      ✗ {testResult.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* OpenAI/Custom Config Info */}
          {aiForm.aiProvider !== "zai" && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                  <Globe className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-800">
                    {aiForm.aiProvider === "openai" ? "OpenAI Compatible" : "Custom API"}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    {aiForm.aiProvider === "openai"
                      ? "Hubungkan ke ChatGPT atau layanan OpenAI-compatible lainnya. Pastikan API Key dan Base URL sudah benar."
                      : "Hubungkan ke endpoint API kustom Anda. Pastikan endpoint mendukung format OpenAI Chat Completions."
                    }
                  </p>
                  {(!aiForm.aiApiKey || !aiForm.aiBaseUrl) && (
                    <p className="text-xs text-amber-700 mt-2 font-medium">
                      ⚠️ API Key dan Base URL wajib diisi untuk provider ini.
                    </p>
                  )}
                  {/* Quick setup guides */}
                  <div className="mt-3 space-y-2">
                    <details className="group">
                      <summary className="text-xs font-semibold text-amber-800 cursor-pointer hover:text-amber-900">
                        📘 Panduan Cepat: Groq (Gratis)
                      </summary>
                      <div className="mt-2 p-2.5 bg-white/70 rounded-lg border border-amber-200 text-xs text-amber-800 space-y-1.5">
                        <p>1. Daftar di <span className="font-mono bg-amber-100 px-1">console.groq.com</span></p>
                        <p>2. Buat API Key di menu API Keys</p>
                        <p>3. Isi konfigurasi:</p>
                        <div className="ml-3 space-y-0.5 font-mono text-[10px]">
                          <p>API Key: <span className="bg-amber-100 px-1">gsk_...</span></p>
                          <p>Base URL: <span className="bg-amber-100 px-1">https://api.groq.com/openai/v1</span></p>
                          <p>Model: <span className="bg-amber-100 px-1">llama-3.3-70b-versatile</span></p>
                        </div>
                        <p className="text-[10px] text-amber-600">💡 Model lain: llama-3.1-8b-instant, mixtral-8x7b-32768</p>
                      </div>
                    </details>
                    <details className="group">
                      <summary className="text-xs font-semibold text-amber-800 cursor-pointer hover:text-amber-900">
                        📘 Panduan Cepat: OpenAI
                      </summary>
                      <div className="mt-2 p-2.5 bg-white/70 rounded-lg border border-amber-200 text-xs text-amber-800 space-y-1.5">
                        <p>1. Daftar di <span className="font-mono bg-amber-100 px-1">platform.openai.com</span></p>
                        <p>2. Buat API Key</p>
                        <p>3. Isi konfigurasi:</p>
                        <div className="ml-3 space-y-0.5 font-mono text-[10px]">
                          <p>API Key: <span className="bg-amber-100 px-1">sk-...</span></p>
                          <p>Base URL: <span className="bg-amber-100 px-1">https://api.openai.com/v1</span></p>
                          <p>Model: <span className="bg-amber-100 px-1">gpt-3.5-turbo</span></p>
                        </div>
                      </div>
                    </details>
                    <details className="group">
                      <summary className="text-xs font-semibold text-amber-800 cursor-pointer hover:text-amber-900">
                        📘 Custom API (Ollama, LM Studio)
                      </summary>
                      <div className="mt-2 p-2.5 bg-white/70 rounded-lg border border-amber-200 text-xs text-amber-800 space-y-1.5">
                        <p>Gunakan provider <strong>Custom API</strong> untuk server lokal.</p>
                        <p>Ollama: <span className="font-mono bg-amber-100 px-1">http://localhost:11434/v1</span></p>
                        <p>LM Studio: <span className="font-mono bg-amber-100 px-1">http://localhost:1234/v1</span></p>
                        <p className="text-[10px] text-amber-600">💡 API Key bisa diisi sembarang teks untuk server lokal</p>
                      </div>
                    </details>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Test Result */}
          {testResult && (
            <div className={`p-3 rounded-lg flex items-start gap-2 ${
              testResult.success ? "bg-emerald-50 border border-emerald-200" : "bg-rose-50 border border-rose-200"
            }`}>
              {testResult.success
                ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                : <AlertCircle className="h-4 w-4 text-rose-600 mt-0.5 shrink-0" />
              }
              <div className="flex-1">
                <p className={`text-xs ${testResult.success ? "text-emerald-700" : "text-rose-700"}`}>
                  {testResult.message}
                </p>
                {!testResult.success && testResult.message?.includes("403") && (
                  <div className="mt-2 p-2 bg-white/70 rounded border border-rose-200 text-xs text-rose-800 space-y-1">
                    <p className="font-semibold">Cara Memperbaiki:</p>
                    <p>1. Buka <span className="font-mono bg-rose-100 px-1">console.groq.com</span></p>
                    <p>2. Login dan buat API Key <strong>baru</strong></p>
                    <p>3. Pastikan key dimulai dengan <span className="font-mono bg-rose-100 px-1">gsk_</span></p>
                    <p>4. Salin key baru dan paste di kolom API Key di atas</p>
                    <p>5. Klik <strong>Test Koneksi AI</strong> untuk verifikasi</p>
                  </div>
                )}
                {!testResult.success && testResult.message?.includes("API Key tidak valid") && !testResult.message?.includes("403") && (
                  <div className="mt-2 p-2 bg-white/70 rounded border border-rose-200 text-xs text-rose-800 space-y-1">
                    <p className="font-semibold">Tips:</p>
                    <p>&#8226; Pastikan API Key sudah benar (tidak ada spasi ekstra)</p>
                    <p>&#8226; Cek apakah key masih aktif di dashboard provider</p>
                    <p>&#8226; Buat key baru jika yang lama sudah expired</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Test Button */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleTestAi}
              disabled={testingAi}
              className="border-violet-200 text-violet-700 hover:bg-violet-50"
            >
              {testingAi
                ? <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                : <Zap className="h-4 w-4 mr-2" />
              }
              {testingAi ? "Menguji..." : "Test Koneksi AI"}
            </Button>
            {aiForm.aiProvider !== "zai" && !aiForm.aiApiKey && (
              <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                <AlertCircle className="h-3 w-3 mr-1" /> API Key belum diisi
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
