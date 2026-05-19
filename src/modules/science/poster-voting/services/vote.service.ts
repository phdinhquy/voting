import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "@/firebase/client";

const COLLECTION_NAME =
  "science_votes";

type VoteInput = {
  campaignId: string;

  posterId: string;

  voterId: string;

  voterEmail?: string;

  voterType:
    | "internal"
    | "guest";
};

/* ========================================
   CREATE VOTE
======================================== */

export async function votePoster({
  campaignId,
  posterId,
  voterId,
  voterEmail,
  voterType,
}: VoteInput) {

  try {

    /* ========================================
       VALIDATE CAMPAIGN
    ======================================== */

    const campaignRef = doc(
      db,
      "science_campaigns",
      campaignId
    );

    const campaignSnap =
      await getDoc(
        campaignRef
      );

    if (
      !campaignSnap.exists()
    ) {

      throw new Error(
        "Không tìm thấy đợt bình chọn."
      );
    }

    const campaign =
      campaignSnap.data();

    const now =
      Date.now();

    if (
      !campaign.isActive
    ) {

      throw new Error(
        "Đợt bình chọn chưa kích hoạt."
      );
    }

    if (
      campaign.voteStartAt &&
      now < campaign.voteStartAt
    ) {

      throw new Error(
        "Bình chọn chưa bắt đầu."
      );
    }

    if (
      campaign.voteEndAt &&
      now > campaign.voteEndAt
    ) {

      throw new Error(
        "Đợt bình chọn đã kết thúc."
      );
    }

    /* ========================================
       VALIDATE POSTER
    ======================================== */

    const posterRef = doc(
      db,
      "science_posters",
      posterId
    );

    const posterSnap =
      await getDoc(
        posterRef
      );

    if (
      !posterSnap.exists()
    ) {

      throw new Error(
        "Poster không tồn tại."
      );
    }

    const poster =
      posterSnap.data();

    if (
      !poster.isPublished
    ) {

      throw new Error(
        "Poster chưa được công khai."
      );
    }

    /* ========================================
       CHECK DUPLICATE VOTE
    ======================================== */

    const duplicateQuery =
      query(
        collection(
          db,
          COLLECTION_NAME
        ),

        where(
          "posterId",
          "==",
          posterId
        ),

        where(
          "voterId",
          "==",
          voterId
        )
      );

    const duplicateSnapshot =
      await getDocs(
        duplicateQuery
      );

    if (
      !duplicateSnapshot.empty
    ) {

      throw new Error(
        "Bạn đã bình chọn poster này rồi."
      );
    }

    /* ========================================
       TRANSACTION
    ======================================== */

    await runTransaction(
      db,

      async (
        transaction
      ) => {

        /* =========================
           CREATE VOTE
        ========================= */

        const voteRef = doc(
          collection(
            db,
            COLLECTION_NAME
          )
        );

        transaction.set(
          voteRef,

          {
            campaignId,

            posterId,

            voterId,

            voterEmail:
              voterEmail || "",

            voterType,

            createdAt:
              serverTimestamp(),
          }
        );

        /* =========================
           UPDATE POSTER STATS
        ========================= */

        transaction.update(
          posterRef,

          {
            voteCount:
              increment(1),

            internalVoteCount:
              voterType ===
              "internal"
                ? increment(1)
                : increment(0),

            guestVoteCount:
              voterType ===
              "guest"
                ? increment(1)
                : increment(0),

            updatedAt:
              serverTimestamp(),
          }
        );
      }
    );

    return {
      success: true,
      message:
        "Bình chọn thành công.",
    };

  } catch (error: any) {

    console.error(
      "VOTE_ERROR:",
      error
    );

    throw new Error(
      error.message ||
      "Không thể bình chọn."
    );
  }
}

/* ========================================
   GET USER VOTED POSTERS
======================================== */

export async function getUserVotes(
  voterId: string
) {

  try {

    const q = query(
      collection(
        db,
        COLLECTION_NAME
      ),

      where(
        "voterId",
        "==",
        voterId
      )
    );

    const snapshot =
      await getDocs(q);

    return snapshot.docs.map(
      (item) =>
        item.data().posterId
    );

  } catch (error) {

    console.error(
      "GET_USER_VOTES_ERROR:",
      error
    );

    return [];
  }
}

/* ========================================
   GET POSTER VOTES
======================================== */

export async function getPosterVotes(
  posterId: string
) {

  try {

    const q = query(
      collection(
        db,
        COLLECTION_NAME
      ),

      where(
        "posterId",
        "==",
        posterId
      )
    );

    const snapshot =
      await getDocs(q);

    const votes =
      snapshot.docs.map(
        (doc) => ({
          id: doc.id,
          ...doc.data(),
        })
      );

    return {
      total:
        votes.length,

      internal:
        votes.filter(
          (vote: any) =>
            vote.voterType ===
            "internal"
        ).length,

      guest:
        votes.filter(
          (vote: any) =>
            vote.voterType ===
            "guest"
        ).length,

      votes,
    };

  } catch (error) {

    console.error(
      "GET_POSTER_VOTES_ERROR:",
      error
    );

    return {
      total: 0,
      internal: 0,
      guest: 0,
      votes: [],
    };
  }
}

/* ========================================
   GET CAMPAIGN ANALYTICS
======================================== */

export async function getCampaignAnalytics(
  campaignId: string
) {

  try {

    const q = query(
      collection(
        db,
        COLLECTION_NAME
      ),

      where(
        "campaignId",
        "==",
        campaignId
      )
    );

    const snapshot =
      await getDocs(q);

    const votes =
      snapshot.docs.map(
        (doc) => ({
          id: doc.id,
          ...doc.data(),
        })
      );

    return {

      totalVotes:
        votes.length,

      internalVotes:
        votes.filter(
          (vote: any) =>
            vote.voterType ===
            "internal"
        ).length,

      guestVotes:
        votes.filter(
          (vote: any) =>
            vote.voterType ===
            "guest"
        ).length,

      internalPercent:
        votes.length > 0
          ? Math.round(
              (
                votes.filter(
                  (vote: any) =>
                    vote.voterType ===
                    "internal"
                ).length /
                votes.length
              ) * 100
            )
          : 0,

      guestPercent:
        votes.length > 0
          ? Math.round(
              (
                votes.filter(
                  (vote: any) =>
                    vote.voterType ===
                    "guest"
                ).length /
                votes.length
              ) * 100
            )
          : 0,
    };

  } catch (error) {

    console.error(
      "GET_ANALYTICS_ERROR:",
      error
    );

    return {

      totalVotes: 0,

      internalVotes: 0,

      guestVotes: 0,

      internalPercent: 0,

      guestPercent: 0,
    };
  }
}