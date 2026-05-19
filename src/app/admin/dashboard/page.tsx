"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  getCountFromServer,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

import {
  Trophy,
  FileText,
  Vote,
  Users,
  GraduationCap,
  Globe,
  TrendingUp,
  BarChart3,
} from "lucide-react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
} from "recharts";

import { db } from "@/firebase/client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  Badge,
} from "@/components/ui/badge";

type PosterAnalytics = {
  id: string;

  title: string;

  voteCount: number;

  internalVoteCount: number;

  guestVoteCount: number;
};

export default function DashboardPage() {

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    totalCampaigns,
    setTotalCampaigns,
  ] = useState(0);

  const [
    totalPosters,
    setTotalPosters,
  ] = useState(0);

  const [
    totalVotes,
    setTotalVotes,
  ] = useState(0);

  const [
    internalVotes,
    setInternalVotes,
  ] = useState(0);

  const [
    guestVotes,
    setGuestVotes,
  ] = useState(0);

  const [
    topPosters,
    setTopPosters,
  ] = useState<
    PosterAnalytics[]
  >([]);

  /* ========================================
     LOAD DATA
  ======================================== */

  useEffect(() => {

    async function loadDashboard() {

      try {

        /* =========================
           COUNTS
        ========================= */

        const campaignsSnap =
          await getCountFromServer(
            collection(
              db,
              "science_campaigns"
            )
          );

        const postersSnap =
          await getCountFromServer(
            collection(
              db,
              "science_posters"
            )
          );

        const votesSnap =
          await getCountFromServer(
            collection(
              db,
              "science_votes"
            )
          );

        setTotalCampaigns(
          campaignsSnap.data().count
        );

        setTotalPosters(
          postersSnap.data().count
        );

        setTotalVotes(
          votesSnap.data().count
        );

        /* =========================
           POSTERS
        ========================= */

        const postersQuery =
          query(
            collection(
              db,
              "science_posters"
            ),

            orderBy(
              "voteCount",
              "desc"
            )
          );

        const postersData =
          await getDocs(
            postersQuery
          );

        const posters =
          postersData.docs.map(
            (doc) => ({

              id: doc.id,

              ...doc.data(),

            })
          ) as PosterAnalytics[];

        setTopPosters(
          posters.slice(0, 10)
        );

        /* =========================
           INTERNAL / GUEST
        ========================= */

        let internal = 0;

        let guest = 0;

        posters.forEach(
          (poster) => {

            internal +=
              poster.internalVoteCount || 0;

            guest +=
              poster.guestVoteCount || 0;
          }
        );

        setInternalVotes(
          internal
        );

        setGuestVotes(
          guest
        );

      } catch (error) {

        console.error(
          error
        );

      } finally {

        setLoading(false);
      }
    }

    loadDashboard();

  }, []);

  /* ========================================
     CHART DATA
  ======================================== */

  const pieData = [
    {
      name: "TYD Internal",
      value: internalVotes,
    },

    {
      name: "Guest",
      value: guestVotes,
    },
  ];

  const COLORS = [
    "#000066",
    "#1a8ea3",
  ];

  /* ========================================
     LOADING
  ======================================== */

  if (loading) {

    return (
      <div className="flex min-h-[70vh] items-center justify-center">

        <div className="text-center">

          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-slate-200 border-t-[#1a8ea3]" />

          <p className="mt-4 text-slate-500">
            Loading dashboard...
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ========================================
          HEADER
      ======================================== */}

      <div className="rounded-[32px] bg-gradient-to-r from-[#000066] via-[#000966] to-[#1a8ea3] p-10 text-white shadow-2xl">

        <div className="flex items-center gap-3">

          <Badge className="border-0 bg-white/20 text-white">
            TYD PORTAL
          </Badge>

          <Badge className="border-0 bg-emerald-500 text-white">
            LIVE
          </Badge>

        </div>

        <h1 className="mt-5 text-5xl font-black">
          Dashboard
        </h1>

        <p className="mt-4 max-w-2xl text-lg text-slate-200">

          Hệ thống quản trị bình chọn poster nghiên cứu khoa học
          Trường Y Dược - Đại học Đà Nẵng.

        </p>
      </div>

      {/* ========================================
          STATS
      ======================================== */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

        {/* Campaigns */}

        <Card className="rounded-[32px] border-0 bg-white shadow-xl">

          <CardContent className="p-8">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Total Campaigns
                </p>

                <h2 className="mt-3 text-5xl font-black text-[#000066]">
                  {totalCampaigns}
                </h2>

              </div>

              <div className="rounded-3xl bg-[#000066]/10 p-5">

                <Trophy className="h-10 w-10 text-[#000066]" />

              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posters */}

        <Card className="rounded-[32px] border-0 bg-white shadow-xl">

          <CardContent className="p-8">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Total Posters
                </p>

                <h2 className="mt-3 text-5xl font-black text-[#000066]">
                  {totalPosters}
                </h2>

              </div>

              <div className="rounded-3xl bg-cyan-100 p-5">

                <FileText className="h-10 w-10 text-cyan-700" />

              </div>
            </div>
          </CardContent>
        </Card>

        {/* Votes */}

        <Card className="rounded-[32px] border-0 bg-white shadow-xl">

          <CardContent className="p-8">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Total Votes
                </p>

                <h2 className="mt-3 text-5xl font-black text-[#1a8ea3]">
                  {totalVotes}
                </h2>

              </div>

              <div className="rounded-3xl bg-emerald-100 p-5">

                <Vote className="h-10 w-10 text-emerald-700" />

              </div>
            </div>
          </CardContent>
        </Card>

        {/* Internal */}

        <Card className="rounded-[32px] border-0 bg-white shadow-xl">

          <CardContent className="p-8">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  TYD Internal Votes
                </p>

                <h2 className="mt-3 text-5xl font-black text-[#000066]">
                  {internalVotes}
                </h2>

              </div>

              <div className="rounded-3xl bg-indigo-100 p-5">

                <GraduationCap className="h-10 w-10 text-indigo-700" />

              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guest */}

        <Card className="rounded-[32px] border-0 bg-white shadow-xl">

          <CardContent className="p-8">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Guest Votes
                </p>

                <h2 className="mt-3 text-5xl font-black text-cyan-700">
                  {guestVotes}
                </h2>

              </div>

              <div className="rounded-3xl bg-cyan-100 p-5">

                <Globe className="h-10 w-10 text-cyan-700" />

              </div>
            </div>
          </CardContent>
        </Card>

        {/* Engagement */}

        <Card className="rounded-[32px] border-0 bg-white shadow-xl">

          <CardContent className="p-8">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Engagement
                </p>

                <h2 className="mt-3 text-5xl font-black text-emerald-600">

                  {totalPosters > 0
                    ? Math.round(
                        totalVotes /
                        totalPosters
                      )
                    : 0}

                </h2>

              </div>

              <div className="rounded-3xl bg-emerald-100 p-5">

                <TrendingUp className="h-10 w-10 text-emerald-700" />

              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================
          CHARTS
      ======================================== */}

      <div className="grid gap-6 xl:grid-cols-2">

        {/* PIE */}

        <Card className="rounded-[32px] border-0 bg-white shadow-xl">

          <CardContent className="p-8">

            <div className="mb-8 flex items-center gap-3">

              <Users className="h-6 w-6 text-[#000066]" />

              <h2 className="text-2xl font-black text-[#000066]">
                Vote Distribution
              </h2>

            </div>

            <div className="h-[350px]">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <PieChart>

                  <Pie
                    data={pieData}
                    dataKey="value"
                    outerRadius={120}
                    label
                  >

                    {pieData.map(
                      (
                        entry,
                        index
                      ) => (

                        <Cell
                          key={index}
                          fill={
                            COLORS[
                              index
                            ]
                          }
                        />
                      )
                    )}

                  </Pie>

                  <Tooltip />

                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* BAR */}

        <Card className="rounded-[32px] border-0 bg-white shadow-xl">

          <CardContent className="p-8">

            <div className="mb-8 flex items-center gap-3">

              <BarChart3 className="h-6 w-6 text-[#000066]" />

              <h2 className="text-2xl font-black text-[#000066]">
                Top Posters
              </h2>

            </div>

            <div className="h-[350px]">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={topPosters}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="title"
                    hide
                  />

                  <YAxis />

                  <Tooltip />

                  <Bar
                    dataKey="voteCount"
                    fill="#1a8ea3"
                    radius={[
                      10,
                      10,
                      0,
                      0,
                    ]}
                  />

                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================
          TOP POSTERS TABLE
      ======================================== */}

      <Card className="rounded-[32px] border-0 bg-white shadow-xl">

        <CardContent className="p-8">

          <div className="mb-8 flex items-center gap-3">

            <Trophy className="h-6 w-6 text-[#000066]" />

            <h2 className="text-2xl font-black text-[#000066]">
              Poster Rankings
            </h2>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr className="border-b">

                  <th className="px-4 py-4 text-left">
                    Rank
                  </th>

                  <th className="px-4 py-4 text-left">
                    Poster
                  </th>

                  <th className="px-4 py-4 text-center">
                    Total
                  </th>

                  <th className="px-4 py-4 text-center">
                    Internal
                  </th>

                  <th className="px-4 py-4 text-center">
                    Guest
                  </th>

                </tr>
              </thead>

              <tbody>

                {topPosters.map(
                  (
                    poster,
                    index
                  ) => (

                    <tr
                      key={poster.id}
                      className="border-b hover:bg-slate-50"
                    >

                      <td className="px-4 py-5 font-black text-[#000066]">

                        #{index + 1}

                      </td>

                      <td className="px-4 py-5 font-semibold">

                        {poster.title}

                      </td>

                      <td className="px-4 py-5 text-center font-black text-[#1a8ea3]">

                        {poster.voteCount || 0}

                      </td>

                      <td className="px-4 py-5 text-center">

                        {poster.internalVoteCount || 0}

                      </td>

                      <td className="px-4 py-5 text-center">

                        {poster.guestVoteCount || 0}

                      </td>

                    </tr>
                  )
                )}

              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}