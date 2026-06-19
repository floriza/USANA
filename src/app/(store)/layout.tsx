import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-dvh">
      <Header />
      {/* No top padding on homepage (hero covers it); other pages pad below fixed header */}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
