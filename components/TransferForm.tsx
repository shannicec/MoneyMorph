"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRightLeft } from "lucide-react"
import { convertCurrency } from "../data/fxRates"
import { formatCurrency } from "../utils/currency"
import toast from "react-hot-toast"

export default function TransferForm({ accounts, onTransfer, fxRates }) {
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
      return convertCurrency(Number.parseFloat(amount), sourceAccount.currency, destinationAccount.currency, fxRates)
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

    // Simplified Gen Z messages - just the two you wanted
    const genZMessages = ["Money said 'bye Felicia' 👋", "Your $$ left the chat 💸"]

    const randomMessage = genZMessages[Math.floor(Math.random() * genZMessages.length)]
    toast.success(randomMessage)
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
          <ArrowRightLeft className="h-5 w-5" />
          <span>Transfer Money</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">From Account</label>
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
              <label className="text-sm font-medium text-gray-900 dark:text-white">To Account</label>
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
            <label className="text-sm font-medium text-gray-900 dark:text-white">Amount</label>
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
              <p className="text-sm text-blue-600 dark:text-blue-300">
                Rate: 1 {sourceAccount.currency} = {fxRates[`${sourceAccount.currency}-${destinationAccount.currency}`]}{" "}
                {destinationAccount.currency}
              </p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-900 dark:text-white">Transfer Note (Optional)</label>
            <Textarea
              placeholder="Add a note about this transfer (e.g., 'Monthly salary payment', 'FX hedge', etc.)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
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
