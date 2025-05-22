import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useState } from "react";
import { LayoutDashboard, User, Folder, BarChart } from "lucide-react";

export default function AppSidebar() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const links = [
    { href: "/home", label: "Home", icon: LayoutDashboard },
    { href: "/jovemPage/profile", label: "Perfil", icon: User },
    { href: "/jovemPage/projects", label: "Projetos", icon: Folder },
    { href: "/jovemPage/dashboard", label: "Desempenho", icon: BarChart },
  ];

  return (
    <div className="relative ">
      <div className="hidden lg:flex fixed top-16 left-0 h-[calc(100vh-4rem)] min-w-max bg-[#323536] text-white z-40">
        <SidebarProvider className="bg-[#323536] text-white">
          <Sidebar className="h-full bg-[#323536] text-white">
            <SidebarContent className="bg-[#323536] text-white">
              <SidebarGroup className="space-y-2 px-2 mt-20">
                {links.map(({ href, label, icon: Icon }) => (
                  <a
                    key={href}
                    href={href}
                    className="flex items-center gap-1 text-sm hover:underline px-2 py-1"
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </a>
                ))}
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      </div>

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
