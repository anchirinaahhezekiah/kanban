import { expect, test } from "@playwright/test";

test("kanban mvp flow", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Kanban MVP Board" })).toBeVisible();

  const todoNameInput = page.getByLabel("todo-name");
  await todoNameInput.fill("Sprint Ready");
  await expect(todoNameInput).toHaveValue("Sprint Ready");

  const firstTitle = page.getByPlaceholder("Card title").first();
  const firstDetails = page.getByPlaceholder("Card details").first();
  await firstTitle.fill("E2E added card");
  await firstDetails.fill("through browser automation");
  await page.getByRole("button", { name: "Add card" }).first().click();
  await expect(page.getByText("E2E added card")).toBeVisible();

  const movedCard = page.locator("article").filter({ hasText: "E2E added card" });
  const doneColumn = page.locator('[data-column-dropzone="done"]');
  const movedCardBox = await movedCard.boundingBox();
  const doneColumnBox = await doneColumn.boundingBox();
  if (!movedCardBox || !doneColumnBox) {
    throw new Error("Could not calculate drag coordinates");
  }
  await page.mouse.move(movedCardBox.x + movedCardBox.width / 2, movedCardBox.y + movedCardBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(doneColumnBox.x + 20, doneColumnBox.y + 20, { steps: 12 });
  await page.mouse.up();
  await expect(doneColumn.getByText("E2E added card")).toBeVisible();

  await page.getByRole("button", { name: "Delete E2E added card" }).click();
  await expect(page.getByText("E2E added card")).toHaveCount(0);
});
