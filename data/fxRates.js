export const fxRates = {
  "KES-USD": 0.0072,
  "USD-KES": 139.0,
  "NGN-USD": 0.0012,
  "USD-NGN": 820.0,
  "KES-NGN": 5.9,
  "NGN-KES": 0.17,
}

export const convertCurrency = (amount, fromCurrency, toCurrency, rates = fxRates) => {
  if (fromCurrency === toCurrency) return amount
  const pair = `${fromCurrency}-${toCurrency}`
  const rate = rates[pair]
  if (!rate) throw new Error(`Exchange rate not found for ${pair}`)
  return amount * rate
}
