import { verifySignatureAppRouter } from "@upstash/qstash/nextjs"
import { fetchAndUpsertYesterday, consoleTrial } from "@/services/arxiv"

async function handler(request: Request) {
  

  await consoleTrial("Hello")
  await fetchAndUpsertYesterday()
  return Response.json({ success: true })
}

export const POST = verifySignatureAppRouter(handler)