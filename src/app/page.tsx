"use client";

import React, { useState, useCallback, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AuthContext,
  type View,
  type UserData,
} from "@/lib/app-shared";

// Lazy-load all components to reduce initial bundle size
const LandingPage = dynamic(() => import("@/components/LandingPage"), { ssr: false });
const UserDashboard = dynamic(() => import("@/components/UserDashboard"), { ssr: false });
const DCMListPage = dynamic(() => import("@/components/DCMListPage"), { ssr: false });
const SurveyPage = dynamic(() => import("@/components/SurveyPage"), { ssr: false });
const ResultsPage = dynamic(() => import("@/components/ResultsPage"), { ssr: false });
const ProfilePage = dynamic(() => import("@/components/ProfilePage"), { ssr: false });
const AdminDashboard = dynamic(() => import("@/components/AdminDashboard"), { ssr: false });
const AdminUsers = dynamic(() => import("@/components/admin-users"), { ssr: false });
const AdminSurveys = dynamic(() => import("@/components/AdminSurveys"), { ssr: false });
const AdminImportExport = dynamic(() => import("@/components/AdminImportExport"), { ssr: false });
const AdminCounseling = dynamic(() => import("@/components/AdminCounseling"), { ssr: false });
const AdminSettings = dynamic(() => import("@/components/AdminSettings"), { ssr: false });
const Certificate = dynamic(() => import("@/components/Certificate"), { ssr: false });
const AdminAnalysis = dynamic(() => import("@/components/AdminAnalysis"), { ssr: false });
const AdminAnalysisDetail = dynamic(() => import("@/components/AdminAnalysisDetail"), { ssr: false });
const AdminMonitoring = dynamic(() => import("@/components/AdminMonitoring"), { ssr: false });
const AdminReporting = dynamic(() => import("@/components/AdminReporting"), { ssr: false });
const AdminCertificateList = dynamic(() => import("@/components/AdminCertificateList"), { ssr: false });
const StudentReporting = dynamic(() => import("@/components/StudentReporting"), { ssr: false });
const SidebarNav = dynamic(() => import("@/components/SidebarNav"), { ssr: false });

// ====== localStorage external store for useSyncExternalStore ======
const STORAGE_KEY = "cekdiribk_user";
const storageListeners = new Set<() => void>();

function subscribeToStorage(callback: () => void) {
  storageListeners.add(callback);
  return () => { storageListeners.delete(callback); };
}

function getStorageSnapshot(): string | null {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}

function getServerSnapshot(): null {
  return null;
}

function notifyStorageListeners() {
  storageListeners.forEach((l) => l());
}

function writeToStorage(u: UserData | null) {
  try {
    if (u) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    notifyStorageListeners();
  } catch { /* ignore storage errors */ }
}

// ==================== MAIN APP ====================
export default function CekDiriBKApp() {
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>("");
  const [selectedCertificateStudentId, setSelectedCertificateStudentId] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Track explicit navigation (null = derive from user existence)
  const [navigatedView, setNavigatedView] = useState<View | null>(null);

  // useSyncExternalStore: server returns null, client returns actual localStorage value
  // React handles hydration mismatch gracefully with a synchronous client re-render
  const storedUserJson = useSyncExternalStore(
    subscribeToStorage,
    getStorageSnapshot,
    getServerSnapshot
  );

  // Derive user from localStorage — no useState needed for user
  const user = React.useMemo<UserData | null>(() => {
    if (!storedUserJson) return null;
    try { return JSON.parse(storedUserJson); } catch { return null; }
  }, [storedUserJson]);

  // Compute current view: explicit navigation takes priority, otherwise derive from user
  const currentView: View = navigatedView ?? (user ? "dashboard" : "landing");

  const handleSetUser = useCallback((u: UserData | null) => {
    writeToStorage(u);
    if (u) setNavigatedView("dashboard");
  }, []);

  const handleLogout = useCallback(() => {
    writeToStorage(null);
    setNavigatedView(null);
  }, []);

  const handleNavigate = useCallback((view: View) => {
    setNavigatedView(view);
    window.scrollTo(0, 0);
  }, []);

  const handleSelectSurvey = useCallback((id: string) => {
    setSelectedSurveyId(id);
  }, []);

  const handleSelectCertificateStudent = useCallback((id: string) => {
    setSelectedCertificateStudentId(id);
  }, []);

  // If not logged in, show landing page
  if (!user) {
    return (
      <AuthContext.Provider value={{ user, setUser: handleSetUser, logout: handleLogout }}>
        <LandingPage />
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
      </AuthContext.Provider>
    );
  }

  // Logged in layout with sidebar
  return (
    <AuthContext.Provider value={{ user, setUser: handleSetUser, logout: handleLogout }}>
      <div className="md:ml-72 min-h-screen bg-gray-50">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center gap-3 md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">BK</div>
            <span className="font-bold text-sm">CekDiriBK.id</span>
          </div>
        </header>

        <SidebarNav
          currentView={currentView}
          onNavigate={handleNavigate}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="p-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {currentView === "dashboard" && <UserDashboard onNavigate={handleNavigate} onSelectSurvey={handleSelectSurvey} />}
              {currentView === "dcm" && <DCMListPage onNavigate={handleNavigate} onSelectSurvey={handleSelectSurvey} />}
              {currentView === "survey" && selectedSurveyId && <SurveyPage surveyId={selectedSurveyId} onNavigate={handleNavigate} />}
              {currentView === "results" && <ResultsPage onNavigate={handleNavigate} surveyIdFilter={selectedSurveyId} />}
              {currentView === "profile" && <ProfilePage onNavigate={handleNavigate} />}
              {currentView === "admin-dashboard" && <AdminDashboard onNavigate={handleNavigate} />}
              {currentView === "admin-users" && <AdminUsers onNavigate={handleNavigate} />}
              {currentView === "admin-surveys" && <AdminSurveys onNavigate={handleNavigate} />}
              {currentView === "admin-import" && <AdminImportExport onNavigate={handleNavigate} />}
              {currentView === "admin-counseling" && <AdminCounseling onNavigate={handleNavigate} />}
              {currentView === "admin-analysis" && <AdminAnalysis onNavigate={handleNavigate} />}
              {currentView === "admin-analysis-detail" && <AdminAnalysisDetail onNavigate={handleNavigate} onSelectCertificateStudent={handleSelectCertificateStudent} />}
              {currentView === "admin-certificate" && <AdminCertificateList onNavigate={handleNavigate} onSelectCertificateStudent={handleSelectCertificateStudent} />}
              {currentView === "admin-report" && <AdminReporting onNavigate={handleNavigate} />}
              {currentView === "admin-monitoring" && <AdminMonitoring onNavigate={handleNavigate} />}
              {currentView === "admin-settings" && <AdminSettings onNavigate={handleNavigate} />}
              {currentView === "student-report" && <StudentReporting onNavigate={handleNavigate} />}
              {currentView === "certificate" && <Certificate onNavigate={handleNavigate} studentId={selectedCertificateStudentId} />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="border-t bg-white py-4 mt-8">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-xs text-gray-500">
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
    </AuthContext.Provider>
  );
}
