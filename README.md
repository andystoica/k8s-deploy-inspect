# K8s Deployment listing with Node.js

Simple K8s cluster inspection tool for retreiving deployment information.

## Installation
Simply install the npm dependencies and execute `npm start`. It is assumed that Node.js and NPM are installed on the system and also kubectl is configured to connect to the Kubernetes cluster.

The kubernetes-client module is configured automatically by trying the KUBECONFIG environment variable first, then ~/.kube/config, then an in-cluster service account, and lastly settling on a default proxy configuration.

```
npm install
npm start
```