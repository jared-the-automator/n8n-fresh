import type { INodeType, INodeTypeDescription } from "n8n-workflow";
import { NodeConnectionType } from "n8n-workflow";
import type { IExecuteFunctions } from "n8n-workflow";
import type { Browser } from "puppeteer-core";
import puppeteer from "puppeteer-core";

interface LinkedInResult {
  url: string;
  title: string;
}

export class JobInfo implements INodeType {
  description: INodeTypeDescription = {
    // ... [previous description code stays the same] ...
  };

  private async initBrowser(): Promise<Browser> {
    const chromePath = "/tmp/chrome/chrome/opt/google/chrome/chrome";
    
    return puppeteer.launch({
      headless: true,
      executablePath: chromePath,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-first-run",
        "--single-process",
        "--disable-extensions",
        "--disable-software-rasterizer",
        "--disk-cache-dir=/tmp/chrome-cache",
        "--user-data-dir=/tmp/chrome-user-data"
      ],
    });
  }

  // ... [rest of the code stays the same] ...
}
