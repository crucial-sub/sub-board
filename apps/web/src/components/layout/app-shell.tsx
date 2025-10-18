import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg-app">
      <SiteHeader />
      <main className="container flex-1 py-8">{children}</main>
      <SiteFooter />
    </div>
  );
}
