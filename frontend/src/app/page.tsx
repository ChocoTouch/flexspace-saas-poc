import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-gray-900">
            🏢 FlexSpace
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Intelligent Workspace Booking System
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">🚀 POC Version 1.0</h3>
            <p className="text-sm text-blue-700">
              This is a proof of concept for a SaaS workspace booking system with QR code access
              control and real-time analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-2">📅</div>
              <h4 className="font-semibold text-gray-900">Smart Booking</h4>
              <p className="text-sm text-gray-600 mt-1">
                Reserve spaces with conflict detection
              </p>
            </div>

            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-2">🔐</div>
              <h4 className="font-semibold text-gray-900">QR Access</h4>
              <p className="text-sm text-gray-600 mt-1">
                Secure temporary access codes
              </p>
            </div>

            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-2">📊</div>
              <h4 className="font-semibold text-gray-900">Analytics</h4>
              <p className="text-sm text-gray-600 mt-1">
                Real-time occupancy insights
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex-1" size="lg">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button variant="outline" className="flex-1" size="lg">
              <Link href="/register">Create Account</Link>
            </Button>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-500">
              Built with Next.js, NestJS, Prisma & PostgreSQL
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-xs text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                API Connected
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}