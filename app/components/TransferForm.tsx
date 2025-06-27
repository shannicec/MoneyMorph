"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowRightLeft, AlertCircle } from "lucide-react"
import { convertCurrency } from "../data/fxRates"
import { formatCurrency } from "../utils/currencyUtils"
import toast from "react-hot-toast"

interface TransferFormProps {
  accounts: any[]
  onTransfer: (transfer: any) => void
  fxRates: any
}

export default function TransferForm({ accounts, onTransfer, fxRates }: TransferFormProps) {
  // Form state - keeping track of what the user is doing
  const [fromAccount, setFromAccount] = useState("")
  const [toAccount, setToAccount] = useState("")
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [errors, setErrors] = useState<any>({})

  // Get the actual account objects - makes life easier
  const sourceAccount = accounts.find((acc) => acc.id === fromAccount)
  const destinationAccount = accounts.find((acc) => acc.id === toAccount)

  // Check if we're dealing with different currencies - FX magic happens here
  const needsCurrencyConversion =
    sourceAccount && destinationAccount && sourceAccount.currency !== destinationAccount.currency

  // Calculate how much the recipient will get after conversion
  const getConvertedAmount = () => {
    if (!needsCurrencyConversion || !amount) return null

    try {
      return convertCurrency(Number.parseFloat(amount), sourceAccount.currency, destinationAccount.currency, fxRates)
    } catch (error) {
      // If conversion fails, we'll handle it gracefully
      return null
    }
  }

  // Form validation - because we don't want broken transfers
  const validateTransfer = () => {
    const newErrors: any = {}

    // Basic field validation
    if (!fromAccount) newErrors.fromAccount = "Pick where the money comes from"
    if (!toAccount) newErrors.toAccount = "Pick where the money goes"
    if (fromAccount === toAccount) newErrors.toAccount = "Can't send money to the same account"
    if (!amount || Number.parseFloat(amount) <= 0) newErrors.amount = "Enter a valid amount"

    // Check if they have enough money - crucial for treasury operations
    if (sourceAccount && amount && Number.parseFloat(amount) > sourceAccount.balance) {
      newErrors.amount = "Not enough money in source account"
    }

    // Make sure FX conversion is possible
    if (needsCurrencyConversion && getConvertedAmount() === null) {
      newErrors.amount = "Can't convert between these currencies right now"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault()

    // Don't proceed if validation fails
    if (!validateTransfer()) return

    const transferAmount = Number.parseFloat(amount)
    const convertedAmount = needsCurrencyConversion ? getConvertedAmount() : transferAmount

    // Create the transfer record - this is what gets logged
    const transferRecord = {
      id: `txn-${Date.now()}`, // Simple ID generation
      timestamp: new Date().toISOString(),
      fromAccountId: fromAccount,
      toAccountId: toAccount,
      fromAccountName: sourceAccount.name,
      toAccountName: destinationAccount.name,
      amount: transferAmount,
      convertedAmount,
      fromCurrency: sourceAccount.currency,
      toCurrency: destinationAccount.currency,
      fxRate: needsCurrencyConversion ? fxRates[`${sourceAccount.currency}-${destinationAccount.currency}`] : null,
      note: note.trim(),
      type: needsCurrencyConversion ? "fx-transfer" : "transfer",
    }

    // Execute the transfer
    onTransfer(transferRecord)

    // Clean up the form - ready for next transfer
    setFromAccount("")
    setToAccount("")
    setAmount("")
    setNote("")
    setErrors({})

    toast.success("Transfer completed! Money moved successfully 🎉")
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
          <ArrowRightLeft className="h-5 w-5" />
          <span>Move Money Between Accounts</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleTransfer} className="space-y-4">
          {/* Account selection - from and to */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromAccount">From Account (Source)</Label>
              <Select value={fromAccount} onValueChange={setFromAccount}>
                <SelectTrigger className={errors.fromAccount ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select source account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center space-x-2">
                        <span>{account.flag}</span>
                        <span>{account.name}</span>
                        <span className="text-sm text-gray-500">
                          ({formatCurrency(account.balance, account.currency)})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.fromAccount && <p className="text-sm text-red-500">{errors.fromAccount}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="toAccount">To Account (Destination)</Label>
              <Select value={toAccount} onValueChange={setToAccount}>
                <SelectTrigger className={errors.toAccount ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select destination account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center space-x-2">
                        <span>{account.flag}</span>
                        <span>{account.name}</span>
                        <span className="text-sm text-gray-500">({account.currency})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.toAccount && <p className="text-sm text-red-500">{errors.toAccount}</p>}
            </div>
          </div>

          {/* Amount input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount to Transfer</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={errors.amount ? "border-red-500" : ""}
            />
            {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
          </div>

          {/* FX conversion preview - shows up when currencies are different */}
          {needsCurrencyConversion && amount && getConvertedAmount() && (
            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                <strong>Currency Conversion Preview:</strong>
                <br />
                Sending: {formatCurrency(Number.parseFloat(amount), sourceAccount.currency)}
                <br />
                Receiving: {formatCurrency(getConvertedAmount(), destinationAccount.currency)}
                <br />
                <span className="text-sm">
                  Exchange Rate: 1 {sourceAccount.currency} ={" "}
                  {fxRates[`${sourceAccount.currency}-${destinationAccount.currency}`]} {destinationAccount.currency}
                </span>
              </AlertDescription>
            </Alert>
          )}

          {/* Optional note */}
          <div className="space-y-2">
            <Label htmlFor="note">Transfer Note (Optional)</Label>
            <Textarea
              id="note"
              placeholder="Add a note about this transfer (e.g., 'Monthly salary payment', 'FX hedge', etc.)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={!fromAccount || !toAccount || !amount}
          >
            Execute Transfer
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
