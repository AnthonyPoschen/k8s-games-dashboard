import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { TypeOf } from "zod";

import { trpc, RouterOutputs } from "../utils/trpc";

import { ReactNode } from 'react'
import { useMutation } from "@tanstack/react-query";

type serverStatus = "Unknown" | "Online" | "Shutting Down" | "Offline" | "Starting"
const Home: NextPage = () => {
  const servers = trpc.kubernetes.getServers.useQuery(undefined, { refetchInterval: 2000 });
  const TurnServerOnOff = trpc.kubernetes.serverOnOff.useMutation()

  const ChangeServerState = async (onOff: boolean, server: RouterOutputs['kubernetes']['getServers'][number]) => {
    console.log("Sending HTTP request")
    TurnServerOnOff.mutate({server: server,onOff: onOff})
  };
  // custom border under heading
  const customStyle = {
    borderImage: "linear-gradient(to right, rgba(80,80,80,0), rgba(80,80,80,1),rgba(80,80,80,0)) 1",
  }
  return (

    <>

      <Head>
        <title>Game server dashboard</title>
        <meta name="description" content="Game server dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center bg-gray-800 from-[#2e026d] to-[#15162c] text-slate-200">
        <div className="text-3xl md:text-4xl text-center font-bold pt-5 w-full border-b-4 pb-2" style={customStyle}>
          Game Server Manager
        </div>
        <div className="flex flex-wrap w-full h-full p-0 pt-2 md:p-2 lg:p-2 lg:w-[900px] justify-center">
          {servers.data?.map((el, index) =>
            <div key={index} className="w-full flex flex-grow p-2 even:bg-gray-500 odd:bg-gray-600">
              <h2 className="md:w-[250px] sm:w-auto md:font-bold md:text-xl">
                {el.Namespace}/{el.Name}
              </h2>
              <p className="grow text-center">
                {CalculateStatus(el)}
              </p>
              {["Online", "Offline"].includes(CalculateStatus(el)) ? CalculateStatus(el) == "Online" ?
                <button className="w-[100px] md:w-[150px] border-slate-500 bg-red-700 hover:bg-red-600 rounded-md" type="button"
                  onClick={() =>
                    ChangeServerState(false,el)}>Turn Off</button>
                :
                <button className="w-[100px] md:w-[150px] border-slate-500 bg-green-700 hover:bg-green-600 rounded-md"
                  type="button" onClick={() =>
                    ChangeServerState(true,el)}>Turn On</button>
                :
                <div className="w-[150px]" />}
            </div>)}
        </div>
      </main>
    </>
  );
};
function CalculateStatus(server: RouterOutputs['kubernetes']['getServers'][number]): serverStatus {
  const { DesiredReplicas, CurrentReplicas } = server
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
