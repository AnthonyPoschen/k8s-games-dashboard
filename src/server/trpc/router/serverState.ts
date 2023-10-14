import {k8sContainer,zServer} from './config'

export async function GetServersState(): Promise<typeof zServer._type[]> {
    const deployPromise = k8sContainer.listDeploymentForAllNamespaces().then((data) => {
      const results: typeof zServer._type[] = [];
      data.body.items.forEach((item) => {
        if (item.metadata?.namespace == undefined || item.metadata.name == undefined) {
          return
        }
        if (item.metadata?.namespace?.startsWith("games-") == false) {
          return
        }
        if (item.status?.replicas == undefined || item.spec?.replicas == undefined) { return }
        if (item.metadata.labels == undefined || item.metadata.labels["type"] != "game") { return }
        results.push({
          Name: item.metadata.name, Namespace: item.metadata.namespace, CurrentReplicas: item.status?.readyReplicas || 0, DesiredReplicas: item.spec?.replicas, Type: "Deployment",
        })
      })
      return results
    }).catch((e) => {
      console.log(e);
      const results: typeof zServer._type[] = [];
      return results;
    })
    const statefulsetPromise = k8sContainer.listStatefulSetForAllNamespaces().then((data) => {
      const results: typeof zServer._type[] = [];
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
      const results: typeof zServer._type[] = [];
      return results;
    })

    return Promise.all([deployPromise, statefulsetPromise]).then((results) => {
      const result: typeof zServer._type[] = [];
      results.forEach((array) => {
        result.push(...array)
      })
      return result
    })
}

export async function ServerOnOff(onOff: boolean,server: typeof zServer._type): Promise<boolean> {
  const { Name, Namespace, Type, DesiredReplicas } = server
  switch (Type) {
    case "Deployment": {
      return k8sContainer.readNamespacedDeployment(Name, Namespace).then((data) => {
        const deployment = data.body;
        if (deployment.spec?.replicas == undefined) { return false }
        deployment.spec.replicas = onOff ? 1 : 0
        return k8sContainer.replaceNamespacedDeployment(Name, Namespace, deployment).then(() => { return true }).catch(() => { return false })
      }).catch((e) => { console.log(e); return false })
    }
    case "Statefulset": {
      return k8sContainer.readNamespacedStatefulSet(Name, Namespace).then((data) => {
        const sts = data.body;
        if (sts.spec?.replicas == undefined) { return false }
        sts.spec.replicas = DesiredReplicas
        return k8sContainer.replaceNamespacedStatefulSet(Name, Namespace, sts).then(() => { return true }).catch(() => { return false })
      }).catch((e) => { console.log(e); return false })
    }
  }
}
