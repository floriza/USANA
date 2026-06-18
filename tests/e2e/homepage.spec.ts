import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads homepage with correct elements", async ({ page }) => {
    await page.goto("/");

    // Check header
    await expect(page.getByText("USANA Store")).toBeVisible();

    // Check navigation
    await expect(page.getByRole("link", { name: "All Products" })).toBeVisible();

    // Check compliance notice
    await expect(page.getByText("Independent USANA Distributor")).toBeVisible();

    // Check footer disclaimer
    await expect(
      page.getByText(/not owned or operated by USANA Health Sciences/)
    ).toBeVisible();
  });

  test("health disclaimer is visible", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText(/statements have not been evaluated/)
    ).toBeVisible();
  });

  test("navigation links work", async ({ page }) => {
    await page.goto("/");
    await page.click("text=All Products");
    await expect(page).toHaveURL(/\/products/);
  });
});

test.describe("Products page", () => {
  test("loads products page", async ({ page }) => {
    await page.goto("/products");
    await expect(page.getByRole("heading", { name: /All Products/i })).toBeVisible();
  });

  test("search works", async ({ page }) => {
    await page.goto("/products");
    await page.fill('input[placeholder*="Search"]', "USANA");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/search=USANA/);
  });
});

test.describe("Auth pages", () => {
  test("login page renders", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
    await expect(page.getByText("Continue with Google")).toBeVisible();
  });

  test("register page renders with consent checkboxes", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByRole("heading", { name: "Create Account" })).toBeVisible();
    await expect(page.getByText("Terms & Conditions")).toBeVisible();
    await expect(page.getByText("Privacy Policy")).toBeVisible();
  });
});
