# 功能列表

## 登录(基于 solana/web3.js)

- /authorization/getNoce: 获取 nonce
  - GET
  - params: {"account": string }
  - response: {"nonce": string }
- /authorization/login: 传入 account address 和 signature 获取 token
  - POST
  - params: {"account": string, "signature": string }
  - response: {"token": string }

## 聊天相关接口

- /chat/hi: 如果过去8小时没有消息，会返回今天的问候信息。
  - POST
  - streaming
  - response: {"response": string }

- /chat/completion: 传入 prompt 获取响应
  - POST
  - streaming
  - params: {"prompt": string }
  - response: {"response": string }

- /chat/asset-analysis/:assetAddress: 获取资产信息
  - GET
  - streaming
  - params: {"assetAddress": string }
  - response: {"assetInfo": string }

- /chat/portfolio-analysis: 获取资产信息
  - GET
  - streaming
  - response: {"portfolioInfo": string }

- /chat/place-order: 创建订单
  - POST
  - streaming
  - response: {"placeOrderContext": string }

- /chat/cancel-order: 取消订单
  - POST
  - streaming
  - response: {"cancelOrderContext": string }