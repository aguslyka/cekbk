import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TAMBAHKAN BARIS INI DI ROOT (LUAR EXPERIMENTAL)
  allowedDevOrigins: ["scribble-preoccupy-dime.ngrok-free.dev"],

  // Jika ada konfigurasi lain, biarkan saja.
  // Hapus bagian experimental yang tadi kita tambahkan jika masih ada
  // agar tidak muncul error "Unrecognized key".
};

export default nextConfig;