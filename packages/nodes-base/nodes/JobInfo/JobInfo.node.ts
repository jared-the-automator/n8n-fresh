import { INodeType, INodeTypeDescription, NodeConnectionType, IExecuteFunctions } from 'n8n-workflow';

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
        inputs: [{
            displayName: 'Input',
            maxConnections: 1,
            required: true,
            type: NodeConnectionType.Main
        }],
        outputs: [{
            displayName: 'Output',
            maxConnections: 1,
            type: NodeConnectionType.Main
        }],
        properties: [
            {
                displayName: 'Job Title',
                name: 'jobTitle',
                type: 'string',
                default: '',
                description: 'Title of the job position',
                required: false,
            },
            {
                displayName: 'Industry',
                name: 'industry',
                type: 'string',
                default: '',
                description: 'Industry sector of the job',
                required: false,
            },
            {
                displayName: 'Company',
                name: 'company',
                type: 'string',
                default: '',
                description: 'Name of the company',
                required: false,
            },
            {
                displayName: 'Location',
                name: 'location',
                type: 'string',
                default: '',
                description: 'Location of the job',
                required: false,
            }
        ],
    };

    async execute(this: IExecuteFunctions) {
        const items = this.getInputData();
        const returnData = [];

        for (let i = 0; i < items.length; i++) {
            const jobInfo: Record<string, string> = {};
            
            // Only include parameters that have values
            const jobTitle = this.getNodeParameter('jobTitle', i, '') as string;
            if (jobTitle) jobInfo.jobTitle = jobTitle;
            
            const industry = this.getNodeParameter('industry', i, '') as string;
            if (industry) jobInfo.industry = industry;
            
            const company = this.getNodeParameter('company', i, '') as string;
            if (company) jobInfo.company = company;
            
            const location = this.getNodeParameter('location', i, '') as string;
            if (location) jobInfo.location = location;

            returnData.push({
                json: jobInfo
            });
        }

        return [returnData];
    }
}
