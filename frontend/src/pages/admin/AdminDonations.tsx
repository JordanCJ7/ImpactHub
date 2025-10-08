import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// Use a simple HTML table here - the project does not include a dedicated Table UI component
import { Badge } from '@/components/ui/badge';
import { DollarSign, Eye, Download, Loader2 } from 'lucide-react';
import { adminService, type Donation } from '@/services/admin';
import { useToast } from '@/hooks/use-toast';

const AdminDonations: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState<Donation[]>([]);

  // Dummy data to show during development when API returns empty
  const sampleDonations: Donation[] = [
    {
      _id: 'don_1',
      amount: 5000,
      donorEmail: 'alice@example.com',
      campaign: { _id: 'camp_1', title: 'Clean Water for Village' } as any,
      status: 'completed',
      createdAt: new Date().toISOString()
    } as Donation,
    {
      _id: 'don_2',
      amount: 2500,
      donorEmail: 'bob@example.com',
      campaign: { _id: 'camp_2', title: 'School Supplies Drive' } as any,
      status: 'pending',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    } as Donation
  ];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await adminService.getAllDonations(1, 50);
        setDonations((res as any)?.donations || []);
      } catch (err) {
        console.error('Failed to load donations', err);
        toast({ title: 'Error', description: 'Could not load donations', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleExport = () => {
    // simple CSV export - use sampleDonations when real donations are empty
    const exportList = donations.length > 0 ? donations : sampleDonations;
    const csv = [
      ['Donation ID', 'Amount', 'Donor', 'Campaign', 'Status', 'Date'],
      ...exportList.map(d => [
        d._id ?? '',
        d.amount ?? '',
        d.donorEmail ?? '',
        (d as any).campaign?.title ?? (d as any).campaign ?? '',
        d.status ?? '',
        d.createdAt ?? ''
      ])
    ].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'donations.csv';
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: 'Exported', description: 'Donations exported as CSV' });
  };

  const handleExportPdf = () => {
    const exportList = donations.length > 0 ? donations : sampleDonations;
    const htmlRows = exportList.map(d => `
      <tr>
        <td style="padding:8px;border:1px solid #e5e7eb">${d._id ?? ''}</td>
        <td style="padding:8px;border:1px solid #e5e7eb">${d.amount ?? ''}</td>
        <td style="padding:8px;border:1px solid #e5e7eb">${d.donorEmail ?? ''}</td>
        <td style="padding:8px;border:1px solid #e5e7eb">${(d as any).campaign?.title ?? ''}</td>
        <td style="padding:8px;border:1px solid #e5e7eb">${d.status ?? ''}</td>
        <td style="padding:8px;border:1px solid #e5e7eb">${d.createdAt ?? ''}</td>
      </tr>
    `).join('');

    const html = `
      <html>
      <head>
        <title>Donations Export</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <style>body{font-family:Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;} table{border-collapse:collapse;width:100%;} th, td{border:1px solid #e5e7eb;padding:8px;text-align:left;} th{background:#f9fafb;}</style>
      </head>
      <body>
        <h1>Donations</h1>
        <table>
          <thead>
            <tr>
              <th>Donation ID</th>
              <th>Amount</th>
              <th>Donor</th>
              <th>Campaign</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${htmlRows}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const w = window.open('', '_blank', 'noopener');
    if (!w) {
      toast({ title: 'Blocked', description: 'Popup blocked. Please allow popups for this site.', variant: 'destructive' });
      return;
    }
    w.document.write(html);
    w.document.close();
    // Give the new window a moment to render then open print dialog
    setTimeout(() => {
      w.print();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Donation Management</h1>
            <p className="text-muted-foreground">Monitor and verify donations</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4 mr-2"/>Export</Button>
            <Button asChild>
              <Link to="/admin">Back to Dashboard</Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Donations</CardTitle>
            <CardDescription>Showing latest donations</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600" />
              </div>
              ) : (
              <div className="overflow-x-auto">
                {/* Show sample cards when there are no donations */}
                {donations.length === 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {sampleDonations.map(s => (
                      <Card key={s._id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-lg font-semibold">Donation {s._id}</div>
                              <div className="text-sm text-muted-foreground">from {s.donorEmail}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold">LKR {s.amount.toLocaleString()}</div>
                              <div className="text-sm text-muted-foreground">{s.status}</div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm">Campaign: {s.campaign?.title}</div>
                          <div className="text-sm text-muted-foreground">{new Date(s.createdAt).toLocaleString()}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDonations;
