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
  Boxes,
  GitBranch,
  Zap,
  Users,
  CheckCircle,
  Calendar,
  Target,
  Activity,
  Shield,
  Brain,
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
      title: "Core ASRS",
      url: "#",
      icon: Warehouse,
      items: [
        {
          title: "Fleet Overview",
          url: "/dashboard",
        },
        {
          title: "Robotics Control",
          url: "/robots",
        },
        {
          title: "Autonomous Mobile Robots",
          url: "/Autonomous-Mobile-Robots",
        },
        {
          title: "Operations Center",
          url: "/operations",
        },
        {
          title: "IoT Sensors",
          url: "/sensors",
        },
        {
          title: "Equipment",
          url: "/equipment",
        },
        {
          title: "Alerts",
          url: "/alerts",
        },
        {
          title: "Maintenance",
          url: "/maintenance",
        },
      ],
    },
    {
      title: "Inventory Management",
      url: "#",
      icon: Package,
      items: [
        {
          title: "Items & Products",
          url: "/items",
        },
        {
          title: "Products",
          url: "/products",
        },
        {
          title: "Inventory",
          url: "/inventory",
        },
        {
          title: "Suppliers",
          url: "/suppliers",
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
      ],
    },
    {
      title: "EWM Modules",
      url: "#",
      icon: Boxes,
      items: [
        {
          title: "Storage Management",
          url: "/storage-management",
        },
        {
          title: "Handling Units",
          url: "/handling-units",
        },
        {
          title: "Yard Management",
          url: "/yard-management",
        },
        {
          title: "Slotting & Replenishment",
          url: "#",
          icon: Target,
          items: [
            {
              title: "Slotting Overview",
              url: "/slotting",
            },
            {
              title: "Replenishment Tasks",
              url: "/slotting/replenishment",
            },
          ],
        },
        {
          title: "Wave Management",
          url: "/waves",
        },
        {
          title: "Cross-Docking",
          url: "/cross-docking",
        },
        {
          title: "Labor Management",
          url: "#",
          icon: Users,
          items: [
            {
              title: "Labor Standards",
              url: "/labor-management/standards",
            },
            {
              title: "Performance Tracking",
              url: "/labor-management/performance",
            },
          ],
        },
        {
          title: "Quality Inspection",
          url: "/quality-inspection",
        },
      ],
    },
    {
      title: "Operations",
      url: "#",
      icon: Truck,
      items: [
        {
          title: "Putaway",
          url: "/operations/putaway",
        },
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
      title: "Analytics & Intelligence",
      url: "#",
      icon: BarChart3,
      items: [
        {
          title: "Analytics Dashboard",
          url: "/analytics",
        },
        {
          title: "Demand Forecasting",
          url: "/forecasting",
        },
        {
          title: "Digital Twin",
          url: "/digital-twin",
        },
        {
          title: "Reports",
          url: "/reports",
        },
      ],
    },
    {
      title: "Specialized",
      url: "#",
      icon: Shield,
      items: [
        {
          title: "Blockchain",
          url: "/blockchain",
        },
        {
          title: "IPFS Storage",
          url: "/ipfs",
        },
        {
          title: "Halal Management",
          url: "/halal",
        },
        {
          title: "Halal Dashboard",
          url: "/halal-dashboard",
        },
      ],
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
    <Sidebar collapsible="icon" {...props} className="glass-effect border-r border-electricBlue/30">
      <SidebarHeader className="border-b border-electricBlue/20">
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter className="border-t border-electricBlue/20">
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
