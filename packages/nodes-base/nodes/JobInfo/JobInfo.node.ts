import type { INodeType, INodeTypeDescription } from "n8n-workflow";
import { NodeConnectionType } from "n8n-workflow";
import type { IExecuteFunctions } from "n8n-workflow";
import puppeteer from "puppeteer";  // Switch back to regular puppeteer

// ... [rest of the imports and interface] ...

export class JobInfo implements INodeType {
  // ... [description stays the same] ...

  async execute(this: IExecuteFunctions) {
    const items = this.getInputData();
    const returnData = [];

    for (let i = 0; i < items.length; i++) {
      try {
        // ... [parameter getting code stays the same] ...

        const browser = await puppeteer.launch({
          headless: true,
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
          ],
        });

        // ... [rest of the code stays the same] ...

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        returnData.push({
          json: {
            error: errorMessage,
            details: "Error launching browser. Using built-in Chrome.",
          },
        });
      }
    }

    return [returnData];
  }
}
