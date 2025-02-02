import {
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	IExecuteFunctions,
} from 'n8n-workflow';

export class JobInfo implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Job Info',
		name: 'jobInfo',
		icon: 'fa:briefcase',
		group: ['transform'],
		version: 1,
		description: 'Create and manage job information',
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
		],
	};

	async execute(this: IExecuteFunctions) {
		const items = this.getInputData();
		const returnData = [];

		for (let i = 0; i < items.length; i++) {
			const jobInfo: Record<string, string[]> = {};

			// Get and process parameters, splitting on commas and trimming whitespace
			const jobTitle = this.getNodeParameter('jobTitle', i, '') as string;
			if (jobTitle) jobInfo.jobTitles = jobTitle.split(',').map((title) => title.trim());

			const industry = this.getNodeParameter('industry', i, '') as string;
			if (industry) jobInfo.industries = industry.split(',').map((ind) => ind.trim());

			const company = this.getNodeParameter('company', i, '') as string;
			if (company) jobInfo.companies = company.split(',').map((comp) => comp.trim());

			const location = this.getNodeParameter('location', i, '') as string;
			if (location) jobInfo.locations = location.split(',').map((loc) => loc.trim());

			returnData.push({
				json: jobInfo,
			});
		}

		return [returnData];
	}
}
