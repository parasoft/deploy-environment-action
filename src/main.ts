/// <reference path="typings/parasoft-em-api.d.ts" />

import * as core from '@actions/core'
import http = require('http');
import https = require('https');
import q = require('q');
import url = require('url');
import {wait} from './wait'

var emBaseURL = url.parse(core.getInput('ctpUrl'));
if (emBaseURL.path === '/') {
    emBaseURL.path = '/em';
} else if (emBaseURL.path === '/em/') {
    emBaseURL.path = '/em';
}
var protocol : any = emBaseURL.protocol === 'https:' ? https : http;
var protocolLabel = emBaseURL.protocol || 'http:';
var username = core.getInput('ctpUsername');

var getFromEM = function<T>(path: string) : q.Promise<T>{
  var def = q.defer<T>();
  var options = {
      host: emBaseURL.hostname,
      port: emBaseURL.port,
      path: emBaseURL.path + path,
      auth: undefined,
      headers: {
          'Accept': 'application/json'
      }
  }
  if (protocolLabel === 'https:') {
      options['rejectUnauthorized'] = false;
      options['agent'] = false;
  }
  if (username) {
      options.auth = username + ':' +  core.getInput('ctpPassword');
  }
  console.log('GET ' + protocolLabel + '//' + options.host + ':' + options.port + options.path);
  var responseString = "";
  protocol.get(options, (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
          responseString += chunk;
      });
      res.on('end', () => {
          console.log('    response ' + res.statusCode + ':  ' + responseString);
          var responseObject = JSON.parse(responseString);
          def.resolve(responseObject);
      });
  }).on('error', (e) => {
      def.reject(e);
  });
  return def.promise;
};

var findInEM = function<T>(path: string, property: string, name: string) :q.Promise<T> {
  var def = q.defer<T>();
  var options = {
      host: emBaseURL.hostname,
      port: emBaseURL.port,
      path: emBaseURL.path + path,
      auth: undefined,
      headers: {
          'Accept': 'application/json'
      }
  }
  if (protocolLabel === 'https:') {
      options['rejectUnauthorized'] = false;
      options['agent'] = false;
  }
  if (username) {
    options.auth = username + ':' +  core.getInput('ctpPassword');
  }
  var responseString = "";
  console.log('GET ' + protocolLabel + '//' + options.host + ':' + options.port + options.path);
  protocol.get(options, (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
          responseString += chunk;
      });
      res.on('end', () => {
          console.log('    response ' + res.statusCode + ':  ' + responseString);
          var responseObject = JSON.parse(responseString);
          if (typeof responseObject[property] === 'undefined') {
              def.reject(property + ' does not exist in response object from ' + path);
              return;
          }
          for (var i = 0; i < responseObject[property].length; i++) {
              if (responseObject[property][i].name === name) {
                  def.resolve(responseObject[property][i]);
                  return;
              }
          }
          def.reject('Could not find name "' + name + '" in ' + property + ' from ' + path);
          return;
      });
  }).on('error', (e) => {
      def.reject(e);
  });
  return def.promise;
};

var postToEM = function<T>(path: string, data: any) : q.Promise<T>{
  var def = q.defer<T>();
  var options = {
      host: emBaseURL.hostname,
      port: parseInt(emBaseURL.port),
      path: emBaseURL.path + path,
      method: 'POST',
      auth: undefined,
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      }
  }
  if (protocolLabel === 'https:') {
      options['rejectUnauthorized'] = false;
      options['agent'] = false;
  }
  if (username) {
    options.auth = username + ':' +  core.getInput('ctpPassword');
  }
  console.log('POST ' + protocolLabel + '//' + options.host + ':' + options.port + options.path);
  var responseString = "";
  var req = protocol.request(options, (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
          responseString += chunk;
      });
      res.on('end', () => {
          console.log('    response ' + res.statusCode + ':  ' + responseString);
          var responseObject = JSON.parse(responseString);
          def.resolve(responseObject);
      });
  }).on('error', (e) => {
      def.reject(e);
  });
  req.write(JSON.stringify(data));
  req.end();
  return def.promise;
}

async function run(): Promise<void> {
  var systemName = core.getInput('system');
  var systemId;
  var environmentName = core.getInput('environment');
  var environmentId;
  var instanceName = core.getInput('instance');
  var instanceId;
  var copyToVirtualize = core.getInput('copyToVirtualize');
  var duplicateDataRepo = core.getInput('duplicateDataRepo');
  var virtualizeName = core.getInput('virtServerName');
  var newEnvironmentName = core.getInput('newEnvironmentName');
  var virtualizeServerId;

  var instancesPromise = findInEM<EMSystem>('/api/v2/systems', 'systems', systemName).then((system: EMSystem) => {
      core.debug('Found system ' + system.name + ' with id ' + system.id);
      systemId = system.id;
      return findInEM<EMEnvironment>('/api/v2/environments', 'environments', environmentName);
  }).then((environment: EMEnvironment) => {
      environmentId = environment.id;
      return findInEM<EMEnvironmentInstance>('/api/v2/environments/' + environmentId + '/instances', 'instances', instanceName);
  });
  if (copyToVirtualize === 'true') {
    instancesPromise = instancesPromise.then((instance : EMEnvironmentInstance) => {
        return findInEM<VirtServer>('/api/v2/servers', 'servers', virtualizeName);
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
                "username": core.getInput('repoUser'),
                "password": core.getInput('repoPassword'),
            }
            copyEnv.dataRepoSettings = dataRepoSettings;
            console.log("Data repo host: " + dataRepoSettings.host);
        }
        return postToEM<EMEnvironmentCopyResult>('/api/v2/environments/copy?async=false', copyEnv);
    }).then((copyResult: EMEnvironmentCopyResult) => {
        environmentId = copyResult.environmentId;
        return findInEM<EMEnvironmentInstance>('/api/v2/environments/' + environmentId + '/instances', 'instances', instanceName);
    });
  }
  instancesPromise.then((instance: EMEnvironmentInstance) => {
    instanceId = instance.id;
    return postToEM<EMProvisionResult>('/api/v2/provisions', {
        environmentId: environmentId,
        instanceId: instanceId,
        abortOnFailure: false
    });
  }).then((res: EMProvisionResult) => {
    var eventId = res.eventId;
    var status = res.status;
    var checkStatus = function() {
        getFromEM<EMProvisionResult>('/api/v2/provisions/' + eventId).then((res: EMProvisionResult) => {
            status = res.status;
            if (status === 'running' || status === 'waiting') {
                setTimeout(checkStatus, 1000);
            } else if (status === 'success') {
                core.debug('Successfully provisioned ' + core.getInput('instance'));
            } else if (status === 'canceled') {
                core.warning('Provisioning canceled.');
            } else {
                core.error('Provisioning failed with status:  ' + status);
                core.setFailed('Provisioning failed with status:  ' + status);
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
