import type { INodeType, INodeTypeDescription } from "n8n-workflow";
import { NodeConnectionType } from "n8n-workflow";
import type { IExecuteFunctions } from "n8n-workflow";

const puppeteer = require("puppeteer-core");

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

  private searchProfiles(
    jobTitles: string[],
    industries: string[],
    locations: string[],
    callback: (error: Error | null, results?: LinkedInResult[]) => void
  ): void {
    puppeteer
      .launch({
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
      })
      .then((browser: any) => {
        browser
          .newPage()
          .then((page: any) => {
            page.setDefaultTimeout(15000);

            Promise.all([
              page.setUserAgent(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
              ),
              page.setExtraHTTPHeaders({
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
              })
            ])
              .then(() => {
                const searchQuery = `site:linkedin.com/in/ (${jobTitles.join(" OR ")}) (${industries.join(
                  " OR "
                )}) (${locations.join(" OR ")})`;

                page
                  .goto("https://www.google.com", { waitUntil: "networkidle0", timeout: 30000 })
                  .then(() => {
                    page
                      .waitForSelector('input[name="q"]', { visible: true, timeout: 5000 })
                      .then((searchInput: any) => {
                        if (!searchInput) {
                          browser.close().then(() => {
                            callback(new Error("Could not find search input"));
                          });
                          return;
                        }

                        page
                          .type('input[name="q"]', searchQuery, { delay: 100 })
                          .then(() => {
                            page.keyboard
                              .press("Enter")
                              .then(() => {
                                Promise.race([
                                  page.waitForSelector("#search", { timeout: 10000 }),
                                  page.waitForSelector("#captcha", { timeout: 10000 })
                                ])
                                  .then(() => {
                                    page.$("#captcha").then((captcha: any) => {
                                      if (captcha) {
                                        browser.close().then(() => {
                                          callback(new Error("Google CAPTCHA detected"));
                                        });
                                        return;
                                      }

                                      page
                                        .evaluate(() => {
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
                                        })
                                        .then((results: LinkedInResult[]) => {
                                          browser.close().then(() => {
                                            callback(null, results);
                                          });
                                        })
                                        .catch((error: Error) => {
                                          browser.close().then(() => {
                                            callback(error);
                                          });
                                        });
                                    });
                                  })
                                  .catch((error: Error) => {
                                    browser.close().then(() => {
                                      callback(error);
                                    });
                                  });
                              })
                              .catch((error: Error) => {
                                browser.close().then(() => {
                                  callback(error);
                                });
                              });
                          })
                          .catch((error: Error) => {
                            browser.close().then(() => {
                              callback(error);
                            });
                          });
                      })
                      .catch((error: Error) => {
                        browser.close().then(() => {
                          callback(error);
                        });
                      });
                  })
                  .catch((error: Error) => {
                    browser.close().then(() => {
                      callback(error);
                    });
                  });
              })
              .catch((error: Error) => {
                browser.close().then(() => {
                  callback(error);
                });
              });
          })
          .catch((error: Error) => {
            browser.close().then(() => {
              callback(error);
            });
          });
      })
      .catch((error: Error) => {
        callback(error);
      });
  }

  execute(this: IExecuteFunctions): Promise<[{ json: any }[]]> {
    return new Promise((resolve) => {
      const items = this.getInputData();
      const returnData: { json: any }[] = [];

      let completedItems = 0;

      items.forEach((_, i) => {
        try {
          const enableSearch = this.getNodeParameter("enableSearch", i, true) as boolean;

          if (!enableSearch) {
            returnData.push({
              json: {
                message: "LinkedIn search is disabled",
              },
            });
            completedItems++;
            if (completedItems === items.length) {
              resolve([returnData]);
            }
            return;
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

          this.searchProfiles(
            jobTitles,
            industries,
            locations,
            (error: Error | null, links?: LinkedInResult[]) => {
              if (error) {
                returnData.push({
                  json: {
                    error: error.message,
                    details: "Error during LinkedIn profile search",
                  },
                });
              } else if (!links || links.length === 0) {
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

              completedItems++;
              if (completedItems === items.length) {
                resolve([returnData]);
              }
            }
          );
        } catch (error) {
          returnData.push({
            json: {
              error: error instanceof Error ? error.message : "An unknown error occurred",
              details: "Error during LinkedIn profile search",
            },
          });
          completedItems++;
          if (completedItems === items.length) {
            resolve([returnData]);
          }
        }
      });
    });
  }
}
