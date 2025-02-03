import {
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	IExecuteFunctions,
} from 'n8n-workflow';
import puppeteer from 'puppeteer';

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
				displayName: 'Job Title(s)',
				name: 'jobTitle',
				type: 'string',
				default: '',
				description: 'Title(s) of the job position(s), separate multiple with commas',
				required: false,
				placeholder: 'e.g. CEO, Founder, Director',
			},
			{
				displayName: 'Industry(s)',
				name: 'industry',
				type: 'string',
				default: '',
				description: 'Industry sector(s) of the job(s), separate multiple with commas',
				required: false,
				placeholder: 'e.g. Technology, Healthcare, Finance',
			},
			{
				displayName: 'Company(s)',
				name: 'company',
				type: 'string',
				default: '',
				description: 'Name(s) of the company(s), separate multiple with commas',
				required: false,
				placeholder: 'e.g. Apple, Google, Microsoft',
			},
			{
				displayName: 'Location(s)',
				name: 'location',
				type: 'string',
				default: '',
				description: 'Location(s) of the job(s), separate multiple with commas',
				required: false,
				placeholder: 'e.g. New York, Remote, London',
			},
			{
				displayName: 'Search LinkedIn Profiles',
				name: 'searchLinkedIn',
				type: 'boolean',
				default: true,
				description: 'Whether to search for LinkedIn profiles matching these criteria',
			},
		],
	};

	async execute(this: IExecuteFunctions) {
		const items = this.getInputData();
		const returnData = [];

		for (let i = 0; i < items.length; i++) {
			const searchLinkedIn = this.getNodeParameter('searchLinkedIn', i, true) as boolean;

			if (searchLinkedIn) {
				try {
					const jobTitles = (this.getNodeParameter('jobTitle', i, '') as string)
						.split(',')
						.map((t) => t.trim())
						.filter(Boolean);
					const industries = (this.getNodeParameter('industry', i, '') as string)
						.split(',')
						.map((t) => t.trim())
						.filter(Boolean);
					const companies = (this.getNodeParameter('company', i, '') as string)
						.split(',')
						.map((t) => t.trim())
						.filter(Boolean);
					const locations = (this.getNodeParameter('location', i, '') as string)
						.split(',')
						.map((t) => t.trim())
						.filter(Boolean);

					// Launch browser
					const browser = await puppeteer.launch({
						headless: false, // Set to true in production
						args: ['--no-sandbox', '--disable-setuid-sandbox'],
					});

					const page = await browser.newPage();
					await page.setUserAgent(
						'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
					);

					// For each combination of criteria, perform a search
					for (const title of jobTitles) {
						for (const industry of industries) {
							for (const location of locations) {
								const searchQuery = `site:linkedin.com/in/ ${title} ${industry} ${location}`;

								await page.goto('https://www.google.com');
								await page.waitForSelector('input[name="q"]');
								await page.type('input[name="q"]', searchQuery);
								await page.keyboard.press('Enter');
								await page.waitForSelector('#search');

								// Extract LinkedIn URLs
								const links = await page.evaluate(() => {
									const results = [];
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

								// Add each result as a separate item
								for (const link of links) {
									returnData.push({
										json: {
											profileUrl: link.url,
											searchCriteria: {
												jobTitle: title,
												industry: industry,
												location: location,
											},
										},
									});
								}

								// Wait briefly between searches
								await new Promise((r) => setTimeout(r, 2000));
							}
						}
					}

					await browser.close();
				} catch (error) {
					console.error('Search error:', error);
					returnData.push({
						json: {
							error: error.message,
						},
					});
				}
			}
		}

		return [returnData];
	}
}
