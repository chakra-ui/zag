import type { NextApiRequest, NextApiResponse } from "next"
import { getComponentDemo } from "../../lib/demo-utils"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { component, defaultProps } = req.body
  console.log("[demo] component", component)
  console.log("[demo] defaultProps", defaultProps)
  try {
    const demo = await getComponentDemo(component, defaultProps)
    console.log("[demo] response", demo)
    res.status(200).json({ success: true, demo })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}
