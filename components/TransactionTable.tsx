"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Search } from "lucide-react"
import { formatCurrency } from "../utils/currency"
import { exportToCSV } from "../utils/csv"
import toast from "react-hot-toast"

export default function TransactionTable({ transactions }) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredTransactions = transactions.filter(
    (txn) =>
      txn.fromAccountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.toAccountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (txn.note && txn.note.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleExport = () => {
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
    toast.success("Your CSV is ready. It just soft-launched itself in your drive 🫣")
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <span>Transaction History</span>
            <Badge variant="secondary" className="ml-2">
              {filteredTransactions.length}
            </Badge>
          </CardTitle>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
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

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">No transactions found</div>
        ) : (
          <div className="rounded-md border border-gray-200 dark:border-gray-700">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-900">
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>From Account</TableHead>
                  <TableHead>To Account</TableHead>
                  <TableHead>Amount Details</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((txn) => (
                  <TableRow key={txn.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableCell>
                      <div className="font-mono text-sm">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {new Date(txn.timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {new Date(txn.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-xs text-gray-500 dark:text-gray-400">{txn.id}</div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900 dark:text-white">{txn.fromAccountName}</div>
                        <div className="text-sm text-red-600 dark:text-red-400 font-mono">
                          -{formatCurrency(txn.amount, txn.fromCurrency)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900 dark:text-white">{txn.toAccountName}</div>
                        <div className="text-sm text-green-600 dark:text-green-400 font-mono">
                          +{formatCurrency(txn.convertedAmount || txn.amount, txn.toCurrency)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {txn.fxRate ? (
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                            Rate: {txn.fxRate}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            {txn.fromCurrency} → {txn.toCurrency}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 dark:text-gray-400">Same currency</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={txn.type === "fx-transfer" ? "default" : "secondary"}
                        className={
                          txn.type === "fx-transfer"
                            ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                            : ""
                        }
                      >
                        {txn.type === "fx-transfer" ? "FX Transfer" : "Transfer"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        {txn.note ? (
                          <div className="text-sm text-gray-700 dark:text-gray-300 truncate" title={txn.note}>
                            {txn.note}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400 dark:text-gray-500">No note</div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
