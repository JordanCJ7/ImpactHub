import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Search } from 'lucide-react';
import { campaignService, type DraftCampaignSummary } from '@/services/campaigns';
import { useToast } from '@/hooks/use-toast';

const LeaderDrafts: React.FC = () => {
  const [drafts, setDrafts] = useState<DraftCampaignSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>('updated');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await campaignService.getMyDrafts();
        if (!(res as any).error) {
          setDrafts((res as any).data?.drafts || []);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const { toast } = useToast();

  const reload = async () => {
    try {
      setLoading(true);
      const res = await campaignService.getMyDrafts();
      if (!(res as any).error) {
        setDrafts((res as any).data?.drafts || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm('Delete this draft? This action cannot be undone.');
    if (!ok) return;
    try {
      setLoading(true);
      const res = await campaignService.deleteDraft(id);
      if ((res as any)?.error) {
        throw new Error((res as any).error || 'Failed to delete draft');
      }
      toast({ title: 'Deleted', description: 'Draft removed successfully.' });
      await reload();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete draft.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filtered = drafts
    .filter((d) => {
      const t = d.title || 'Untitled Draft';
      return t.toLowerCase().includes(query.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (sortBy === 'created') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      // default updated
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-gray-700" />
          <h1 className="text-2xl font-bold">My Draft Campaigns</h1>
        </div>
        <Button asChild>
          <Link to="/leader/create">Create New</Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search drafts by title..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="w-full sm:w-60">
            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated">Updated (newest)</SelectItem>
                <SelectItem value="created">Created (newest)</SelectItem>
                <SelectItem value="title">Title (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Drafts ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-gray-500">Loading drafts...</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-gray-500">No drafts found.</div>
          ) : (
            <div className="divide-y">
              {filtered.map((d) => {
                const updated = d.updatedAt ? new Date(d.updatedAt) : (d.createdAt ? new Date(d.createdAt) : null);
                const created = d.createdAt ? new Date(d.createdAt) : null;
                const updatedLabel = updated && !isNaN(updated.getTime()) ? updated.toLocaleString() : 'N/A';
                const createdLabel = created && !isNaN(created.getTime()) ? created.toLocaleDateString() : 'N/A';
                return (
                  <div key={d._id} className="flex items-center justify-between py-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">
                        {d.title || 'Untitled Draft'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Updated {updatedLabel} • Created {createdLabel}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {d.category && (
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded">{d.category}</span>
                      )}
                      {typeof d.goal === 'number' && !isNaN(d.goal) && (
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded">Goal: {d.goal}</span>
                      )}
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/leader/create?draft=${d._id}`}>Continue</Link>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(d._id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderDrafts;
