import type { INodeType, INodeTypeDescription } from "n8n-workflow";
import { NodeConnectionType } from "n8n-workflow";
import type { IExecuteFunctions } from "n8n-workflow";
import puppeteer from "puppeteer";

interface LinkedInResult {
  url: string;
  title: string;
}

export class JobInfo implements INodeType {
  // ... [previous code until page.evaluate] ...

        const links = await page.evaluate(() => {
          const results: LinkedInResult[] = [];
          document.querySelectorAll("a").forEach((link) => {
            const href = link.getAttribute("href");
            if (href && href.includes("linkedin.com/in/")) {
              results.push({
                url: href,
                title: link.textContent || "",
              });
            }
          });
          return results;
        });

// ... [rest of the code stays the same] ...
