import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import * as core from '@actions/core';
import * as main from '../src/main';
import * as service from '../src/service';
import q from 'q';
import http from 'http';

const systemResponse_SUCCESS = {"systems": [{"id": 10, "name": "fake-system"}]};
const environmentResponse_SUCCESS = {"environments": [ {"id": 29, "name": "fake-environment", "systemId": 10 }]}
const instanceResponse_SUCCESS = {"instances": [{"id": 131, "name": "fake-instance"}]};
const provision_SUCCESS = {
  "environmentId": 29,
  "instanceId": 131,
  "abortOnFailure": true,
  "steps": [
    {
      "percent": 0,
      "stepId": 0,
      "description": "string",
      "name": "string",
      "result": "SUCCESS"
    }
  ],
  "status": "SUCCESS",
  "eventId": 0
}
const getProvision_SUCCESS = {"eventId": 1, "environmentId": 29, "instanceId": 131, "abortOnFailure": true, "status": "success", "steps": []};

test('test basic deploy environment', () => {
    jest.spyOn(core, 'getInput').mockImplementation((val) => {
        if (val === 'ctpUrl') {
            return 'https://fake-ctp-endpoint:8080/em/'
        } else if (val === 'ctpUsername' || val === 'ctpPassword') {
            return 'admin';
        } else if (val === 'systemName') {
            return 'fake-system'
        } else if (val === 'environmentName') {
          return 'fake-environment'
        } else if (val === 'instanceName') {
          return 'fake-instance'
       }
    });
    jest.spyOn(service.WebService.prototype, 'findInEM').mockImplementation((path, property, name) => {
        let def = q.defer();
        let promise = new Promise((resolve, reject) => {
            def.resolve = resolve;
            def.reject = reject;
        });
        console.log('findInEM invoked');
        var res = new http.IncomingMessage(null);
        res.statusCode = 200;
        if (path === '/api/v2/systems') {
          def.resolve(systemResponse_SUCCESS);
        }
        else if (path === '/api/v2/environments') {
          def.resolve(environmentResponse_SUCCESS);
        }
        else if (path === '/api/v2/environments/29/instances') {
          def.resolve(instanceResponse_SUCCESS);
      }
        return promise;
    });
    jest.spyOn(service.WebService.prototype, 'postToEM').mockImplementation((path, data) => {
        let def = q.defer();
        let promise = new Promise((resolve, reject) => {
            def.resolve = resolve;
            def.reject = reject;
        });
        console.log('postToEM invoked');
        var res = new http.IncomingMessage(null);
        res.statusCode = 200;
        if (path === '/api/v2/provisions') {
          def.resolve(provision_SUCCESS);
        }
        return promise;
    });
    jest.spyOn(service.WebService.prototype, 'getFromEM').mockImplementation((path) => {
      let def = q.defer();
      let promise = new Promise((resolve, reject) => {
          def.resolve = resolve;
          def.reject = reject;
      });
      console.log('getFromEM invoked');
      var res = new http.IncomingMessage(null);
        res.statusCode = 200;
        if (path === '/api/v2/provisions/1') {
          def.resolve(getProvision_SUCCESS);
        }
      return promise;
  });
    main.run();
});

// shows how the runner will run a javascript action with env / stdout protocol
/*
test('test runs', () => {
  process.env['INPUT_CTPURL'] = 'http://34.221.143.134:8080/em/'
  process.env['INPUT_CTPUSERNAME'] = 'demo'
  process.env['INPUT_CTPPASSWORD'] = 'demo-user'
  process.env['INPUT_SYSTEM'] = 'ParaBank'
  process.env['INPUT_ENVIRONMENT'] = 'Retail Services (Silo 1)'
  process.env['INPUT_INSTANCE'] = 'Negative'
  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }
  console.log(cp.execFileSync(np, [ip], options).toString())
})
*/
