import * as core from '@actions/core'
import http = require('http');
import https = require('https');
import q = require('q');
import url = require('url');

export interface Authorization {
    username: string,
    password: string
}

export class WebService {
    private baseURL: url.Url;
    protected protocol: typeof https | typeof http;
    protected protocolLabel: string;
    protected authorization: Authorization;

    constructor(endpoint: string, context: string, authorization?: Authorization) {
        this.baseURL = url.parse(endpoint);
        if (this.baseURL.path === '/') {
            this.baseURL.path += context;
        } else if (this.baseURL.path === `/${context}/`) {
            this.baseURL.path = `/${context}`;
        }
        this.authorization = authorization;
        this.protocol = this.baseURL.protocol === 'https:' ? https : http;
        this.protocolLabel = this.baseURL.protocol || 'http:';
    }

    getFromEM<T>(path: string) : Promise<T> {
        let def = q.defer<T>();
        let promise = new Promise<T>((resolve, reject) => {
            def.resolve = resolve;
            def.reject = reject;
        });
        var options = {
            host: this.baseURL.hostname,
            port: this.baseURL.port,
            path: this.baseURL.path + path,
            auth: undefined,
            headers: {
                'Accept': 'application/json'
            }
        }
        if (this.protocolLabel === 'https:') {
            options['rejectUnauthorized'] = false;
            options['agent'] = false;
        }
        if (this.authorization) {
            options.auth = this.authorization.username + ':' +  this.authorization.password;
        }
        core.debug('GET ' + this.protocolLabel + '//' + options.host + ':' + options.port + options.path);
        var responseString = "";
        this.protocol.get(options, (res) => {
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                responseString += chunk;
            });
            res.on('end', () => {
                core.debug('    response ' + res.statusCode + ':  ' + responseString);
                var responseObject = JSON.parse(responseString);
                def.resolve(responseObject);
            });
        }).on('error', (e) => {
            def.reject(e);
        });
        return promise;
      };
      
      findInEM<T>(path: string, property: string, name: string) : Promise<T> {
        let def = q.defer<T>();
        let promise = new Promise<T>((resolve, reject) => {
            def.resolve = resolve;
            def.reject = reject;
        });
        var options = {
            host: this.baseURL.hostname,
            port: this.baseURL.port,
            path: this.baseURL.path + path,
            auth: undefined,
            headers: {
                'Accept': 'application/json'
            }
        }
        if (this.protocolLabel === 'https:') {
            options['rejectUnauthorized'] = false;
            options['agent'] = false;
        }
        if (this.authorization) {
          options.auth = this.authorization.username + ':' +  this.authorization.password;
        }
        var responseString = "";
        core.debug('GET ' + this.protocolLabel + '//' + options.host + ':' + options.port + options.path);
        this.protocol.get(options, (res) => {
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                responseString += chunk;
            });
            res.on('end', () => {
                core.debug('    response ' + res.statusCode + ':  ' + responseString);
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
        return promise;
      };
      
      postToEM<T>(path: string, data: any) : Promise<T>{
        let def = q.defer<T>();
        let promise = new Promise<T>((resolve, reject) => {
            def.resolve = resolve;
            def.reject = reject;
        });
        var options = {
            host: this.baseURL.hostname,
            port: parseInt(this.baseURL.port),
            path: this.baseURL.path + path,
            method: 'POST',
            auth: undefined,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }
        if (this.protocolLabel === 'https:') {
            options['rejectUnauthorized'] = false;
            options['agent'] = false;
        }
        if (this.authorization) {
          options.auth = this.authorization.username + ':' +  this.authorization.password;
        }
        core.debug('POST ' + this.protocolLabel + '//' + options.host + ':' + options.port + options.path);
        var responseString = "";
        var req = this.protocol.request(options, (res) => {
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                responseString += chunk;
            });
            res.on('end', () => {
                core.debug('    response ' + res.statusCode + ':  ' + responseString);
                var responseObject = JSON.parse(responseString);
                def.resolve(responseObject);
            });
        }).on('error', (e) => {
            def.reject(e);
        });
        req.write(JSON.stringify(data));
        req.end();
        return promise;
      }
} 
