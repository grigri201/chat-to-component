import React from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem, SelectLabel } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function DynamicComp({ eventCallback }: { eventCallback: (message: string) => void }) {
    const [assetAddress, setAssetAddress] = React.useState('AAPLLLLLL1');
    const [direction, setDirection] = React.useState('buy');
    const [orderType, setOrderType] = React.useState('market');
    const [quantityFloat, setQuantityFloat] = React.useState(0.0);
    const [limitPriceFloat, setLimitPriceFloat] = React.useState(140);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
  
    const handleSubmit = () => {
        setIsSubmitting(true);
        eventCallback(`Place order: ${direction} ${quantityFloat} of ${assetAddress} at ${orderType === 'limit' ? limitPriceFloat : 'market price'}.`);
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
                    <Select onValueChange={(value: string) => setAssetAddress(value)}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select an asset" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Assets</SelectLabel>
                                <SelectItem value={'AAPLLLLLL1'}>AAPL</SelectItem>
                                <SelectItem value={'MSFTTTTTT2'}>MSFT</SelectItem>
                                <SelectItem value={'TLSAAAAAA3'}>TLSA</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <Label>Direction</Label>
                    <div className="space-y-1">
                        <Button
                            variant={direction === 'buy' ? 'default' : 'outline'}
                            onClick={() => setDirection('buy')}
                            className="mr-2"
                        >
                            Buy
                        </Button>
                        <Button
                            variant={direction === 'sell' ? 'destructive' : 'outline'}
                            onClick={() => setDirection('sell')}
                        >
                            Sell
                        </Button>
                    </div>
                </div>
                <div className="space-y-1">
                    <Label>Order Type</Label>
                    <div className="space-y-1">
                        <Button
                            variant={orderType === 'limit' ? 'default' : 'outline'}
                            onClick={() => setOrderType('limit')}
                            className="mr-2"
                        >
                            Limit
                        </Button>
                        <Button
                            variant={orderType === 'market' ? 'destructive' : 'outline'}
                            onClick={() => setOrderType('market')}
                        >
                            Market
                        </Button>
                    </div>
                </div>
                {orderType === 'limit' && (
                    <div className="space-y-1">
                        <Label>Limit Price(Market: 140)</Label>
                        <Input name="price" type="number" onChange={e => setLimitPriceFloat(Number(e.target.value))} />
                    </div>
                )}
                <div className="space-y-1">
                    <Label>Quantity(max: 200)</Label>
                    <Input name="quantity" type="number" onChange={e => setQuantityFloat(Number(e.target.value))} />
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? 'Submitting' : 'Submit'}</Button>
            </CardFooter>
        </Card>
    );
  }