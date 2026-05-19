"use client";

import Image from "next/image";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  createPoster,
  deletePoster,
  listenPosters,
  uploadPosterImage,
} from "@/modules/science/poster-voting/services/poster.service";

import { Poster } from "@/modules/science/poster-voting/types/poster";

import {
  listenCampaigns,
} from "@/modules/science/poster-voting/services/campaign.service";

import { Campaign } from "@/modules/science/poster-voting/types/campaign";

export default function PostersPage() {
  const [campaigns, setCampaigns] =
    useState<Campaign[]>([]);

  const [posters, setPosters] =
    useState<Poster[]>([]);

  const [title, setTitle] = useState("");

  const [slug, setSlug] = useState("");

  const [authors, setAuthors] =
    useState("");

  const [instructors, setInstructors] =
    useState("");

  const [campaignId, setCampaignId] =
    useState("");

  const [file, setFile] =
    useState<File | null>(null);

  useEffect(() => {
    const unsubscribePosters =
      listenPosters(setPosters);

    const unsubscribeCampaigns =
      listenCampaigns(setCampaigns);

    return () => {
      unsubscribePosters();

      unsubscribeCampaigns();
    };
  }, []);

  async function handleCreatePoster() {
    if (
      !title ||
      !slug ||
      !campaignId ||
      !file
    )
      return;

    const posterUrl =
      await uploadPosterImage(file);

    await createPoster({
      campaignId,

      title,

      slug,

      posterUrl,

      authors: authors
        .split(",")
        .map((item) => item.trim()),

      instructors: instructors
        .split(",")
        .map((item) => item.trim()),

      voteCount: 0,

      isPublished: true,

      createdAt: Date.now(),

      updatedAt: Date.now(),
    });

    setTitle("");

    setSlug("");

    setAuthors("");

    setInstructors("");

    setCampaignId("");

    setFile(null);
  }

  async function handleDelete(id: string) {
    const confirmDelete = confirm(
      "Delete this poster?"
    );

    if (!confirmDelete) return;

    await deletePoster(id);
  }

  return (
    <div>
      <h1 className="text-4xl font-bold">
        Posters
      </h1>

      {/* Form */}
      <Card className="mt-8">
        <CardContent className="space-y-4 p-6">

          <select
            className="w-full rounded-md border p-3"
            value={campaignId}
            onChange={(e) =>
              setCampaignId(
                e.target.value
              )
            }
          >
            <option value="">
              Select campaign
            </option>

            {campaigns.map((campaign) => (
              <option
                key={campaign.id}
                value={campaign.id}
              >
                {campaign.name}
              </option>
            ))}
          </select>

          <Input
            placeholder="Poster title"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
          />

          <Input
            placeholder="Slug"
            value={slug}
            onChange={(e) =>
              setSlug(e.target.value)
            }
          />

          <Input
            placeholder="Authors (comma separated)"
            value={authors}
            onChange={(e) =>
              setAuthors(e.target.value)
            }
          />

          <Input
            placeholder="Instructors (comma separated)"
            value={instructors}
            onChange={(e) =>
              setInstructors(
                e.target.value
              )
            }
          />

          <Input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setFile(
                e.target.files?.[0] || null
              )
            }
          />

          <Button
            onClick={handleCreatePoster}
          >
            Create Poster
          </Button>
        </CardContent>
      </Card>

      {/* List */}
      <div className="mt-8 grid grid-cols-3 gap-6">
        {posters.map((poster) => (
          <Card key={poster.id}>
            <CardContent className="p-4">

              <div className="relative aspect-[1/1.414] overflow-hidden rounded-xl border">
                <Image
                  src={poster.posterUrl}
                  alt={poster.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="mt-4">
                <h2 className="line-clamp-2 text-lg font-bold">
                  {poster.title}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  {poster.authors.join(", ")}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  GVHD:
                  {" "}
                  {poster.instructors.join(
                    ", "
                  )}
                </p>

                <p className="mt-3 text-sm font-semibold">
                  Votes:
                  {" "}
                  {poster.voteCount}
                </p>

                <Button
                  variant="destructive"
                  className="mt-4 w-full"
                  onClick={() =>
                    handleDelete(
                      poster.id
                    )
                  }
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}