"use client";

import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function BillingSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="mx-auto flex w-full max-w-lg flex-1 items-center justify-center p-6">
        <Card className="w-full text-center">
          <CardContent className="flex flex-col items-center gap-4 py-10">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/40">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold">Payment Successful</h2>
            <p className="text-muted-foreground">
              Your subscription is now active. You have unlimited access to all
              TurnItOut features.
            </p>
            <Link href="/">
              <Button>Start Checking Papers</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
