import { Page } from '@playwright/test';

/** Common base for Page Objects — shared seam for cross-page helpers. */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}
}
