import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, BookOpen, Shield, Zap } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">AmarFollower</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">API Documentation</h1>
            <p className="text-lg text-gray-600">
               SMM Panel API for developers
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Base Info
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-2">
                <p>Base URL: <code className="bg-gray-100 px-2 py-1 rounded">{process.env.NEXTAUTH_URL || "https://amarfollower.com"}/api/v1</code></p>
                <p>Method: <span className="font-semibold">POST</span></p>
                <p>Response: <span className="font-semibold">JSON</span></p>
                <p>All requests require your API key.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-2">
                <p>Every request must include:</p>
                <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-xs">
{`{
  "key": "YOUR_API_KEY",
  "action": "..."
}`}
                </div>
                <p>Keep your API key secret. Do not expose it client-side.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Start
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-2">
                <p>1. Sign up and go to API Keys</p>
                <p>2. Create a new API key</p>
                <p>3. Test your first request:</p>
                <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-xs">
{`{
  "key": "YOUR_API_KEY",
  "action": "balance"
}`}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Support
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-2">
                <p>Need help? Contact our support team for API integration assistance.</p>
                <p className="text-xs text-gray-500">Response time: usually under 24 hours</p>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6">API Endpoints</h2>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Service list</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-2">Parameters:</p>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1 mb-3">
                    <li><code>key</code> - Your API key</li>
                    <li><code>action</code> - <span className="font-mono">services</span></li>
                  </ul>
                  <p className="text-sm text-gray-700 mb-3">Response:</p>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-xs overflow-x-auto">
{`[
  {
    "service": 1,
    "name": "Followers",
    "type": "Default",
    "category": "First Category",
    "rate": "0.90",
    "min": "50",
    "max": "10000",
    "refill": true,
    "cancel": true
  }
]`}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Add order</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-2">Parameters:</p>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1 mb-3">
                    <li><code>key</code> - Your API key</li>
                    <li><code>action</code> - <span className="font-mono">add</span></li>
                    <li><code>service</code> - Service ID</li>
                    <li><code>link</code> - Link to page</li>
                    <li><code>quantity</code> - Needed quantity</li>
                    <li><code>runs</code> - Runs to deliver <span className="text-gray-500">(optional)</span></li>
                    <li><code>interval</code> - Interval in minutes <span className="text-gray-500">(optional)</span></li>
                  </ul>
                  <p className="text-sm text-gray-700 mb-3">Response:</p>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-xs overflow-x-auto">
{`{
  "order": 23501
}`}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Order status</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-2">Parameters:</p>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1 mb-3">
                    <li><code>key</code> - Your API key</li>
                    <li><code>action</code> - <span className="font-mono">status</span></li>
                    <li><code>order</code> - Order ID</li>
                  </ul>
                  <p className="text-sm text-gray-700 mb-3">Response:</p>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-xs overflow-x-auto">
{`{
  "charge": "0.27819",
  "start_count": "3572",
  "status": "Partial",
  "remains": "157",
  "currency": "USD"
}`}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">User balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-2">Parameters:</p>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1 mb-3">
                    <li><code>key</code> - Your API key</li>
                    <li><code>action</code> - <span className="font-mono">balance</span></li>
                  </ul>
                  <p className="text-sm text-gray-700 mb-3">Response:</p>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-xs overflow-x-auto">
{`{
  "balance": "100.84292",
  "currency": "USD"
}`}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-8 px-4 mt-16">
        <div className="container mx-auto text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} AmarFollower. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
