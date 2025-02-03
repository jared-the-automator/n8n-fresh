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
	// ... [previous code until execute function] ...

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

				// Use Puppeteer's Chrome
				const browserFetcher = puppeteer.createBrowserFetcher();
				const revisionInfo = await browserFetcher.download('1108766');

				const browser = await puppeteer.launch({
					headless: true,
					executablePath: revisionInfo.executablePath,
					args: [
						'--no-sandbox',
						'--disable-setuid-sandbox',
						'--disable-dev-shm-usage',
						'--disable-gpu',
					],
				});

				const page = await browser.newPage();
				await page.setUserAgent(
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
				);

				const searchQuery = `site:linkedin.com/in/ (${jobTitles.join(' OR ')}) (${industries.join(' OR ')}) (${locations.join(' OR ')})`;

				await page.goto('https://www.google.com', { waitUntil: 'networkidle0' });
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

				if (links.length === 0) {
					returnData.push({
						json: {
							message: 'No LinkedIn profiles found matching the criteria',
							searchCriteria: {
								jobTitle: jobTitles.join(', '),
								industry: industries.join(', '),
								location: locations.join(', '),
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
									jobTitle: jobTitles.join(', '),
									industry: industries.join(', '),
									location: locations.join(', '),
								},
							},
						});
					});
				}

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
