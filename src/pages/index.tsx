import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { TypeOf } from "zod";

import { trpc, RouterOutputs } from "../utils/trpc";

import { ReactNode } from 'react'

type serverStatus = "Unknown" | "Online" | "Shutting Down" | "Offline" | "Starting"
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
    <div className="flex flex-wrap w-full h-full p-8 lg:p-2 lg:w-1/2 justify-center text-black">
      {servers.data?.Servers.map((el) =>
      <div className="w-full flex flex-grow p-2 even:bg-gray-400 odd:bg-gray-500 hover:bg-gray-300">
        <h2 className="w-[150px] font-bold text-xl">
          {el.Name}
        </h2>
        <p className="grow text-center">
          {CalculateStatus(el)}
        </p>
        {["Online", "Offline"].includes(CalculateStatus(el)) ?
        <button className="w-[150px]" type="button">Turn {CalculateStatus(el) == "Online" ? "Off" : "On"}</button> :
        <div className="w-[150px]" />
        }
      </div>)}
    </div>
  </main>
</>
);
};

function CalculateStatus(server: RouterOutputs['kubernetes']['get']['Servers'][number]): serverStatus {
var { DesiredReplicas, CurrentReplicas } = server
if (CurrentReplicas == 1 && DesiredReplicas == 1) {
return "Online"
}
if (CurrentReplicas == 1 && DesiredReplicas == 0) {
return "Shutting Down"
}
if (CurrentReplicas == 0 && DesiredReplicas == 0) {
return "Offline"
}
if (CurrentReplicas == 0 && DesiredReplicas == 1) {
return "Starting"
}
return "Unknown"
}

export default Home;
