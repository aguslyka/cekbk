"use client";

import React from "react";
import {
  Home, Users, BookOpen, ClipboardList, FileText,
  LayoutDashboard, MessageSquare, PieChart as PieChartIcon,
  Settings, Download, User, LogOut, X, Menu, BarChart3,
  Award, GraduationCap, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth, type View } from "@/lib/app-shared";

export default function SidebarNav({ currentView, onNavigate, isOpen, onClose }: {
  currentView: View;
  onNavigate: (view: View) => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user, logout } = useAuth();
  if (!user) return null;

  const isAdmin = user.role === "ADMIN";

  const userMenuItems = [
    { view: "dashboard" as View, label: "Selamat Datang", icon: <Home className="h-4 w-4" /> },
    { view: "profile" as View, label: "Profil", icon: <User className="h-4 w-4" /> },
    { view: "dcm" as View, label: "Daftar Cek Masalah", icon: <ClipboardList className="h-4 w-4" /> },
    { view: "results" as View, label: "Hasil Analisa", icon: <PieChartIcon className="h-4 w-4" /> },
    { view: "student-report" as View, label: "Laporan Survey", icon: <FileText className="h-4 w-4" /> },
  ];

  const adminMenuItems = [
    { view: "admin-dashboard" as View, label: "Dashboard Admin", icon: <LayoutDashboard className="h-4 w-4" /> },
    { view: "admin-users" as View, label: "Kelola User", icon: <Users className="h-4 w-4" /> },
    { view: "admin-surveys" as View, label: "Kelola Survey", icon: <ClipboardList className="h-4 w-4" /> },
    { view: "admin-counseling" as View, label: "Konseling BK", icon: <MessageSquare className="h-4 w-4" /> },
    { view: "admin-analysis" as View, label: "Hasil Analisa", icon: <PieChartIcon className="h-4 w-4" /> },
    { view: "admin-certificate" as View, label: "Sertifikat", icon: <Award className="h-4 w-4" /> },
    { view: "admin-monitoring" as View, label: "Monitoring", icon: <BarChart3 className="h-4 w-4" /> },
    { view: "admin-report" as View, label: "Laporan Survey", icon: <FileText className="h-4 w-4" /> },
    { view: "admin-import" as View, label: "Import / Export", icon: <Download className="h-4 w-4" /> },
    { view: "admin-settings" as View, label: "Pengaturan", icon: <Settings className="h-4 w-4" /> },
  ];

  const handleLogout = () => {
    logout();
    onNavigate("landing");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />}

      <aside className={`fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-slate-50 to-white border-r border-gray-200/80 shadow-xl z-50 transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 p-4">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-50" />
          <div className="flex items-center gap-3 relative">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white font-bold text-base shadow-lg ring-1 ring-white/30">
              BK
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">CekDiriBK.id</h3>
              <p className="text-[11px] text-teal-100">Self-Assessment BK</p>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto md:hidden text-white hover:bg-white/20" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-teal-200 ring-offset-2 ring-offset-white">
              <AvatarFallback className="bg-gradient-to-br from-teal-400 to-emerald-500 text-white text-sm font-bold shadow-md">
                {user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate text-gray-800">{user.name}</p>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-gray-500">Kelas {user.grade}</span>
                <span className="text-gray-300">•</span>
                <span className={`text-[11px] font-medium px-1.5 py-0 rounded-full ${
                  isAdmin 
                    ? "bg-rose-100 text-rose-700" 
                    : "bg-teal-100 text-teal-700"
                }`}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 h-[calc(100vh-210px)]">
          <nav className="p-3 space-y-3">
            {/* Menu Siswa Section */}
            <div className="rounded-xl bg-gradient-to-br from-teal-50/80 via-emerald-50/40 to-cyan-50/60 border border-teal-100/60 overflow-hidden">
              {/* Section Header */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-teal-100/50 bg-gradient-to-r from-teal-100/50 to-transparent">
                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-sm">
                  <GraduationCap className="h-3 w-3 text-white" />
                </div>
                <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">Menu Siswa</span>
              </div>
              {/* Menu Items */}
              <div className="p-1.5 space-y-0.5">
                {userMenuItems.map((item) => {
                  const isActive = currentView === item.view;
                  return (
                    <button
                      key={item.view}
                      onClick={() => { onNavigate(item.view); onClose(); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all duration-200 group ${
                        isActive
                          ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold shadow-md shadow-teal-200/50"
                          : "text-teal-800 hover:bg-white/70 hover:shadow-sm"
                      }`}
                    >
                      <span className={`transition-all duration-200 ${
                        isActive ? "text-white scale-110" : "text-teal-500 group-hover:text-teal-600 group-hover:scale-110"
                      }`}>
                        {item.icon}
                      </span>
                      {item.label}
                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Menu Admin Section */}
            {isAdmin && (
              <div className="rounded-xl bg-gradient-to-br from-rose-50/80 via-orange-50/40 to-amber-50/60 border border-rose-100/60 overflow-hidden">
                {/* Section Header */}
                <div className="flex items-center gap-2 px-3 py-2 border-b border-rose-100/50 bg-gradient-to-r from-rose-100/50 to-transparent">
                  <div className="w-5 h-5 rounded-md bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-sm">
                    <ShieldCheck className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Menu Admin</span>
                </div>
                {/* Menu Items */}
                <div className="p-1.5 space-y-0.5">
                  {adminMenuItems.map((item) => {
                    const isActive = currentView === item.view;
                    return (
                      <button
                        key={item.view}
                        onClick={() => { onNavigate(item.view); onClose(); }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all duration-200 group ${
                          isActive
                            ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white font-semibold shadow-md shadow-rose-200/50"
                            : "text-rose-800 hover:bg-white/70 hover:shadow-sm"
                        }`}
                      >
                        <span className={`transition-all duration-200 ${
                          isActive ? "text-white scale-110" : "text-rose-400 group-hover:text-rose-500 group-hover:scale-110"
                        }`}>
                          {item.icon}
                        </span>
                        {item.label}
                        {isActive && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </nav>
        </ScrollArea>

        {/* Logout */}
        <div className="p-3 border-t border-gray-100">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-gray-500 hover:text-rose-600 hover:bg-rose-50/80 rounded-lg transition-all duration-200" 
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" /> Keluar
          </Button>
        </div>
      </aside>
    </>
  );
}
