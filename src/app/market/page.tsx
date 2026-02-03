import { MarketAnalysisWidget } from "@/interfaces/web/components/market";

export default function MarketPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Market Intelligence</h1>
        <p className="text-muted-foreground mt-2">
          Analyze salary ranges and market demand for any tech role
        </p>
      </div>
      <MarketAnalysisWidget />
    </div>
  );
}
