import type { INodeType, INodeTypeDescription } from "n8n-workflow";
import { NodeConnectionType } from "n8n-workflow";
import type { IExecuteFunctions } from "n8n-workflow";
import { PuppeteerService } from "./puppeteerService";

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
      // ... [rest of the properties remain the same]
    ],
  };

  private async searchProfiles(
    jobTitles: string[],
    industries: string[],
    locations: string[]
  ): Promise<LinkedInResult[]> {
    const puppeteer = PuppeteerService.getInstance();
    
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: "/tmp/chrome/chrome/opt/google/chrome/chrome",
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

    try {
      const page = await browser.newPage();
      page.setDefaultTimeout(15000);

      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );

      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
      });

      const searchQuery = `site:linkedin.com/in/ (${jobTitles.join(" OR ")}) (${industries.join(
        " OR "
      )}) (${locations.join(" OR ")})`;

      await page.goto("https://www.google.com", { 
        waitUntil: "networkidle0",
        timeout: 30000
      });

      const searchInput = await page.waitForSelector('input[name="q"]', {
        visible: true,
        timeout: 5000
      });

      if (!searchInput) {
        throw new Error("Could not find search input");
      }

      await page.type('input[name="q"]', searchQuery, { delay: 100 });
      await page.keyboard.press("Enter");

      await Promise.race([
        page.waitForSelector("#search", { timeout: 10000 }),
        page.waitForSelector("#captcha", { timeout: 10000 })
      ]);

      const captcha = await page.$("#captcha");
      if (captcha) {
        throw new Error("Google CAPTCHA detected");
      }

      return await page.evaluate(() => {
        const results = [];
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
    } finally {
      await browser.close();
    }
  }

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

        const links = await this.searchProfiles(jobTitles, industries, locations);

        if (links.length === 0) {
          returnData.push({
            json: {
              message: "No LinkedIn profiles found matching the criteria",
              searchCriteria: {
                jobTitle: jobTitles.join(", "),
                industry: industries.join(", "),
                location: locations.join(", "),
              },
            },
          });
        } else {
          links.slice(0, maxResults).forEach((link) => {
            returnData.push({
              json: {
                profileUrl: link.url,
                profileTitle: link.title,
                searchCriteria: {
                  jobTitle: jobTitles.join(", "),
                  industry: industries.join(", "),
                  location: locations.join(", "),
                },
              },
            });
          });
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
