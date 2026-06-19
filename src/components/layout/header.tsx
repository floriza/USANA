"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  ShoppingCart,
  Search,
  Menu,
  Heart,
  LogOut,
  X,
  Leaf,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "Supplements", href: "/products?category=supplements" },
  { label: "Nutritionals", href: "/products?category=nutritionals" },
  { label: "Weight Management", href: "/products?category=shakes-and-weight-management" },
  { label: "Skin Care", href: "/products?category=skin-care" },
  { label: "Personal Care", href: "/products?category=personal-care" },
];

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const { data: cart } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await fetch("/api/v1/cart");
      return res.json();
    },
  });

  const cartCount = cart?.data?.items?.length ?? 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close drawers when route changes — wrapped in startTransition to avoid sync setState in effect
  useEffect(() => {
    const id = setTimeout(() => {
      setMenuOpen(false);
      setSearchOpen(false);
    }, 0);
    return () => clearTimeout(id);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/products?search=${encodeURIComponent(search)}`);
      setSearch("");
      setSearchOpen(false);
    }
  }

  const isHome = pathname === "/";
  const transparent = isHome && !scrolled && !menuOpen;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: transparent ? "transparent" : "rgba(250,250,247,0.96)",
        backdropFilter: transparent ? "none" : "blur(12px)",
        borderBottom: transparent ? "none" : "1px solid #EAE7DF",
        boxShadow: transparent ? "none" : "0 1px 24px rgba(28,43,32,0.07)",
      }}
    >
      <div
        className="text-xs py-1.5 text-center transition-all duration-300"
        style={{
          background: transparent ? "rgba(0,0,0,0.15)" : "#2D6A4F",
          color: "rgba(255,255,255,0.88)",
        }}
      >
        <span className="font-medium">Independent USANA Distributor</span>
        <span className="mx-2 opacity-50">·</span>
        <span>Free nationwide delivery on orders P2,000+</span>
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center gap-4 h-16">
          <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="USANA Store Philippines">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300"
              style={{ background: transparent ? "rgba(255,255,255,0.18)" : "#2D6A4F" }}
            >
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <div
                className="font-bold text-sm leading-tight"
                style={{ fontFamily: "var(--font-playfair,serif)", color: transparent ? "#fff" : "var(--foreground)" }}
              >
                USANA Store
              </div>
              <div className="text-xs leading-tight" style={{ color: transparent ? "rgba(255,255,255,0.65)" : "var(--muted)" }}>
                Philippines
              </div>
            </div>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-md hidden md:flex">
            <div className="relative w-full">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: transparent ? "rgba(255,255,255,0.55)" : "var(--muted)" }}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search supplements, vitamins..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all"
                style={{
                  background: transparent ? "rgba(255,255,255,0.12)" : "#F2EFE8",
                  border: transparent ? "1px solid rgba(255,255,255,0.22)" : "1px solid #EAE7DF",
                  color: transparent ? "#fff" : "var(--foreground)",
                }}
              />
            </div>
          </form>

          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2.5 rounded-xl transition-colors"
              style={{ color: transparent ? "#fff" : "var(--foreground)" }}
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {session?.user ? (
              <>
                <Link
                  href="/account/wishlist"
                  className="p-2.5 rounded-xl transition-colors hidden sm:flex"
                  style={{ color: transparent ? "#fff" : "var(--foreground)" }}
                  aria-label="Wishlist"
                >
                  <Heart className="w-5 h-5" />
                </Link>

                <Link
                  href="/cart"
                  className="p-2.5 rounded-xl transition-colors relative"
                  style={{ color: transparent ? "#fff" : "var(--foreground)" }}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[1.1rem] h-[1.1rem] bg-[#2D6A4F] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </Link>

                <div className="relative group hidden sm:block">
                  <button
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium"
                    style={{ color: transparent ? "#fff" : "var(--foreground)" }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: transparent ? "rgba(255,255,255,0.2)" : "#2D6A4F" }}
                    >
                      {(session.user.name?.[0] ?? "U").toUpperCase()}
                    </div>
                    <span className="hidden lg:block">{session.user.name?.split(" ")[0] ?? "Account"}</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#EAE7DF] py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                    <div className="px-4 py-2 border-b border-[#EAE7DF] mb-1">
                      <p className="text-xs" style={{ color: "var(--muted)" }}>Signed in as</p>
                      <p className="text-sm font-semibold truncate">{session.user.name}</p>
                    </div>
                    {[["My Account", "/account"], ["My Orders", "/account/orders"], ["Reward Points", "/account/rewards"]].map(([label, href]) => (
                      <Link key={href} href={href} className="flex px-4 py-2 text-sm hover:bg-[#F2EFE8] transition-colors" style={{ color: "var(--foreground)" }}>{label}</Link>
                    ))}
                    {["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string) && (
                      <Link href="/admin/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-[#F2EFE8] transition-colors" style={{ color: "#2D6A4F" }}>
                        <Sparkles className="w-4 h-4" /> Admin Panel
                      </Link>
                    )}
                    <hr className="my-1 border-[#EAE7DF]" />
                    <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/cart" className="p-2.5 rounded-xl transition-colors relative" style={{ color: transparent ? "#fff" : "var(--foreground)" }}>
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[1.1rem] h-[1.1rem] bg-[#2D6A4F] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">{cartCount}</span>
                  )}
                </Link>
                <Link href="/login" className="px-4 py-2 text-sm font-medium rounded-xl border transition-colors hidden sm:inline-flex" style={{ borderColor: transparent ? "rgba(255,255,255,0.4)" : "#D6D0C4", color: transparent ? "#fff" : "var(--foreground)" }}>Login</Link>
                <Link href="/register" className="px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors hidden sm:inline-flex" style={{ background: "#2D6A4F" }}>Register</Link>
              </>
            )}

            <button
              className="md:hidden p-2.5 rounded-xl transition-colors ml-1"
              style={{ color: transparent ? "#fff" : "var(--foreground)" }}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1 pb-2">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="px-3 py-1.5 text-sm rounded-lg transition-colors whitespace-nowrap" style={{ color: transparent ? "rgba(255,255,255,0.8)" : "var(--muted)" }}>
              {link.label}
            </Link>
          ))}
          <Link href="/products" className="px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ml-1" style={{ color: transparent ? "#E9C46A" : "#2D6A4F" }}>
            All Products &rarr;
          </Link>
        </nav>
      </div>

      {searchOpen && (
        <div className="md:hidden border-t border-[#EAE7DF] bg-white px-4 py-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted)" }} />
              <input ref={searchRef} type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#EAE7DF] bg-[#F2EFE8] text-sm focus:outline-none" />
            </div>
          </form>
        </div>
      )}

      {menuOpen && (
        <div className="md:hidden border-t border-[#EAE7DF] bg-white shadow-lg">
          <div className="px-4 py-4 space-y-0.5">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="block py-2.5 px-3 text-sm rounded-lg hover:bg-[#F2EFE8] transition-colors" style={{ color: "var(--foreground)" }}>{link.label}</Link>
            ))}
            <Link href="/products" className="block py-2.5 px-3 text-sm font-semibold rounded-lg hover:bg-[#F2EFE8] transition-colors" style={{ color: "#2D6A4F" }}>All Products</Link>
          </div>
          {!session?.user ? (
            <div className="px-4 pb-4 pt-2 border-t border-[#EAE7DF] flex gap-2">
              <Link href="/login" className="flex-1 text-center py-2.5 text-sm font-medium border border-[#D6D0C4] rounded-xl hover:bg-[#F2EFE8] transition-colors">Login</Link>
              <Link href="/register" className="flex-1 text-center py-2.5 text-sm font-semibold text-white rounded-xl transition-colors" style={{ background: "#2D6A4F" }}>Register</Link>
            </div>
          ) : (
            <div className="px-4 pb-4 pt-2 border-t border-[#EAE7DF] space-y-0.5">
              {[["My Account", "/account"], ["My Orders", "/account/orders"], ["Wishlist", "/account/wishlist"]].map(([label, href]) => (
                <Link key={href} href={href} className="block py-2 px-3 text-sm rounded-lg hover:bg-[#F2EFE8] transition-colors" style={{ color: "var(--foreground)" }}>{label}</Link>
              ))}
              <button onClick={() => signOut({ callbackUrl: "/" })} className="block w-full text-left py-2 px-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">Sign Out</button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
