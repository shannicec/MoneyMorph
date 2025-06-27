"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, ArrowRightLeft, DollarSign, Activity } from "lucide-react"

const formatCurrency = (amount, currency) => {
  const formatters = {
    USD: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
    KES: new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }),
    NGN: new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }),
  }
  const formatter = formatters[currency]
  if (!formatter) {
    return `${currency} ${amount.toLocaleString()}`
  }
  return formatter.format(amount)
}

export default function Analytics({ accounts, transactions }) {
  const totalMoved = transactions.reduce((sum, txn) => sum + txn.amount, 0)
  const fxTransfers = transactions.filter((txn) => txn.type === "fx-transfer").length

  const accountActivity = accounts.map((account) => {
    const outgoing = transactions.filter((txn) => txn.fromAccountId === account.id).length
    const incoming = transactions.filter((txn) => txn.toAccountId === account.id).length
    return { ...account, activity: outgoing + incoming }
  })

  const mostActive = accountActivity.reduce(
    (prev, current) => (prev.activity > current.activity ? prev : current),
    accountActivity[0] || { name: "No activity", activity: 0 },
  )

  const currencyBreakdown = accounts.reduce((breakdown, account) => {
    breakdown[account.currency] = (breakdown[account.currency] || 0) + account.balance
    return breakdown
  }, {})

  const totalValueUSD = Object.entries(currencyBreakdown).reduce((total, [currency, amount]) => {
    if (currency === "USD") return total + amount
    if (currency === "KES") return total + amount * 0.0072
    if (currency === "NGN") return total + amount * 0.0012
    return total + amount
  }, 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Moved</CardTitle>
          <TrendingUp className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono">{formatCurrency(totalMoved, "USD")}</div>
          <p className="text-xs text-blue-100 font-mono">{transactions.length} transactions</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">FX Transfers</CardTitle>
          <ArrowRightLeft className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono">{fxTransfers}</div>
          <p className="text-xs text-orange-100">
            {transactions.length > 0 ? `${((fxTransfers / transactions.length) * 100).toFixed(1)}%` : "0%"} of all
            transfers
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Most Active</CardTitle>
          <Activity className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold truncate">{mostActive.name}</div>
          <p className="text-xs text-green-100 font-mono">{mostActive.activity} transactions</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
          <DollarSign className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono">{formatCurrency(totalValueUSD, "USD")}</div>
          <div className="flex flex-wrap gap-1 mt-2">
            {Object.entries(currencyBreakdown).map(([currency, amount]) => (
              <Badge key={currency} variant="secondary" className="text-xs bg-purple-400 text-white font-mono">
                {currency}: {formatCurrency(amount, currency)}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-purple-100 mt-1 font-mono">{accounts.length} accounts</p>
        </CardContent>
      </Card>
    </div>
  )
}
