"use client"

import { ChevronRight, ChevronDown, type LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useState, useEffect } from "react"

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

  // State for main menu collapsible states
  const [mainMenuStates, setMainMenuStates] = useState<Record<string, boolean>>({})

  // State for nested sub-menu collapsible states
  const [nestedMenuStates, setNestedMenuStates] = useState<Record<string, boolean>>({})

  // Load states from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const savedMainStates = localStorage.getItem('sidebar-main-menu-states')
      const savedNestedStates = localStorage.getItem('sidebar-nested-menu-states')

      if (savedMainStates) {
        setMainMenuStates(JSON.parse(savedMainStates))
      }

      if (savedNestedStates) {
        setNestedMenuStates(JSON.parse(savedNestedStates))
      }
    } catch (error) {
      console.warn('Failed to load sidebar states from localStorage:', error)
      // Reset to empty states if parsing fails
      setMainMenuStates({})
      setNestedMenuStates({})
    }
  }, [])

  // Save states to localStorage whenever they change
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem('sidebar-main-menu-states', JSON.stringify(mainMenuStates))
    } catch (error) {
      console.warn('Failed to save main menu states to localStorage:', error)
    }
  }, [mainMenuStates])

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem('sidebar-nested-menu-states', JSON.stringify(nestedMenuStates))
    } catch (error) {
      console.warn('Failed to save nested menu states to localStorage:', error)
    }
  }, [nestedMenuStates])

  const toggleMainMenu = (title: string) => {
    setMainMenuStates(prev => ({
      ...prev,
      [title]: !prev[title]
    }))
  }

  const toggleNestedMenu = (title: string) => {
    setNestedMenuStates(prev => ({
      ...prev,
      [title]: !prev[title]
    }))
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = pathname === item.url || (item.items && item.items.some(subItem => pathname === subItem.url || (subItem.items && subItem.items.some(nestedItem => pathname === nestedItem.url))))
          const isOpen = mainMenuStates[item.title] ?? isActive

          return (
            <Collapsible
              key={item.title}
              asChild
              open={isOpen}
              onOpenChange={() => toggleMainMenu(item.title)}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <div className="flex items-center">
                  <SidebarMenuButton tooltip={item.title} isActive={isActive} asChild className="flex-1">
                    <Link href={item.url} className="flex items-center gap-2">
                      {item.icon && <item.icon />}
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                  {item.items && (
                    <CollapsibleTrigger asChild>
                      <button className="ml-auto p-1 hover:bg-accent rounded-sm transition-colors">
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                        ) : (
                          <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                        )}
                      </button>
                    </CollapsibleTrigger>
                  )}
                </div>
                {item.items && (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => {
                        const isSubActive = pathname === subItem.url || (subItem.items && subItem.items.some(nestedItem => pathname === nestedItem.url))
                        const isNestedOpen = nestedMenuStates[subItem.title] ?? isSubActive

                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            {subItem.items ? (
                              <Collapsible
                                key={subItem.title}
                                asChild
                                open={isNestedOpen}
                                onOpenChange={() => toggleNestedMenu(subItem.title)}
                                className="group/nested-collapsible"
                              >
                                <div>
                                  <div className="flex items-center">
                                    <SidebarMenuSubButton className="flex-1">
                                      <span>{subItem.title}</span>
                                    </SidebarMenuSubButton>
                                    <CollapsibleTrigger asChild>
                                      <button className="ml-auto p-1 hover:bg-accent rounded-sm transition-colors">
                                        {isNestedOpen ? (
                                          <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                                        ) : (
                                          <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                                        )}
                                      </button>
                                    </CollapsibleTrigger>
                                  </div>
                                  <CollapsibleContent>
                                    <div className="ml-4 mt-1 space-y-1">
                                      {subItem.items.map((nestedItem) => (
                                        <SidebarMenuSubButton key={nestedItem.title} isActive={pathname === nestedItem.url} asChild>
                                          <Link href={nestedItem.url}>
                                            {nestedItem.title}
                                          </Link>
                                        </SidebarMenuSubButton>
                                      ))}
                                    </div>
                                  </CollapsibleContent>
                                </div>
                              </Collapsible>
                            ) : (
                              <SidebarMenuSubButton isActive={pathname === subItem.url} asChild>
                                <Link href={subItem.url}>
                                  {subItem.title}
                                </Link>
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
