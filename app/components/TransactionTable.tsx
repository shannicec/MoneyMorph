"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Filter, Search } from "lucide-react"
import { formatCurrency } from "../utils/currencyUtils"
import { exportToCSV } from "../utils/csvUtils"
import toast from "react-hot-toast"

interface TransactionTableProps {
  transactions: any[]
}

export default function TransactionTable({ transactions }: TransactionTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currencyFilter, setCurrencyFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch =
      searchTerm === "" ||
      txn.fromAccountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.toAccountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.note.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCurrency =
      currencyFilter === "all" || txn.fromCurrency === currencyFilter || txn.toCurrency === currencyFilter

    const matchesType = typeFilter === "all" || txn.type === typeFilter

    return matchesSearch && matchesCurrency && matchesType
  })

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      toast.error("No transactions to export")
      return
    }

    const csvData = filteredTransactions.map((txn) => ({
      "Transaction ID": txn.id,
      Date: new Date(txn.timestamp).toLocaleString(),
      "From Account": txn.fromAccountName,
      "To Account": txn.toAccountName,
      Amount: txn.amount,
      "From Currency": txn.fromCurrency,
      "To Currency": txn.toCurrency,
      "Converted Amount": txn.convertedAmount || txn.amount,
      "FX Rate": txn.fxRate || "N/A",
      Type: txn.type,
      Note: txn.note || "",
    }))

    exportToCSV(csvData, "money-morph-transactions")
    toast.success("Transactions exported successfully!")
  }

  const currencies = ["KES", "USD", "NGN"]
  const types = ["transfer", "fx-transfer"]

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <Filter className="h-5 w-5" />
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
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
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
          <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Currencies</SelectItem>
              {currencies.map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
              <SelectItem value="fx-transfer">FX Transfer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border border-gray-200 dark:border-gray-700">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-900">
                <TableHead>Date</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((txn) => (
                  <TableRow key={txn.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableCell className="font-mono text-sm">{new Date(txn.timestamp).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="font-medium">{txn.fromAccountName}</div>
                      <div className="text-sm text-gray-500">-{formatCurrency(txn.amount, txn.fromCurrency)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{txn.toAccountName}</div>
                      <div className="text-sm text-green-600">
                        +{formatCurrency(txn.convertedAmount || txn.amount, txn.toCurrency)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {txn.fxRate && (
                        <div className="text-sm">
                          <div>Rate: {txn.fxRate}</div>
                          <div className="text-gray-500">
                            {txn.fromCurrency} → {txn.toCurrency}
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={txn.type === "fx-transfer" ? "default" : "secondary"}
                        className={txn.type === "fx-transfer" ? "bg-orange-100 text-orange-800" : ""}
                      >
                        {txn.type === "fx-transfer" ? "FX Transfer" : "Transfer"}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{txn.note || "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
