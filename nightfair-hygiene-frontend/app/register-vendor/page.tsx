"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/app/providers";
import { useNightFairHygiene } from "@/hooks/useNightFairHygiene";
import { Store, MapPin, Check, AlertCircle, Loader2 } from "lucide-react";

export default function RegisterVendorPage() {
  const { wallet } = useApp();
  const { contract } = useNightFairHygiene();
  const { toast } = useToast();

  const [vendorName, setVendorName] = useState("");
  const [vendorLocation, setVendorLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!vendorName.trim() || !vendorLocation.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (!contract) {
      toast({
        title: "Error",
        description: "Contract not loaded. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("[RegisterVendor] Submitting:", { vendorName, vendorLocation });

      const tx = await contract.registerVendor(vendorName, vendorLocation);
      
      toast({
        title: "Transaction Submitted",
        description: "Waiting for blockchain confirmation...",
      });

      const receipt = await tx.wait();
      
      // Extract vendor ID from event logs
      let vendorId = "N/A";
      try {
        for (const log of receipt.logs) {
          try {
            const parsed = contract.interface.parseLog(log);
            if (parsed?.name === "VendorRegistered") {
              vendorId = parsed.args?.vendorId?.toString() || "N/A";
              break;
            }
          } catch {
            continue;
          }
        }
      } catch (error) {
        console.warn("[RegisterVendor] Failed to parse event logs:", error);
      }

      toast({
        title: "🎉 Registration Successful!",
        description: `Your vendor has been registered. ID: #${vendorId}`,
        duration: 5000,
      });

      // Reset form
      setVendorName("");
      setVendorLocation("");
    } catch (error) {
      console.error("[RegisterVendor] Failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to register vendor";
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
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
              <Store className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
            <CardDescription className="text-base mt-2">
              Please connect your wallet to register a new vendor
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

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      {/* Header */}
      <div className="text-center mb-10">
        <Badge className="mb-4" variant="secondary">
          <Store className="h-3.5 w-3.5 mr-1.5 inline" />
          Vendor Registration
        </Badge>
        <h1 className="text-4xl font-bold mb-3">Register Your Stall</h1>
        <p className="text-lg text-muted-foreground">
          Join the night market community and start receiving customer feedback
        </p>
      </div>

      {/* Main Form Card */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Vendor Information</CardTitle>
          <CardDescription className="text-base">
            Enter your stall details to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          {/* Vendor Name */}
          <div className="space-y-3">
            <Label htmlFor="vendorName" className="text-base font-semibold flex items-center gap-2">
              <Store className="h-4 w-4 text-primary" />
              Vendor Name
            </Label>
            <Input
              id="vendorName"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              placeholder="e.g., Golden Dragon Noodles"
              disabled={isSubmitting}
              className="h-12 text-base"
            />
            <p className="text-sm text-muted-foreground">
              This will be displayed publicly to customers
            </p>
          </div>

          {/* Location */}
          <div className="space-y-3">
            <Label htmlFor="vendorLocation" className="text-base font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Location
            </Label>
            <Input
              id="vendorLocation"
              value={vendorLocation}
              onChange={(e) => setVendorLocation(e.target.value)}
              placeholder="e.g., Stall A-01, East Market"
              disabled={isSubmitting}
              className="h-12 text-base"
            />
            <p className="text-sm text-muted-foreground">
              Help customers find your stall easily
            </p>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleRegister}
            disabled={isSubmitting || !vendorName.trim() || !vendorLocation.trim()}
            className="w-full h-12 text-base font-semibold"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <Check className="mr-2 h-5 w-5" />
                Register Vendor
              </>
            )}
          </Button>

          {/* Info Box */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-5 rounded-lg border border-primary/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="font-semibold text-sm">What happens next?</p>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>You&apos;ll receive a unique Vendor ID</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Customers can rate your stall using this ID</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>All ratings are encrypted for privacy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Only aggregate scores are visible to authorities</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Registration is open to all vendors. Need help?{" "}
          <a href="#" className="text-primary hover:underline font-medium">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
