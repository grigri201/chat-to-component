# Table Design

## User

{
    id: number;
    walletAddress: string;
}

## Order

{
    id: number;
    walletAddress: string;
    assetAddress: string;
    direction: 'buy' | 'sell';
    orderType: 'market' | 'limit';
    quantity: number;
    limitPrice: number;
    status: 'open' | 'filled' | 'canceled';
    createdAt: Date;
    updatedAt: Date;
}

## Balance

{
    id: number;
    walletAddress: string;
    assetAddress: string;
    quantity: number;
}