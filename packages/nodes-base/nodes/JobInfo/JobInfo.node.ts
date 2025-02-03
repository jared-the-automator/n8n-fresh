import type { INodeType, INodeTypeDescription } from "n8n-workflow";
import { NodeConnectionType } from "n8n-workflow";
import type { IExecuteFunctions } from "n8n-workflow";
import puppeteer from "puppeteer-core";
import chromium from "chromium";

// ... rest of the interface ...

export class JobInfo implements INodeType {
  // ... rest of the description ...

  async execute(this: IExecuteFunctions) {
    const items = this.getInputData();
    const returnData = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const enableSearch = this.getNodeParameter("enableSearch", i, true) as boolean;

        if (!enableSearch) {
          returnData.push({
            json: {
              message: "LinkedIn search is disabled",
            },
          });
          continue;
        }

        // ... rest of the parameter getting code ...

        const browser = await puppeteer.launch({
          executablePath: chromium.path,
          headless: true,
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
          ],
        });

        // ... rest of the code remains the same ...

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        returnData.push({
          json: {
            error: errorMessage,
            details: "Error launching browser. Please check system configuration.",
            chromiumPath: chromium.path,
          },
        });
      }
    }

    return [returnData];
  }
}
