export class PuppeteerService {
  private static instance: any;

  private constructor() {}

  public static getInstance(): any {
    if (!PuppeteerService.instance) {
      PuppeteerService.instance = require("puppeteer-core");
    }
    return PuppeteerService.instance;
  }
}
