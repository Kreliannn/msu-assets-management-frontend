"use client"
import Link from "next/link";


import useUserStore from "@/app/store/useUserStore";

import { SidebarProvider } from "@/components/ui/sidebar";
import { SideBarOffice } from "@/components/ui/sidebar.office";

export default function AdminLayout({ children }: { children: React.ReactNode }) {

    const {user} = useUserStore()

    //if(user?.type != "admin" ) return <div> not auth </div>

    return (
      <div className="flex min-h-screen ">
          <SidebarProvider>
                
                <SideBarOffice />
               
                <main className="w-full">
                    <div className="mb-[80px] md:mb-[0px]"> </div>
                    {children}
                </main>
          </SidebarProvider>
       
      </div>
    );
  }