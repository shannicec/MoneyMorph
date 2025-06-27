export const formatCurrency = (amount, currency) => {
  const formatters = {
    USD: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
    KES: new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
    NGN: new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
  }

  const formatter = formatters[currency]

  if (!formatter) {
    return `${currency} ${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  return formatter.format(amount)
}

export const getCurrencySymbol = (currency) => {
  const symbols = {
    USD: "$",
    KES: "KSh",
    NGN: "₦",
  }
  return symbols[currency] || currency
}

export const parseCurrencyAmount = (value) => {
  const cleanValue = value.toString().replace(/[^0-9.-]/g, "")
  return Number.parseFloat(cleanValue) || 0
}
