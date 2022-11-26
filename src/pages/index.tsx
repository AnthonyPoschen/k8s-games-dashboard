import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
const servers = trpc.kubernetes.get.useQuery();
const customStyle = {
borderImage: "linear-gradient(to right, rgba(80,80,80,0), rgba(80,80,80,1),rgba(80,80,80,0)) 1;",
}
return (
<>

  <Head>
    <title>Game server dashboard</title>
    <meta name="description" content="Game server dashboard" />
    <link rel="icon" href="/favicon.ico" />
  </Head>
  <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
    <div className="text-4xl text-center font-bold pt-5 w-full border-b-4 pb-2" style={customStyle}>
      Game Server Manager
    </div>
    <div className="flex w-full p-8 lg:p-2 lg:w-1/2 justify-center">
      {servers.data?.Servers.map((el) =>
      <div className="min-w-[200px] flex-col flex flex-grow border-2 border-gray-600 p-2">
        <h2 className="font-bold text-xl text-center w-full">
          {el.Name}
        </h2>
        <p>Status: {el.Status}</p>
        <p>Current Replicas: {el.CurrentReplicas}</p>
        <p>Desired Replicas: {el.DesiredReplicas}</p>
        <button className="w-full" type="button">Turn {el.DesiredReplicas == 0 ? "On" : "Off"}</button>
      </div>)}
    </div>
  </main>
</>
);
};

export default Home;
