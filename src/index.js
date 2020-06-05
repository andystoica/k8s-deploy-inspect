#!/usr/bin/env node
const Client = require('kubernetes-client').Client;       // K8S Client library
const { table, getBorderCharacters } = require('table');  // Table formatting
const moment = require('moment');                         // Data formatting


// Extracts the creationTimestamp from the active
// replicaset associated with a particular deployment
function getLastUpdate(deployment, replicasets) {
  const uid = deployment.metadata.uid;
  
  // Filter out the replicaset by keeping only those
  // owned by the deployment and having at least 1 replica
  const rs = replicasets.filter(replicaset => 
    replicaset.metadata.ownerReferences
      .map(ref => ref.uid)
      .includes(uid) &&
    replicaset.spec.replicas !== 0
  );
  
  // Return the first item or null if no replicaset could be found
  return  (rs.length > 0) ? rs[0].metadata.creationTimestamp : null;
}


// Formats data for output as a table
function renderTable(data) {
  
  const tableConfig = {
    border: getBorderCharacters('norc')
  };
  
  const output = [[
    'DEPLOYMENT',
    'IMAGE(s)',
    'LAST UPDATED'
  ]];
  
  data.forEach(item => output.push([
    item.name,
    item.images.join('\n'),
    item.lastUpdate
  ]));
  
  return table(output ,tableConfig);
  
}


async function main() {  
  
  // Keep the first argument as the namespace or
  // exit if no arguments are provided.
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: kdi <namespace>');
    process.exitCode = 1;
    return;
  }
  
  const namespace = args[0];
  const data = [];
  let deployments;
  let replicasets;
  
  try {
    // Query the API for deployments and replicasets
    let response;
    const client = new Client({ version: '1.13' });
    
    response = await client.apis.apps.v1.namespaces(namespace).deployments.get();
    deployments = response.body.items;
    
    response = await client.apis.apps.v1.namespaces(namespace).replicasets.get();
    replicasets = response.body.items;

  } catch (err) {
    // K8s API error handling
    console.error('Error: Could not connect to Kubernetes.', err);
    process.exitCode = 1;
    return;
  }
  
  if (deployments.length === 0) {
      console.log('Error: no deployment found in this namespace.');
      process.exitCode = 1;
      return;
    }
    
    // For each deployment, extract the required information
    deployments.forEach(deployment => {
      data.push({
        name: deployment.metadata.name,
        images: deployment.spec.template.spec.containers.map(container => container.image),
        lastUpdate: moment(getLastUpdate(deployment, replicasets)).format('DD-MM-YYYY HH:mm:ss')
      });
    });
    
    // Display the information as a table
    console.log(`\n Deployment information for '${namespace}' namespace`)
    console.log(renderTable(data));
}

main();