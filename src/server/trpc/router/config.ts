import { z } from "zod";
import * as k8s from '@kubernetes/client-node';
import * as os from 'os';

const homedir = os.homedir();

export const kc: k8s.KubeConfig = new k8s.KubeConfig();
// kc.loadFromDefault();
if (process.env.NODE_ENV == "development") {
  kc.loadFromFile(`${homedir}/.kube/config`)
} else {
  kc.loadFromDefault()
}

export const k8sContainer = kc.makeApiClient(k8s.AppsV1Api);
export const zServerType = z.enum(["Deployment", "Statefulset"])
export const zServer = z.object(
  {
    Name: z.string(),
    Namespace: z.string(),
    Type: zServerType,
    DesiredReplicas: z.number(),
    CurrentReplicas: z.number()
  })
