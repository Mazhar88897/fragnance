import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getReviewsCollection } from "@/lib/mongodb";

function jsonError(message: string, status: number, details?: unknown) {
  return NextResponse.json({ ok: false, message, details }, { status });
}

/**
 * GET /api/review/summary?fragrance_id=...
 * Approved reviews only: aggregate votes + name/review/rating list.
 */
export async function GET(request: NextRequest) {
  try {
    const fragranceId = request.nextUrl.searchParams.get("fragrance_id");
    if (!fragranceId) {
      return jsonError("fragrance_id query param is required", 400);
    }
    if (!ObjectId.isValid(fragranceId)) {
      return jsonError("invalid fragrance_id", 400);
    }

    const fragranceObjectId = new ObjectId(fragranceId);
    const col = await getReviewsCollection();

    const [aggregate] = await col
      .aggregate<{
        total_votes: number;
        average_rating: number | null;
        reviews: { name: string; review: string; rating: number }[];
      }>([
        {
          $match: {
            fragrance_id: fragranceObjectId,
            approval: true,
          },
        },
        {
          $facet: {
            stats: [
              {
                $group: {
                  _id: null,
                  total_votes: { $sum: 1 },
                  average_rating: { $avg: "$rating" },
                },
              },
            ],
            reviews: [
              { $sort: { created_at: -1 } },
              {
                $project: {
                  _id: 0,
                  name: 1,
                  review: 1,
                  rating: 1,
                },
              },
            ],
          },
        },
        {
          $project: {
            total_votes: {
              $ifNull: [{ $arrayElemAt: ["$stats.total_votes", 0] }, 0],
            },
            average_rating: {
              $ifNull: [{ $arrayElemAt: ["$stats.average_rating", 0] }, null],
            },
            reviews: 1,
          },
        },
      ])
      .toArray();

    const totalVotes = aggregate?.total_votes ?? 0;
    const average =
      aggregate?.average_rating == null
        ? null
        : Math.round(aggregate.average_rating * 100) / 100;

    return NextResponse.json({
      ok: true,
      fragrance_id: fragranceId,
      total_votes: totalVotes,
      average_rating: average,
      reviews: aggregate?.reviews ?? [],
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return jsonError(message, 500);
  }
}
