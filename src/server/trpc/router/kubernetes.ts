import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import k8s from '@kubernetes/client-node';

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
const k8sHPA = kc.makeApiClient(k8s.AutoscalingV2Api);
// const k8scon = kc.makeApiClient(k8s.);

export const kubernetesRouter = router({
  get: publicProcedure.input(z.object({}).nullish()).query(() => {
    // Call Golang microservice to get the API results,
    // Map the return structure to a known type then return it down here
    k8scon.setDefaultAuthentication
    return {
      Servers: [
        {
          Name: "factorio",
          Namespace: "ns-1",
          HPAName: "hpa-name",
          DesiredReplicas: 1,
          CurrentReplicas: 1,
          HasHPA: true,
        },
        {
          Name: "factorio 2",
          Namespace: "ns-2",
          HPAName: "hpa-name",
          DesiredReplicas: 1,
          CurrentReplicas: 1,
          HasHPA: false,
        },
        {
          Name: "game2",
          Namespace: "ns-3",
          HPAName: "hpa-name",
          DesiredReplicas: 0,
          CurrentReplicas: 0,
          HasHPA: true,
        },
        {
          Name: "game3",
          Namespace: "ns-4",
          HPAName: "hpa-name",
          DesiredReplicas: 0,
          CurrentReplicas: 1,
          HasHPA: true,
        },
        {
          Name: "game4",
          Namespace: "ns-5",
          HPAName: "hpa-name",
          DesiredReplicas: 1,
          CurrentReplicas: 0,
          HasHPA: true,
        },
      ],
    };
  }),

  set: publicProcedure.input(z.object({ HPAName: z.string(), Namespace: z.string(), Replicas: z.number() })).output(z.boolean()).query((q) => {
    var { HPAName, Namespace, Replicas } = q.input
    var returnValue = true
    k8sHPA.readNamespacedHorizontalPodAutoscaler(HPAName, Namespace).then((value) => {
      if (value?.body?.status?.desiredReplicas == undefined) {
        return false
      }
      value.body.status.desiredReplicas = Replicas
      k8sHPA.replaceNamespacedHorizontalPodAutoscaler(HPAName, Namespace, value.body).catch((e) => { console.log(e); returnValue = false })
    }).catch(() => { returnValue = false })
    return returnValue
  }),
});
