"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft, Settings, RefreshCw, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
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
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const data = await apiFetch("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify(form),
      }, user.id, user.role, String(user.grade));
      setSettings(data.settings || {});
      toast({ title: "Berhasil", description: "Pengaturan berhasil disimpan" });
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Gagal menyimpan", variant: "destructive" });
    } finally {
      setSaving(false);
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

          {/* Pejabat Penandatangan Section */}
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
          <KopSurat schoolSettings={form} />
        </CardContent>
      </Card>
    </div>
  );
}
