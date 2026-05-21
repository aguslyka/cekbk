"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LogIn, UserPlus, Eye, EyeOff,
  RefreshCw, Phone, Mail, Lock,
  GraduationCap, MapPin, Hash, User, Calendar,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useAuth, apiFetch, FIELD_CONFIG } from "@/lib/app-shared";

export default function LandingPage() {
  const { setUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [schoolInfo, setSchoolInfo] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    jenisKelamin: "",
    password: "",
    confirmPassword: "",
    grade: "",
  });

  // Fetch school settings for profil sekolah section
  useEffect(() => {
    apiFetch("/api/settings", {})
      .then((data) => setSchoolInfo(data.settings || {}))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const data = await apiFetch("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        });
        setUser(data.user);
        toast({ title: "Login berhasil!", description: `Selamat datang, ${data.user.name}` });
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast({ title: "Error", description: "Password tidak cocok", variant: "destructive" });
          setLoading(false);
          return;
        }
        if (!formData.name || !formData.email || !formData.whatsapp || !formData.jenisKelamin || !formData.grade) {
          toast({ title: "Error", description: "Semua field wajib diisi", variant: "destructive" });
          setLoading(false);
          return;
        }
        const data = await apiFetch("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            whatsapp: formData.whatsapp,
            jenisKelamin: formData.jenisKelamin,
            password: formData.password,
            grade: Number(formData.grade),
          }),
        });
        setUser(data.user);
        toast({ title: "Registrasi berhasil!", description: `Selamat datang, ${data.user.name}` });
      }
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {schoolInfo.schoolLogo ? (
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm flex items-center justify-center">
                <img src={schoolInfo.schoolLogo} alt="Logo Sekolah" className="w-full h-full object-contain p-0.5" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                BK
              </div>
            )}
            <div>
              <h1 className="font-bold text-lg text-gray-900">CekDiriBK.id</h1>
              <p className="text-xs text-gray-500">Self-Assessment BK</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Badge className="mb-4 bg-teal-100 text-teal-700 hover:bg-teal-100">
            Self-Assessment Bimbingan Konseling
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Kenali Dirimu, <span className="text-teal-600">Pahami Masalahmu</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-2">
            Temukan solusi terbaik bersama BK
          </p>
          <p className="text-sm text-gray-500 max-w-xl mx-auto">
            DCM (Daftar Cek Masalah) adalah daftar untuk membantu kamu mengenali berbagai masalah
            yang mungkin kamu alami, seperti pribadi, sosial, belajar, karir. Jawabanmu akan dijaga
            kerahasiaannya dan hanya digunakan untuk membantumu.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10"
        >
          {Object.entries(FIELD_CONFIG).map(([key, cfg]) => (
            <Card key={key} className="border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <div className={`inline-flex p-3 rounded-xl mb-2 ${cfg.bgColor} ${cfg.color}`}>
                  {cfg.icon}
                </div>
                <h3 className="font-semibold text-sm">{cfg.label}</h3>
                <p className="text-xs text-gray-500 mt-1">{cfg.description}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </section>

      {/* Profil Sekolah Section */}
      {schoolInfo.schoolName && (
        <section className="max-w-4xl mx-auto px-4 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="border shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-8 w-8 text-white" />
                  <div>
                    <h3 className="text-xl font-bold text-white">Profil Sekolah</h3>
                    <p className="text-teal-100 text-sm">Informasi sekolah penyelenggara assessment</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  {schoolInfo.schoolLogo && (
                    <div className="mb-3 flex justify-center">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border-2 border-gray-200 shadow-sm flex items-center justify-center">
                        <img src={schoolInfo.schoolLogo} alt="Logo Sekolah" className="w-full h-full object-contain p-1" />
                      </div>
                    </div>
                  )}
                  <h4 className="text-lg font-bold text-gray-900 uppercase">{schoolInfo.schoolName}</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {schoolInfo.schoolAddress && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <MapPin className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-gray-500">Alamat</p>
                        <p className="text-sm text-gray-900">{schoolInfo.schoolAddress}</p>
                      </div>
                    </div>
                  )}
                  {schoolInfo.schoolPhone && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <Phone className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-gray-500">Telepon</p>
                        <p className="text-sm text-gray-900">{schoolInfo.schoolPhone}</p>
                      </div>
                    </div>
                  )}
                  {schoolInfo.schoolEmail && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <Mail className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-gray-500">Email</p>
                        <p className="text-sm text-gray-900">{schoolInfo.schoolEmail}</p>
                      </div>
                    </div>
                  )}
                  {schoolInfo.schoolNpsn && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <Hash className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-gray-500">NPSN</p>
                        <p className="text-sm text-gray-900">{schoolInfo.schoolNpsn}</p>
                      </div>
                    </div>
                  )}
                  {schoolInfo.bkCoordinator && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <User className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-gray-500">Koordinator BK</p>
                        <p className="text-sm text-gray-900">{schoolInfo.bkCoordinator}</p>
                      </div>
                    </div>
                  )}
                  {schoolInfo.academicYear && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <Calendar className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-gray-500">Tahun Ajaran</p>
                        <p className="text-sm text-gray-900">{schoolInfo.academicYear}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>
      )}

      {/* Auth Section */}
      <section className="max-w-md mx-auto px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="shadow-lg border-0 shadow-teal-100">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl">
                {isLogin ? "Selamat Datang!" : "Buat Akun Baru"}
              </CardTitle>
              <CardDescription>
                {isLogin
                  ? "Masuk untuk memulai perjalanan mengenali dirimu"
                  : "Daftar untuk memulai perjalanan mengenali dirimu bersama CekDiriBK.id"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap <span className="text-red-500">*</span></Label>
                    <Input
                      id="name"
                      placeholder="Masukkan nama lengkap"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="contoh@email.com"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">No. WhatsApp <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="whatsapp"
                        type="tel"
                        placeholder="08xxxxxxxxxx"
                        className="pl-10"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                )}
                {!isLogin && (
                  <div className="space-y-2">
                    <Label>Jenis Kelamin <span className="text-red-500">*</span></Label>
                    <Select
                      value={formData.jenisKelamin}
                      onValueChange={(val) => setFormData({ ...formData, jenisKelamin: val })}
                    >
                      <SelectTrigger className={!formData.jenisKelamin ? "border-red-300" : ""}>
                        <SelectValue placeholder="Pilih jenis kelamin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LAKI-LAKI">Laki-laki</SelectItem>
                        <SelectItem value="PEREMPUAN">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                    {!formData.jenisKelamin && (
                      <p className="text-xs text-red-400">Jenis kelamin wajib diisi</p>
                    )}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan password"
                      className="pl-10 pr-10"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">Klik ikon mata untuk menampilkan password</p>
                </div>
                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Konfirmasi Password <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Ulangi password"
                          className="pl-10 pr-10"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Jenjang Kelas <span className="text-red-500">*</span></Label>
                      <Select
                        value={formData.grade}
                        onValueChange={(val) => setFormData({ ...formData, grade: val })}
                      >
                        <SelectTrigger className={!formData.grade ? "border-red-300" : ""}>
                          <SelectValue placeholder="Pilih kelas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">Kelas 7</SelectItem>
                          <SelectItem value="8">Kelas 8</SelectItem>
                          <SelectItem value="9">Kelas 9</SelectItem>
                        </SelectContent>
                      </Select>
                      {!formData.grade && (
                        <p className="text-xs text-red-400">Jenjang kelas wajib dipilih</p>
                      )}
                    </div>
                  </>
                )}
                <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={loading || (!isLogin && (!formData.name || !formData.email || !formData.whatsapp || !formData.jenisKelamin || !formData.password || !formData.confirmPassword || !formData.grade))}>
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : isLogin ? (
                    <LogIn className="h-4 w-4 mr-2" />
                  ) : (
                    <UserPlus className="h-4 w-4 mr-2" />
                  )}
                  {loading ? "Memproses..." : isLogin ? "Masuk" : "Daftar"}
                </Button>
              </form>
              <div className="mt-4 text-center">
                <Separator className="my-3" />
                <p className="text-sm text-gray-500">
                  {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-teal-600 font-medium hover:underline"
                  >
                    {isLogin ? "Daftar sekarang" : "Masuk"}
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center">
          {schoolInfo.schoolName && (
            <div className="mb-3 flex flex-col items-center gap-2">
              {schoolInfo.schoolLogo && (
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-gray-200 shadow-sm flex items-center justify-center">
                  <img src={schoolInfo.schoolLogo} alt="Logo Sekolah" className="w-full h-full object-contain p-0.5" />
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-700">{schoolInfo.schoolName}</p>
                {schoolInfo.schoolAddress && <p className="text-xs text-gray-500">{schoolInfo.schoolAddress}</p>}
              </div>
            </div>
          )}
          <p className="text-sm text-gray-500">
            Hak Cipta dan Dibuat oleh Team 6. Didukung oleh CekDiriBK.id
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Kenali dirimu, Pahami masalahmu, dan temukan solusi terbaik bersama BK.
          </p>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/6281234567890?text=Halo%20Guru%20BK%2C%20saya%20ingin%20bertanya%20tentang%20CekDiriBK"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 print:hidden"
        title="Hubungi via WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </div>
  );
}
