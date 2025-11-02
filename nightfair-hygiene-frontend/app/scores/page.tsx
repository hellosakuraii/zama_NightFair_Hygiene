"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNightFairHygiene } from "@/hooks/useNightFairHygiene";
import { Users, MapPin, Star, Lock, TrendingUp, Info, Loader2 } from "lucide-react";

interface VendorScore {
  id: number;
  name: string;
  location: string;
  ratingCount: number;
}

export default function VendorScoresPage() {
  const { contract } = useNightFairHygiene();
  const [vendors, setVendors] = useState<VendorScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!contract) return;

    const loadVendors = async () => {
      setIsLoading(true);
      try {
        const vendorIds = await contract.getAllVendorIds();
        const vendorData = await Promise.all(
          vendorIds.map(async (id: bigint) => {
            const info = await contract.getVendorInfo(id);
            
            // Contract returns: [id, name, location, exists, ratingCount]
            return {
              id: Number(id),
              name: info[1],
              location: info[2],
              ratingCount: Number(info[4]),
            };
          })
        );
        setVendors(vendorData);
      } catch (error) {
        console.error("Failed to load vendors:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVendors();
  }, [contract]);

  const totalRatings = vendors.reduce((acc, v) => acc + v.ratingCount, 0);
  const avgRatingsPerVendor = vendors.length > 0 ? (totalRatings / vendors.length).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto py-10 px-4">
        {/* Header Section */}
        <div className="text-center mb-10">
          <Badge className="mb-4" variant="secondary">
            <TrendingUp className="h-3.5 w-3.5 mr-1.5 inline" />
            Public Transparency
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Vendor Directory</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Track community participation while protecting individual privacy through FHEVM encryption
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="border-2 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">
                  Total Vendors
                </CardTitle>
                <Users className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{vendors.length}</div>
            </CardContent>
          </Card>

          <Card className="border-2 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">
                  Total Ratings
                </CardTitle>
                <Star className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalRatings}</div>
            </CardContent>
          </Card>

          <Card className="border-2 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">
                  Avg per Vendor
                </CardTitle>
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{avgRatingsPerVendor}</div>
            </CardContent>
          </Card>
        </div>

        {/* Info Banner */}
        <Card className="mb-10 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-background">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Info className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  Privacy-First Design
                </h3>
                <p className="text-muted-foreground">
                  Individual ratings are encrypted using FHEVM technology. Only rating participation counts 
                  are publicly visible to ensure transparency. Actual scores are securely aggregated and 
                  accessible only to authorized authorities through cryptographic decryption.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vendors Grid */}
        {isLoading ? (
          <div className="text-center py-20">
            <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
            <p className="text-lg text-muted-foreground">Loading vendors...</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendors.map((vendor) => (
                <Card 
                  key={vendor.id} 
                  className="border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-300 group"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl mb-1 truncate group-hover:text-primary transition-colors">
                          {vendor.name}
                        </CardTitle>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{vendor.location}</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="flex-shrink-0 font-mono">
                        #{vendor.id}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Rating Count */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Participation</span>
                      </div>
                      <span className="text-lg font-bold">
                        {vendor.ratingCount}
                      </span>
                    </div>

                    {/* Encrypted Status */}
                    {vendor.ratingCount > 0 && (
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <Lock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-primary mb-0.5">
                            Encrypted Scores
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Accessible to authorities only
                          </p>
                        </div>
                      </div>
                    )}

                    {vendor.ratingCount === 0 && (
                      <div className="text-center py-3 text-sm text-muted-foreground">
                        No ratings yet
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {vendors.length === 0 && (
              <Card className="border-2 border-dashed">
                <CardContent className="text-center py-16">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Vendors Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Be the first to register a vendor and start collecting ratings
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Bottom CTA */}
        {vendors.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Want to contribute?{" "}
              <a href="/rate" className="text-primary hover:underline font-semibold">
                Rate a vendor
              </a>
              {" "}or{" "}
              <a href="/register-vendor" className="text-primary hover:underline font-semibold">
                register your stall
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
