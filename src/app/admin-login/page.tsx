"use client";

import Image from "next/image";

import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

import {
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import {
  loginWithMicrosoft,
} from "@/modules/science/poster-voting/services/auth.service";

export default function AdminLoginPage() {

  const router = useRouter();

  async function handleLogin() {

    try {

      await loginWithMicrosoft();

      toast.success(
        "Đăng nhập thành công."
      );

      router.push(
        "/admin/dashboard"
      );

    } catch (error: any) {

      toast.error(
        error?.message ||
        "Đăng nhập thất bại."
      );
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-sky-50 via-cyan-50 to-white px-4">

      {/* BACKGROUND */}

      <div className="absolute inset-0 overflow-hidden">

        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl animate-pulse" />

        <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-sky-200/40 blur-3xl animate-pulse" />

        <div className="absolute left-1/3 top-1/2 h-72 w-72 rounded-full bg-blue-100/50 blur-3xl" />

      </div>

      {/* CARD */}

      <div
        className="
          relative
          z-10
          w-full
          max-w-md
          overflow-hidden
          rounded-[38px]
          border
          border-white/60
          bg-white/80
          p-10
          shadow-[0_20px_80px_rgba(14,165,233,0.18)]
          backdrop-blur-2xl
        "
      >

        {/* GLOW */}

        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-100 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center text-center">

          {/* LOGO */}

          <div
            className="
              relative
              h-24
              w-24
              overflow-hidden
              rounded-[28px]
              bg-white
              shadow-[0_10px_40px_rgba(14,165,233,0.15)]
              ring-1
              ring-sky-100
            "
          >

            <Image
              src="/logo-tyd.png"
              alt="TYD Logo"
              fill
              className="object-contain p-3"
            />

          </div>

          {/* BADGE */}

          <div
            className="
              mt-6
              flex
              items-center
              gap-2
              rounded-full
              bg-sky-100
              px-5
              py-2
              text-sm
              font-bold
              text-sky-700
            "
          >

            <ShieldCheck className="h-4 w-4" />

            Administration Portal

          </div>

          {/* TITLE */}

          <h1 className="mt-6 text-4xl font-black text-slate-800">
            Admin Dashboard
          </h1>

          <p className="mt-4 text-sm leading-relaxed text-slate-500">

            Hệ thống quản trị bình chọn poster
            <br />
            Sinh viên Nghiên cứu khoa học
            <br />
            Trường Y Dược - Đại học Đà Nẵng

          </p>

          {/* INFO */}

          <div
            className="
              mt-6
              flex
              items-start
              gap-3
              rounded-2xl
              border
              border-sky-100
              bg-sky-50/80
              p-4
              text-left
            "
          >

            <Sparkles className="mt-0.5 h-5 w-5 text-cyan-500" />

            <div>

              <p className="text-sm font-semibold text-slate-700">
                Chỉ dành cho quản trị viên TYD
              </p>

              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Sử dụng tài khoản Microsoft thuộc hệ thống
                <br />
                @smp.udn.vn để đăng nhập.
              </p>

            </div>
          </div>

          {/* BUTTON */}

          <Button
            onClick={handleLogin}
            className="
              mt-8
              h-14
              w-full
              rounded-2xl
              bg-gradient-to-r
              from-sky-500
              via-cyan-500
              to-blue-500
              text-base
              font-bold
              text-white
              shadow-[0_10px_30px_rgba(14,165,233,0.30)]
              transition-all
              duration-300
              hover:scale-[1.02]
              hover:shadow-[0_20px_40px_rgba(14,165,233,0.35)]
            "
          >
            Login with Microsoft
          </Button>

        </div>
      </div>
    </div>
  );
}