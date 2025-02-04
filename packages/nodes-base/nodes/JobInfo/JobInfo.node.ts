import type { IExecuteFunctions } from "n8n-core";
import type { INodeExecutionData, INodeType, INodeTypeDescription } from "n8n-workflow";
import { NodeConnectionType } from "n8n-workflow";

// No top-level await, use dynamic import later
let puppeteerPromise = import('puppeteer').catch(error => {
  console.error("Failed to load puppeteer:", error);
  return null;
});

interface LinkedInResult {
  url: string;
  title: string;
}

export class JobInfo implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Job Info",
    name: "jobInfo",
    icon: "fa:briefcase",
    group: ["transform"],
    version: 1,
    description: "Search for LinkedIn profiles based on job criteria",
    defaults: {
      name: "Job Info",
    },
    inputs: [
      {
        displayName: "Input",
        maxConnections: 1,
        required: true,
        type: NodeConnectionType.Main,
      },
    ],
    outputs: [
      {
        displayName: "Output",
        maxConnections: 1,
        type: NodeConnectionType.Main,
      },
    ],
    properties: [
      {
        displayName: "Enable LinkedIn Search",
        name: "enableSearch",
        type: "boolean",
        default: true,
        description: "Whether to search for LinkedIn profiles",
      },
      {
        displayName: "Job Title(s)",
        name: "jobTitle",
        type: "string",
        default: "",
        description: "Title(s) of the job position(s), separate multiple with commas",
        required: true,
        displayOptions: {
          show: {
            enableSearch: [true],
          },
        },
      },
      // ... rest of the properties remain the same
    ],
  };

  private getBrowserLaunchOptions() {
    return {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-first-run",
        "--single-process",
        "--disable-extensions",
      ],
    };
  }

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const puppeteerModule = await puppeteerPromise;
    if (!puppeteerModule) {
      throw new Error("Puppeteer is not initialized");
    }

    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

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

        const maxResults = this.getNodeParameter("maxResults", i, 10) as number;
        const jobTitles = (this.getNodeParameter("jobTitle", i, "") as string)
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
        const industries = (this.getNodeParameter("industry", i, "") as string)
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
        const locations = (this.getNodeParameter("location", i, "") as string)
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);

        const browser = await puppeteerModule.launch(this.getBrowserLaunchOptions());

        try {
          // ... rest of the code remains the same
        } finally {
          await browser.close();
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        returnData.push({
          json: {
            error: errorMessage,
            details: "Error during LinkedIn profile search",
          },
        });
      }
    }

    return [returnData];
  }
}
