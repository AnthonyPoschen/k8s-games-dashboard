import { router } from "../trpc";
import { kubernetesRouter } from "./kubernetes";

export const appRouter = router({
  kubernetes: kubernetesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
