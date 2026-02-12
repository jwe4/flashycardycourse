import { PricingTable } from '@clerk/nextjs';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Pricing
          </h1>
          <p className="text-muted-foreground mt-2">
            Choose the plan that fits your learning goals
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <PricingTable />
        </div>
      </div>
    </div>
  );
}
