"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { getCurrencyPairs } from "@/data/fxRates"
import toast from "react-hot-toast"

interface FXRateEditorProps {
  isOpen: boolean
  onClose: () => void
  fxRates: any
  onUpdateRates: (rates: any) => void
}

export default function FXRateEditor({ isOpen, onClose, fxRates, onUpdateRates }: FXRateEditorProps) {
  const [editedRates, setEditedRates] = useState(fxRates)

  const currencyPairs = getCurrencyPairs()

  const handleRateChange = (pair: string, newRate: string) => {
    const rate = Number.parseFloat(newRate)
    if (isNaN(rate) || rate <= 0) return

    setEditedRates({
      ...editedRates,
      [pair]: rate,
    })
  }

  const handleSave = () => {
    onUpdateRates(editedRates)
    toast.success("Rates updated! Currency conversion just got a glow up ✨")
    onClose()
  }

  const handleReset = () => {
    setEditedRates(fxRates)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage FX Rates</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currencyPairs.map(({ from, to, rate }) => {
              const pair = `${from}-${to}`
              return (
                <Card key={pair} className="p-4">
                  <CardContent className="p-0">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        {from} → {to}
                      </Label>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">1 {from} =</span>
                        <Input
                          type="number"
                          step="0.000001"
                          value={editedRates[pair] || rate}
                          onChange={(e) => handleRateChange(pair, e.target.value)}
                          className="flex-1"
                        />
                        <span className="text-sm text-gray-500">{to}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
