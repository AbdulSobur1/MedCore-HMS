'use client'

import { useState } from 'react'
import { Plus, Search, Download, DollarSign } from 'lucide-react'

const INVOICES_DATA = [
  {
    id: 'INV001',
    patientName: 'John Doe',
    patientId: 'P001',
    amount: 2500,
    services: ['Consultation', 'Lab Tests', 'Medications'],
    date: '2024-06-01',
    dueDate: '2024-06-15',
    status: 'Paid',
  },
  {
    id: 'INV002',
    patientName: 'Jane Smith',
    patientId: 'P002',
    amount: 1850,
    services: ['Consultation', 'Ultrasound'],
    date: '2024-05-28',
    dueDate: '2024-06-11',
    status: 'Paid',
  },
  {
    id: 'INV003',
    patientName: 'Mike Johnson',
    patientId: 'P003',
    amount: 5200,
    services: ['Surgery', 'Hospital Admission (3 days)', 'ICU Care'],
    date: '2024-05-20',
    dueDate: '2024-06-03',
    status: 'Overdue',
  },
  {
    id: 'INV004',
    patientName: 'Sarah Wilson',
    patientId: 'P004',
    amount: 950,
    services: ['Consultation', 'X-Ray'],
    date: '2024-05-25',
    dueDate: '2024-06-08',
    status: 'Pending',
  },
]

export function BillingSection() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')

  const filteredInvoices = INVOICES_DATA.filter((invoice) => {
    const matchesSearch =
      invoice.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'All' || invoice.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const totalRevenue = INVOICES_DATA.reduce((sum, inv) => (inv.status === 'Paid' ? sum + inv.amount : sum), 0)
  const pendingAmount = INVOICES_DATA.reduce((sum, inv) => (inv.status === 'Pending' ? sum + inv.amount : sum), 0)
  const overdueAmount = INVOICES_DATA.reduce((sum, inv) => (inv.status === 'Overdue' ? sum + inv.amount : sum), 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Billing & Payments</h1>
          <p className="text-muted-foreground mt-2">Manage invoices and financial records</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-5 h-5" />
          New Invoice
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-success">${totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-2">From paid invoices</p>
            </div>
            <div className="p-3 rounded-lg bg-success/20">
              <DollarSign className="w-6 h-6 text-success" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Pending Payment</p>
              <p className="text-3xl font-bold text-warning">${pendingAmount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-2">{INVOICES_DATA.filter(i => i.status === 'Pending').length} invoices</p>
            </div>
            <div className="p-3 rounded-lg bg-warning/20">
              <DollarSign className="w-6 h-6 text-warning" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Overdue Payment</p>
              <p className="text-3xl font-bold text-destructive">${overdueAmount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-2">{INVOICES_DATA.filter(i => i.status === 'Overdue').length} invoices</p>
            </div>
            <div className="p-3 rounded-lg bg-destructive/20">
              <DollarSign className="w-6 h-6 text-destructive" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by patient name or invoice ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div className="flex gap-2">
          {['All', 'Paid', 'Pending', 'Overdue'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                selectedStatus === status
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-card border border-border text-foreground hover:bg-muted'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Invoice ID</th>
                <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Patient</th>
                <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Amount</th>
                <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Services</th>
                <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Date</th>
                <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Due Date</th>
                <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Status</th>
                <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-border hover:bg-muted transition-colors">
                  <td className="py-4 px-6 text-foreground text-sm font-medium">{invoice.id}</td>
                  <td className="py-4 px-6 text-foreground text-sm">{invoice.patientName}</td>
                  <td className="py-4 px-6 text-foreground text-sm font-semibold">${invoice.amount.toLocaleString()}</td>
                  <td className="py-4 px-6 text-foreground text-sm">{invoice.services.join(', ')}</td>
                  <td className="py-4 px-6 text-muted-foreground text-sm">{invoice.date}</td>
                  <td className="py-4 px-6 text-muted-foreground text-sm">{invoice.dueDate}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'Paid'
                          ? 'bg-success/20 text-success'
                          : invoice.status === 'Pending'
                            ? 'bg-warning/20 text-warning'
                            : 'bg-destructive/20 text-destructive'
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                      <Download className="w-4 h-4 text-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
