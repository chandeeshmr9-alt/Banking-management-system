import type { ReactNode } from "react";
import { DesktopSidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

type LayoutProps = {
  children: ReactNode;
};

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen md:flex">
      <DesktopSidebar />

      <div className="flex min-h-screen flex-1 flex-col">
        <Header
          title="Banking Management System"
          subtitle="Professional banking dashboard interface"
        />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">{children}</div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
