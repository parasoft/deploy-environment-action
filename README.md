<p align="center">
  <a href="https://github.com/parasoft/deploy-environment-action/actions"><img alt="typescript-action status" src="https://github.com/actions/typescript-action/workflows/build-test/badge.svg"></a>
</p>

# Deploy an Environment

This action enables you to stand up a consistent, disposable environment for testing your application. It deploys and provisions a Parasoft service virtualization environment to the specified Continous Testing Platform endpoint. You can also configure the action to copy Parasoft virtual assets (PVA) and data repositories from an exisiting environment when deploying the new environment.  

## Usage

Add the following entry to your Github workflow YAML file with the required inputs: 

```yaml
uses: parasoft/deploy-environment-action@v1
with:
  ctpUrl: 'http://exampleUrl'
  ctpUsername: 'username'
  ctpPassword: ${{ secrets.password }}
  system: 'system'
  environment: 'environment'
  instance: 'instance'
```

### Required Inputs
The following inputs are required to use this action:

| Input | Description |
| --- | --- |
| `ctpURL` | Specifies the Continuous Testing Platform endpoint where the environment will be deployed. |
| `ctpUsername` | Specifies a user name for accessing the Continuous Testing Platform endpoint. |
| `ctpPassword` | Specifies a Github encrypted secret for accessing the Continuous Testing Platform endpoint. Refer to the [Encrypted Secrets Documentation](https://docs.github.com/en/actions/reference/encrypted-secrets) for details on how to create an encrypted secret. |
| `system` | Specifies the name of the system in Continous Testing Platform that contains the environment instance you want to provision. |
| `environment` | Specifies the name of the environment that contains the instances you want to provision. |
| `instance` | Specifies the environment instance you want to provision. |

### Optional Inputs
The following optional inputs are also supported: 

| Input | Description |
| --- | --- |
| `abortOnFailure` | Aborts a provisioning action on failure and marks the action as failed. Set to `true` to enable. Default is `false`. |
| `copyToVirtualize` | Replicates virtual assets in the environment to another server. Set to `true` to enable. Default is `false`. |
| `virtServerName` | Specifies the name of a target Virtualize server for replicated virtual assets. The `copyToVirtualize` input must be enabled. |
| `newEnvironmentName` | Specifies the name for the replicated environment. This environment can be destroyed with the destroy-environment-action when testing has been completed. |
| `duplicateDataRepo` | Duplicates the associated data repositories before provisioning. Set to `true` to enable. Default is `false`. |
| `duplicateType` | Specifies where to duplicate the data repository. You can specify the following values: <ul> <li>`default`: Duplicates to the current data repository server on the specified system.</li> <li>`target`: Duplicates to a data repository server on the same host as the target Virtualize server.</li> <li>`custom`: Duplicate to a data repository server on a specified host. See `reportHost`.</li></ul> |
| `repoHost` | Specifies the host of the data repository server when `duplicateType` is `custom`. |
| `repoPort` | Specifies the port of the data repository server when `duplicateType` is set to `target` or `custom`. |
| `repoUsername` | Specifies the username of the data repository server when `duplicateType` is set to `target` or `custom`. |
| `repoPassword` | Specifies the password of the data repository server when `duplicateType` is set to `target` or `custom`. |


## Build and Test this Action Locally

1. Install the dependencies:  
```bash
$ npm install
```

2. Build the typescript and package it for distribution:
```bash
$ npm run build && npm run package
```

3. Run the tests:
```bash
$ npm test

 PASS  ./index.test.js

...
```
