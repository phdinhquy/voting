"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  createCampaign,
  deleteCampaign,
  listenCampaigns,
} from "@/modules/science/poster-voting/services/campaign.service";

import { Campaign } from "@/modules/science/poster-voting/types/campaign";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<
    Campaign[]
  >([]);

  const [name, setName] = useState("");

  const [slug, setSlug] = useState("");

  const [description, setDescription] =
    useState("");

  const [academicYear, setAcademicYear] =
    useState("");

  const [startAt, setStartAt] = useState("");

  const [endAt, setEndAt] = useState("");

  const [voteStartAt, setVoteStartAt] =
    useState("");

  const [voteEndAt, setVoteEndAt] =
    useState("");

  useEffect(() => {
    const unsubscribe =
      listenCampaigns(setCampaigns);

    return () => unsubscribe();
  }, []);

  async function handleCreateCampaign() {
    if (
      !name ||
      !slug ||
      !academicYear
    )
      return;

    await createCampaign({
      name,

      slug,

      description,

      academicYear,

      startAt: new Date(startAt).getTime(),

      endAt: new Date(endAt).getTime(),

      voteStartAt:
        new Date(voteStartAt).getTime(),

      voteEndAt:
        new Date(voteEndAt).getTime(),

      isActive: true,

      createdAt: Date.now(),

      updatedAt: Date.now(),
    });

    setName("");

    setSlug("");

    setDescription("");

    setAcademicYear("");

    setStartAt("");

    setEndAt("");

    setVoteStartAt("");

    setVoteEndAt("");
  }

  async function handleDelete(id: string) {
    const confirmDelete = confirm(
      "Delete this campaign?"
    );

    if (!confirmDelete) return;

    await deleteCampaign(id);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">
          Campaigns
        </h1>
      </div>

      {/* Form */}
      <Card className="mt-8">
        <CardContent className="space-y-4 p-6">

          <Input
            placeholder="Campaign Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
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
            placeholder="Academic Year"
            value={academicYear}
            onChange={(e) =>
              setAcademicYear(
                e.target.value
              )
            }
          />

          <Input
            placeholder="Description"
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-2 text-sm">
                Event Start
              </p>

              <Input
                type="datetime-local"
                value={startAt}
                onChange={(e) =>
                  setStartAt(
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <p className="mb-2 text-sm">
                Event End
              </p>

              <Input
                type="datetime-local"
                value={endAt}
                onChange={(e) =>
                  setEndAt(
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-2 text-sm">
                Vote Start
              </p>

              <Input
                type="datetime-local"
                value={voteStartAt}
                onChange={(e) =>
                  setVoteStartAt(
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <p className="mb-2 text-sm">
                Vote End
              </p>

              <Input
                type="datetime-local"
                value={voteEndAt}
                onChange={(e) =>
                  setVoteEndAt(
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          <Button
            onClick={handleCreateCampaign}
          >
            Create Campaign
          </Button>
        </CardContent>
      </Card>

      {/* List */}
      <div className="mt-8 grid gap-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    {campaign.name}
                  </h2>

                  <p className="text-sm text-slate-500">
                    {campaign.academicYear}
                  </p>

                  <p className="mt-2 text-sm">
                    Vote:
                    {" "}
                    {new Date(
                      campaign.voteStartAt
                    ).toLocaleString()}
                    {" → "}
                    {new Date(
                      campaign.voteEndAt
                    ).toLocaleString()}
                  </p>
                </div>

                <Button
                  variant="destructive"
                  onClick={() =>
                    handleDelete(
                      campaign.id
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