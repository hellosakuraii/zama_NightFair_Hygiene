"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/app/providers";
import { useNightFairHygiene } from "@/hooks/useNightFairHygiene";
import { FhevmDecryptionSignature } from "@/fhevm/FhevmDecryptionSignature";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { 
  Shield, 
  Lock, 
  Unlock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2,
  Loader2,
  Eye,
  Users,
  MapPin
} from "lucide-react";

interface VendorWithDetails {
  id: string;
  name: string;
  location: string;
  ratingCount: bigint;
  aggregatedCleanliness?: number;
  aggregatedGloveWearing?: number;
  aggregatedWasteManagement?: number;
  isDecrypting?: boolean;
}

const getScoreColor = (avg: number) => {
  if (avg >= 8) return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30";
  if (avg >= 6) return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30";
  return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30";
};

export default function AuthorityPage() {
  const { wallet, fhevm } = useApp();
  const { contract } = useNightFairHygiene();
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const { ethersSigner } = useMetaMaskEthersSigner();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [vendors, setVendors] = useState<VendorWithDetails[]>([]);

  const decryptVendorScores = async (vendorId: string) => {
    if (!contract || !wallet.address || !fhevm.instance || !ethersSigner) return;

    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, isDecrypting: true } : v))
    );

    try {
      const contractAddress = await contract.getAddress();
      
      const cleanlinessHandle = await contract.vendorAggregatedCleanliness(BigInt(vendorId));
      const gloveWearingHandle = await contract.vendorAggregatedGloveWearing(BigInt(vendorId));
      const wasteManagementHandle = await contract.vendorAggregatedWasteManagement(BigInt(vendorId));

      // Request decryption permission
      const tx = await contract.allowAuthorityAccess(BigInt(vendorId));
      await tx.wait();

      // Get decryption signature
      const sig = await FhevmDecryptionSignature.loadOrSign(
        fhevm.instance,
        [contractAddress as `0x${string}`],
        ethersSigner,
        fhevmDecryptionSignatureStorage
      );

      if (!sig) {
        throw new Error("Unable to build FHEVM decryption signature");
      }

      // Decrypt scores
      const decryptionResult = await fhevm.instance.userDecrypt(
        [
          { handle: cleanlinessHandle, contractAddress },
          { handle: gloveWearingHandle, contractAddress },
          { handle: wasteManagementHandle, contractAddress },
        ],
        sig.privateKey,
        sig.publicKey,
        sig.signature,
        sig.contractAddresses,
        sig.userAddress,
        sig.startTimestamp,
        sig.durationDays
      );

      const cleanliness = decryptionResult[cleanlinessHandle];
      const gloveWearing = decryptionResult[gloveWearingHandle];
      const wasteManagement = decryptionResult[wasteManagementHandle];

      setVendors((prev) =>
        prev.map((v) =>
          v.id === vendorId
            ? {
                ...v,
                aggregatedCleanliness: Number(cleanliness),
                aggregatedGloveWearing: Number(gloveWearing),
                aggregatedWasteManagement: Number(wasteManagement),
                isDecrypting: false,
              }
            : v
        )
      );
    } catch (error) {
      console.error("Failed to decrypt scores:", error);
      setVendors((prev) =>
        prev.map((v) => (v.id === vendorId ? { ...v, isDecrypting: false } : v))
      );
      alert(`Decryption failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  useEffect(() => {
    if (!contract || !wallet.address) return;

    const checkAuthorization = async () => {
      try {
        const authorized = await contract.isAuthorizedAuthority(wallet.address);
        setIsAuthorized(authorized);

        if (authorized) {
          const vendorIds = await contract.getAllVendorIds();
          const vendorData = await Promise.all(
            vendorIds.map(async (id: bigint) => {
              const info = await contract.getVendorInfo(id);
              
              // Contract returns: [id, name, location, exists, ratingCount]
              return {
                id: id.toString(),
                name: info[1],
                location: info[2],
                ratingCount: BigInt(info[4]),
              };
            })
          );
          setVendors(vendorData);
        }
      } catch (error) {
        console.error("Failed to check authorization:", error);
      }
    };

    checkAuthorization();
  }, [contract, wallet.address]);

  if (!wallet.isConnected) {
    return (
      <div className="container mx-auto py-20 px-4 max-w-2xl">
        <Card className="border-2">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Authority Portal</CardTitle>
            <p className="text-muted-foreground mt-2">
              Please connect your wallet to access
            </p>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <Button onClick={wallet.connect} size="lg" className="px-8">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="container mx-auto py-20 px-4 max-w-2xl">
        <Card className="border-2 border-destructive/50">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <p className="text-muted-foreground mt-2">
              Your address is not authorized to access this portal
            </p>
          </CardHeader>
          <CardContent className="text-center pb-8 text-sm text-muted-foreground">
            <p>Authorized Personnel Only</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isAuthorized === null) {
    return (
      <div className="container mx-auto py-20 px-4 max-w-2xl">
        <Card className="border-2">
          <CardContent className="text-center py-12">
            <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
            <p className="text-lg text-muted-foreground">Checking authorization...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto py-10 px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <Badge className="mb-4" variant="default">
            <Shield className="h-3.5 w-3.5 mr-1.5 inline" />
            Authority Access
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Authority Portal</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Decrypt and analyze aggregated vendor hygiene data
          </p>
        </div>

        {/* Info Banner */}
        <Card className="mb-10 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-background">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  Authorized Decryption
                </h3>
                <p className="text-sm text-muted-foreground">
                  Click &quot;Decrypt Scores&quot; to request permission and reveal aggregated 
                  ratings. This action requires a blockchain transaction to grant FHE decryption rights.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vendors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor) => {
            const hasDecrypted = vendor.aggregatedCleanliness !== undefined;
            const avgScore = hasDecrypted
              ? ((vendor.aggregatedCleanliness! + vendor.aggregatedGloveWearing! + vendor.aggregatedWasteManagement!) /
                  (3 * Number(vendor.ratingCount))).toFixed(2)
              : null;

            return (
              <Card key={vendor.id} className="border-2 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl mb-1 truncate">
                        {vendor.name}
                      </CardTitle>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{vendor.location}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="font-mono">
                      #{vendor.id}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Basic Info */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Ratings</span>
                    </div>
                    <span className="text-lg font-bold">
                      {vendor.ratingCount.toString()}
                    </span>
                  </div>

                  {/* Decrypted Scores */}
                  {hasDecrypted ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                        <Unlock className="h-4 w-4" />
                        <span>Decrypted Scores</span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center p-2 rounded bg-muted/30">
                          <span className="text-muted-foreground">Cleanliness</span>
                          <span className="font-mono font-semibold">{vendor.aggregatedCleanliness}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded bg-muted/30">
                          <span className="text-muted-foreground">Glove Wearing</span>
                          <span className="font-mono font-semibold">{vendor.aggregatedGloveWearing}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded bg-muted/30">
                          <span className="text-muted-foreground">Waste Mgmt</span>
                          <span className="font-mono font-semibold">{vendor.aggregatedWasteManagement}</span>
                        </div>
                      </div>

                      {vendor.ratingCount > BigInt(0) && (
                        <div className={`p-3 rounded-lg border-2 ${getScoreColor(Number(avgScore))}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4" />
                              <span className="text-sm font-semibold">Average Score</span>
                            </div>
                            <span className="text-2xl font-bold font-mono">
                              {avgScore}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                        <span>Successfully decrypted</span>
                      </div>
                    </div>
                  ) : (
                    /* Decrypt Button */
                    <Button
                      onClick={() => decryptVendorScores(vendor.id)}
                      disabled={vendor.isDecrypting || vendor.ratingCount === BigInt(0)}
                      className="w-full h-11"
                      size="default"
                    >
                      {vendor.isDecrypting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Decrypting...
                        </>
                      ) : vendor.ratingCount === BigInt(0) ? (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          No Ratings Yet
                        </>
                      ) : (
                        <>
                          <Unlock className="mr-2 h-4 w-4" />
                          Decrypt Scores
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {vendors.length === 0 && (
          <Card className="border-2 border-dashed">
            <CardContent className="text-center py-16">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Vendors Found</h3>
              <p className="text-muted-foreground">
                No vendors have been registered yet
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
