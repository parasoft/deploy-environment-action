<p align="center">
  <a href="https://github.com/parasoft/deploy-environment-action/actions"><img alt="typescript-action status" src="https://github.com/actions/typescript-action/workflows/build-test/badge.svg"></a>
</p>

# Deploy an environment v1

This action allows you to deploy a Parasoft service virtualization environment to a given Continous Testing Platform endpoint.

## Usage

Add the following to your github workflow yml file with the required inputs

```yaml
uses: parasoft/deploy-environment-action@v1
with:
  ctpUrl: 'http://exampleUrl'
  ctpUsername: 'username'
  ctpPassword: 'password'
  system: 'system'
  environment: 'environment'
  instance: 'instance'
```

### Additional optional inputs include:

**abortOnFailure:** 
   Aborts a provisioning action on failure and marks this action as failed\
   Use 'true' to set this flag. Defaulted to 'false' if excluded

**copyToVirtualize:**
   Virtual assets in the environment will be replicated on another server\
   Use 'true' to set this flag. Defaulted to 'false' if excluded

**virtServerName:**
   The environment assets will be copied to a Virtualize server matching this name

**newEnvironmentName:**
   The name for the replicated environment can be used to later destroy the environment

**duplicateDataRepo:**
   Duplicate associated data repositories before provisioning\
   Use 'true' to set this flag. Defaulted to 'false' if excluded

**duplicateType:**
   Where to duplicate data repository\
   Use "default" to duplicate to the current data repository server on the specified system. If this input is not specified and duplicateDataRepo is 'true', then "default" will be used.\
   Use "target" to duplicate to a data repository server on the same host as the target Virtualize server\
   Use "custom" to duplicate to a data repository server on a specified host

**repoHost:**
  The host of the data repository server\
  Include this input only if duplicateType is set to "custom"

**repoPort:**
  The port of the data repository server\
  Include this input if duplicateType is set to "target" or "custom"

**repoUsername:**
  The username of the data repository server\
  Include this input if duplicateType is set to "target" or "custom"

**repoPassword:**
  The password of the data repository server\
  Include this input if duplicateType is set to "target" or "custom"

## Build and test this action locally

Install the dependencies  
```bash
$ npm install
```

Build the typescript and package it for distribution
```bash
$ npm run build && npm run package
```

Run the tests
```bash
$ npm test

 PASS  ./index.test.js

...
```