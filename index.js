const Client = require('kubernetes-client').Client;       // K8S Client libray
const { table, getBorderCharacters } = require('table');  // Used for formatting tables
const moment = require('moment');                         // Data formatting



function formatDeployments(ns, deployments) {

  // Table configuration
  const tableConfig = {
    border: getBorderCharacters('norc'),
  };

  // Table header
  const data = [[
    'DEPLOYMENT',
    'IMAGE(s)',
    'UPDATED ON'
  ]];

  // Table rows and corresponding data columns
  deployments.body.items.forEach((deployment) => {
    data.push([
      deployment.metadata.name,
      deployment.spec.template.spec.containers.map((container) => container.image).join('\n'),
      moment(deployment.metadata.creationTimestamp).format('DD-MM-YYYY HH:mm:ss')
    ]);
  });

  // Information displayed before each table
  const infoMessage = ` NAMESPACE: ${ns}\n`;
  return infoMessage + table(data, tableConfig);
}



async function main() {
  try {
    // Initialise API Client    
    const client = new Client({ version: '1.13' });    
    
    // Get a list of all namespaces
    const namespaces = await client.api.v1.namespaces.get();

    // Iterate through namespace and display their deployments
    namespaces.body.items
      .map((item) => item.metadata.name)
      .forEach(async (namespace) => {
        const deployments = await client.apis.apps.v1.namespaces(namespace).deployments.get();
        
        // Only show namespaces which contain deployments
        if (deployments.body.items.length)
          console.log(formatDeployments(namespace, deployments));
      });
      
  } catch (err) {
    // K8s API error handling
    console.error('Error: Could not connect to Kubernetes.');
    process.exitCode = 1;
  }
}

main();
