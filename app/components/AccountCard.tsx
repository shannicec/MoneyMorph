"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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

export default function AccountCard({ account }) {
  return (
    <Card className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{account.flag}</span>
            <CardTitle className="text-lg text-gray-900 dark:text-white">{account.name}</CardTitle>
          </div>
          <Badge variant="secondary">{account.type}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Balance</span>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 font-mono">{account.currency}</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white font-mono">
            {formatCurrency(account.balance, account.currency)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">ID: {account.id}</div>
        </div>
      </CardContent>
    </Card>
  )
}
