"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
      items?: {
        title: string
        url: string
      }[]
    }[]
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = pathname === item.url || (item.items && item.items.some(subItem => pathname === subItem.url || (subItem.items && subItem.items.some(nestedItem => pathname === nestedItem.url))))

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title} isActive={isActive} asChild>
                    <a href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      {item.items && (
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      )}
                    </a>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                {item.items && (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => {
                        const isSubActive = pathname === subItem.url || (subItem.items && subItem.items.some(nestedItem => pathname === nestedItem.url))

                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            {subItem.items ? (
                              <Collapsible
                                key={subItem.title}
                                asChild
                                defaultOpen={isSubActive}
                                className="group/nested-collapsible"
                              >
                                <div>
                                  <CollapsibleTrigger asChild>
                                    <SidebarMenuSubButton asChild>
                                      <div className="flex items-center justify-between w-full">
                                        <span>{subItem.title}</span>
                                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/nested-collapsible:rotate-90" />
                                      </div>
                                    </SidebarMenuSubButton>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent>
                                    <div className="ml-4 mt-1 space-y-1">
                                      {subItem.items.map((nestedItem) => (
                                        <SidebarMenuSubButton key={nestedItem.title} asChild isActive={pathname === nestedItem.url}>
                                          <a href={nestedItem.url}>
                                            <span>{nestedItem.title}</span>
                                          </a>
                                        </SidebarMenuSubButton>
                                      ))}
                                    </div>
                                  </CollapsibleContent>
                                </div>
                              </Collapsible>
                            ) : (
                              <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                                <a href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </a>
                              </SidebarMenuSubButton>
                            )}
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
