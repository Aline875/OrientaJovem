"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarProvider,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import { LayoutDashboard, User, Folder, BarChart } from "lucide-react";
import Link from "next/link";

export default function AppSidebar() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [links, setLinks] = useState<
    { href: string; label: string; icon: React.ElementType }[]
  >([]);

  useEffect(() => {
    const session = localStorage.getItem("usuario_sessao");
    if (session) {
      const usuario = JSON.parse(session);
      const tipo = usuario.tipo;

      const jovemLinks = [
        { href: "/jovemPage/profile", label: "Perfil", icon: User },
        { href: "/jovemPage/projects", label: "Projetos", icon: Folder },
        { href: "/jovemPage/dashboard", label: "Desempenho", icon: BarChart },
      ];

      const empresaLinks = [
        { href: "/empresaPage/profile", label: "Perfil", icon: User },
        { href: "/empresaPage/projects", label: "Projetos", icon: Folder },
        { href: "/empresaPage/dashboard", label: "Desempenho", icon: BarChart },
      ];

      setLinks([
        { href: "/home", label: "Home", icon: LayoutDashboard },
        ...(tipo === "empresa" ? empresaLinks : jovemLinks),
      ]);
    }
  }, []);

  return (
    <div className="relative">
      {/* Desktop */}
      <div className="hidden lg:block">
        <SidebarProvider>
          <Sidebar className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white/10 backdrop-blur-md border-r border-white/20">
            <SidebarHeader className="p-4">
              <h2 className="text-lg font-semibold text-white">Menu</h2>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {links.map(({ href, label, icon: Icon }) => (
                      <SidebarMenuItem key={href}>
                        <SidebarMenuButton asChild>
                          <Link
                            href={href}
                            className="flex items-center gap-3 text-white hover:bg-white/20 rounded-md p-2"
                          >
                            <Icon size={20} />
                            {label}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      </div>

      {/* Mobile */}
      <div className="lg:hidden">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger>
            <button className="text-white p-4 bg-[#323536]">Abrir Menu</button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-[#323536] text-white w-52">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>Navegação</SheetDescription>
            </SheetHeader>
            <SidebarProvider>
              <Sidebar className="h-full">
                <SidebarHeader>
                  <h2 className="text-lg font-semibold px-2 py-2">Menu</h2>
                </SidebarHeader>
                <SidebarContent>
                  <SidebarGroup className="space-y-2 px-2">
                    {links.map(({ href, label, icon: Icon }) => (
                      <a
                        key={href}
                        href={href}
                        className="flex items-center gap-2 text-sm hover:underline"
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </a>
                    ))}
                  </SidebarGroup>
                </SidebarContent>
              </Sidebar>
            </SidebarProvider>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
