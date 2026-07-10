"use client";

import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface TableAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive";
  separator?: boolean;
}

interface TableActionsProps {
  actions: TableAction[];
}

export function TableActions({ actions }: TableActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors outline-none">
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">Open menu</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action) => (
          <span key={action.label}>
            {action.separator && <DropdownMenuSeparator />}
            <DropdownMenuItem
              data-variant={action.variant}
              onClick={action.onClick}
              className={action.variant === "destructive" ? "text-red-600 focus:text-red-600" : ""}
            >
              {action.icon && <span className="mr-2 h-4 w-4 flex-shrink-0">{action.icon}</span>}
              {action.label}
            </DropdownMenuItem>
          </span>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
