import { WeatherForm } from "@/components/weather-form";
import { WeatherLookup } from "@/components/weather-lookup";
import { WeatherSubmissions } from "@/components/weather-submissions";

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Weather System
          </h1>
          <p className="text-muted-foreground text-lg">
            Submit weather requests and retrieve stored results
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Weather Form Section */}
          <div className="flex flex-col items-center justify-start">
            <h2 className="text-2xl font-semibold mb-4">
              Submit Weather Request
            </h2>
            <WeatherForm />
          </div>

          {/* Data Lookup Section */}
          <div className="flex flex-col items-center justify-start">
            <h2 className="text-2xl font-semibold mb-4">Lookup Weather Data</h2>
            <WeatherLookup />
          </div>
        </div>

        {/* Weather Submissions Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Weather Submissions</h2>
          <WeatherSubmissions />
        </div>
      </div>
    </div>
  );
}
