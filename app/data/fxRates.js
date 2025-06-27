export const fxRates = {
  // Kenyan Shilling conversions
  "KES-USD": 0.0072, // 1 KES = 0.0072 USD
  "USD-KES": 139.0, // 1 USD = 139 KES

  // Nigerian Naira conversions
  "NGN-USD": 0.0012, // 1 NGN = 0.0012 USD
  "USD-NGN": 820.0, // 1 USD = 820 NGN

  // Direct KES-NGN conversions (avoiding USD as intermediate)
  "KES-NGN": 5.9, // 1 KES = 5.9 NGN
  "NGN-KES": 0.17, // 1 NGN = 0.17 KES
}

// Helper function to get all available currency pairs
export const getCurrencyPairs = () => {
  return Object.keys(fxRates).map((pair) => {
    const [from, to] = pair.split("-")
    return { from, to, rate: fxRates[pair] }
  })
}

// The main conversion function
export const convertCurrency = (amount, fromCurrency, toCurrency, rates = fxRates) => {
  // If it's the same currency, no conversion needed
  if (fromCurrency === toCurrency) return amount

  const pair = `${fromCurrency}-${toCurrency}`
  const rate = rates[pair]

  if (!rate) {
    throw new Error(`Exchange rate not found for ${pair}`)
  }
  return amount * rate
}
