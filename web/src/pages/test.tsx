"use client";

import DynamicCodeRenderer from "@/components/DynamicComponentLoader";

export default function TestPage() {
  const code = `function DynamicComp({
  eventCallback,
  React,
  dependencies,
}) {
  const {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectGroup,
    SelectLabel,
    SelectItem,
    Button,
    Label,
    Input,
  } = dependencies;

  const assetPriceMap = {
    'AAPLLLLLL1': 140,
    'MSFTTTTTT2': 180,
    'TLSAAAAAA3': 120,
  };

  const [assetAddress, setAssetAddress] = React.useState('');
  const [direction, setDirection] = React.useState('');
  const [orderType, setOrderType] = React.useState('');
  const [quantityFloat, setQuantityFloat] = React.useState(0.0);
  const [limitPriceFloat, setLimitPriceFloat] = React.useState(0.0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    eventCallback(
      \`Place order: \${direction} \${quantityFloat} of \${assetAddress} at \${
        orderType === "limit" ? limitPriceFloat : "market price"
      }.\`
    );
    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Place an Order</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1">
          <Label>Asset</Label>
          <Select onValueChange={(value) => {
              setAssetAddress(value);
              setLimitPriceFloat(assetPriceMap[value]);
            }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an asset" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Assets</SelectLabel>
                <SelectItem value={'AAPLLLLLL1'}>{'AAPL'}</SelectItem>
                <SelectItem value={'MSFTTTTTT2'}>{'MSFT'}</SelectItem>
                <SelectItem value={'TLSAAAAAA3'}>{'TLSA'}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Direction</Label>
          <div className="space-y-1">
            <Button
              variant={direction === "buy" ? "default" : "outline"}
              onClick={() => setDirection("buy")}
              className="mr-2"
            >
              Buy
            </Button>
            <Button
              variant={direction === "sell" ? "destructive" : "outline"}
              onClick={() => setDirection("sell")}
            >
              Sell
            </Button>
          </div>
        </div>
        <div className="space-y-1">
          <Label>Order Type</Label>
          <div className="space-y-1">
            <Button
              variant={orderType === "limit" ? "default" : "outline"}
              onClick={() => setOrderType("limit")}
              className="mr-2"
            >
              Limit
            </Button>
            <Button
              variant={orderType === "market" ? "destructive" : "outline"}
              onClick={() => setOrderType("market")}
            >
              Market
            </Button>
          </div>
        </div>
        {orderType === "limit" && (
          <div className="space-y-1">
            <Label>Limit Price(Market: \${limitPriceFloat})</Label>
            <Input
              name="price"
              type="number"
              onChange={(e) => setLimitPriceFloat(Number(e.target.value))}
            />
          </div>
        )}
        <div className="space-y-1">
          <Label>Quantity(max: 340)</Label>
          <Input
            name="quantity"
            type="number"
            onChange={(e) => setQuantityFloat(Number(e.target.value))}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Submitting" : "Submit"}
        </Button>
      </CardFooter>
    </Card>
  );
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
