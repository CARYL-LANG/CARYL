import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../lib/context';
import { AdminSidebar } from '../../components/admin/sidebar';
import { AdminHeader } from '../../components/admin/header';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { Download, FileText, BarChart3 } from 'lucide-react';

export default function AdminReportsPage() {
  const navigate = useNavigate();
  const { bookings, rooms, eventBookings } = useBooking();
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'annual'>('monthly');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);

  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const totalEventRevenue = eventBookings.reduce((sum, e) => sum + e.totalPrice, 0);
  const combinedRevenue = totalRevenue + totalEventRevenue;
  const totalBookings = bookings.length;
  const totalEvents = eventBookings.length;
  const occupiedRooms = rooms.filter((r) => r.status === 'occupied').length;
  const avgOccupancy = rooms.length > 0 ? ((occupiedRooms / rooms.length) * 100).toFixed(1) : 0;

  // Period filter helper
  const filterByPeriod = (items: any[], dateField: string) => {
    const refDate = new Date(reportDate + 'T00:00:00');
    if (reportPeriod === 'daily') {
      return items.filter((item) => {
        const d = new Date(item[dateField]);
        return d.toDateString() === refDate.toDateString();
      });
    } else if (reportPeriod === 'weekly') {
      const weekStart = new Date(refDate);
      weekStart.setDate(refDate.getDate() - refDate.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      return items.filter((item) => {
        const d = new Date(item[dateField]);
        return d >= weekStart && d < weekEnd;
      });
    } else if (reportPeriod === 'monthly') {
      return items.filter((item) => {
        const d = new Date(item[dateField]);
        return d.getMonth() === refDate.getMonth() && d.getFullYear() === refDate.getFullYear();
      });
    } else {
      return items.filter((item) => {
        const d = new Date(item[dateField]);
        return d.getFullYear() === refDate.getFullYear();
      });
    }
  };

  const periodBookings = filterByPeriod(bookings, 'checkInDate');
  const periodEventBookings = filterByPeriod(eventBookings, 'eventDate');
  const periodRevenue = periodBookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const periodEventRevenue = periodEventBookings.reduce((sum, e) => sum + e.totalPrice, 0);
  const combinedPeriodRevenue = periodRevenue + periodEventRevenue;

  // Generate Reservation Report
  const handleGenerateReservationReport = () => {
    const reportData = {
      title: 'Reservation Report',
      generatedDate: new Date().toLocaleDateString(),
      period: reportPeriod,
      reportDate,
      totalBookings: periodBookings.length,
      bookings: periodBookings.map((b) => ({
        id: b.id,
        guestName: b.guestName,
        email: b.guestEmail,
        phone: b.guestPhone,
        rooms: b.roomNumber || 'N/A',
        checkIn: new Date(b.checkInDate).toLocaleDateString(),
        checkOut: new Date(b.checkOutDate).toLocaleDateString(),
        status: b.status,
        totalPrice: b.totalPrice,
      })),
    };
    setGeneratedReport(reportData);
  };

  // Generate Sales Report
  const handleGenerateSalesReport = () => {
    const reportData = {
      title: 'Sales Report',
      generatedDate: new Date().toLocaleDateString(),
      period: reportPeriod,
      reportDate,
      totalRevenue: combinedPeriodRevenue,
      roomBookings: periodBookings.length,
      eventBookings: periodEventBookings.length,
      roomRevenue: periodRevenue,
      eventRevenue: periodEventRevenue,
      paymentBreakdown: [
        { status: 'Pending', count: periodBookings.filter((b) => b.paymentStatus === 'pending').length },
        { status: 'Completed', count: periodBookings.filter((b) => b.paymentStatus === 'completed').length },
        { status: 'Cancelled', count: periodBookings.filter((b) => b.paymentStatus === 'cancelled').length },
      ],
      details: periodBookings.map((b) => ({
        bookingId: b.id,
        guestName: b.guestName,
        amount: b.totalPrice,
        method: b.paymentMethod || 'Not specified',
        status: b.paymentStatus || 'pending',
        date: new Date(b.checkInDate).toLocaleDateString(),
      })),
    };
    setGeneratedReport(reportData);
  };

  // Generate Customer Report
  const handleGenerateCustomerReport = () => {
    const customers = periodBookings.map((b) => ({
      name: b.guestName,
      email: b.guestEmail,
      phone: b.guestPhone,
      bookings: periodBookings.filter((booking) => booking.guestEmail === b.guestEmail).length,
      totalSpent: periodBookings
        .filter((booking) => booking.guestEmail === b.guestEmail)
        .reduce((sum, booking) => sum + booking.totalPrice, 0),
    }));

    const reportData = {
      title: 'Customer Report',
      generatedDate: new Date().toLocaleDateString(),
      period: reportPeriod,
      reportDate,
      totalCustomers: [...new Set(periodBookings.map((b) => b.guestEmail))].length,
      customers: Array.from(
        new Map(customers.map((item) => [item.email, item])).values()
      ),
    };
    setGeneratedReport(reportData);
  };

  // Generate Room/Facility Usage Report
  const handleGenerateRoomUsageReport = () => {
    const reportData = {
      title: 'Room Usage Report',
      generatedDate: new Date().toLocaleDateString(),
      totalRooms: rooms.length,
      occupiedRooms: occupiedRooms,
      availableRooms: rooms.length - occupiedRooms,
      occupancyRate: avgOccupancy,
      roomBreakdown: [
        {
          type: 'Single',
          total: rooms.filter((r) => r.type === 'single').length,
          occupied: rooms.filter((r) => r.type === 'single' && r.status === 'occupied').length,
        },
        {
          type: 'Double',
          total: rooms.filter((r) => r.type === 'double').length,
          occupied: rooms.filter((r) => r.type === 'double' && r.status === 'occupied').length,
        },
        {
          type: 'Suite',
          total: rooms.filter((r) => r.type === 'suite').length,
          occupied: rooms.filter((r) => r.type === 'suite' && r.status === 'occupied').length,
        },
      ],
    };
    setGeneratedReport(reportData);
  };

  // Export as PDF
  const handleExportPDF = async () => {
    if (!generatedReport) return;

    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = margin;

      pdf.setFontSize(18);
      pdf.text(`${generatedReport.title}`, margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.text(`Generated: ${generatedReport.generatedDate}`, margin, yPosition);
      yPosition += 6;

      pdf.setDrawColor(200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      const addNewPage = () => {
        pdf.addPage();
        yPosition = margin;
      };

      const checkPage = (needed: number) => {
        if (yPosition + needed > pageHeight - 15) addNewPage();
      };

      if (generatedReport.title === 'Sales Report') {
        pdf.setFontSize(13);
        pdf.text('Revenue Summary:', margin, yPosition);
        yPosition += 7;
        pdf.setFontSize(10);
        pdf.text(`Room Revenue: ₱${generatedReport.roomRevenue}`, margin + 5, yPosition);
        yPosition += 6;
        pdf.text(`Event Revenue: ₱${generatedReport.eventRevenue}`, margin + 5, yPosition);
        yPosition += 6;
        pdf.setFontSize(12);
        pdf.text(`Total Revenue: ₱${generatedReport.totalRevenue}`, margin + 5, yPosition);
        yPosition += 10;

        pdf.setFontSize(11);
        pdf.text('Payment Status Breakdown:', margin, yPosition);
        yPosition += 7;
        pdf.setFontSize(10);
        generatedReport.paymentBreakdown.forEach((p: any) => {
          pdf.text(`${p.status}: ${p.count}`, margin + 5, yPosition);
          yPosition += 6;
        });
        yPosition += 6;

        pdf.setFontSize(11);
        pdf.text('Transaction Details:', margin, yPosition);
        yPosition += 7;
        pdf.setFontSize(8);
        pdf.text('Booking ID', margin, yPosition);
        pdf.text('Guest', margin + 40, yPosition);
        pdf.text('Amount', margin + 100, yPosition);
        pdf.text('Method', margin + 120, yPosition);
        pdf.text('Status', margin + 150, yPosition);
        pdf.text('Date', margin + 180, yPosition);
        yPosition += 5;
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;
        generatedReport.details.forEach((d: any) => {
          checkPage(10);
          pdf.text(String(d.bookingId).substring(0, 8), margin, yPosition);
          pdf.text(String(d.guestName).substring(0, 25), margin + 40, yPosition);
          pdf.text(`₱${d.amount}`, margin + 100, yPosition);
          pdf.text(String(d.method).substring(0, 15), margin + 120, yPosition);
          pdf.text(String(d.status), margin + 150, yPosition);
          pdf.text(String(d.date), margin + 180, yPosition);
          yPosition += 5;
        });
      } else if (generatedReport.title === 'Reservation Report') {
        pdf.setFontSize(13);
        pdf.text(`Total Reservations: ${generatedReport.totalBookings}`, margin, yPosition);
        yPosition += 10;

        pdf.setFontSize(11);
        pdf.text('Booking Details:', margin, yPosition);
        yPosition += 7;
        pdf.setFontSize(8);
        pdf.text('Guest', margin, yPosition);
        pdf.text('Email', margin + 50, yPosition);
        pdf.text('Room', margin + 110, yPosition);
        pdf.text('Check-In', margin + 130, yPosition);
        pdf.text('Check-Out', margin + 160, yPosition);
        pdf.text('Status', margin + 190, yPosition);
        pdf.text('Price', margin + 220, yPosition);
        yPosition += 5;
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;
        generatedReport.bookings.forEach((b: any) => {
          checkPage(10);
          pdf.text(String(b.guestName).substring(0, 30), margin, yPosition);
          pdf.text(String(b.email).substring(0, 30), margin + 50, yPosition);
          pdf.text(String(b.rooms), margin + 110, yPosition);
          pdf.text(String(b.checkIn), margin + 130, yPosition);
          pdf.text(String(b.checkOut), margin + 160, yPosition);
          pdf.text(String(b.status), margin + 190, yPosition);
          pdf.text(`₱${b.totalPrice}`, margin + 220, yPosition);
          yPosition += 5;
        });
      } else if (generatedReport.title === 'Customer Report') {
        pdf.setFontSize(13);
        pdf.text(`Total Customers: ${generatedReport.totalCustomers}`, margin, yPosition);
        yPosition += 10;

        pdf.setFontSize(11);
        pdf.text('Customer Details:', margin, yPosition);
        yPosition += 7;
        pdf.setFontSize(8);
        pdf.text('Name', margin, yPosition);
        pdf.text('Email', margin + 60, yPosition);
        pdf.text('Phone', margin + 130, yPosition);
        pdf.text('Bookings', margin + 180, yPosition);
        pdf.text('Total Spent', margin + 210, yPosition);
        yPosition += 5;
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;
        generatedReport.customers.forEach((c: any) => {
          checkPage(10);
          pdf.text(String(c.name).substring(0, 35), margin, yPosition);
          pdf.text(String(c.email).substring(0, 35), margin + 60, yPosition);
          pdf.text(String(c.phone || 'N/A'), margin + 130, yPosition);
          pdf.text(String(c.bookings), margin + 180, yPosition);
          pdf.text(`₱${c.totalSpent}`, margin + 210, yPosition);
          yPosition += 5;
        });
      } else if (generatedReport.title === 'Room Usage Report') {
        pdf.setFontSize(13);
        pdf.text(`Total Rooms: ${generatedReport.totalRooms}`, margin, yPosition);
        yPosition += 6;
        pdf.text(`Occupied: ${generatedReport.occupiedRooms}  |  Available: ${generatedReport.availableRooms}  |  Occupancy: ${generatedReport.occupancyRate}%`, margin, yPosition);
        yPosition += 10;

        pdf.setFontSize(11);
        pdf.text('Room Type Breakdown:', margin, yPosition);
        yPosition += 7;
        pdf.setFontSize(9);
        pdf.text('Type', margin, yPosition);
        pdf.text('Total', margin + 60, yPosition);
        pdf.text('Occupied', margin + 100, yPosition);
        yPosition += 5;
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;
        generatedReport.roomBreakdown.forEach((r: any) => {
          checkPage(10);
          pdf.text(r.type, margin, yPosition);
          pdf.text(String(r.total), margin + 60, yPosition);
          pdf.text(String(r.occupied), margin + 100, yPosition);
          yPosition += 5;
        });
      }

      // Footer on last page
      yPosition = pageHeight - 10;
      pdf.setFontSize(8);
      pdf.text(
        `Generated on ${new Date().toLocaleString()} | Pring Kuya's Inn`,
        margin,
        yPosition
      );

      pdf.save(
        `${generatedReport.title || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Error generating PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Export as Excel
  const handleExportExcel = () => {
    if (!generatedReport) return;

    const worksheet = XLSX.utils.json_to_sheet(
      generatedReport.details || generatedReport.customers || generatedReport.roomBreakdown || generatedReport.bookings || []
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    XLSX.writeFile(workbook, `${generatedReport?.title || 'Report'}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Clear generated report
  const handleClearReport = () => {
    setGeneratedReport(null);
  };

  // Monthly data computed from real bookings
  const monthlyData = React.useMemo(() => {
    const months: { month: string; bookings: number; revenue: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      const year = d.getFullYear();
      const month = d.getMonth();
      const monthBookings = bookings.filter(b => {
        const bd = new Date(b.checkInDate);
        return bd.getFullYear() === year && bd.getMonth() === month;
      });
      const monthEvents = eventBookings.filter(e => {
        const ed = new Date(e.eventDate);
        return ed.getFullYear() === year && ed.getMonth() === month;
      });
      months.push({
        month: monthName,
        bookings: monthBookings.length + monthEvents.length,
        revenue: monthBookings.reduce((s, b) => s + b.totalPrice, 0) + monthEvents.reduce((s, e) => s + e.totalPrice, 0),
      });
    }
    return months;
  }, [bookings, eventBookings]);

  // Room type data
  const roomTypeData = [
    {
      type: 'Single',
      booked: rooms.filter((r) => r.type === 'single' && r.status === 'occupied').length,
      available: rooms.filter((r) => r.type === 'single' && r.status === 'available').length,
    },
    {
      type: 'Double',
      booked: rooms.filter((r) => r.type === 'double' && r.status === 'occupied').length,
      available: rooms.filter((r) => r.type === 'double' && r.status === 'available').length,
    },
    {
      type: 'Suite',
      booked: rooms.filter((r) => r.type === 'suite' && r.status === 'occupied').length,
      available: rooms.filter((r) => r.type === 'suite' && r.status === 'available').length,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Reports & Analytics</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleExportPDF}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                  Export PDF
                </button>
                <button
                  onClick={handleExportExcel}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  Export Excel
                </button>
              </div>
            </div>

            {/* Generated Report Display Section */}
            {generatedReport && (
              <div
                ref={reportRef}
                className="bg-white rounded-lg p-8 mb-8 border-2 border-purple-200"
              >
                <div className="text-center mb-8 border-b pb-6">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    {generatedReport.title}
                  </h2>
                  <p className="text-gray-600">
                    Generated: {generatedReport.generatedDate}
                  </p>
                </div>

                {/* Reservation Report */}
                {generatedReport.title === 'Reservation Report' && (
                  <div>
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total Reservations</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {generatedReport.totalBookings}
                      </p>
                    </div>
                  </div>
                )}

                {/* Sales Report */}
                {generatedReport.title === 'Sales Report' && (
                  <div>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">Room Revenue</p>
                        <p className="text-2xl font-bold text-green-600">₱{generatedReport.roomRevenue}</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-600">Event Revenue</p>
                        <p className="text-2xl font-bold text-purple-600">₱{generatedReport.eventRevenue}</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-blue-600">₱{generatedReport.totalRevenue}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Customer Report */}
                {generatedReport.title === 'Customer Report' && (
                  <div>
                    <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total Customers</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {generatedReport.totalCustomers}
                      </p>
                    </div>
                  </div>
                )}

                {/* Room Usage Report */}
                {generatedReport.title === 'Room Usage Report' && (
                  <div>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="p-4 bg-green-50 rounded-lg text-center">
                        <p className="text-sm text-gray-600">Occupied Rooms</p>
                        <p className="text-3xl font-bold text-green-600">{generatedReport.occupiedRooms}</p>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-lg text-center">
                        <p className="text-sm text-gray-600">Available Rooms</p>
                        <p className="text-3xl font-bold text-yellow-600">{generatedReport.availableRooms}</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg text-center">
                        <p className="text-sm text-gray-600">Occupancy Rate</p>
                        <p className="text-3xl font-bold text-blue-600">{generatedReport.occupancyRate}%</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Export Buttons - Show when report is generated */}
            {generatedReport && (
              <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Export Options</h3>
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={handleExportPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition font-medium"
                  >
                    <Download size={18} />
                    Download PDF
                  </button>
                  <button
                    onClick={handleExportExcel}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition font-medium"
                  >
                    <Download size={18} />
                    Download Excel
                  </button>
                  <button
                    onClick={handleClearReport}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition font-medium"
                  >
                    <FileText size={18} />
                    Clear Report
                  </button>
                </div>
              </div>
            )}

            {/* Period Filter */}
            <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Report Period</h3>
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Period Type</label>
                  <select
                    value={reportPeriod}
                    onChange={(e) => setReportPeriod(e.target.value as any)}
                    className="rounded-lg border border-gray-300 bg-white py-2 px-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference Date</label>
                  <input
                    type="date"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="rounded-lg border border-gray-300 bg-white py-2 px-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div className="text-sm text-gray-500">
                  {reportPeriod === 'daily' && `Showing data for ${new Date(reportDate).toLocaleDateString()}`}
                  {reportPeriod === 'weekly' && `Showing data for the week of ${new Date(reportDate).toLocaleDateString()}`}
                  {reportPeriod === 'monthly' && `Showing data for ${new Date(reportDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
                  {reportPeriod === 'annual' && `Showing data for ${new Date(reportDate).getFullYear()}`}
                </div>
              </div>
            </div>

            {/* Generate Reports Section */}
            <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Generate Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  onClick={handleGenerateReservationReport}
                  className="px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-medium flex items-center justify-center gap-2"
                >
                  <FileText size={16} />
                  Reservation Report
                </button>
                <button
                  onClick={handleGenerateSalesReport}
                  className="px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm font-medium flex items-center justify-center gap-2"
                >
                  <BarChart3 size={16} />
                  Sales Report
                </button>
                <button
                  onClick={handleGenerateCustomerReport}
                  className="px-4 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 transition text-sm font-medium flex items-center justify-center gap-2"
                >
                  <FileText size={16} />
                  Customer Report
                </button>
                <button
                  onClick={handleGenerateRoomUsageReport}
                  className="px-4 py-3 bg-orange-600 text-white rounded hover:bg-orange-700 transition text-sm font-medium flex items-center justify-center gap-2"
                >
                  <BarChart3 size={16} />
                  Room Usage Report
                </button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    ₱{totalRevenue}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {totalBookings}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">All bookings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Avg Occupancy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {avgOccupancy}%
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Current rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Occupied Rooms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">
                    {occupiedRooms}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Of {rooms.length} total</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Monthly Bookings & Revenue */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Bookings & Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="bookings"
                        stroke="#3b82f6"
                        name="Bookings"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10b981"
                        name="Revenue"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Room Type Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Room Type Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={roomTypeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="booked" fill="#ef4444" name="Occupied" />
                      <Bar dataKey="available" fill="#10b981" name="Available" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Booking Status Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Status Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {bookings.filter((b) => b.status === 'pending').length}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Confirmed</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {bookings.filter((b) => b.status === 'confirmed').length}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Checked-In</p>
                    <p className="text-2xl font-bold text-green-600">
                      {bookings.filter((b) => b.status === 'checked-in').length}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Checked-Out</p>
                    <p className="text-2xl font-bold text-gray-600">
                      {bookings.filter((b) => b.status === 'checked-out').length}
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Cancelled</p>
                    <p className="text-2xl font-bold text-red-600">
                      {bookings.filter((b) => b.status === 'cancelled').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
