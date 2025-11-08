"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/app/providers";
import { useNightFairHygiene } from "@/hooks/useNightFairHygiene";
import { useToast } from "@/hooks/use-toast";
import { Star, Lock, Loader2, CheckCircle2, AlertCircle, FileText, Sparkles } from "lucide-react";

interface Vendor {
  id: number;
  name: string;
  location: string;
}

const getScoreColor = (score: number) => {
  if (score >= 8) return "text-green-600 dark:text-green-400";
  if (score >= 6) return "text-yellow-600 dark:text-yellow-400";
  return "text-orange-600 dark:text-orange-400";
};

const getScoreLabel = (score: number) => {
  if (score >= 9) return "Excellent";
  if (score >= 7) return "Good";
  if (score >= 5) return "Fair";
  return "Needs Improvement";
};

export default function RateVendorPage() {
  const { wallet, fhevm } = useApp();
  const { contract, isReady, fhevmInstance } = useNightFairHygiene();
  const { toast } = useToast();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorId, setVendorId] = useState("");
  const [cleanliness, setCleanliness] = useState([8]);
  const [gloveWearing, setGloveWearing] = useState([7]);
  const [wasteManagement, setWasteManagement] = useState([9]);
  const [evidenceHash, setEvidenceHash] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);

  // Load vendors list
  useEffect(() => {
    if (!contract) return;

    const loadVendors = async () => {
      setIsLoadingVendors(true);
      try {
        const vendorIds = await contract.getAllVendorIds();
        const vendorData = await Promise.all(
          vendorIds.map(async (id: bigint) => {
            const info = await contract.getVendorInfo(id);
            return {
              id: Number(id),
              name: info[1],
              location: info[2],
            };
          })
        );
        setVendors(vendorData);
        if (vendorData.length > 0) {
          setVendorId(vendorData[0].id.toString());
        }
      } catch (error) {
        console.error("Failed to load vendors:", error);
        toast({
          title: "Error",
          description: "Failed to load vendor list",
          variant: "destructive",
        });
      } finally {
        setIsLoadingVendors(false);
      }
    };

    loadVendors();
  }, [contract, toast]);

  const handleSubmit = async () => {
    if (!contract || !fhevmInstance || !isReady || !wallet.address) {
      toast({
        title: "Not Ready",
        description: "Please connect wallet and initialize FHEVM",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const contractAddress = await contract.getAddress();

      const input = fhevmInstance.createEncryptedInput(contractAddress, wallet.address);
      input.add16(cleanliness[0]);
      input.add16(gloveWearing[0]);
      input.add16(wasteManagement[0]);

      toast({ title: "🔐 Encrypting...", description: "Securing your rating with FHEVM" });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const enc = await (input as any).encrypt();

      toast({ title: "✓ Encrypted", description: "Submitting to blockchain..." });

      const evidenceBytes32 = evidenceHash || "0x" + "0".repeat(64);

      const tx = await contract.submitRating(
        parseInt(vendorId),
        enc.handles[0],
        enc.handles[1],
        enc.handles[2],
        enc.inputProof,
        evidenceBytes32
      );

      toast({ title: "⏳ Processing", description: "Waiting for confirmation..." });

      await tx.wait();

      toast({
        title: "🎉 Success!",
        description: "Your encrypted rating has been recorded",
        duration: 5000,
      });

      // Reset form
      setCleanliness([8]);
      setGloveWearing([7]);
      setWasteManagement([9]);
      setEvidenceHash("");
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Failed to submit rating";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!wallet.isConnected) {
    return (
      <div className="container mx-auto py-20 px-4 max-w-2xl">
        <Card className="border-2">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Star className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
            <CardDescription className="text-base mt-2">
              Please connect your wallet to submit ratings
            </CardDescription>
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

  if (!isReady) {
    return (
      <div className="container mx-auto py-20 px-4 max-w-2xl">
        <Card className="border-2">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <CardTitle className="text-2xl">Initializing FHEVM</CardTitle>
            <CardDescription className="text-base mt-2">
              Status: {fhevm.status}
            </CardDescription>
          </CardHeader>
          {fhevm.error && (
            <CardContent>
              <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <p className="text-sm font-semibold text-destructive">Error</p>
                </div>
                <p className="text-sm text-muted-foreground">{fhevm.error}</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    );
  }

  const avgScore = Math.round((cleanliness[0] + gloveWearing[0] + wasteManagement[0]) / 3);

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-10">
        <Badge className="mb-4" variant="secondary">
          <Lock className="h-3.5 w-3.5 mr-1.5 inline" />
          Encrypted Rating System
        </Badge>
        <h1 className="text-4xl font-bold mb-3">Rate a Vendor</h1>
        <p className="text-lg text-muted-foreground">
          Your ratings are encrypted and aggregated for privacy
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vendor Selection */}
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Select Vendor
              </CardTitle>
              <CardDescription>Choose which vendor you want to rate</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={vendorId} onValueChange={setVendorId} disabled={isLoadingVendors}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder={isLoadingVendors ? "Loading vendors..." : "Select a vendor"} />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id.toString()}>
                      <div className="flex flex-col py-1">
                        <span className="font-semibold">#{vendor.id} - {vendor.name}</span>
                        <span className="text-xs text-muted-foreground">{vendor.location}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {vendors.length === 0 && !isLoadingVendors && (
                <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  No vendors found. Register one first!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Rating Sliders */}
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle>Hygiene Ratings</CardTitle>
              <CardDescription>Rate each category from 1 (poor) to 10 (excellent)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Cleanliness */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-semibold">Cleanliness</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`${getScoreColor(cleanliness[0])} border-current`}>
                      {cleanliness[0]}/10
                    </Badge>
                    <span className={`text-sm font-medium ${getScoreColor(cleanliness[0])}`}>
                      {getScoreLabel(cleanliness[0])}
                    </span>
                  </div>
                </div>
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={cleanliness}
                  onValueChange={setCleanliness}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  Food preparation area, equipment, utensils
                </p>
              </div>

              {/* Glove Wearing */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-semibold">Glove Wearing</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`${getScoreColor(gloveWearing[0])} border-current`}>
                      {gloveWearing[0]}/10
                    </Badge>
                    <span className={`text-sm font-medium ${getScoreColor(gloveWearing[0])}`}>
                      {getScoreLabel(gloveWearing[0])}
                    </span>
                  </div>
                </div>
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={gloveWearing}
                  onValueChange={setGloveWearing}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  Staff wearing gloves when handling food
                </p>
              </div>

              {/* Waste Management */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-semibold">Waste Management</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`${getScoreColor(wasteManagement[0])} border-current`}>
                      {wasteManagement[0]}/10
                    </Badge>
                    <span className={`text-sm font-medium ${getScoreColor(wasteManagement[0])}`}>
                      {getScoreLabel(wasteManagement[0])}
                    </span>
                  </div>
                </div>
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={wasteManagement}
                  onValueChange={setWasteManagement}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  Proper waste disposal and recycling
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Evidence Hash */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Evidence (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={evidenceHash}
                onChange={(e) => setEvidenceHash(e.target.value)}
                placeholder="0x... or IPFS CID"
                className="h-11"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Add a hash of photo/video evidence if available
              </p>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !isReady || !vendorId}
            className="w-full h-14 text-lg font-semibold"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Submit Encrypted Rating
              </>
            )}
          </Button>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Overall Score Preview */}
          <Card className="border-2 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
                Overall Score
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-0">
              <div className={`text-5xl font-bold mb-2 ${getScoreColor(avgScore)}`}>
                {avgScore}
              </div>
              <p className={`text-lg font-semibold ${getScoreColor(avgScore)}`}>
                {getScoreLabel(avgScore)}
              </p>
              <p className="text-xs text-muted-foreground mt-3">
                Average of all categories
              </p>
            </CardContent>
          </Card>

          {/* Privacy Notice */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                Privacy Protected
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">Ratings encrypted locally</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">Identity remains anonymous</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">Only aggregates visible</p>
              </div>
            </CardContent>
          </Card>

          {/* Info */}
          <Card className="border-2 border-muted">
            <CardHeader>
              <CardTitle className="text-sm">💡 Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• Be honest and fair in your ratings</p>
              <p>• Consider peak vs off-peak hours</p>
              <p>• Evidence helps authorities verify</p>
              <p>• Cooldown: 1 hour between ratings</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Updated: Thu Nov 27 15:20:20 CST 2025
