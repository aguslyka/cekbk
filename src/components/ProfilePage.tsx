"use client";

import React, { useState } from "react";
import {
  ArrowLeft, Phone, Pencil, Check, X, Trash2, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth, apiFetch, type View } from "@/lib/app-shared";
import { toast } from "@/hooks/use-toast";

export default function ProfilePage({ onNavigate }: { onNavigate: (view: View) => void }) {
  const { user, setUser, logout } = useAuth();

  const [editingWhatsApp, setEditingWhatsApp] = useState(false);
  const [whatsappValue, setWhatsappValue] = useState("");
  const [savingWhatsApp, setSavingWhatsApp] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  if (!user) return null;

  // Format WhatsApp for display and link
  const formatWaDisplay = (wa: string) => {
    if (wa.startsWith("0")) return wa;
    if (wa.startsWith("62")) return "0" + wa.slice(2);
    return wa;
  };
  const formatWaLink = (wa: string) => {
    if (wa.startsWith("0")) return "62" + wa.slice(1);
    if (wa.startsWith("62")) return wa;
    if (wa.startsWith("+62")) return wa.slice(1);
    return "62" + wa;
  };

  const handleEditWhatsApp = () => {
    setWhatsappValue(user.whatsapp || "");
    setEditingWhatsApp(true);
  };

  const handleCancelWhatsApp = () => {
    setEditingWhatsApp(false);
    setWhatsappValue("");
  };

  const handleSaveWhatsApp = async () => {
    setSavingWhatsApp(true);
    try {
      const data = await apiFetch("/api/user/profile", {
        method: "PATCH",
        body: JSON.stringify({ whatsapp: whatsappValue }),
      }, user.id, user.role, String(user.grade));

      setUser(data.user);
      setEditingWhatsApp(false);
      toast({
        title: "Berhasil",
        description: "Nomor WhatsApp berhasil diperbarui",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Gagal memperbarui WhatsApp",
        variant: "destructive",
      });
    } finally {
      setSavingWhatsApp(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "HAPUS") return;
    setDeleting(true);
    try {
      await apiFetch("/api/user/profile", {
        method: "DELETE",
      }, user.id, user.role, String(user.grade));

      toast({
        title: "Akun dihapus",
        description: "Akun dan semua data terkait telah dihapus",
      });
      logout();
      onNavigate("landing");
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Gagal menghapus akun",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setDeleteConfirmText("");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => onNavigate("dashboard")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-bold">Profil</h2>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-teal-100 text-teal-700 text-2xl font-bold">
                {user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
              </AvatarFallback>
              <AvatarImage src={user.image} />
            </Avatar>
            <div>
              <h3 className="text-xl font-bold">{user.name}</h3>
              <p className="text-gray-500">{user.email}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge className="bg-teal-100 text-teal-700">Kelas {user.grade}</Badge>
                {user.jenisKelamin && (
                  <Badge className={user.jenisKelamin === "LAKI-LAKI" ? "bg-sky-100 text-sky-700" : "bg-pink-100 text-pink-700"}>
                    {user.jenisKelamin === "LAKI-LAKI" ? "Laki-laki" : "Perempuan"}
                  </Badge>
                )}
                {user.whatsapp && (
                  <Badge className="bg-green-100 text-green-700">
                    <Phone className="h-3 w-3 mr-1" />
                    {formatWaDisplay(user.whatsapp)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Nama</span>
              <span className="font-medium">{user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Jenis Kelamin</span>
              {user.jenisKelamin ? (
                <Badge className={user.jenisKelamin === "LAKI-LAKI" ? "bg-sky-100 text-sky-700" : "bg-pink-100 text-pink-700"}>
                  {user.jenisKelamin === "LAKI-LAKI" ? "Laki-laki" : "Perempuan"}
                </Badge>
              ) : (
                <span className="text-gray-400 italic">Belum diisi</span>
              )}
            </div>

            {/* WhatsApp — Editable */}
            <div className="flex justify-between items-center">
              <span className="text-gray-500">No. WhatsApp</span>
              {editingWhatsApp ? (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <Input
                      type="tel"
                      placeholder="08xxxxxxxxxx"
                      className="pl-8 h-8 text-sm w-44"
                      value={whatsappValue}
                      onChange={(e) => setWhatsappValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveWhatsApp();
                        if (e.key === "Escape") handleCancelWhatsApp();
                      }}
                      autoFocus
                      disabled={savingWhatsApp}
                    />
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={handleSaveWhatsApp}
                    disabled={savingWhatsApp}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={handleCancelWhatsApp}
                    disabled={savingWhatsApp}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {user.whatsapp ? (
                    <a
                      href={`https://wa.me/${formatWaLink(user.whatsapp)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-green-600 hover:text-green-700 hover:underline flex items-center gap-1.5"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {formatWaDisplay(user.whatsapp)}
                    </a>
                  ) : (
                    <span className="text-gray-400 italic">Belum diisi</span>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-gray-400 hover:text-teal-600 hover:bg-teal-50"
                    onClick={handleEditWhatsApp}
                    title={user.whatsapp ? "Ubah nomor WhatsApp" : "Tambah nomor WhatsApp"}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Kelas</span>
              <span className="font-medium">{user.grade}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Role</span>
              <span className="font-medium">{user.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Hari / Tanggal</span>
              <span className="font-medium">
                {user.createdAt ? (() => {
                  const d = new Date(user.createdAt);
                  const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][d.getDay()];
                  const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][d.getMonth()];
                  return `${hari}, ${d.getDate()} ${bulan} ${d.getFullYear()}`;
                })() : "-"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      {user.role !== "ADMIN" && (
        <Card className="mt-6 border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Zona Berbahaya
            </CardTitle>
            <CardDescription>
              Tindakan ini tidak dapat dibatalkan. Semua data yang terkait dengan akunmu akan dihapus permanen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={deleteDialogOpen} onOpenChange={(open) => {
              setDeleteDialogOpen(open);
              if (!open) setDeleteConfirmText("");
            }}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Hapus Akun
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    Hapus Akun Permanen?
                  </DialogTitle>
                  <DialogDescription asChild>
                    <div className="space-y-3">
                      <p>
                        Akun dan semua data terkait akan dihapus permanen, termasuk:
                      </p>
                      <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
                        <li>Semua jawaban survey (DCM) yang telah diisi</li>
                        <li>Semua hasil analisa dan laporan</li>
                        <li>Data konseling yang terkait</li>
                      </ul>
                      <p className="font-medium text-red-600">
                        Tindakan ini TIDAK DAPAT dibatalkan!
                      </p>
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">
                          Ketik <span className="font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">HAPUS</span> untuk mengkonfirmasi:
                        </p>
                        <Input
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          placeholder="Ketik HAPUS"
                          className="border-red-200 focus:border-red-400"
                        />
                      </div>
                    </div>
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDeleteDialogOpen(false);
                      setDeleteConfirmText("");
                    }}
                    disabled={deleting}
                  >
                    Batal
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== "HAPUS" || deleting}
                  >
                    {deleting ? "Menghapus..." : "Hapus Akun Permanen"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
