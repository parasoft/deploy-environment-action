/// <reference path="typings/parasoft-em-api.d.ts" />

import * as core from '@actions/core';
import * as service from './service';

export async function run() {
  var ctpEndpoint = core.getInput('ctpUrl', { required: true });
  var ctpUsername = core.getInput('ctpUsername', { required: true });
  var ctpPassword = core.getInput('ctpPassword', { required: true });
  var ctpService = new service.WebService(ctpEndpoint, 'em', { username: ctpUsername, password: ctpPassword });
  var systemName = core.getInput('system', { required: true });
  var systemId;
  var environmentName = core.getInput('environment', { required: true });
  var environmentId;
  var instanceName = core.getInput('instance', { required: true });
  var instanceId;
  var copyToVirtualize = core.getInput('copyToVirtualize', { required: false });
  var duplicateDataRepo = core.getInput('duplicateDataRepo', { required: false });
  var virtualizeName = core.getInput('virtServerName', { required: false });
  var newEnvironmentName = core.getInput('newEnvironmentName', { required: false });
  var virtualizeServerId;

  var instancesPromise = ctpService.findInEM<EMSystem>('/api/v2/systems', 'systems', systemName).then((system: EMSystem) => {
      core.debug('Found system ' + system.name + ' with id ' + system.id);
      systemId = system.id;
      return ctpService.findInEM<EMEnvironment>('/api/v2/environments', 'environments', environmentName);
  }).then((environment: EMEnvironment) => {
      environmentId = environment.id;
      return ctpService.findInEM<EMEnvironmentInstance>('/api/v2/environments/' + environmentId + '/instances', 'instances', instanceName);
  });
  if (copyToVirtualize === 'true') {
    instancesPromise = instancesPromise.then((instance : EMEnvironmentInstance) => {
        return ctpService.findInEM<VirtServer>('/api/v2/servers', 'servers', virtualizeName);
    }).then((server: VirtServer) => {
        virtualizeServerId = server.id;
        var duplicateType = core.getInput('duplicateType');
        var copyEnv: {[k: string]: any} = {
            originalEnvId: environmentId,
            serverId: virtualizeServerId,
            newEnvironmentName: newEnvironmentName,
            copyDataRepo: duplicateDataRepo
        };
        if (duplicateType === 'target' || duplicateType === 'custom') {
            var dataRepoSettings = {
                "host": duplicateType === 'target' ? server.host : core.getInput('repoHost'),
                "port": core.getInput('repoPort'),
                "username": core.getInput('repoUsername'),
                "password": core.getInput('repoPassword'),
            }
            copyEnv.dataRepoSettings = dataRepoSettings;
            console.log("Data repo host: " + dataRepoSettings.host);
        }
        return ctpService.postToEM<EMEnvironmentCopyResult>('/api/v2/environments/copy?async=false', copyEnv);
    }).then((copyResult: EMEnvironmentCopyResult) => {
        environmentId = copyResult.environmentId;
        return ctpService.findInEM<EMEnvironmentInstance>('/api/v2/environments/' + environmentId + '/instances', 'instances', instanceName);
    });
  }
  instancesPromise.then((instance: EMEnvironmentInstance) => {
    instanceId = instance.id;
    return ctpService.postToEM<EMProvisionResult>('/api/v2/provisions', {
        environmentId: environmentId,
        instanceId: instanceId,
        abortOnFailure: core.getInput('abortOnFailure') === 'true'
    });
  }).then((res: EMProvisionResult) => {
    var eventId = res.eventId;
    var status = res.status;
    var checkStatus = function() {
        ctpService.getFromEM<EMProvisionResult>('/api/v2/provisions/' + eventId).then((res: EMProvisionResult) => {
            status = res.status;
            if (status === 'running' || status === 'waiting') {
                setTimeout(checkStatus, 1000);
            } else if (status === 'success') {
                core.debug('Successfully provisioned ' + core.getInput('instance'));
            } else if (status === 'canceled') {
                core.warning('Provisioning canceled.');
            } else {
                core.error('Provisioning failed with status:  ' + status);
                if (core.getInput('abortOnFailure') === 'true') {
                  core.setFailed('Provisioning failed with status:  ' + status);
                }
            }
        });
    };
    if (status === 'running' || status === 'waiting') {
        setTimeout(checkStatus, 1000);
    }
  }).catch((e) => {
    core.setFailed(e.message);
  });
}

run();
