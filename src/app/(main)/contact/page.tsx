
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Building } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="container mx-auto py-8">
        <div className="max-w-3xl mx-auto">
             <Card>
                <CardHeader className="text-center">
                    <Mail className="mx-auto h-12 w-12 text-primary" />
                    <CardTitle className="mt-4 font-heading text-3xl">Contact Us</CardTitle>
                    <CardDescription className="max-w-prose mx-auto">
                        We're here to help with any questions you may have about our platform, services, or enterprise solutions. Please don't hesitate to reach out.
                    </CardDescription>
                </CardHeader>
                <CardContent className="mt-6">
                    <div className="flex flex-col items-center justify-center space-y-6">
                       <div className="text-center">
                            <h3 className="text-lg font-semibold text-primary">General & Enterprise Inquiries</h3>
                            <p className="text-muted-foreground">For questions about features, pricing, or custom solutions.</p>
                            <Link href="mailto:EnterpriseAI@pollitago.com" className="text-lg font-medium text-foreground hover:text-primary transition-colors mt-1 block">
                                EnterpriseAI@pollitago.com
                            </Link>
                       </div>
                       <div className="text-center">
                            <h3 className="text-lg font-semibold text-primary">Our Headquarters</h3>
                            <p className="text-muted-foreground">
                                123 Innovation Drive<br />
                                Tech City, TX 54321
                            </p>
                       </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
