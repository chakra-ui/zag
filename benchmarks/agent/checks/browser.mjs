// The benchmark task by hand through Playwright on the Zag screen, as browser tools would, in both panel modes.
import assert from "node:assert/strict"
import { isCorrect } from "../harness/task.mjs"

export default async function ({ open, check }) {
  for (const panels of ["keep", "unmount"]) {
    await check(`react-zag, panels ${panels}: clicking through saves the right settings`, async () => {
      const { page, errors, saved } = await open({ screen: "react-zag", panels })
      await page.getByLabel("Project name").fill("Atlas")
      await page.getByRole("combobox", { name: "Visibility" }).click()
      await page.getByRole("option", { name: "Internal" }).click()
      await page.getByRole("tab", { name: "Members" }).click()
      await page.getByRole("button", { name: "Actions for Priya Shah" }).click()
      await page.getByRole("menuitem", { name: "Make admin" }).click()
      await page.getByRole("button", { name: "Actions for Tom Becker" }).click()
      await page.getByRole("menuitem", { name: "Remove" }).click()
      await page.getByRole("alertdialog").getByRole("button", { name: "Remove" }).click()
      await page.getByRole("tab", { name: "Notifications" }).click()
      await page.getByRole("button", { name: "Email" }).click()
      // Zag's switch is a visually hidden checkbox.
      await page.getByRole("checkbox", { name: "Deploy failures" }).click({ force: true })
      await page.getByRole("checkbox", { name: "Weekly digest" }).click({ force: true })
      await page.getByRole("button", { name: "Save settings" }).click()
      assert.equal(isCorrect(await saved()), true)
      assert.deepEqual(errors, [])
      await page.close()
    })
  }
}
