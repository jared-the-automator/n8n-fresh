import { INodeType, INodeTypeDescription, NodeConnectionType, IExecuteFunctions } from 'n8n-workflow';

export class JobInfo implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Job Info',
        name: 'jobInfo',
        icon: 'fa:briefcase',
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
            type: NodeConnectionType.Main
        }],
        outputs: [{
            displayName: 'Output',
            maxConnections: 1,
            type: NodeConnectionType.Main
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

    async execute(this: IExecuteFunctions) {
        return [this.helpers.returnJsonArray([{
            jobTitle: 'Software Developer',
            company: 'Example Corp',
            location: 'Remote',
            salary: '$100,000',
        }])];
    }
}
