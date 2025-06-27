"use client"

import { useState } from "react"
import AccountCard from "./AccountCard"
import TransferForm from "./TransferForm"
import TransactionTable from "./TransactionTable"
import AnalyticsPanel from "./AnalyticsPanel"
import FXRateEditor from "./FXRateEditor"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

interface DashboardProps {
  accounts: any[]
  setAccounts: (accounts: any[]) => void
  transactions: any[]
  setTransactions: (transactions: any[]) => void
  fxRates: any
  setFxRates: (rates: any) => void
}

export default function Dashboard({
  accounts,
  setAccounts,
  transactions,
  setTransactions,
  fxRates,
  setFxRates,
}: DashboardProps) {
  const [showFXEditor, setShowFXEditor] = useState(false)

  const handleTransfer = (transfer: any) => {
    // Update account balances
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
    <div className="space-y-8">
      {/* Analytics Panel */}
      <AnalyticsPanel accounts={accounts} transactions={transactions} />

      {/* FX Rate Editor Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => setShowFXEditor(true)}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <Settings className="h-4 w-4" />
          <span>Manage FX Rates</span>
        </Button>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {accounts.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))}
      </div>

      {/* Transfer Form */}
      <TransferForm accounts={accounts} onTransfer={handleTransfer} fxRates={fxRates} />

      {/* Transaction Table */}
      <TransactionTable transactions={transactions} />

      {/* FX Rate Editor Modal */}
      <FXRateEditor
        isOpen={showFXEditor}
        onClose={() => setShowFXEditor(false)}
        fxRates={fxRates}
        onUpdateRates={setFxRates}
      />
    </div>
  )
}
