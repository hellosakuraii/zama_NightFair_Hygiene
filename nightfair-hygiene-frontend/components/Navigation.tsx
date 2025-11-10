"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Wallet, X, Shield } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/app/providers";
import { shortenAddress } from "@/lib/utils";
import { getChainName } from "@/fhevm/internal/constants";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/register-vendor", label: "Register Vendor" },
  { href: "/rate", label: "Rate Vendor" },
  { href: "/scores", label: "Public Directory" },
  { href: "/authority", label: "Authority Portal" },
];

export function Navigation() {
  const pathname = usePathname();
  const { wallet } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-primary leading-none">NightFair</span>
              <span className="text-xs text-muted-foreground leading-none">Hygiene</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`font-medium transition-all ${
                      isActive ? "shadow-sm" : "hover:bg-muted"
                    }`}
                  >
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Network Indicator */}
            {wallet.chainId && (
              <Badge 
                variant={wallet.isSupported ? "secondary" : "destructive"}
                className="hidden sm:flex items-center gap-1.5"
              >
                <div className={`h-2 w-2 rounded-full ${
                  wallet.isSupported ? "bg-green-500" : "bg-red-500"
                } animate-pulse`} />
                {getChainName(wallet.chainId)}
              </Badge>
            )}

            {/* Wallet Connect */}
            {wallet.isConnected && wallet.address ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={wallet.disconnect}
                className="hidden sm:flex items-center gap-2 font-mono"
              >
                <Wallet className="h-4 w-4" />
                {shortenAddress(wallet.address)}
              </Button>
            ) : (
              <Button 
                size="sm" 
                onClick={wallet.connect} 
                disabled={wallet.isConnecting}
                className="hidden sm:flex items-center gap-2"
              >
                {wallet.isConnecting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4" />
                    Connect Wallet
                  </>
                )}
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-3 bg-background/95 backdrop-blur">
            {/* Mobile Navigation Links */}
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start font-medium"
                  >
                    {item.label}
                  </Button>
                </Link>
              );
            })}

            {/* Mobile Wallet Section */}
            <div className="pt-3 border-t space-y-3">
              {/* Network Badge */}
              {wallet.chainId && (
                <div className="flex justify-center">
                  <Badge 
                    variant={wallet.isSupported ? "secondary" : "destructive"}
                    className="flex items-center gap-1.5"
                  >
                    <div className={`h-2 w-2 rounded-full ${
                      wallet.isSupported ? "bg-green-500" : "bg-red-500"
                    } animate-pulse`} />
                    {getChainName(wallet.chainId)}
                  </Badge>
                </div>
              )}

              {/* Wallet Button */}
              {wallet.isConnected && wallet.address ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    wallet.disconnect();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full font-mono"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  {shortenAddress(wallet.address)}
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  onClick={() => {
                    wallet.connect();
                    setIsMobileMenuOpen(false);
                  }} 
                  disabled={wallet.isConnecting}
                  className="w-full"
                >
                  {wallet.isConnecting ? (
                    <>
                      <div className="mr-2 h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="mr-2 h-4 w-4" />
                      Connect Wallet
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// Updated: Thu Nov 27 15:20:20 CST 2025
