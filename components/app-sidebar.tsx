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
      title: "Robotics & Automation",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "AMR Fleet Management",
          url: "/autonomous-mobile-robots",
        },
        {
          title: "AMR Material Handling",
          url: "/autonomous-mobile-robots/material-handling",
        },
        {
          title: "Robot Control",
          url: "/robots",
        },
        {
          title: "Equipment Status",
          url: "/equipment",
        },
        {
          title: "IoT Sensors",
          url: "/sensors",
        },
        {
          title: "Maintenance",
          url: "/maintenance",
        },
        {
          title: "System Alerts",
          url: "/alerts",
        },
      ],
    },
    {
      title: "Inventory & Products",
      url: "#",
      icon: Package,
      items: [
        {
          title: "Items Management",
          url: "/items",
        },
        {
          title: "Products Catalog",
          url: "/products",
        },
        {
          title: "Inventory Overview",
          url: "/inventory",
        },
        {
          title: "Suppliers",
          url: "/suppliers",
        },
        {
          title: "Identification Systems",
          url: "#",
          items: [
            {
              title: "Barcode Scanner",
              url: "/barcode-scanner",
            },
            {
              title: "RFID Management",
              url: "/rfid",
            },
            {
              title: "QR Codes",
              url: "/qr",
            },
          ],
        },
      ],
    },
    {
      title: "Warehouse Operations",
      url: "#",
      icon: Warehouse,
      items: [
        {
          title: "Operations Center",
          url: "/operations",
        },
        {
          title: "Storage Management",
          url: "/storage-management",
        },
        {
          title: "Locations & Zones",
          url: "#",
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
          title: "Material Handling",
          url: "#",
          items: [
            {
              title: "Handling Units",
              url: "/handling-units",
            },
            {
              title: "Putaway Operations",
              url: "/operations/putaway",
            },
            {
              title: "Movements",
              url: "/movements",
            },
          ],
        },
        {
          title: "Advanced Operations",
          url: "#",
          items: [
            {
              title: "Slotting Optimization",
              url: "/slotting",
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
              title: "Yard Management",
              url: "/yard-management",
            },
          ],
        },
      ],
    },
    {
      title: "Logistics & Shipping",
      url: "#",
      icon: Truck,
      items: [
        {
          title: "Logistics Hub",
          url: "/logistics",
        },
        {
          title: "Shipments",
          url: "/shipments",
        },
        {
          title: "Transactions",
          url: "/transactions",
        },
      ],
    },
    {
      title: "Quality & Compliance",
      url: "#",
      icon: CheckCircle,
      items: [
        {
          title: "Quality Inspection",
          url: "/quality-inspection",
        },
        {
          title: "Labor Management",
          url: "/labor-management",
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
      title: "Analytics & Intelligence",
      url: "#",
      icon: BarChart3,
      items: [
        {
          title: "Analytics Dashboard",
          url: "/analytics",
        },
        {
          title: "Reports",
          url: "/reports",
        },
        {
          title: "Demand Forecasting",
          url: "/forecasting",
        },
        {
          title: "Optimization",
          url: "/optimization",
        },
        {
          title: "Digital Twin",
          url: "/digital-twin",
        },
      ],
    },
    {
      title: "Advanced Technologies",
      url: "#",
      icon: Brain,
      items: [
        {
          title: "Blockchain",
          url: "/blockchain",
        },
        {
          title: "IPFS Storage",
          url: "/ipfs",
        },
      ],
    },
    {
      title: "System Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General Settings",
          url: "/settings",
        },
        {
          title: "User Management",
          url: "#",
        },
        {
          title: "System Configuration",
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
