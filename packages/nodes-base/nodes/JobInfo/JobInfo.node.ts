import {
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	IExecuteFunctions,
} from 'n8n-workflow';
import puppeteer from 'puppeteer';

interface LinkedInResult {
	url: string;
	title: string;
}

export class JobInfo implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Job Info',
		name: 'jobInfo',
		icon: 'fa:briefcase',
		group: ['transform'],
		version: 1,
		description: 'Search for LinkedIn profiles based on job criteria',
		defaults: {
			name: 'Job Info',
		},
		inputs: [
			{
				displayName: 'Input',
				maxConnections: 1,
				required: true,
				type: NodeConnectionType.Main,
			},
		],
		outputs: [
			{
				displayName: 'Output',
				maxConnections: 1,
				type: NodeConnectionType.Main,
			},
		],
		properties: [
			{
				displayName: 'Enable LinkedIn Search',
				name: 'enableSearch',
				type: 'boolean',
				default: true,
				description: 'Whether to search for LinkedIn profiles',
			},
			{
				displayName: 'Job Title(s)',
				name: 'jobTitle',
				type: 'string',
				default: '',
				description: 'Title(s) of the job position(s), separate multiple with commas',
				required: true,
				displayOptions: {
					show: {
						enableSearch: [true],
					},
				},
				placeholder: 'e.g. CEO, Founder, Director',
			},
			{
				displayName: 'Industry(s)',
				name: 'industry',
				type: 'string',
				default: '',
				description: 'Industry sector(s) of the job(s), separate multiple with commas',
				required: true,
				displayOptions: {
					show: {
						enableSearch: [true],
					},
				},
				placeholder: 'e.g. Technology, Healthcare, Finance',
			},
			{
				displayName: 'Location(s)',
				name: 'location',
				type: 'string',
				default: '',
				description: 'Location(s) of the job(s), separate multiple with commas',
				required: true,
				displayOptions: {
					show: {
						enableSearch: [true],
					},
				},
				placeholder: 'e.g. New York, Remote, London',
			},
			{
				displayName: 'Maximum Results',
				name: 'maxResults',
				type: 'number',
				default: 10,
				description: 'Maximum number of LinkedIn profiles to return',
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
				const enableSearch = this.getNodeParameter('enableSearch', i, true) as boolean;

				if (!enableSearch) {
					returnData.push({
						json: {
							message: 'LinkedIn search is disabled',
						},
					});
					continue;
				}

				const maxResults = this.getNodeParameter('maxResults', i, 10) as number;
				const jobTitles = (this.getNodeParameter('jobTitle', i, '') as string)
					.split(',')
					.map((t) => t.trim())
					.filter(Boolean);
				const industries = (this.getNodeParameter('industry', i, '') as string)
					.split(',')
					.map((t) => t.trim())
					.filter(Boolean);
				const locations = (this.getNodeParameter('location', i, '') as string)
					.split(',')
					.map((t) => t.trim())
					.filter(Boolean);

				const browser = await puppeteer.launch({
					headless: 'new',
					args: [
						'--no-sandbox',
						'--disable-setuid-sandbox',
						'--disable-dev-shm-usage',
						'--disable-accelerated-2d-canvas',
						'--disable-gpu',
					],
				});

				const page = await browser.newPage();
				await page.setUserAgent(
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
				);

				const searchQuery = `site:linkedin.com/in/ (${jobTitles.join(' OR ')}) (${industries.join(' OR ')}) (${locations.join(' OR ')})`;

				await page.goto('https://www.google.com');
				await page.waitForSelector('input[name="q"]');
				await page.type('input[name="q"]', searchQuery);
				await page.keyboard.press('Enter');
				await page.waitForSelector('#search');

				const links: LinkedInResult[] = await page.evaluate(() => {
					const results: LinkedInResult[] = [];
					document.querySelectorAll('a').forEach((link) => {
						const href = link.getAttribute('href');
						if (href && href.includes('linkedin.com/in/')) {
							results.push({
								url: href,
								title: link.textContent || '',
							});
						}
					});
					return results;
				});

				links.slice(0, maxResults).forEach((link) => {
					returnData.push({
						json: {
							profileUrl: link.url,
							profileTitle: link.title,
							searchCriteria: {
								jobTitle: jobTitles.join(', '),
								industry: industries.join(', '),
								location: locations.join(', '),
							},
						},
					});
				});

				await browser.close();
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
				returnData.push({
					json: {
						error: errorMessage,
					},
				});
			}
		}

		return [returnData];
	}
}
