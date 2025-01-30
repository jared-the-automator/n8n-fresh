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
                required: true,
            },
            {
                displayName: 'Industry',
                name: 'industry',
                type: 'string',
                default: '',
                description: 'Industry sector of the job',
                required: true,
            },
            {
                displayName: 'Company',
                name: 'company',
                type: 'string',
                default: '',
                description: 'Name of the company',
                required: true,
            },
            {
                displayName: 'Location',
                name: 'location',
                type: 'string',
                default: '',
                description: 'Location of the job',
                required: true,
            }
        ],
    };

    async execute(this: IExecuteFunctions) {
        const items = this.getInputData();
        const returnData = [];

        for (let i = 0; i < items.length; i++) {
            const jobTitle = this.getNodeParameter('jobTitle', i) as string;
            const industry = this.getNodeParameter('industry', i) as string;
            const company = this.getNodeParameter('company', i) as string;
            const location = this.getNodeParameter('location', i) as string;

            returnData.push({
                json: {
                    jobTitle,
                    industry,
                    company,
                    location,
                }
            });
        }

        return [returnData];
    }
}
