import { getComponentDemo } from "../../../lib/demo-utils"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { component, defaultProps } = body

    console.log("[demo] component", component)
    console.log("[demo] defaultProps", defaultProps)

    const demo = await getComponentDemo(component, defaultProps)
    console.log("[demo] response", demo)

    return NextResponse.json({ success: true, demo })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    )
  }
}
