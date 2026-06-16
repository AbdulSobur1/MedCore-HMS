'use client'

import { useState } from 'react'
import { Plus, Search, Edit2, Trash2, Lock, Users, Building2 } from 'lucide-react'

const STAFF_DATA = [
  { id: 'S001', name: 'Dr. Ahmed Hassan', role: 'Doctor', department: 'Cardiology', status: 'Active', email: 'ahmed@hospital.com' },
  { id: 'S002', name: 'Dr. Emily Garcia', role: 'Doctor', department: 'Endocrinology', status: 'Active', email: 'emily@hospital.com' },
  { id: 'S003', name: 'Sarah Johnson', role: 'Nurse', department: 'Cardiology', status: 'Active', email: 'sarah.j@hospital.com' },
  { id: 'S004', name: 'Mike Thompson', role: 'Pharmacist', department: 'Pharmacy', status: 'Active', email: 'mike.t@hospital.com' },
  { id: 'S005', name: 'Lisa Anderson', role: 'Administrator', department: 'Admin', status: 'Active', email: 'lisa.a@hospital.com' },
]

const DEPARTMENTS_DATA = [
  { id: 'D001', name: 'Cardiology', head: 'Dr. Ahmed Hassan', beds: 20, staff: 12 },
  { id: 'D002', name: 'Orthopedics', head: 'Dr. Robert Smith', beds: 15, staff: 8 },
  { id: 'D003', name: 'Neurology', head: 'Dr. Lisa Chen', beds: 12, staff: 6 },
  { id: 'D004', name: 'Pediatrics', head: 'Dr. Maria Lopez', beds: 18, staff: 10 },
]

export function AdminSection() {
  const [activeTab, setActiveTab] = useState<'staff' | 'departments' | 'settings'>('staff')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredStaff = STAFF_DATA.filter(
    (staff) =>
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredDepartments = DEPARTMENTS_DATA.filter((dept) =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Administration</h1>
          <p className="text-muted-foreground mt-2">Manage staff, departments, and system settings</p>
        </div>
        {activeTab !== 'settings' && (
          <button className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-5 h-5" />
            Add {activeTab === 'staff' ? 'Staff' : 'Department'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border">
        {(['staff', 'departments', 'settings'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === tab
                ? 'border-accent text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'staff' && <Users className="w-4 h-4" />}
            {tab === 'departments' && <Building2 className="w-4 h-4" />}
            {tab === 'settings' && <Lock className="w-4 h-4" />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Staff Management */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Staff Table */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">ID</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Name</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Role</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Department</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Status</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Email</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((staff) => (
                    <tr key={staff.id} className="border-b border-border hover:bg-muted transition-colors">
                      <td className="py-4 px-6 text-foreground text-sm font-medium">{staff.id}</td>
                      <td className="py-4 px-6 text-foreground text-sm">{staff.name}</td>
                      <td className="py-4 px-6 text-foreground text-sm">{staff.role}</td>
                      <td className="py-4 px-6 text-foreground text-sm">{staff.department}</td>
                      <td className="py-4 px-6">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-success/20 text-success">
                          {staff.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground text-sm">{staff.email}</td>
                      <td className="py-4 px-6 flex gap-2">
                        <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                          <Edit2 className="w-4 h-4 text-foreground" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Department Management */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Department Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDepartments.map((dept) => (
              <div key={dept.id} className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{dept.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Head: {dept.head}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                      <Edit2 className="w-4 h-4 text-foreground" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Beds</p>
                    <p className="text-2xl font-bold text-foreground">{dept.beds}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Staff Count</p>
                    <p className="text-2xl font-bold text-foreground">{dept.staff}</p>
                  </div>
                </div>

                <button className="w-full mt-6 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
                  Manage Department
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Hospital Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Hospital Name</label>
                  <input
                    type="text"
                    defaultValue="MedCore Hospital"
                    className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue="admin@medcore.hospital"
                    className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                  <input
                    type="tel"
                    defaultValue="(555) 123-4567"
                    className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground"
                  />
                </div>
                <button className="w-full px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
                  Save Changes
                </button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">System Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Email Notifications</label>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">SMS Alerts</label>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Maintenance Mode</label>
                  <input type="checkbox" className="w-5 h-5 rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Two-Factor Authentication</label>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
