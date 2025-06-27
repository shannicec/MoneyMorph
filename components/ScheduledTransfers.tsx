"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Trash2 } from "lucide-react"
import { formatCurrency } from "../utils/currency"
import { convertCurrency } from "../data/fxRates"
import toast from "react-hot-toast"

interface ScheduledTransfersProps {
  accounts: any[]
  scheduledTransfers: any[]
  setScheduledTransfers: (transfers: any[]) => void
  fxRates: any
}

export default function ScheduledTransfers({
  accounts,
  scheduledTransfers,
  setScheduledTransfers,
  fxRates,
}: ScheduledTransfersProps) {
  const [fromAccount, setFromAccount] = useState("")
  const [toAccount, setToAccount] = useState("")
  const [amount, setAmount] = useState("")
  const [scheduledDate, setScheduledDate] = useState("")
  const [note, setNote] = useState("")

  const fromAccountData = accounts.find((acc) => acc.id === fromAccount)
  const toAccountData = accounts.find((acc) => acc.id === toAccount)

  const isCrossCurrency = fromAccountData && toAccountData && fromAccountData.currency !== toAccountData.currency

  const getConvertedAmount = () => {
    if (!isCrossCurrency || !amount) return null
    try {
      return convertCurrency(Number.parseFloat(amount), fromAccountData.currency, toAccountData.currency, fxRates)
    } catch (error) {
      return null
    }
  }

  const handleScheduleTransfer = (e: React.FormEvent) => {
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

    if (fromAccountData && transferAmount > fromAccountData.balance) {
      toast.error("Insufficient balance")
      return
    }

    const convertedAmount = isCrossCurrency ? getConvertedAmount() : transferAmount

    const scheduledTransfer = {
      id: `scheduled-${Date.now()}`,
      fromAccountId: fromAccount,
      toAccountId: toAccount,
      fromAccountName: fromAccountData.name,
      toAccountName: toAccountData.name,
      amount: transferAmount,
      convertedAmount,
      fromCurrency: fromAccountData.currency,
      toCurrency: toAccountData.currency,
      fxRate: isCrossCurrency ? fxRates[`${fromAccountData.currency}-${toAccountData.currency}`] : null,
      scheduledDate,
      note: note.trim(),
      type: isCrossCurrency ? "fx-transfer" : "transfer",
      status: "scheduled",
    }

    setScheduledTransfers([...scheduledTransfers, scheduledTransfer])

    // Reset form
    setFromAccount("")
    setToAccount("")
    setAmount("")
    setScheduledDate("")
    setNote("")

    toast.success("Money said 'bye Felicia' 👋")
  }

  const handleDeleteScheduled = (id: string) => {
    setScheduledTransfers(scheduledTransfers.filter((transfer) => transfer.id !== id))
    toast.success("Your $$ left the chat 💸")
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="space-y-8">
      {/* Schedule New Transfer Form */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <Calendar className="h-5 w-5" />
            <span>Schedule New Transfer</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleScheduleTransfer} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromAccount">From Account</Label>
                <Select value={fromAccount} onValueChange={setFromAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center space-x-2">
                          <span>{account.flag}</span>
                          <span>{account.name}</span>
                          <span className="text-sm text-gray-500 font-mono">
                            ({formatCurrency(account.balance, account.currency)})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="toAccount">To Account</Label>
                <Select value={toAccount} onValueChange={setToAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center space-x-2">
                          <span>{account.flag}</span>
                          <span>{account.name}</span>
                          <span className="text-sm text-gray-500 font-mono">({account.currency})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Scheduled Date</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  min={today}
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
              </div>
            </div>

            {isCrossCurrency && amount && getConvertedAmount() && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-blue-800 dark:text-blue-200">
                  <strong>FX Conversion:</strong> {formatCurrency(Number.parseFloat(amount), fromAccountData.currency)}
                  {" → "} {formatCurrency(getConvertedAmount(), toAccountData.currency)}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-300 font-mono">
                  Rate: 1 {fromAccountData.currency} ={" "}
                  {fxRates[`${fromAccountData.currency}-${toAccountData.currency}`]} {toAccountData.currency}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="note">Note (Optional)</Label>
              <Textarea
                id="note"
                placeholder="Add a note for this scheduled transfer..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Schedule Transfer
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Scheduled Transfers List */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
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
            <div className="rounded-md border border-gray-200 dark:border-gray-700">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-900">
                    <TableHead>Scheduled Date</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduledTransfers.map((transfer) => (
                    <TableRow key={transfer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <TableCell className="font-mono text-sm">
                        {new Date(transfer.scheduledDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{transfer.fromAccountName}</div>
                        <div className="text-sm text-gray-500 font-mono">
                          -{formatCurrency(transfer.amount, transfer.fromCurrency)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{transfer.toAccountName}</div>
                        <div className="text-sm text-green-600 font-mono">
                          +{formatCurrency(transfer.convertedAmount || transfer.amount, transfer.toCurrency)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {transfer.fxRate && (
                          <div className="text-sm">
                            <div className="font-mono">Rate: {transfer.fxRate}</div>
                            <div className="text-gray-500 font-mono">
                              {transfer.fromCurrency} → {transfer.toCurrency}
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={transfer.type === "fx-transfer" ? "default" : "secondary"}
                          className={transfer.type === "fx-transfer" ? "bg-orange-100 text-orange-800" : ""}
                        >
                          {transfer.type === "fx-transfer" ? "FX Transfer" : "Transfer"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{transfer.note || "-"}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteScheduled(transfer.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
