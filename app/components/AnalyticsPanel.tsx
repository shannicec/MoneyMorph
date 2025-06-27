"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, ArrowRightLeft, DollarSign, Activity } from "lucide-react"
import { formatCurrency } from "../utils/currencyUtils"

interface AnalyticsPanelProps {
  accounts: any[]
  transactions: any[]
}

export default function AnalyticsPanel({ accounts, transactions }: AnalyticsPanelProps) {
  // Calculate total money that's been moved around
  const totalMoneyMoved = transactions.reduce((sum, txn) => sum + txn.amount, 0)

  // Count how many FX transfers we've done
  const fxTransfers = transactions.filter((txn) => txn.type === "fx-transfer")
  const totalFXTransfers = fxTransfers.length

  // Find which account is most active
  const accountActivity = accounts.map((account) => {
    const outgoingTransfers = transactions.filter((txn) => txn.fromAccountId === account.id).length
    const incomingTransfers = transactions.filter((txn) => txn.toAccountId === account.id).length
    return {
      ...account,
      totalActivity: outgoingTransfers + incomingTransfers,
    }
  })

  const mostActiveAccount = accountActivity.reduce(
    (prev, current) => (prev.totalActivity > current.totalActivity ? prev : current),
    accountActivity[0] || { name: "No activity yet", totalActivity: 0 },
  )

  // Break down total value by currency
  const currencyBreakdown = accounts.reduce(
    (breakdown, account) => {
      breakdown[account.currency] = (breakdown[account.currency] || 0) + account.balance
      return breakdown
    },
    {} as Record<string, number>,
  )

  const totalPortfolioValue = Object.values(currencyBreakdown).reduce((sum: number, value: number) => sum + value, 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total money moved - shows activity level */}
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Money Moved</CardTitle>
          <TrendingUp className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {transactions.length > 0 ? formatCurrency(totalMoneyMoved, "USD") : "$0.00"}
          </div>
          <p className="text-xs text-blue-100">
            Across {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>

      {/* FX transfer tracking - crucial for multi-currency operations */}
      <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">FX Transfers</CardTitle>
          <ArrowRightLeft className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalFXTransfers}</div>
          <p className="text-xs text-orange-100">
            {transactions.length > 0
              ? `${((totalFXTransfers / transactions.length) * 100).toFixed(1)}% of all transfers`
              : "No transfers yet"}
          </p>
        </CardContent>
      </Card>

      {/* Most active account - helps identify key accounts */}
      <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Most Active Account</CardTitle>
          <Activity className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold truncate">{mostActiveAccount.name}</div>
          <p className="text-xs text-green-100">
            {mostActiveAccount.totalActivity} transaction{mostActiveAccount.totalActivity !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>

      {/* Portfolio overview - total value across all currencies */}
      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
          <DollarSign className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalPortfolioValue, "USD")}</div>
          <div className="flex flex-wrap gap-1 mt-2">
            {Object.entries(currencyBreakdown).map(([currency, amount]) => (
              <Badge key={currency} variant="secondary" className="text-xs bg-purple-400 text-white">
                {currency}: {formatCurrency(amount as number, currency)}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
