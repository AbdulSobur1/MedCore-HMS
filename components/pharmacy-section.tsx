'use client'

import { useState } from 'react'
import { Plus, Search, TrendingDown } from 'lucide-react'

const PRESCRIPTIONS_DATA = [
  {
    id: 'RX001',
    patientName: 'John Doe',
    patientId: 'P001',
    medication: 'Lisinopril 10mg',
    dosage: 'Once daily',
    quantity: 30,
    prescribedBy: 'Dr. Ahmed Hassan',
    date: '2024-06-01',
    status: 'Dispensed',
    expiryDate: '2024-12-01',
  },
  {
    id: 'RX002',
    patientName: 'Jane Smith',
    patientId: 'P002',
    medication: 'Metformin 500mg',
    dosage: 'Twice daily',
    quantity: 60,
    prescribedBy: 'Dr. Emily Garcia',
    date: '2024-05-28',
    status: 'Pending',
    expiryDate: '2024-11-28',
  },
  {
    id: 'RX003',
    patientName: 'Mike Johnson',
    patientId: 'P003',
    medication: 'Digoxin 0.25mg',
    dosage: 'Once daily',
    quantity: 30,
    prescribedBy: 'Dr. Ahmed Hassan',
    date: '2024-06-01',
    status: 'Ready',
    expiryDate: '2024-12-01',
  },
  {
    id: 'RX004',
    patientName: 'Sarah Wilson',
    patientId: 'P004',
    medication: 'Amoxicillin 500mg',
    dosage: 'Three times daily',
    quantity: 21,
    prescribedBy: 'Dr. James Wilson',
    date: '2024-05-25',
    status: 'Dispensed',
    expiryDate: '2025-05-25',
  },
]

const INVENTORY_DATA = [
  { name: 'Lisinopril 10mg', stock: 450, minStock: 100, unit: 'tablets', supplier: 'PharmaCorp' },
  { name: 'Metformin 500mg', stock: 320, minStock: 150, unit: 'tablets', supplier: 'HealthMeds' },
  { name: 'Digoxin 0.25mg', stock: 45, minStock: 50, unit: 'tablets', supplier: 'CardioMeds' },
  { name: 'Amoxicillin 500mg', stock: 890, minStock: 200, unit: 'tablets', supplier: 'BioPharma' },
  { name: 'Aspirin 100mg', stock: 25, minStock: 100, unit: 'tablets', supplier: 'GenericDrugs' },
]

export function PharmacySection() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [activeTab, setActiveTab] = useState<'prescriptions' | 'inventory'>('prescriptions')

  const filteredPrescriptions = PRESCRIPTIONS_DATA.filter((rx) => {
    const matchesSearch =
      rx.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rx.medication.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'All' || rx.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const filteredInventory = INVENTORY_DATA.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pharmacy Management</h1>
          <p className="text-muted-foreground mt-2">Manage prescriptions and inventory</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-5 h-5" />
          New Prescription
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border">
        {(['prescriptions', 'inventory'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === tab
                ? 'border-accent text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'prescriptions' ? 'Prescriptions' : 'Inventory'}
          </button>
        ))}
      </div>

      {/* Prescriptions Tab */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by patient or medication..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="flex gap-2">
              {['All', 'Pending', 'Ready', 'Dispensed'].map((status) => (
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

          {/* Prescriptions Table */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">ID</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Patient</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Medication</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Dosage</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Prescribed By</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Status</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrescriptions.map((rx) => (
                    <tr key={rx.id} className="border-b border-border hover:bg-muted transition-colors">
                      <td className="py-4 px-6 text-foreground text-sm font-medium">{rx.id}</td>
                      <td className="py-4 px-6 text-foreground text-sm">{rx.patientName}</td>
                      <td className="py-4 px-6 text-foreground text-sm">{rx.medication}</td>
                      <td className="py-4 px-6 text-foreground text-sm">{rx.dosage}</td>
                      <td className="py-4 px-6 text-foreground text-sm">{rx.prescribedBy}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            rx.status === 'Dispensed'
                              ? 'bg-success/20 text-success'
                              : rx.status === 'Ready'
                                ? 'bg-info/20 text-info'
                                : 'bg-warning/20 text-warning'
                          }`}
                        >
                          {rx.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground text-sm">{rx.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search medications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Inventory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInventory.map((item, idx) => {
              const isLowStock = item.stock <= item.minStock
              return (
                <div key={idx} className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-foreground text-sm">{item.name}</h3>
                    {isLowStock && (
                      <TrendingDown className="w-5 h-5 text-destructive" />
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Current Stock</p>
                      <p className="text-2xl font-bold text-foreground">
                        {item.stock}{' '}
                        <span className="text-sm text-muted-foreground">{item.unit}</span>
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Minimum Stock Level</p>
                      <p className="text-sm text-foreground">{item.minStock} {item.unit}</p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Supplier</p>
                      <p className="text-sm text-foreground">{item.supplier}</p>
                    </div>

                    {/* Stock Bar */}
                    <div className="mt-4">
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${isLowStock ? 'bg-destructive' : 'bg-success'}`}
                          style={{ width: `${Math.min((item.stock / (item.minStock * 2)) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <button className="w-full mt-4 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity text-sm">
                      Reorder
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
