// Updated: 2025-11-12 15:46:36
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, TrendingUp, Users, ArrowRight, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Gradient */}
      <section className="relative py-24 px-4 bg-gradient-to-br from-primary/20 via-primary/10 to-background overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <Badge className="mb-6 px-4 py-1.5 text-sm font-medium" variant="secondary">
            <Sparkles className="h-3.5 w-3.5 mr-1.5 inline" />
            Powered by Zama FHEVM
          </Badge>
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            NightFair Hygiene
          </h1>
          <p className="text-2xl md:text-3xl text-muted-foreground mb-3 font-medium">
            Privacy-Preserving Hygiene Rating
          </p>
          <p className="text-lg md:text-xl text-muted-foreground/80 mb-10 max-w-2xl mx-auto">
            Encrypted citizen feedback for cleaner night markets. Your voice matters, your privacy protected.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/rate">
              <Button size="lg" className="text-base px-8 h-12 group">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/scores">
              <Button size="lg" variant="outline" className="text-base px-8 h-12">
                View Public Directory
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 border-b bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Shield className="h-10 w-10 mx-auto mb-3 text-primary" />
              <div className="text-3xl font-bold mb-1">100%</div>
              <div className="text-sm text-muted-foreground">Privacy Protected</div>
            </div>
            <div className="text-center">
              <Lock className="h-10 w-10 mx-auto mb-3 text-primary" />
              <div className="text-3xl font-bold mb-1">FHE</div>
              <div className="text-sm text-muted-foreground">Homomorphic Encryption</div>
            </div>
            <div className="text-center">
              <Users className="h-10 w-10 mx-auto mb-3 text-primary" />
              <div className="text-3xl font-bold mb-1">Public</div>
              <div className="text-sm text-muted-foreground">Transparent Aggregation</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Enhanced Cards */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4">Why NightFair?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Revolutionary approach to public health monitoring with privacy at its core
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group">
              <CardHeader className="text-center pt-8">
                <div className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl mb-3">Anonymous Rating</CardTitle>
                <CardDescription className="text-base">
                  Submit encrypted hygiene scores without revealing your identity. Full encryption using FHEVM technology.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group">
              <CardHeader className="text-center pt-8">
                <div className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl mb-3">Smart Aggregation</CardTitle>
                <CardDescription className="text-base">
                  Homomorphic operations aggregate scores on-chain while keeping individual ratings private.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group">
              <CardHeader className="text-center pt-8">
                <div className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl mb-3">Authority Portal</CardTitle>
                <CardDescription className="text-base">
                  Authorized departments can securely decrypt and monitor aggregated data for action.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works with Timeline */}
      <section className="py-20 px-4 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              Simple steps to make your voice heard
            </p>
          </div>
          <div className="space-y-8 relative">
            {/* Connection Line */}
            <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent hidden md:block" />
            
            <div className="flex gap-6 relative">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg relative z-10">
                1
              </div>
              <div className="flex-1 pb-2">
                <h3 className="font-semibold text-xl mb-2">Connect Wallet</h3>
                <p className="text-muted-foreground">
                  Use MetaMask or any Web3 wallet to securely connect to the dApp
                </p>
              </div>
            </div>

            <div className="flex gap-6 relative">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg relative z-10">
                2
              </div>
              <div className="flex-1 pb-2">
                <h3 className="font-semibold text-xl mb-2">Submit Encrypted Rating</h3>
                <p className="text-muted-foreground">
                  Rate vendors on cleanliness, glove wearing, and waste management - all encrypted locally
                </p>
              </div>
            </div>

            <div className="flex gap-6 relative">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg relative z-10">
                3
              </div>
              <div className="flex-1 pb-2">
                <h3 className="font-semibold text-xl mb-2">On-Chain Aggregation</h3>
                <p className="text-muted-foreground">
                  FHEVM homomorphically aggregates scores while preserving individual privacy
                </p>
              </div>
            </div>

            <div className="flex gap-6 relative">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg relative z-10">
                4
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-xl mb-2">Transparent Results</h3>
                <p className="text-muted-foreground">
                  Public views participation counts, authorities access detailed analytics
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="text-center py-12">
              <CardTitle className="text-3xl mb-4">Ready to Get Started?</CardTitle>
              <CardDescription className="text-base mb-8 max-w-xl mx-auto">
                Join the movement for cleaner, safer night markets. Your feedback matters, and your privacy is guaranteed.
              </CardDescription>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register-vendor">
                  <Button size="lg" variant="outline" className="px-8">
                    Register Your Stall
                  </Button>
                </Link>
                <Link href="/rate">
                  <Button size="lg" className="px-8">
                    Rate a Vendor
                  </Button>
                </Link>
              </div>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold text-lg">NightFair Hygiene</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Powered by Zama FHEVM - Fully Homomorphic Encryption for Ethereum
            </p>
          </div>
          <div className="flex justify-center gap-6 text-sm">
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Documentation
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              GitHub
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
