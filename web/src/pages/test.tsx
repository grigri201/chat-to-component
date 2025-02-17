"use client";

import DynamicCodeRenderer from "@/components/DynamicComponentLoader";

export default function TestPage() {
//   const code = `function DynamicComp({
//   eventCallback,
//   React,
//   dependencies,
// }) {
//   const { PlaceOrder } = dependencies;
//   const assets = {'AAPLLLLLL1': 'AAPL', 'MSFTTTTTT2': 'MSFT', 'TLSAAAAAA3': 'TLSA'};
//   const prices = {'AAPL': 140, 'MSFT': 180, 'TLSA': 200};
//   return <PlaceOrder 
//   assets={assets}
//   prices={prices}
//   balance={100}
//   eventCallback={(formData) => console.log(formData)}
//   />
// }
// `
const code = `function DynamicComp({
  eventCallback,
  React,
  dependencies,
}) {
  const { PlaceOrder } = dependencies;
  const assets = {AAPLLLLLL1: "AAPL", MSFTTTTTT2: "MSFT", TLSAAAAAA3: "TLSA"};
  const prices = {AAPLLLLLL1: 140, MSFTTTTTT2: 180, TLSAAAAAA3: 200};
  return <PlaceOrder 
  assets={assets}
  prices={prices}
  balance={10000}
  eventCallback={(formData) => console.log(formData)}
  />
}`

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Shadcn UI Test Page</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Cards</h2>
          <div className="grid grid-cols-2 gap-4">
            <DynamicCodeRenderer code={code} eventCallback={(message: string) => console.log(message)} />
          </div>
        </section>
      </div>
    </div>
  );
}
