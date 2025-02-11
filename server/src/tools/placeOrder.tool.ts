import type { ChatCompletionTool } from "openai/resources/index.mjs";

export const placeOrderTool: ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'placeOrder',
    description: 'Place a new order with the specified parameters',
    parameters: {
      type: 'object',
      properties: {
        assetAddress: {
          type: 'string',
          description: 'The address of the asset',
        },
        direction: {
          type: 'string',
          enum: ['buy', 'sell'],
          description: 'The direction of the order',
        },
        orderType: {
          type: 'string',
          enum: ['market', 'limit'],
          description: 'The type of the order',
        },
        quantityFloat: {
          type: 'number',
          description: 'The quantity of asset for the order, note that this is ask asset not bid',
        },
        limitPriceFloat: {
          type: 'number',
          description: 'The limit price in bid asset for the order',
        },
        slippageBps: {
          type: 'number',
          description: 'The slippage in bps for the order',
        },
        expireTime: {
          type: 'number',
          description: 'The expiration time for the order, default is 0 which means no expiration',
        }
      },
      required: [
        'assetAddress',
        'direction',
        'orderType',
        'quantityFloat',
        'limitPriceFloat',
      ],
    },
  },
};