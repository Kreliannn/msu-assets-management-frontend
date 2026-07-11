"use client"
import Link from "next/link";


import useUserStore from "@/app/store/useUserStore";
import { TestSideBar } from "@/components/ui/sidebar.template";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SideBarEvaluator } from "@/components/ui/sidebar.evaluator";


export default function AdminLayout({ children }: { children: React.ReactNode }) {

    const {user} = useUserStore()

    //if(user?.type != "admin" ) return <div> not auth </div>

    return (
      <div className="flex min-h-screen ">
          <SidebarProvider>
                
                <SideBarEvaluator />
               
                <main className="w-full">
                    <div className="mb-[80px] md:mb-[0px]"> </div>
                    {children}
                </main>
          </SidebarProvider>
       
      </div>
    );
  }