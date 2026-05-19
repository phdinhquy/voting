"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";

import {
  Sparkles,
  Trophy,
  Share2,
  Vote,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Eye,
  Flame,
  Crown,
  CheckCircle2,
  Search,
  X,
} from "lucide-react";

import { toast } from "sonner";

import { auth } from "@/firebase/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

import { listenPosters } from "@/modules/science/poster-voting/services/poster.service";

import {
  loginWithGoogle,
  loginWithMicrosoft,
  logout,
} from "@/modules/science/poster-voting/services/auth.service";

import {
  getUserVotes,
  votePoster,
} from "@/modules/science/poster-voting/services/vote.service";

import { Poster } from "@/modules/science/poster-voting/types/poster";

import { useAutoLogout } from "@/modules/science/poster-voting/hooks/useAutoLogout";

const ITEMS_PER_PAGE = 9;

export default function PublicVotingPage() {
  useAutoLogout();

  const [posters, setPosters] = useState<Poster[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState("");
  const [selectedPoster, setSelectedPoster] = useState<Poster | null>(null);
  const [confirmPoster, setConfirmPoster] = useState<Poster | null>(null);
  const [votedPosterIds, setVotedPosterIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  /* ========================= INIT ========================== */

  useEffect(() => {
    const unsubscribePosters = listenPosters((data) => {
      const published = data
        .filter((poster) => poster.isPublished)
        .sort((a, b) => b.voteCount - a.voteCount);

      setPosters(published);
    });

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setUser(firebaseUser);

        if (firebaseUser) {
          try {
            const votedIds = await getUserVotes(firebaseUser.uid);

            setVotedPosterIds(votedIds || []);
          } catch {
            setVotedPosterIds([]);
          }
        }

        setLoading(false);
      }
    );

    return () => {
      unsubscribePosters();
      unsubscribeAuth();
    };
  }, []);

  /* ========================= DEVTOOLS PROTECTION ========================== */

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();

      toast.warning("Chuột phải đã bị vô hiệu hóa.");
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (e.key === "F12") {
        e.preventDefault();

        toast.warning("Developer Tools đã bị chặn.");

        return;
      }

      if (e.ctrlKey && e.shiftKey && key === "i") {
        e.preventDefault();

        toast.warning("Inspect đã bị chặn.");

        return;
      }

      if (e.ctrlKey && e.shiftKey && key === "j") {
        e.preventDefault();

        toast.warning("Console đã bị chặn.");

        return;
      }

      if (e.ctrlKey && key === "u") {
        e.preventDefault();

        toast.warning("View Source đã bị chặn.");

        return;
      }

      if (e.ctrlKey && e.shiftKey && key === "c") {
        e.preventDefault();

        toast.warning("Inspect Element đã bị chặn.");

        return;
      }

      if (e.metaKey && e.altKey && key === "i") {
        e.preventDefault();

        toast.warning("Developer Tools đã bị chặn.");

        return;
      }
    };

    let warningShown = false;

    const threshold = 160;

    const detectDevTools = window.setInterval(() => {
      const widthDiff = window.outerWidth - window.innerWidth;

      const heightDiff = window.outerHeight - window.innerHeight;

      if (widthDiff > threshold || heightDiff > threshold) {
        if (!warningShown) {
          warningShown = true;

          toast.error("Phát hiện Developer Tools.");
        }
      } else {
        warningShown = false;
      }
    }, 1500);

    document.addEventListener("contextmenu", handleContextMenu);

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener(
        "contextmenu",
        handleContextMenu
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      clearInterval(detectDevTools);
    };
  }, []);

  /* ========================= FILTER ========================== */

  const filteredPosters = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return posters;
    }

    return posters.filter(
      (poster) =>
        poster.title?.toLowerCase().includes(keyword) ||
        poster.authors?.some((author) =>
          author?.toLowerCase().includes(keyword)
        ) ||
        poster.instructors?.some((instructor) =>
          instructor?.toLowerCase().includes(keyword)
        )
    );
  }, [posters, search]);

  /* ========================= PAGINATION ========================== */

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPosters.length / ITEMS_PER_PAGE)
  );

  const paginatedPosters = useMemo(() => {
    return filteredPosters.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filteredPosters, currentPage]);

  /* ========================= VOTE ========================== */

  async function handleVote(poster: Poster) {
    try {
      if (!user) {
        toast.error("Vui lòng đăng nhập trước khi bình chọn.");

        return;
      }

      if (votedPosterIds.includes(poster.id)) {
        toast.warning("Bạn đã bình chọn poster này rồi.");

        return;
      }

      setVotingId(poster.id);

      await votePoster({
        campaignId: poster.campaignId,
        posterId: poster.id,
        voterId: user.uid,
        voterType: user.email?.includes("smp.udn.vn")
          ? "internal"
          : "guest",
      });

      setVotedPosterIds((prev) => [...prev, poster.id]);

      toast.success("Bình chọn thành công.");
    } catch (error: any) {
      console.error("VOTE_ERROR:", error);

      const message = error?.message || "";

      if (
        message.includes("permission") ||
        message.includes("PERMISSION_DENIED") ||
        message.includes("insufficient permissions") ||
        error?.code === "permission-denied"
      ) {
        toast.warning("Bạn đã bình chọn poster này rồi.");

        if (!votedPosterIds.includes(poster.id)) {
          setVotedPosterIds((prev) => [...prev, poster.id]);
        }

        return;
      }

      toast.error("Có lỗi xảy ra khi bình chọn.");
    } finally {
      setVotingId("");
    }
  }

  /* ========================= SHARE ========================== */

  async function handleShare(poster: Poster) {
    const url = `${window.location.origin}/science/poster-voting`;

    const text = `Bình chọn poster: ${poster.title}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Poster Voting",
          text,
          url,
        });

        return;
      } catch {
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);

      toast.success("Đã copy link chia sẻ.");
    } catch {
      toast.error("Không thể copy link.");
    }
  }

  /* ========================= LOADING ========================== */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-100 border-t-cyan-500" />

          <p className="text-sm font-medium text-slate-600">
            Đang tải dữ liệu...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-100 text-slate-800">
      {/* BG */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-120px] top-[-120px] h-[340px] w-[340px] rounded-full bg-cyan-300/30 blur-[120px]" />

        <div className="absolute bottom-[-120px] right-[-120px] h-[340px] w-[340px] rounded-full bg-blue-300/30 blur-[120px]" />

        <div className="absolute left-1/2 top-1/3 h-[260px] w-[260px] -translate-x-1/2 rounded-full bg-sky-200/30 blur-[120px]" />
      </div>

      {/* HEADER */}

      <header className="sticky top-0 z-50 border-b border-cyan-100 bg-white/70 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          {/* LEFT */}

          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-cyan-100 bg-white shadow-md md:h-16 md:w-16">
              <Image
                src="/logo-tyd.png"
                alt="TYD Logo"
                fill
                className="object-contain p-2"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <Badge className="border-0 bg-cyan-500 text-white">
                  TYD PORTAL
                </Badge>

                <Badge className="border-0 bg-emerald-500 text-white">
                  LIVE
                </Badge>
              </div>

              <h1 className="mt-2 text-2xl font-black text-slate-800 md:text-4xl">
                Poster Voting 2026
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Sinh viên nghiên cứu khoa học lần V
              </p>
            </div>
          </div>

          {/* RIGHT */}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {!user && (
              <>
                <Button
                  className="h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold text-white shadow-lg"
                  onClick={loginWithMicrosoft}
                >
                  Internal Login
                </Button>

                <Button
                  variant="outline"
                  className="h-11 rounded-xl border-cyan-100 bg-white text-slate-700 hover:bg-cyan-50"
                  onClick={loginWithGoogle}
                >
                  Guest Login
                </Button>
              </>
            )}

            {user && (
              <>
                <div className="flex items-center gap-3 rounded-2xl border border-cyan-100 bg-white px-4 py-2 shadow-sm">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-cyan-500 text-white">
                      {user.email?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="max-w-[180px]">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {user.email}
                    </p>

                    <p className="text-xs text-slate-500">
                      {user.email?.includes("smp.udn.vn")
                        ? "Nội bộ TYD"
                        : "Khách"}
                    </p>
                  </div>
                </div>

                <Button
                  variant="destructive"
                  className="h-11 rounded-xl"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4" />

                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* MAIN */}

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-6 md:py-8">
        {/* HERO */}

        <section className="overflow-hidden rounded-3xl border border-cyan-100 bg-white/80 p-5 shadow-xl backdrop-blur-xl md:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-cyan-600">
                <Sparkles className="h-4 w-4" />

                <p className="text-xs uppercase tracking-[0.3em]">
                  Competition Event
                </p>
              </div>

              <h2 className="mt-4 text-3xl font-black leading-tight text-slate-800 md:text-5xl">
                Bình chọn poster
                <br />

                <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                  nghiên cứu khoa học
                </span>
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
                Hệ thống bình chọn trực tuyến dành cho các đề tài nghiên cứu
                khoa học sinh viên Trường Y Dược - Đại học Đà Nẵng.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-white to-cyan-50 p-5 shadow-md">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    Tổng poster
                  </p>

                  <Flame className="h-5 w-5 text-orange-400" />
                </div>

                <p className="mt-3 text-4xl font-black text-cyan-600">
                  {posters.length}
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-white to-cyan-50 p-5 shadow-md">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    Trạng thái
                  </p>

                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                </div>

                <p className="mt-3 text-xl font-black text-emerald-500">
                  Đang diễn ra
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SEARCH */}

        <section className="mt-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              placeholder="Tìm kiếm poster, tác giả..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 rounded-2xl border-cyan-100 bg-white pl-11 text-slate-700 shadow-sm placeholder:text-slate-400 focus-visible:ring-cyan-400"
            />

            {search && (
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                onClick={() => setSearch("")}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </section>

        {/* MY VOTES */}

        {user && votedPosterIds.length > 0 && (
          <section className="mt-6 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <Trophy className="h-6 w-6 text-emerald-500" />

              <h3 className="text-lg font-bold text-slate-800">
                Poster đã bình chọn
              </h3>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {posters
                .filter((poster) =>
                  votedPosterIds.includes(poster.id)
                )
                .map((poster) => (
                  <Badge
                    key={poster.id}
                    className="rounded-full border-0 bg-emerald-500 px-4 py-2 text-white"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />

                    {poster.title}
                  </Badge>
                ))}
            </div>
          </section>
        )}

        {/* GRID */}

        <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {paginatedPosters.map((poster) => {
            const rank =
              posters.findIndex((p) => p.id === poster.id) + 1;

            const isVoted = votedPosterIds.includes(poster.id);

            return (
              <Card
                key={poster.id}
                className="overflow-hidden rounded-3xl border border-cyan-100 bg-white/90 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-cyan-300 hover:shadow-2xl"
              >
                <CardContent className="p-0">
                  {/* IMAGE */}

                  <div
                    className="relative aspect-[4/5] cursor-pointer overflow-hidden bg-slate-100"
                    onClick={() => setSelectedPoster(poster)}
                  >
                    <Image
                      src={poster.posterUrl}
                      alt={poster.title}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />

                    <div className="absolute left-3 top-3">
                      <Badge className="border-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow">
                        <Crown className="mr-1 h-3 w-3" />

                        TOP #{rank}
                      </Badge>
                    </div>

                    {isVoted && (
                      <div className="absolute bottom-3 right-3">
                        <Badge className="border-0 bg-emerald-500 text-white">
                          ✓ Đã vote
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* CONTENT */}

                  <div className="p-5">
                    <h2 className="line-clamp-2 text-lg font-black leading-snug text-slate-800 md:text-xl">
                      {poster.title}
                    </h2>

                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                      <p className="line-clamp-2">
                        <span className="font-semibold text-cyan-600">
                          Tác giả:
                        </span>{" "}
                        {poster.authors.join(", ")}
                      </p>

                      <p className="line-clamp-2">
                        <span className="font-semibold text-cyan-600">
                          GVHD:
                        </span>{" "}
                        {poster.instructors.join(", ")}
                      </p>
                    </div>

                    {/* STATS */}

                    <div className="mt-5 flex items-end justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-500">
                          Votes
                        </p>

                        <p className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-4xl font-black text-transparent">
                          {poster.voteCount}
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl text-slate-500 hover:bg-cyan-50 hover:text-cyan-600"
                        onClick={() => handleShare(poster)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* ACTION */}

                    <div className="mt-4 flex flex-col gap-2">
                      <Button
                        className={`h-11 w-full rounded-xl font-semibold transition-all ${
                          isVoted
                            ? "bg-emerald-500 text-white hover:bg-emerald-500"
                            : "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                        }`}
                        disabled={votingId === poster.id || isVoted}
                        onClick={() => setConfirmPoster(poster)}
                      >
                        <Vote className="mr-2 h-4 w-4" />

                        {isVoted
                          ? "Đã bình chọn"
                          : "Bình chọn ngay"}
                      </Button>

                      <Button
                        variant="outline"
                        className="h-10 rounded-xl border-cyan-100 bg-white text-slate-700 hover:bg-cyan-50"
                        onClick={() => setSelectedPoster(poster)}
                      >
                        <Eye className="mr-2 h-4 w-4" />

                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        {/* EMPTY */}

        {!paginatedPosters.length && (
          <div className="mt-16 text-center">
            <p className="text-slate-500">
              Không tìm thấy poster phù hợp.
            </p>
          </div>
        )}

        {/* PAGINATION */}

        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              className="border-cyan-100 bg-white text-slate-700 hover:bg-cyan-50"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((prev) => prev - 1)
              }
            >
              <ChevronLeft className="mr-2 h-4 w-4" />

              Prev
            </Button>

            <div className="rounded-xl border border-cyan-100 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
              Trang {currentPage}/{totalPages}
            </div>

            <Button
              variant="outline"
              className="border-cyan-100 bg-white text-slate-700 hover:bg-cyan-50"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => prev + 1)
              }
            >
              Next

              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </main>

      {/* CONFIRM */}

      <Dialog
        open={!!confirmPoster}
        onOpenChange={() => setConfirmPoster(null)}
      >
        <DialogContent className="rounded-3xl border border-cyan-100 bg-white text-slate-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">
              Xác nhận bình chọn
            </DialogTitle>

            <DialogDescription className="text-slate-500">
              Xác nhận bình chọn poster nghiên cứu khoa học.
            </DialogDescription>
          </DialogHeader>

          <p className="text-slate-600">
            Bạn xác nhận bình chọn poster:
            <span className="font-bold text-slate-800">
              {" "}
              {confirmPoster?.title}
            </span>
          </p>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="border-cyan-100 bg-white text-slate-700 hover:bg-cyan-50"
              onClick={() => setConfirmPoster(null)}
            >
              Hủy
            </Button>

            <Button
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
              onClick={() => {
                if (confirmPoster) {
                  handleVote(confirmPoster);

                  setConfirmPoster(null);
                }
              }}
            >
              <Vote className="mr-2 h-4 w-4" />

              Xác nhận vote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DETAIL */}

      <Dialog
        open={!!selectedPoster}
        onOpenChange={() => setSelectedPoster(null)}
      >
        <DialogContent className="max-h-[95vh] overflow-y-auto rounded-3xl border border-cyan-100 bg-white text-slate-800 shadow-2xl sm:max-w-5xl">
          <DialogHeader className="hidden">
            <DialogTitle>
              Poster Detail
            </DialogTitle>

            <DialogDescription>
              Chi tiết poster nghiên cứu khoa học.
            </DialogDescription>
          </DialogHeader>

          {selectedPoster && (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* IMAGE */}

              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-cyan-100 bg-slate-50">
                <Image
                  src={selectedPoster.posterUrl}
                  alt={selectedPoster.title}
                  fill
                  className="object-contain"
                />
              </div>

              {/* CONTENT */}

              <div>
                <Badge className="border-0 bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                  TOP #
                  {posters.findIndex(
                    (p) => p.id === selectedPoster.id
                  ) + 1}
                </Badge>

                <h2 className="mt-4 text-3xl font-black leading-tight text-slate-800">
                  {selectedPoster.title}
                </h2>

                <div className="mt-6 space-y-5">
                  <div>
                    <p className="text-sm text-slate-500">
                      Tác giả
                    </p>

                    <p className="mt-1 text-base font-semibold text-slate-800">
                      {selectedPoster.authors.join(", ")}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      Giảng viên hướng dẫn
                    </p>

                    <p className="mt-1 text-base font-semibold text-slate-800">
                      {selectedPoster.instructors.join(", ")}
                    </p>
                  </div>

                  {/* STATS */}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-white to-cyan-50 p-5 shadow-sm">
                      <p className="text-sm text-slate-500">
                        Ranking
                      </p>

                      <p className="mt-2 text-5xl font-black text-cyan-600">
                        #
                        {posters.findIndex(
                          (p) => p.id === selectedPoster.id
                        ) + 1}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-white to-cyan-50 p-5 shadow-sm">
                      <p className="text-sm text-slate-500">
                        Votes
                      </p>

                      <p className="mt-2 text-5xl font-black text-cyan-600">
                        {selectedPoster.voteCount}
                      </p>
                    </div>
                  </div>

                  {/* ACTION */}

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      variant="outline"
                      className="flex-1 border-cyan-100 bg-white text-slate-700 hover:bg-cyan-50"
                      onClick={() =>
                        handleShare(selectedPoster)
                      }
                    >
                      <Share2 className="mr-2 h-4 w-4" />

                      Chia sẻ
                    </Button>

                    <Button
                      className={`flex-1 ${
                        votedPosterIds.includes(
                          selectedPoster.id
                        )
                          ? "bg-emerald-500 text-white hover:bg-emerald-500"
                          : "bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                      }`}
                      disabled={votedPosterIds.includes(
                        selectedPoster.id
                      )}
                      onClick={() => {
                        setSelectedPoster(null);

                        setConfirmPoster(selectedPoster);
                      }}
                    >
                      <Vote className="mr-2 h-4 w-4" />

                      {votedPosterIds.includes(
                        selectedPoster.id
                      )
                        ? "Đã bình chọn"
                        : "Vote poster"}
                    </Button>
                  </div>

                  {/* INFO */}

                  <div className="flex items-start gap-3 rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
                    <Eye className="mt-0.5 h-5 w-5 text-cyan-600" />

                    <p className="text-sm leading-relaxed text-slate-600">
                      Hệ thống đảm bảo quyền riêng tư, chỉ ghi nhận số lượng
                      bình chọn hợp lệ.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MOBILE FLOAT */}

      {user && (
        <div className="fixed bottom-4 left-4 right-4 z-40 md:hidden">
          <div className="flex items-center justify-between rounded-2xl border border-cyan-100 bg-white/90 px-4 py-3 shadow-xl backdrop-blur-xl">
            <div>
              <p className="text-xs text-slate-500">
                Bạn đã bình chọn
              </p>

              <p className="text-lg font-bold text-cyan-600">
                {votedPosterIds.length} poster
              </p>
            </div>

            <Badge className="bg-emerald-500 text-white">
              Đang hoạt động
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}