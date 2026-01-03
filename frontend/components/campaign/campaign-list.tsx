"use client";

import {
  DataTable,
  DataTableColumnDef,
  DataTableFilterField,
} from "@/components/common/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFilters } from "@/hooks/usefilters";
import { useFetch } from "@/hooks/useApiCalls";
import { getAxiosForUseFetch } from "@/lib/axios";
import API_PATH from "@/lib/apiPath";
import { Campaign, CampaignStatus } from "@/types/campaign";
import { ListResponse } from "@/types";
import { formatReadableDateSafe } from "@/lib/utils";
import { Small, MutedText } from "@/components/common/typography";
import { useRouter } from "next/navigation";
import { Eye, Clock, CheckCircle2, AlertCircle, PauseCircle, XCircle, FileEdit, Mail } from "lucide-react";

const statusConfig: Record<CampaignStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
  [CampaignStatus.DRAFT]: { label: "Draft", variant: "secondary", icon: FileEdit },
  [CampaignStatus.SCHEDULED]: { label: "Scheduled", variant: "outline", icon: Clock },
  [CampaignStatus.SENDING]: { label: "Sending", variant: "default", icon: Mail },
  [CampaignStatus.PAUSED]: { label: "Paused", variant: "secondary", icon: PauseCircle },
  [CampaignStatus.COMPLETED]: { label: "Completed", variant: "outline", icon: CheckCircle2 },
  [CampaignStatus.CANCELLED]: { label: "Cancelled", variant: "destructive", icon: XCircle },
};

interface CampaignListProps {
    onEditCampaign?: (id: number) => void;
}

export default function CampaignList({ onEditCampaign }: CampaignListProps) {
    const router = useRouter();

    const {
        page,
        setPage,
        pageSize,
        setPageSize,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        filters,
        setFilters,
        joinOperator,
        setJoinOperator,
    } = useFilters<Campaign>({
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        defaultPageSize: 5,
    });

    const { data, isLoading } = useFetch<ListResponse<Campaign>>(
        getAxiosForUseFetch,
        ["campaigns-list", page.toString(), pageSize.toString(), sortBy, sortOrder, JSON.stringify(filters), joinOperator],
        {
            url: { template: API_PATH.CAMPAIGNS.LIST_CAMPAIGNS },
            params: {
                page,
                limit: pageSize,
                sort_by: sortBy,
                sort_order: sortOrder,
                filters: JSON.stringify(filters),
                join_operator: joinOperator,
            },
        }
    );

    const columns: DataTableColumnDef<Campaign>[] = [
        {
            accessorKey: "name",
            header: "Name",
            sortable: true,
            cell: ({ row }) => (
                <div className="flex flex-col">
                     <span className="font-medium hover:text-primary cursor-pointer transition-colors" onClick={() => router.push(`/campaigns/${row.id}`)}>
                        {row.name}
                     </span>
                     <span className="text-xs text-muted-foreground truncate max-w-[250px]">
                        {row.subject}
                     </span>
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            sortable: true,
            cell: ({ row }) => {
                const config = statusConfig[row.status] || statusConfig[CampaignStatus.DRAFT];
                const Icon = config.icon;
                return (
                    <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
                        <Icon className="w-3 h-3" />
                         {config.label}
                    </Badge>
                )
            }
        },
        {
            accessorKey: "total_recipients",
            header: "Recipients",
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <span className="font-medium">{row.total_recipients.toLocaleString()}</span>
                </div>
            )
        },
        {
            accessorKey: "sent_count",
            header: "Sent",
             cell: ({ row }) => (
                 <span>{row.sent_count.toLocaleString()}</span>
             )
        },
        {
            accessorKey: "created_at",
            header: "Date",
            sortable: true,
             cell: ({ row }) => {
                const date = row.status === CampaignStatus.SCHEDULED ? row.scheduled_at : row.created_at;
                 return (
                     <MutedText>
                         {formatReadableDateSafe(date)}
                     </MutedText>
                 )
             }
        },
        {
            accessorKey: "id",
            header: "Actions",
             cell: ({ row }) => (
                <div className="flex items-center gap-2">
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => router.push(`/campaigns/${row.id}`)}
                        title="View Details"
                    >
                        <Eye className="size-5" />
                     </Button>
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onEditCampaign?.(row.id)}
                        title="Edit Campaign"
                    >
                        <FileEdit className="size-5" />
                     </Button>
                </div>
             )
        }
    ];

    const filterFields: DataTableFilterField<Campaign>[] = [
        {
            id: "name",
            label: "Name",
            placeholder: "Filter by name...",
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={data?.data || []}
            loading={isLoading}
            pagination={{
                page,
                pageSize,
                total: data?.total || 0,
                onPageChange: setPage,
                onPageSizeChange: setPageSize,
            }}
             sorting={{
                sortBy,
                sortOrder,
                onSortChange: (newSortBy, newOrder) => {
                    setSortBy(newSortBy);
                    setSortOrder(newOrder);
                }
            }}
             filtering={{
                filters,
                onFilterChange: setFilters,
                joinOperator,
                onJoinOperatorChange: setJoinOperator
            }}
            filterFields={filterFields}
        />
    );
}
