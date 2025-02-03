import type { INodeType, INodeTypeDescription } from "n8n-workflow";
import { NodeConnectionType } from "n8n-workflow";
import type { IExecuteFunctions } from "n8n-workflow";
import puppeteer from "puppeteer-core";

interface LinkedInResult {
  url: string;
  title: string;
}

export class JobInfo implements INodeType {
  description: INodeTypeDescription = {
    // ... [previous description code remains the same] ...
  };

  async execute(this: IExecuteFunctions) {
    const items = this.getInputData();
    const returnData = [];

    for (let i = 0; i < items.length; i++) {
      try {
        // ... [previous parameter code remains the same] ...

        const browser = await puppeteer.launch({
          executablePath: process.platform === "linux" 
            ? "/usr/bin/chromium-browser"  // Linux path
            : process.platform === "win32"
              ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"  // Windows path
              : "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", // Mac path
          headless: true,
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
          ],
        });

        // ... [rest of the code remains the same] ...

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        returnData.push({
          json: {
            error: errorMessage,
            details: "Error launching browser. Please check Chrome installation.",
            platform: process.platform,
          },
        });
      }
    }

    return [returnData];
  }
}
