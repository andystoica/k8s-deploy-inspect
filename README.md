# K8s Deployment listing with Node.js

Simple K8s cluster inspection tool for retrieving deployment information.

## Installation
Clone the Git repository, install the npm dependencies and link the bin commadn with `npm link`. After that, simply use `kdi` to read the list of deployments, their creation date and associated images. It is assumed that Node.js and NPM are installed on the system and also `kubectl` is configured to connect with the Kubernetes cluster.

The *kubernetes-client* module is configured automatically by trying the `KUBECONFIG` environment variable first, then `~/.kube/config`, then an in-cluster service account, and lastly settling on a default proxy configuration.

```
mkdir kdi && cd kdi
git clone https://github.com/andystoica/k8s-deploy-inspect
npm install
npm link
```

