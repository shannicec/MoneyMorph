"use client"

import { useState, useEffect } from "react"
import { Toaster } from "react-hot-toast"
import toast from "react-hot-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  ArrowRightLeft,
  DollarSign,
  Activity,
  Moon,
  Sun,
  Search,
  Calendar,
  Clock,
  Trash2,
  Download,
} from "lucide-react"

// Data
const initialAccounts = [
  { id: "acc-001", name: "Mpesa KES", currency: "KES", balance: 2500000, flag: "🇰🇪", type: "Mobile Money" },
  { id: "acc-002", name: "Bank USD", currency: "USD", balance: 15000, flag: "🇺🇸", type: "Bank Account" },
  { id: "acc-003", name: "Flutterwave NGN", currency: "NGN", balance: 8500000, flag: "🇳🇬", type: "Payment Gateway" },
  { id: "acc-004", name: "KCB KES", currency: "KES", balance: 1200000, flag: "🇰🇪", type: "Bank Account" },
  { id: "acc-005", name: "Wise USD", currency: "USD", balance: 25000, flag: "🇺🇸", type: "Digital Wallet" },
  { id: "acc-006", name: "GTBank NGN", currency: "NGN", balance: 12000000, flag: "🇳🇬", type: "Bank Account" },
  { id: "acc-007", name: "Safaricom KES", currency: "KES", balance: 800000, flag: "🇰🇪", type: "Mobile Money" },
  { id: "acc-008", name: "Payoneer USD", currency: "USD", balance: 8500, flag: "🇺🇸", type: "Digital Wallet" },
  { id: "acc-009", name: "Paystack NGN", currency: "NGN", balance: 6200000, flag: "🇳🇬", type: "Payment Gateway" },
  { id: "acc-010", name: "Buffer USD", currency: "USD", balance: 5000, flag: "🇺🇸", type: "Buffer Account" },
]

const fxRates = {
  "KES-USD": 0.0072,
  "USD-KES": 139.0,
  "NGN-USD": 0.0012,
  "USD-NGN": 820.0,
  "KES-NGN": 5.9,
  "NGN-KES": 0.17,
}

// Utility functions
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

const convertCurrency = (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return amount
  const pair = `${fromCurrency}-${toCurrency}`
  const rate = fxRates[pair]
  if (!rate) throw new Error(`Exchange rate not found for ${pair}`)
  return amount * rate
}

// Components
function ThemeToggle({ theme, onToggle }) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onToggle}
      className="relative overflow-hidden transition-all duration-300 bg-transparent"
    >
      <Sun
        className={`h-4 w-4 transition-all duration-300 ${theme === "dark" ? "rotate-90 scale-0" : "rotate-0 scale-100"}`}
      />
      <Moon
        className={`absolute h-4 w-4 transition-all duration-300 ${theme === "dark" ? "rotate-0 scale-100" : "-rotate-90 scale-0"}`}
      />
    </Button>
  )
}

function AccountCard({ account }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{account.flag}</span>
            <CardTitle className="text-lg">{account.name}</CardTitle>
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
          <div className="text-2xl font-bold font-mono">{formatCurrency(account.balance, account.currency)}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">ID: {account.id}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function Analytics({ accounts, transactions }) {
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

function TransferForm({ accounts, onTransfer }) {
  const [fromAccount, setFromAccount] = useState("")
  const [toAccount, setToAccount] = useState("")
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")

  const sourceAccount = accounts.find((acc) => acc.id === fromAccount)
  const destinationAccount = accounts.find((acc) => acc.id === toAccount)
  const needsConversion = sourceAccount && destinationAccount && sourceAccount.currency !== destinationAccount.currency

  const getConvertedAmount = () => {
    if (!needsConversion || !amount) return null
    try {
      return convertCurrency(Number.parseFloat(amount), sourceAccount.currency, destinationAccount.currency)
    } catch (error) {
      return null
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!fromAccount || !toAccount || !amount) {
      toast.error("Please fill all fields")
      return
    }

    if (fromAccount === toAccount) {
      toast.error("Cannot transfer to same account")
      return
    }

    const transferAmount = Number.parseFloat(amount)
    if (transferAmount <= 0 || transferAmount > sourceAccount.balance) {
      toast.error("Invalid amount")
      return
    }

    const convertedAmount = needsConversion ? getConvertedAmount() : transferAmount

    const transfer = {
      id: `txn-${Date.now()}`,
      timestamp: new Date().toISOString(),
      fromAccountId: fromAccount,
      toAccountId: toAccount,
      fromAccountName: sourceAccount.name,
      toAccountName: destinationAccount.name,
      amount: transferAmount,
      convertedAmount,
      fromCurrency: sourceAccount.currency,
      toCurrency: destinationAccount.currency,
      fxRate: needsConversion ? fxRates[`${sourceAccount.currency}-${destinationAccount.currency}`] : null,
      note: note.trim(),
      type: needsConversion ? "fx-transfer" : "transfer",
    }

    onTransfer(transfer)
    setFromAccount("")
    setToAccount("")
    setAmount("")
    setNote("")

    const genZMessages = ["Money said 'bye Felicia' 👋", "Your $$ left the chat 💸"]
    const randomMessage = genZMessages[Math.floor(Math.random() * genZMessages.length)]
    toast.success(randomMessage)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ArrowRightLeft className="h-5 w-5" />
          <span>Transfer Money</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">From Account</label>
              <Select value={fromAccount} onValueChange={setFromAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.flag} {account.name} ({formatCurrency(account.balance, account.currency)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">To Account</label>
              <Select value={toAccount} onValueChange={setToAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.flag} {account.name} ({account.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Amount</label>
            <Input
              type="number"
              step="0.01"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {needsConversion && amount && getConvertedAmount() && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-blue-800 dark:text-blue-200">
                <strong>FX Conversion:</strong> {formatCurrency(Number.parseFloat(amount), sourceAccount.currency)}
                {" → "} {formatCurrency(getConvertedAmount(), destinationAccount.currency)}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-300 font-mono">
                Rate: 1 {sourceAccount.currency} = {fxRates[`${sourceAccount.currency}-${destinationAccount.currency}`]}{" "}
                {destinationAccount.currency}
              </p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Transfer Note (Optional)</label>
            <Input
              placeholder="Add a note about this transfer..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full">
            Execute Transfer
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function ScheduledTransfers({ accounts, scheduledTransfers, setScheduledTransfers }) {
  const [fromAccount, setFromAccount] = useState("")
  const [toAccount, setToAccount] = useState("")
  const [amount, setAmount] = useState("")
  const [scheduledDate, setScheduledDate] = useState("")
  const [note, setNote] = useState("")

  const sourceAccount = accounts.find((acc) => acc.id === fromAccount)
  const destinationAccount = accounts.find((acc) => acc.id === toAccount)
  const needsConversion = sourceAccount && destinationAccount && sourceAccount.currency !== destinationAccount.currency

  const getConvertedAmount = () => {
    if (!needsConversion || !amount) return null
    try {
      return convertCurrency(Number.parseFloat(amount), sourceAccount.currency, destinationAccount.currency)
    } catch (error) {
      return null
    }
  }

  const handleScheduleTransfer = (e) => {
    e.preventDefault()

    if (!fromAccount || !toAccount || !amount || !scheduledDate) {
      toast.error("Please fill in all required fields")
      return
    }

    if (fromAccount === toAccount) {
      toast.error("Source and destination must be different")
      return
    }

    const transferAmount = Number.parseFloat(amount)
    if (transferAmount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    if (sourceAccount && transferAmount > sourceAccount.balance) {
      toast.error("Insufficient balance")
      return
    }

    const convertedAmount = needsConversion ? getConvertedAmount() : transferAmount

    const scheduledTransfer = {
      id: `scheduled-${Date.now()}`,
      fromAccountId: fromAccount,
      toAccountId: toAccount,
      fromAccountName: sourceAccount.name,
      toAccountName: destinationAccount.name,
      amount: transferAmount,
      convertedAmount,
      fromCurrency: sourceAccount.currency,
      toCurrency: destinationAccount.currency,
      fxRate: needsConversion ? fxRates[`${sourceAccount.currency}-${destinationAccount.currency}`] : null,
      scheduledDate,
      note: note.trim(),
      type: needsConversion ? "fx-transfer" : "transfer",
      status: "scheduled",
    }

    setScheduledTransfers([...scheduledTransfers, scheduledTransfer])

    // Reset form
    setFromAccount("")
    setToAccount("")
    setAmount("")
    setScheduledDate("")
    setNote("")

    const genZMessages = ["Money said 'bye Felicia' 👋", "Your $$ left the chat 💸"]
    const randomMessage = genZMessages[Math.floor(Math.random() * genZMessages.length)]
    toast.success(randomMessage)
  }

  const handleDeleteScheduled = (id) => {
    setScheduledTransfers(scheduledTransfers.filter((transfer) => transfer.id !== id))
    toast.success("Scheduled transfer deleted")
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="space-y-8">
      {/* Schedule New Transfer Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Schedule New Transfer</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleScheduleTransfer} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">From Account</label>
                <Select value={fromAccount} onValueChange={setFromAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.flag} {account.name} ({formatCurrency(account.balance, account.currency)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">To Account</label>
                <Select value={toAccount} onValueChange={setToAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.flag} {account.name} ({account.currency})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Amount</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Scheduled Date</label>
                <Input
                  type="date"
                  min={today}
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
              </div>
            </div>

            {needsConversion && amount && getConvertedAmount() && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-blue-800 dark:text-blue-200">
                  <strong>FX Conversion:</strong> {formatCurrency(Number.parseFloat(amount), sourceAccount.currency)}
                  {" → "} {formatCurrency(getConvertedAmount(), destinationAccount.currency)}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-300 font-mono">
                  Rate: 1 {sourceAccount.currency} ={" "}
                  {fxRates[`${sourceAccount.currency}-${destinationAccount.currency}`]} {destinationAccount.currency}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Note (Optional)</label>
              <Input
                placeholder="Add a note for this scheduled transfer..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Schedule Transfer
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Scheduled Transfers List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Scheduled Transfers</span>
            <Badge variant="secondary" className="ml-2 font-mono">
              {scheduledTransfers.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scheduledTransfers.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No scheduled transfers yet. Schedule your first transfer above! 📅
            </div>
          ) : (
            <div className="space-y-4">
              {scheduledTransfers.map((transfer) => (
                <div
                  key={transfer.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="font-medium font-mono">
                        {new Date(transfer.scheduledDate).toLocaleDateString()}
                      </span>
                      <Badge variant={transfer.type === "fx-transfer" ? "default" : "secondary"}>
                        {transfer.type === "fx-transfer" ? "FX Transfer" : "Transfer"}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteScheduled(transfer.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">From:</span>
                      <div className="font-medium">{transfer.fromAccountName}</div>
                      <div className="text-sm text-red-600 dark:text-red-400 font-mono">
                        -{formatCurrency(transfer.amount, transfer.fromCurrency)}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">To:</span>
                      <div className="font-medium">{transfer.toAccountName}</div>
                      <div className="text-sm text-green-600 dark:text-green-400 font-mono">
                        +{formatCurrency(transfer.convertedAmount || transfer.amount, transfer.toCurrency)}
                      </div>
                    </div>
                  </div>

                  {transfer.fxRate && (
                    <div className="mb-3 p-2 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800">
                      <div className="text-sm">
                        <span className="text-orange-800 dark:text-orange-200 font-medium">FX Rate: </span>
                        <span className="font-mono">{transfer.fxRate}</span>
                        <span className="text-orange-600 dark:text-orange-300 font-mono ml-2">
                          ({transfer.fromCurrency} → {transfer.toCurrency})
                        </span>
                      </div>
                    </div>
                  )}

                  {transfer.note && (
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400 text-sm">Note: </span>
                      <span className="text-gray-700 dark:text-gray-300 text-sm">{transfer.note}</span>
                    </div>
                  )}

                  <div className="mt-2 text-xs text-gray-400 dark:text-gray-500 font-mono">ID: {transfer.id}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function TransactionTable({ transactions }) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredTransactions = transactions.filter(
    (txn) =>
      txn.fromAccountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.toAccountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (txn.note && txn.note.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Add this function at the top of the TransactionTable component, right after the filteredTransactions logic:

  const exportToCSV = (data, filename = "export") => {
    if (!data || data.length === 0) {
      toast.error("No transactions to export")
      return
    }

    // Get headers from the first object
    const headers = Object.keys(data[0])

    // Create CSV content
    const csvContent = [
      headers.join(","), // Header row
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header]
            // Escape values that contain commas or quotes
            if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value
          })
          .join(","),
      ),
    ].join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `${filename}-${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url) // Clean up the URL object
    }
  }

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      toast.error("No transactions to export")
      return
    }

    const csvData = filteredTransactions.map((txn) => ({
      "Transaction ID": txn.id,
      Date: new Date(txn.timestamp).toLocaleDateString(),
      Time: new Date(txn.timestamp).toLocaleTimeString(),
      "From Account": txn.fromAccountName,
      "To Account": txn.toAccountName,
      "Amount Sent": txn.amount,
      "From Currency": txn.fromCurrency,
      "Amount Received": txn.convertedAmount || txn.amount,
      "To Currency": txn.toCurrency,
      "FX Rate": txn.fxRate || "N/A",
      "Transfer Type": txn.type,
      Note: txn.note || "",
    }))

    exportToCSV(csvData, "money-morph-transactions")
    toast.success("CSV downloaded! Your data just soft-launched itself 🫣")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <span>Transaction History</span>
            <Badge variant="secondary" className="ml-2">
              {filteredTransactions.length}
            </Badge>
          </CardTitle>
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2 bg-transparent"
            disabled={filteredTransactions.length === 0}
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">No transactions found</div>
          ) : (
            filteredTransactions.map((txn) => (
              <div
                key={txn.id}
                className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">
                    {txn.fromAccountName} → {txn.toAccountName}
                  </div>
                  <Badge variant={txn.type === "fx-transfer" ? "default" : "secondary"}>
                    {txn.type === "fx-transfer" ? "FX Transfer" : "Transfer"}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                    <div className="font-medium font-mono">{formatCurrency(txn.amount, txn.fromCurrency)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Received:</span>
                    <div className="font-medium text-green-600 dark:text-green-400 font-mono">
                      {formatCurrency(txn.convertedAmount || txn.amount, txn.toCurrency)}
                    </div>
                  </div>
                  {txn.fxRate && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Rate:</span>
                      <div className="font-medium font-mono">{txn.fxRate}</div>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Date:</span>
                    <div className="font-medium font-mono">{new Date(txn.timestamp).toLocaleDateString()}</div>
                  </div>
                </div>
                {txn.note && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Note: </span>
                    <span className="text-gray-700 dark:text-gray-300 text-sm">{txn.note}</span>
                  </div>
                )}
                <div className="mt-2 text-xs text-gray-400 dark:text-gray-500 font-mono">
                  ID: {txn.id} • {new Date(txn.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Main App
export default function App() {
  const [accounts, setAccounts] = useState(initialAccounts)
  const [transactions, setTransactions] = useState([])
  const [scheduledTransfers, setScheduledTransfers] = useState([])
  const [theme, setTheme] = useState("light")

  useEffect(() => {
    const savedTheme = localStorage.getItem("money-morph-theme") || "light"
    setTheme(savedTheme)
    document.documentElement.classList.toggle("dark", savedTheme === "dark")
  }, [])

  useEffect(() => {
    localStorage.setItem("money-morph-theme", theme)
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"))
  }

  const handleTransfer = (transfer) => {
    const updatedAccounts = accounts.map((account) => {
      if (account.id === transfer.fromAccountId) {
        return { ...account, balance: account.balance - transfer.amount }
      }
      if (account.id === transfer.toAccountId) {
        return {
          ...account,
          balance: account.balance + (transfer.convertedAmount || transfer.amount),
        }
      }
      return account
    })

    setAccounts(updatedAccounts)
    setTransactions([transfer, ...transactions])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">💰 MoneyMorph</h1>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>

        <div className="space-y-8">
          <Analytics accounts={accounts} transactions={transactions} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {accounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>

          <Tabs defaultValue="transfers" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="transfers">Instant Transfers</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled Transfers</TabsTrigger>
              <TabsTrigger value="history">Transaction History</TabsTrigger>
            </TabsList>

            <TabsContent value="transfers" className="space-y-8">
              <TransferForm accounts={accounts} onTransfer={handleTransfer} />
            </TabsContent>

            <TabsContent value="scheduled" className="space-y-8">
              <ScheduledTransfers
                accounts={accounts}
                scheduledTransfers={scheduledTransfers}
                setScheduledTransfers={setScheduledTransfers}
              />
            </TabsContent>

            <TabsContent value="history" className="space-y-8">
              <TransactionTable transactions={transactions} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  )
}
