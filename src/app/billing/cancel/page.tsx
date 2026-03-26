"use client";

import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import Link from "next/link";

export default function BillingCancelPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="mx-auto flex w-full max-w-lg flex-1 items-center justify-center p-6">
        <Card className="w-full text-center">
          <CardContent className="flex flex-col items-center gap-4 py-10">
            <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/40">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold">Payment Cancelled</h2>
            <p className="text-muted-foreground">
              No worries! You can upgrade anytime from the billing page.
            </p>
            <div className="flex gap-3">
              <Link href="/billing">
                <Button variant="outline">Back to Plans</Button>
              </Link>
              <Link href="/">
                <Button>Go to Editor</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
