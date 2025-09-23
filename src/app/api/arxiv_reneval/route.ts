import { verifySignatureAppRouter } from "@upstash/qstash/nextjs"
import { fetchAndUpsertYesterday, consoleTrial } from "@/services/arxiv"

async function handler(request: Request) {
  const data = await request.json()
  

  for (let i = 0; i < 10; i++) {
    await consoleTrial(data.message)
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  return Response.json({ success: true })
}

export const POST = verifySignatureAppRouter(handler)