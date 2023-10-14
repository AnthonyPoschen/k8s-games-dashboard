import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { GetServersState,ServerOnOff } from "./serverState"
import { getFileSystem } from "./filesystem"
import { k8sContainer, zServerType, zServer } from "./config"

export const kubernetesRouter = router({
  getServers: publicProcedure.output(zServer.array()).query(GetServersState),
  serverOnOff: publicProcedure.input(z.object({server: zServer,onOff: z.boolean()})).output(z.boolean()).mutation((input) => {
    const { onOff,server } = input.input
    return ServerOnOff(onOff,server)
  }),
  getFileSystem: publicProcedure.input(z.object({server:zServer})).query((q) => { return getFileSystem(q.input.server) })
})
