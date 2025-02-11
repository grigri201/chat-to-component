"use client";
import { DynamicComp } from "@/test_component";

export default function TestPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Shadcn UI Test Page</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Cards</h2>
          <div className="grid grid-cols-2 gap-4">
            <DynamicComp eventCallback={(message: string) => console.log(message)} />
          </div>
        </section>
      </div>
    </div>
  );
}
