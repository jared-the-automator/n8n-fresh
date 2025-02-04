import type { IExecuteFunctions } from "n8n-core";
import type { INodeExecutionData, INodeType, INodeTypeDescription } from "n8n-workflow";
import { NodeConnectionType } from "n8n-workflow";
import puppeteer from "puppeteer";

interface LinkedInResult {
  url: string;
  title: string;
}

export class JobInfo implements INodeType {
  // ... rest of the code remains the same
}
