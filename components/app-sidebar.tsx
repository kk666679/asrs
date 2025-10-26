"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Package,
  Warehouse,
  Truck,
  BarChart3,
  ScanLine,
  Thermometer,
  Cpu,
  TrendingUp,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "ASRS Admin",
    email: "admin@asrs.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "ASRS System",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: "Inventory",
      url: "#",
      icon: Package,
      items: [
        {
          title: "Items",
          url: "/items",
        },
        {
          title: "Suppliers",
          url: "/suppliers",
        },
      ],
    },
    {
      title: "Storage",
      url: "#",
      icon: Warehouse,
      items: [
        {
          title: "Locations",
          url: "/locations",
        },
        {
          title: "Zones",
          url: "/zones",
        },
        {
          title: "Racks",
          url: "/racks",
        },
      ],
    },
    {
      title: "Operations",
      url: "#",
      icon: Truck,
      items: [
        {
          title: "Shipments",
          url: "/shipments",
        },
        {
          title: "Transactions",
          url: "/transactions",
        },
        {
          title: "Movements",
          url: "/movements",
        },
      ],
    },
    {
      title: "Barcode/RFID",
      url: "#",
      icon: ScanLine,
      items: [
        {
          title: "Barcode Scanner",
          url: "/barcode-scanner",
        },
        {
          title: "Generate Barcodes",
          url: "/api/barcodes/generate",
        },
        {
          title: "Lookup Barcodes",
          url: "/api/barcodes/lookup",
        },
      ],
    },
    {
      title: "IoT Sensors",
      url: "/sensors",
      icon: Thermometer,
    },
    {
      title: "Robotics",
      url: "/robots",
      icon: Cpu,
    },
    {
      title: "Forecasting",
      url: "/forecasting",
      icon: TrendingUp,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: BarChart3,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Warehouse A",
      url: "#",
      icon: Frame,
    },
    {
      name: "Warehouse B",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Warehouse C",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
