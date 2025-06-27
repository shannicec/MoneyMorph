export const exportToCSV = (data, filename = "export") => {
  if (!data || data.length === 0) {
    throw new Error("No data to export")
  }

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
  }
}

export const parseCSV = (csvText) => {
  const lines = csvText.trim().split("\n")
  if (lines.length < 2) {
    throw new Error("CSV must have at least a header and one data row")
  }

  const headers = lines[0].split(",").map((header) => header.trim())
  const data = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((value) => value.trim())
    if (values.length === headers.length) {
      const row = {}
      headers.forEach((header, index) => {
        row[header] = values[index]
      })
      data.push(row)
    }
  }

  return data
}

export const generateSampleAccountsCSV = () => {
  const sampleData = [
    {
      "Account ID": "acc-001",
      "Account Name": "Kenyan Operations",
      Currency: "KES",
      Balance: "2500000",
      Type: "Operating",
      Flag: "🇰🇪",
    },
    {
      "Account ID": "acc-002",
      "Account Name": "US Dollar Reserve",
      Currency: "USD",
      Balance: "15000",
      Type: "Reserve",
      Flag: "🇺🇸",
    },
  ]

  return sampleData
}
