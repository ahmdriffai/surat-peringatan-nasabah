"use client";

import {
  AlertTriangle,
  ArchiveIcon,
  ClipboardCheck,
  Gavel,
  Home,
  MailCheck,
  NotepadText,
  Users2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useGetAllSP } from "@/features/sp/hook";
import { countMyPendingApprovals } from "@/features/sp/utils";

export const menuItems = [
  { id: "dashboard", url: "/dashboard", title: "Dashboard", icon: Home },
  { id: "customers", url: "/customers", title: "Nasabah", icon: Users2 },
  {
    id: "surat-peringatan",
    url: "/surat-peringatan",
    title: "Surat Peringatan",
    icon: NotepadText,
  },
  {
    id: "persetujuan",
    url: "/persetujuan",
    title: "Menunggu Persetujuan",
    icon: ClipboardCheck,
    approverOnly: true,
  },
  {
    id: "mail",
    url: "/register-surat",
    title: "Register Surat",
    icon: MailCheck,
  },
  {
    id: "archive",
    url: "/arsip-surat",
    title: "Arsip Surat",
    icon: ArchiveIcon,
  },
  {
    id: "kejaksaan",
    url: "/kejaksaan",
    title: "Kepala Kejaksaan Negeri",
    icon: Gavel,
    adminOnly: true,
  },
];

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const isAdmin = session?.user.role === "ADMIN";
  const isApprover = session?.user.role === "APPROVER";

  const { data: sp } = useGetAllSP();
  const pendingApprovalCount = countMyPendingApprovals(
    sp ?? [],
    session?.user.id,
  );

  const visibleMenuItems = menuItems
    .filter((item) => !item.adminOnly || isAdmin)
    .filter((item) => !item.approverOnly || isApprover)
    .map((item) =>
      item.id === "persetujuan"
        ? { ...item, badge: pendingApprovalCount }
        : item,
    );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <AlertTriangle className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold text-sm">SP Nasabah</span>
                  <span className="text-xs text-muted-foreground">
                    Bank Wonosobo
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={visibleMenuItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={{
            nama: session?.user.nama ?? "",
            email: session?.user.email ?? "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
