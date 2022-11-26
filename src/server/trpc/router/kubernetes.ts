import { z } from "zod";

import { router, publicProcedure } from "../trpc";

export const kubernetesRouter = router({
  get: publicProcedure.input(z.object().nullish()).query(() => {
    // Call Golang microservice to get the API results,
    // Map the return structure to a known type then return it down here
    return {
      Servers: [
        {
          Name: "factorio",
          Status: "OK",
          DesiredReplicas: 1,
          CurrentReplicas: 1,
          HasHPA: true,
        },
        {
          Name: "game2",
          Status: "OK",
          DesiredReplicas: 0,
          CurrentReplicas: 0,
          HasHPA: true,
        },
      ],
    };
  }),
});
