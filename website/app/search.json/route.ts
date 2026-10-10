import { searchData } from "lib/search-meta"

export const dynamic = "force-static"

export function GET() {
  return Response.json(searchData)
}
