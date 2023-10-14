import { getUrl, httpRequest } from '@trpc/client/dist/links/internals/httpUtils'
import {k8sContainer,zServer} from './config'
// const https = require('https');
import { get } from 'http'

export function getFileSystem(server: typeof zServer._type) {
    var options = {
      host: server.Name + "-filesystem." + server.Namespace + ".svc.cluster.local",
      port: 80,
      path: '/'
    };
    get(options, (res) => {
      console.log(res.statusCode)
      console.log(res.pause)
      res.on("data", function(chunk) {
        console.log("BODY: " + chunk); 
      })
    });
  return
}
