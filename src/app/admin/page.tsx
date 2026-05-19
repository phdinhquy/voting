"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import { db } from "@/firebase/client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

export default function AdminDashboardPage() {

  const [campaigns,
    setCampaigns] =
    useState(0);

  const [posters,
    setPosters] =
    useState(0);

  const [votes,
    setVotes] =
    useState(0);

  useEffect(() => {

    const unsubCampaigns =
      onSnapshot(
        collection(
          db,
          "science_campaigns"
        ),
        (snapshot) => {
          setCampaigns(
            snapshot.size
          );
        }
      );

    const unsubPosters =
      onSnapshot(
        collection(
          db,
          "science_posters"
        ),
        (snapshot) => {
          setPosters(
            snapshot.size
          );
        }
      );

    const unsubVotes =
      onSnapshot(
        collection(
          db,
          "science_votes"
        ),
        (snapshot) => {
          setVotes(
            snapshot.size
          );
        }
      );

    return () => {

      unsubCampaigns();

      unsubPosters();

      unsubVotes();
    };

  }, []);

  return (
    <div>

      <div className="mb-8">

        <h1 className="text-4xl font-bold">
          Dashboard
        </h1>

        <p className="mt-2 text-slate-500">
          Poster Voting Analytics
        </p>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

        <Card>
          <CardContent className="p-6">

            <p className="text-sm text-slate-500">
              Campaigns
            </p>

            <h2 className="mt-4 text-5xl font-bold">
              {campaigns}
            </h2>

          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">

            <p className="text-sm text-slate-500">
              Posters
            </p>

            <h2 className="mt-4 text-5xl font-bold">
              {posters}
            </h2>

          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">

            <p className="text-sm text-slate-500">
              Votes
            </p>

            <h2 className="mt-4 text-5xl font-bold">
              {votes}
            </h2>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}