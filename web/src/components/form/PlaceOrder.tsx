import React, { useState, useMemo } from "react";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
  } from "@/components/ui/select";
  import { Label } from "@/components/ui/label";
  import { Input } from "@/components/ui/input";
  import { Button } from "@/components/ui/button";
  import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";

export interface Props {
    assets: Record<string, string>; // asset_address -> symbol
    prices: Record<string, number>; // asset_address -> price
    balance: number;
    eventCallback: (formData: Record<string, any>) => void;
}

export function PlaceOrder({
    assets,
    prices,
    balance,
    eventCallback,
  }:Props) {
    const [assetAddress, setAssetAddress] = useState(Object.values(assets)[0]);
    const [direction, setDirection] = useState('buy');
    const [orderType, setOrderType] = useState('limit');
    const [quantityFloat, setQuantityFloat] = useState(0.0);
    const [limitPriceFloat, setLimitPriceFloat] = useState(prices[assetAddress]);
    const [currentMarketPrice, setCurrentMarketPrice] = useState(prices[assetAddress]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const isValid = useMemo(() => {
      const newErrors: Record<string, string> = {};

      // Required fields validation
      if (!assetAddress) newErrors.asset = 'Asset is required';
      if (!direction) newErrors.direction = 'Direction is required';
      if (!orderType) newErrors.orderType = 'Order type is required';

      // Quantity validation
      if (quantityFloat <= 0) {
        newErrors.quantity = 'Quantity must be greater than 0';
      } else if (quantityFloat > balance) {
        newErrors.quantity = `Quantity cannot exceed maximum balance of ${balance}`;
      }

      // Price validation for limit orders
      if (orderType === 'limit' && !limitPriceFloat) {
        newErrors.price = 'Price is required for limit orders';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }, [assetAddress, direction, orderType, quantityFloat, limitPriceFloat, balance]);

    const handleSubmit = () => {
      if (!isValid) return;
      setIsSubmitting(true);
      eventCallback(
        {
          assetAddress,
          direction,
          orderType,
          quantityFloat,
          limitPriceFloat,
        }
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
                setCurrentMarketPrice(prices[value]);
              }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an asset" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Assets</SelectLabel>
                  {Object.keys(assets).map((key) => (
                    <SelectItem key={key} value={key}>{assets[key]}</SelectItem>
                  ))}
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
              <Label>Limit Price(Market: ${currentMarketPrice})</Label>
              <Input
                name="price"
                type="number"
                onChange={(e) => setLimitPriceFloat(Number(e.target.value))}
                className={errors.price ? 'border-red-500' : ''}
                aria-invalid={!!errors.price}
                aria-errormessage={errors.price}
                min={0}
              />
            </div>
          )}
          <div className="space-y-1">
            <Label>Quantity(max: {balance})</Label>
            <Input
              name="quantity"
              type="number"
              onChange={(e) => setQuantityFloat(Number(e.target.value))}
              className={errors.quantity ? 'border-red-500' : ''}
              aria-invalid={!!errors.quantity}
              aria-errormessage={errors.quantity}
              min={0}
              max={balance}
            />
          </div>
        </CardContent>
        <CardFooter>
          <div className="w-full space-y-2">
            {Object.values(errors).map((error, index) => (
              <p key={index} className="text-sm text-red-500">{error}</p>
            ))}
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !isValid}
              className="w-full">

            {isSubmitting ? "Submitting" : "Submit"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  }