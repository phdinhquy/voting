export interface Campaign {
  id: string;

  name: string;

  slug: string;

  description: string;

  academicYear: string;

  startAt: number;

  endAt: number;

  voteStartAt: number;

  voteEndAt: number;

  bannerUrl?: string;

  isActive: boolean;

  createdAt: number;

  updatedAt: number;
}