import { test } from "@playwright/test"
import { PaginationModel } from "./models/pagination.model"

let I: PaginationModel

test.beforeEach(async ({ page }) => {
  I = new PaginationModel(page)
  await I.goto()
})

test("should have no accessibility violation", async () => {
  await I.checkAccessibility()
})

test("should update page when item is clicked", async () => {
  await I.clickItem("2")
  await I.seeItemIsCurrent("2")
  await I.clickItem("5")
  await I.seeItemIsSelected("5")
})

test("should update page when next button is clicked", async () => {
  await I.clickNext()
  await I.seeItemIsCurrent("2")
  await I.clickNext(3)
  await I.clickItem("5")
  await I.seeItemIsSelected("5")
})

test("should update page when prev button is clicked", async () => {
  await I.clickNext(4)
  await I.seeItemIsSelected("5")
  await I.clickNext()
  await I.clickPrev()
  await I.seeItemIsSelected("5")
  await I.clickPrev(3)
  await I.seeItemIsCurrent("2")
})

test("should call onChange when item is clicked", async () => {
  await I.clickItem("2")
  await I.seeOutputContains(": 2")
})

test("should call onChange when next button is clicked", async () => {
  await I.clickNext()
  await I.seeOutputContains(": 2")
})

test("should call onChange when prev button is clicked", async () => {
  await I.clickItem("5")
  await I.clickPrev()
  await I.seeOutputContains(": 4")
})
