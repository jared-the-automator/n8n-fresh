import type { INodeType, INodeTypeDescription } from "n8n-workflow";
import { NodeConnectionType } from "n8n-workflow";
import type { IExecuteFunctions } from "n8n-workflow";
import { searchLinkedInProfiles } from "./puppeteerHelper";

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
      {
        displayName: "Industry(s)",
        name: "industry",
        type: "string",
        default: "",
        description: "Industry sector(s) of the job(s), separate multiple with commas",
        required: true,
        displayOptions: {
          show: {
            enableSearch: [true],
          },
        },
      },
      {
        displayName: "Location(s)",
        name: "location",
        type: "string",
        default: "",
        description: "Location(s) of the job(s), separate multiple with commas",
        required: true,
        displayOptions: {
          show: {
            enableSearch: [true],
          },
        },
      },
      {
        displayName: "Maximum Results",
        name: "maxResults",
        type: "number",
        default: 10,
        description: "Maximum number of LinkedIn profiles to return",
        displayOptions: {
          show: {
            enableSearch: [true],
          },
        },
      },
    ],
  };

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

        const links = await searchLinkedInProfiles(jobTitles, industries, locations);

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
