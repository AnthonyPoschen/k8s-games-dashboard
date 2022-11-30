import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import * as k8s from '@kubernetes/client-node';

const kc: k8s.KubeConfig = new k8s.KubeConfig();
// kc.loadFromDefault();
kc.loadFromFile('/Users/zanven/.kube/config')

const k8sContainer = kc.makeApiClient(k8s.AppsV1Api);
// const k8scon = kc.makeApiClient(k8s.);
const zServerType = z.enum(["Deployment", "Statefulset"])
const zServer = z.object({ Name: z.string(), Namespace: z.string(), Type: zServerType, DesiredReplicas: z.number(), CurrentReplicas: z.number() }).array()
export const kubernetesRouter = router({
  get: publicProcedure.output(zServer).query(async () => {
    let deployPromise = k8sContainer.listDeploymentForAllNamespaces().then((data) => {
      var results: typeof zServer._type = [];
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
      var results: typeof zServer._type = [];
      return results;
    })
    let statefulsetPromise = k8sContainer.listStatefulSetForAllNamespaces().then((data) => {
      var results: typeof zServer._type = [];
      data.body.items.forEach((item) => {
        if (item.metadata?.namespace == undefined || item.metadata.name == undefined) {
          return
        }
        if (item.metadata?.namespace?.startsWith("games-") == false) {
          return
        }
        console.log(item)
        if (item.status?.replicas == undefined || item.spec?.replicas == undefined) { return }
        results.push({
          Name: item.metadata.name, Namespace: item.metadata.namespace, CurrentReplicas: item.status?.readyReplicas || 0, DesiredReplicas: item.spec?.replicas, Type: "Statefulset",
        })
      })
      return results
    }).catch((e) => {
      console.log(e);
      var results: typeof zServer._type = [];
      return results;
    })

    return Promise.all([deployPromise, statefulsetPromise]).then((results) => {
      var result: typeof zServer._type = [];
      results.forEach((array) => {
        result.push(...array)
      })
      return result
    })
  }),
  set: publicProcedure.input(z.object({ Name: z.string(), Namespace: z.string(), Type: zServerType, Replicas: z.number() })).output(z.boolean()).mutation(async (q) => {
    let { Name, Namespace, Type, Replicas } = q.input
    console.log("Request recieved", q.input)
    switch (Type) {
      case "Deployment": {
        return k8sContainer.readNamespacedDeployment(Name, Namespace).then((data) => {
          let deployment = data.body;
          if (deployment.spec?.replicas == undefined) { return false }
          deployment.spec.replicas = Replicas
          return k8sContainer.replaceNamespacedDeployment(Name, Namespace, deployment).then(() => { return true }).catch(() => { return false })
        }).catch((e) => { console.log(e); return false })
      }
      case "Statefulset": {
        return k8sContainer.readNamespacedStatefulSet(Name, Namespace).then((data) => {
          let sts = data.body;
          if (sts.spec?.replicas == undefined) { return false }
          sts.spec.replicas = Replicas
          return k8sContainer.replaceNamespacedStatefulSet(Name, Namespace, sts).then(() => { return true }).catch(() => { return false })
        }).catch((e) => { console.log(e); return false })
      }
    }
  })
})
