"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft, Filter, PieChart as PieChartIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth, apiFetch, FIELD_CONFIG, getGrade, selectedAnalysisUserId, setSelectedAnalysisUserId, type View } from "@/lib/app-shared";
import { calculateOverallPercentage, getGradeInfo, type FieldName } from "@/lib/recommendations";

export default function AdminAnalysis({ onNavigate }: { onNavigate: (view: View) => void }) {
  const { user } = useAuth();
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterGrade, setFilterGrade] = useState("ALL");
  const [filterField, setFilterField] = useState("ALL");

  const fetchAnalysis = useCallback(() => {
    if (!user) return;
    const params = new URLSearchParams();
    if (filterGrade !== "ALL") params.set("grade", filterGrade);
    if (filterField !== "ALL") params.set("field", filterField);
    apiFetch(`/api/admin/analysis?${params.toString()}`, {}, user.id, user.role, String(user.grade))
      .then(setAnalysisData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, filterGrade, filterField]);

  useEffect(() => { fetchAnalysis(); }, [fetchAnalysis]);

  const fieldAnalysis = analysisData?.fieldAnalysis || {};
  const allUsers = analysisData?.responses ? [...new Map((analysisData.responses as any[]).map((r: any) => [r.userId, r.user])).values()] as any[] : [];
  const students = allUsers.map((u: any) => {
    const pribadiUser = fieldAnalysis.PRIBADI?.users?.find((us: any) => us.id === u.id);
    const sosialUser = fieldAnalysis.SOSIAL?.users?.find((us: any) => us.id === u.id);
    const belajarUser = fieldAnalysis.BELAJAR?.users?.find((us: any) => us.id === u.id);
    const karirUser = fieldAnalysis.KARIR?.users?.find((us: any) => us.id === u.id);
    const pribadiPercentage = pribadiUser?.percentage;
    const sosialPercentage = sosialUser?.percentage;
    const belajarPercentage = belajarUser?.percentage;
    const karirPercentage = karirUser?.percentage;
    // Calculate overall only when at least one field is completed
    const fieldPercentages: Record<FieldName, number> = {
      PRIBADI: pribadiPercentage ?? 0,
      SOSIAL: sosialPercentage ?? 0,
      BELAJAR: belajarPercentage ?? 0,
      KARIR: karirPercentage ?? 0,
    };
    const hasAnyData = pribadiPercentage !== undefined || sosialPercentage !== undefined || belajarPercentage !== undefined || karirPercentage !== undefined;
    const overallPercentage = hasAnyData ? calculateOverallPercentage(fieldPercentages) : undefined;
    const overallGradeInfo = overallPercentage !== undefined ? getGradeInfo(overallPercentage) : null;
    return {
      id: u.id,
      name: u.name,
      grade: u.grade,
      completed: !!(pribadiUser || sosialUser || belajarUser || karirUser),
      pribadiPercentage,
      sosialPercentage,
      belajarPercentage,
      karirPercentage,
      overallPercentage,
      overallGradeInfo,
    };
  });
  const totalStudents = students.length;
  const completedStudents = students.filter((s: any) => s.completed).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => onNavigate("admin-dashboard")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Hasil Analisa</h2>
          <p className="text-sm text-gray-500">Analisa hasil DCM seluruh siswa</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-600">Filter:</span>
            </div>
            <Select value={filterGrade} onValueChange={setFilterGrade}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="Kelas" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Kelas</SelectItem>
                <SelectItem value="7">Kelas 7</SelectItem>
                <SelectItem value="8">Kelas 8</SelectItem>
                <SelectItem value="9">Kelas 9</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterField} onValueChange={setFilterField}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Bidang" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Bidang</SelectItem>
                <SelectItem value="PRIBADI">Pribadi</SelectItem>
                <SelectItem value="SOSIAL">Sosial</SelectItem>
                <SelectItem value="BELAJAR">Belajar</SelectItem>
                <SelectItem value="KARIR">Karir</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-gray-500">Total Siswa</p><p className="text-3xl font-bold">{totalStudents}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-gray-500">Selesai Assessment</p><p className="text-3xl font-bold text-emerald-600">{completedStudents}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-gray-500">Belum Selesai</p><p className="text-3xl font-bold text-amber-600">{totalStudents - completedStudents}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-gray-500">Tingkat Penyelesaian</p><p className="text-3xl font-bold text-teal-600">{totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0}%</p></CardContent></Card>
      </div>

      {/* Students Table */}
      {loading ? (
        <Card><CardContent className="p-8"><div className="animate-pulse space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-gray-200 rounded" />)}</div></CardContent></Card>
      ) : students.length === 0 ? (
        <Card><CardContent className="p-12 text-center"><PieChartIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" /><p className="text-gray-500">Belum ada data siswa</p></CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead className="text-center">Pribadi</TableHead>
                  <TableHead className="text-center">Sosial</TableHead>
                  <TableHead className="text-center">Belajar</TableHead>
                  <TableHead className="text-center">Karir</TableHead>
                  <TableHead className="text-center">Rata-rata</TableHead>
                  <TableHead className="text-center">Rekomendasi</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s: any, i: number) => (
                  <TableRow key={s.id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell><Badge variant="outline">Kelas {s.grade}</Badge></TableCell>
                    <TableCell className="text-center">
                      {s.pribadiPercentage !== undefined ? (
                        <Badge className={getGrade(s.pribadiPercentage).bgColor + " " + getGrade(s.pribadiPercentage).color}>
                          {s.pribadiPercentage}%
                        </Badge>
                      ) : <span className="text-gray-400">-</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      {s.sosialPercentage !== undefined ? (
                        <Badge className={getGrade(s.sosialPercentage).bgColor + " " + getGrade(s.sosialPercentage).color}>
                          {s.sosialPercentage}%
                        </Badge>
                      ) : <span className="text-gray-400">-</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      {s.belajarPercentage !== undefined ? (
                        <Badge className={getGrade(s.belajarPercentage).bgColor + " " + getGrade(s.belajarPercentage).color}>
                          {s.belajarPercentage}%
                        </Badge>
                      ) : <span className="text-gray-400">-</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      {s.karirPercentage !== undefined ? (
                        <Badge className={getGrade(s.karirPercentage).bgColor + " " + getGrade(s.karirPercentage).color}>
                          {s.karirPercentage}%
                        </Badge>
                      ) : <span className="text-gray-400">-</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      {s.overallPercentage !== undefined ? (
                        <span className="font-semibold text-sm">{s.overallPercentage}%</span>
                      ) : <span className="text-gray-400">-</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      {s.overallGradeInfo ? (
                        <Badge className={`${s.overallGradeInfo.bgColor} ${s.overallGradeInfo.color}`}>
                          {s.overallGradeInfo.grade} — {s.overallGradeInfo.label}
                        </Badge>
                      ) : <span className="text-gray-400">-</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button size="sm" variant="outline" onClick={() => {
                        setSelectedAnalysisUserId(s.id);
                        onNavigate("admin-analysis-detail");
                      }}>
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
