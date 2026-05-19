export interface Poster {
  id: string;

  campaignId: string;

  title: string;

  slug: string;

  posterUrl: string;

  authors: string[];

  instructors: string[];

  department?: string;

  summary?: string;

  voteCount: number;

  isPublished: boolean;

  createdAt: number;

  updatedAt: number;
}