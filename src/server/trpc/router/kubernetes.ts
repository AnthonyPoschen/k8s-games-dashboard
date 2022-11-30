import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import * as k8s from '@kubernetes/client-node';
import * as os from 'os';
const homedir = os.homedir();

const kc: k8s.KubeConfig = new k8s.KubeConfig();
// kc.loadFromDefault();
if (process.env.NODE_ENV == "development") {
  kc.loadFromFile(`${homedir}/.kube/config`)
} else {
  kc.loadFromDefault()
}
const k8sContainer = kc.makeApiClient(k8s.AppsV1Api);
// const k8scon = kc.makeApiClient(k8s.);
const zServerType = z.enum(["Deployment", "Statefulset"])
const zServer = z.object({ Name: z.string(), Namespace: z.string(), Type: zServerType, DesiredReplicas: z.number(), CurrentReplicas: z.number() }).array()
export const kubernetesRouter = router({
  get: publicProcedure.output(zServer).query(async () => {
    const deployPromise = k8sContainer.listDeploymentForAllNamespaces().then((data) => {
      const results: typeof zServer._type = [];
      data.body.items.forEach((item) => {

        if (item.metadata?.namespace == undefined || item.metadata.name == undefined) {
          return
        }
        if (item.metadata?.namespace?.startsWith("games-") == false) {
          return
        }
        if (item.status?.replicas == undefined || item.spec?.replicas == undefined) { return }
        results.push({
          Name: item.metadata.name, Namespace: item.metadata.namespace, CurrentReplicas: item.status?.readyReplicas || 0, DesiredReplicas: item.spec?.replicas, Type: "Deployment",
        })
      })
      return results
    }).catch((e) => {
      console.log(e);
      const results: typeof zServer._type = [];
      return results;
    })
    const statefulsetPromise = k8sContainer.listStatefulSetForAllNamespaces().then((data) => {
      const results: typeof zServer._type = [];
      data.body.items.forEach((item) => {
        if (item.metadata?.namespace == undefined || item.metadata.name == undefined) {
          return
        }
        if (item.metadata?.namespace?.startsWith("games-") == false) {
          return
        }
        if (item.status?.replicas == undefined || item.spec?.replicas == undefined) { return }
        results.push({
          Name: item.metadata.name, Namespace: item.metadata.namespace, CurrentReplicas: item.status?.readyReplicas || 0, DesiredReplicas: item.spec?.replicas, Type: "Statefulset",
        })
      })
      return results
    }).catch((e) => {
      console.log(e);
      const results: typeof zServer._type = [];
      return results;
    })

    return Promise.all([deployPromise, statefulsetPromise]).then((results) => {
      const result: typeof zServer._type = [];
      results.forEach((array) => {
        result.push(...array)
      })
      return result
    })
  }),
  set: publicProcedure.input(z.object({ Name: z.string(), Namespace: z.string(), Type: zServerType, Replicas: z.number() })).output(z.boolean()).mutation(async (q) => {
    const { Name, Namespace, Type, Replicas } = q.input
    switch (Type) {
      case "Deployment": {
        return k8sContainer.readNamespacedDeployment(Name, Namespace).then((data) => {
          const deployment = data.body;
          if (deployment.spec?.replicas == undefined) { return false }
          deployment.spec.replicas = Replicas
          return k8sContainer.replaceNamespacedDeployment(Name, Namespace, deployment).then(() => { return true }).catch(() => { return false })
        }).catch((e) => { console.log(e); return false })
      }
      case "Statefulset": {
        return k8sContainer.readNamespacedStatefulSet(Name, Namespace).then((data) => {
          const sts = data.body;
          if (sts.spec?.replicas == undefined) { return false }
          sts.spec.replicas = Replicas
          return k8sContainer.replaceNamespacedStatefulSet(Name, Namespace, sts).then(() => { return true }).catch(() => { return false })
        }).catch((e) => { console.log(e); return false })
      }
    }
  })
})
