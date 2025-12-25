"use client";

import React from "react";
import { DataTable } from "../common/data-table";
import { Badge } from "@/components/ui/badge";
import { MutedText } from "../common/typography";

interface TagDetailViewProps {
  type: "contacts" | "campaigns";
  tagId?: string | number;
}

const demoContacts = [
  { id: 1, name: "John Doe", email: "john@example.com", status: "Subscribed" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", status: "Subscribed" },
  { id: 3, name: "Alice Johnson", email: "alice@example.com", status: "Unsubscribed" },
  { id: 4, name: "Bob Brown", email: "bob@example.com", status: "Subscribed" },
  { id: 5, name: "Charlie Davis", email: "charlie@example.com", status: "Bounced" },
];

const demoCampaigns = [
  { id: 1, name: "Summer Sale 2024", type: "Newsletter", status: "Sent", sentAt: "2024-06-15" },
  { id: 2, name: "Product Launch", type: "Promotional", status: "Draft", sentAt: "-" },
  { id: 3, name: "Monthly Digest", type: "Newsletter", status: "Scheduled", sentAt: "2024-07-01" },
  { id: 4, name: "Holiday Discount", type: "Promotional", status: "Sent", sentAt: "2023-12-20" },
];

export const TagDetailView = ({ type, tagId }: TagDetailViewProps) => {
  const contactColumns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    { 
      accessorKey: "status", 
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.status;
        let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
        if (status === "Subscribed") variant = "default";
        if (status === "Bounced") variant = "destructive";
        return <Badge variant={variant}>{status}</Badge>;
      }
    },
  ];

  const campaignColumns = [
    { accessorKey: "name", header: "Campaign Name" },
    { accessorKey: "type", header: "Type" },
    { 
      accessorKey: "status", 
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.status;
        let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
        if (status === "Sent") variant = "default";
        if (status === "Draft") variant = "secondary";
        return <Badge variant={variant}>{status}</Badge>;
      }
    },
    { accessorKey: "sentAt", header: "Date" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">
          {type === "contacts" ? "Tagged Contacts" : "Associated Campaigns"}
        </h2>
        <MutedText>
          Showing {type} for Tag ID: {tagId || "N/A"} (Demo Data)
        </MutedText>
      </div>

      <DataTable
        columns={(type === "contacts" ? contactColumns : campaignColumns) as any}
        data={(type === "contacts" ? demoContacts : demoCampaigns) as any}
        loading={false}
      />
    </div>
  );
};
