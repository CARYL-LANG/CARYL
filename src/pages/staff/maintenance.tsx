import { useState } from 'react';
import { useBooking } from '../../lib/context';
import { StaffSidebar } from '../../components/staff/staff-sidebar';
import { StaffHeader } from '../../components/staff/staff-header';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Wrench, Plus, DoorOpen, Waves } from 'lucide-react';
import { MaintenanceReport } from '../../lib/types';

export default function StaffMaintenancePage() {
  const { rooms, services, maintenanceReports, addMaintenanceReport, updateMaintenanceReport, currentUser, logActivity } = useBooking();
  const [showModal, setShowModal] = useState(false);
  const [itemType, setItemType] = useState<'room' | 'facility'>('room');
  const [itemId, setItemId] = useState('');
  const [issueDescription, setIssueDescription] = useState('');

  const roomsList = rooms.map((r) => ({ id: r.id, name: `Room ${r.roomNumber}` }));
  const facilitiesList = services
    .filter((s) => s.category === 'swimming-pool' || s.category === 'videoke')
    .map((s) => ({ id: s.id, name: s.name }));
  const itemOptions = itemType === 'room' ? roomsList : facilitiesList;

  const handleSubmit = () => {
    if (!itemId || !issueDescription.trim()) return;
    const selectedItem = itemOptions.find((i) => i.id === itemId);
    if (!selectedItem) return;

    const report: MaintenanceReport = {
      id: crypto.randomUUID(),
      itemType,
      itemId,
      itemName: selectedItem.name,
      reportedBy: currentUser.id,
      reporterName: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.name,
      issueDescription,
      status: 'reported',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addMaintenanceReport(report);
    logActivity('Reported maintenance issue', 'maintenance_report', report.id, `${selectedItem.name}: ${issueDescription}`);
    setShowModal(false);
    setItemId('');
    setIssueDescription('');
  };

  const handleStatusChange = (id: string, status: string) => {
    updateMaintenanceReport(id, { status: status as MaintenanceReport['status'] });
    logActivity('Updated maintenance report', 'maintenance_report', id, `Status changed to ${status}`);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <StaffSidebar />
      <div className="flex-1 overflow-auto">
        <StaffHeader />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Maintenance Reports</h1>
              <p className="text-gray-600 mt-2">Report and track maintenance issues for rooms and facilities</p>
            </div>
            <Button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Plus size={20} /> Report Issue
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card><CardContent className="p-4"><p className="text-2xl font-bold text-red-600">{maintenanceReports.filter((r) => r.status === 'reported').length}</p><p className="text-xs text-gray-500">Reported</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-2xl font-bold text-yellow-600">{maintenanceReports.filter((r) => r.status === 'in-progress').length}</p><p className="text-xs text-gray-500">In Progress</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-2xl font-bold text-green-600">{maintenanceReports.filter((r) => r.status === 'resolved').length}</p><p className="text-xs text-gray-500">Resolved</p></CardContent></Card>
          </div>

          {/* Reports */}
          <div className="space-y-4">
            {maintenanceReports.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-gray-500"><Wrench size={40} className="mx-auto mb-3 text-gray-300" />No maintenance reports yet.</CardContent></Card>
            ) : (
              maintenanceReports.map((report) => (
                <Card key={report.id}>
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {report.itemType === 'room' ? <DoorOpen size={18} className="text-gray-500" /> : <Waves size={18} className="text-gray-500" />}
                          <h3 className="font-bold text-gray-900">{report.itemName}</h3>
                          <Badge className={
                            report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            report.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {report.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">{report.issueDescription}</p>
                        <p className="text-xs text-gray-500">Reported by {report.reporterName || 'Unknown'} on {new Date(report.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="sm:w-48">
                        <label className="text-xs font-medium text-gray-500 block mb-1">Update Status</label>
                        <select
                          value={report.status}
                          onChange={(e) => handleStatusChange(report.id, e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                          <option value="reported">Reported</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Report Maintenance Issue</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={itemType}
                  onChange={(e) => { setItemType(e.target.value as 'room' | 'facility'); setItemId(''); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="room">Room</option>
                  <option value="facility">Facility</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{itemType === 'room' ? 'Room' : 'Facility'}</label>
                <select
                  value={itemId}
                  onChange={(e) => setItemId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Select {itemType === 'room' ? 'a room' : 'a facility'}</option>
                  {itemOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Description</label>
                <textarea
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  rows={3}
                  placeholder="Describe the issue..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={handleSubmit} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">Submit Report</Button>
              <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
