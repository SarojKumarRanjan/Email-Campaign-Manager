"use client";

import { useState } from "react";
import PageHeader from "@/components/common/page-header";
import CreateList from "@/components/list/create-list";
import { Button } from "@/components/ui/button";
import {BookmarkCheck} from  "lucide-react"
import ListView from "@/components/list/listview";
import GridView from "@/components/list/gridview";
import {LayoutGrid, LayoutList} from "lucide-react"




export default function ListsPage() {

   const [open, setOpen] = useState(false)
   const [view, setView] = useState("list")


    return (
        <div className="p-4  flex-1 flex flex-col gap-4">
                   <PageHeader
                       title="Lists"
                       rightNode={
                        <div className="flex gap-2">
                        <Button className="cursor-pointer" variant={view === "list" ? "default" : "outline"} onClick={() => setView("list")}><LayoutList className="size-5" /></Button>
                        <Button className="cursor-pointer" variant={view === "grid" ? "default" : "outline"} onClick={() => setView("grid")}><LayoutGrid className="size-5" /></Button>
                        <Button className="cursor-pointer" onClick={() => setOpen(true)}><BookmarkCheck className="size-5" /> Create List</Button>

                        </div>
                       }                    
                   />
          <div>
             {view === "list" ? <ListView /> : <GridView />}
          </div>


                   <CreateList open={open} onClose={() => setOpen(false)} />
       
               </div>
    )
}
