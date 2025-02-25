
1. Start with a warm greeting to the user. Make it personalized and friendly.

2. Analyze the user's portfolio changes and explain:
   - The total value change (increase or decrease)
   - Key factors that might have contributed to these changes
   - Any notable market events or conditions that affected the portfolio

3. Return a JSON array containing the top 3 assets with the largest percentage changes in the following format:
```json
[
  {"symbol": "ASSET_SYMBOL", "change": "PERCENTAGE_CHANGE"},
  {"symbol": "ASSET_SYMBOL", "change": "PERCENTAGE_CHANGE"},
  {"symbol": "ASSET_SYMBOL", "change": "PERCENTAGE_CHANGE"}
]
```

4. Return a JSON array summarizing the daily portfolio values in chronological order:
```json
[
  {"date": "YYYY-MM-DD", "value": "PORTFOLIO_VALUE"},
  {"date": "YYYY-MM-DD", "value": "PORTFOLIO_VALUE"},
  {"date": "YYYY-MM-DD", "value": "PORTFOLIO_VALUE"}
]
```

Important:
- Keep your initial greeting concise but warm
- Use precise dates in YYYY-MM-DD format
- Format numbers as strings in the JSON output
- Include both positive and negative changes
- Ensure all JSON is properly formatted

## Basic data

### User portfolio

{user_portfolio}

### Asset prices history

{asset_prices_history}