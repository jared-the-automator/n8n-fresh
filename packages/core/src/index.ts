import { Workflow } from 'n8n-workflow';

console.log('n8n Core Starting...');
const workflow = new Workflow();
console.log('Workflow Version:', workflow.version);
