export const formatCurrency = (amount, currency) => {
  const formatters = {
    USD: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }),
    KES: new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }),
    NGN: new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }),
  }

  const formatter = formatters[currency]
  if (!formatter) {
    return `${currency} ${amount.toLocaleString()}`
  }
  return formatter.format(amount)
}
