import type { INodeType, INodeTypeDescription } from 'n8n-workflow';

export class JobInfo implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Job Info',
        name: 'jobInfo',
        group: ['transform'],
        version: 1,
        description: 'Get information about a job',
        defaults: {
            name: 'Job Info',
        },
        inputs: [{
            displayName: 'Input',
            maxConnections: 1,
            required: true,
            type: 'main'
        }],
        outputs: [{
            displayName: 'Output',
            maxConnections: 1,
            type: 'main'
        }],
        properties: [
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'string',
                default: 'Get Job Info',
                description: 'The operation to perform',
            },
        ],
    };

    async execute() {
        // Return the job info
        return [
            [
                {
                    json: {
                        jobTitle: 'Software Developer',
                        company: 'Example Corp',
                        location: 'Remote',
                        salary: '$100,000',
                    },
                },
            ],
        ];
    }
}
