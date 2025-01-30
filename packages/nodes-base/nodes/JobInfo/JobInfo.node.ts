import { INodeType, INodeTypeDescription, NodeConnectionType } from 'n8n-workflow';

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
        inputs: [
            {
                type: NodeConnectionType.Main,
            }
        ],
        outputs: [
            {
                type: NodeConnectionType.Main,
            }
        ],
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
