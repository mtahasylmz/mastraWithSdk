import { verifySignatureAppRouter } from "@upstash/qstash/nextjs"
import { fetchAndUpsertYesterday} from "@/services/arxiv"

async function handler(request: Request) {
  console.log("Fetching and upserting yesterday's papers...")
  await fetchAndUpsertYesterday()
  console.log("Fetching and upserting yesterday's papers completed")
  return Response.json({ success: true })
}

export const POST = verifySignatureAppRouter(handler)