import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminService } from '@/services/admin';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/services/admin';

const AdminUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingMap, setActionLoadingMap] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'campaign-leader' | 'donor'>('all');

  useEffect(() => {
    loadUsers();
  }, [filter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers();
      // Handle different response structures
      const usersData = Array.isArray(response) ? response : (response as any)?.users || [];
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatusChange = async (userId: string, action: 'block' | 'unblock') => {
    try {
      setActionLoadingMap(prev => ({ ...prev, [userId]: true }));
      if (action === 'block') {
        const result = await adminService.blockUser(userId) as any;
        toast({ title: 'User blocked', description: (result && result.message) || 'User was blocked' });
      } else {
        const result = await adminService.unblockUser(userId) as any;
        toast({ title: 'User unblocked', description: (result && result.message) || 'User was unblocked' });
      }
      await loadUsers(); // Refresh the list
    } catch (error: any) {
      console.error(`Failed to ${action} user:`, error);
      toast({ title: 'Action failed', description: error?.error || error?.message || 'Failed to update user status' });
    } finally {
      setActionLoadingMap(prev => ({ ...prev, [userId]: false }));
    }
  };

  const filteredUsers = Array.isArray(users) ? users.filter(user => {
    // Status filter
    if (filter === 'active' && !(user.isActive && !user.isBanned)) return false;
    if (filter === 'blocked' && !(user.isBanned || !user.isActive)) return false;

    // Role filter
    if (roleFilter !== 'all' && user.role !== roleFilter) return false;

    // Search filter (name or email)
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchesName = user.name?.toLowerCase().includes(q);
      const matchesEmail = user.email?.toLowerCase().includes(q);
      if (!matchesName && !matchesEmail) return false;
    }

    return true;
  }) : [];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'campaign-leader': return 'default';
      case 'donor': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusBadgeColor = (user: User) => {
    if (user.isBanned) return 'destructive';
    if (user.isActive) return 'default';
    return 'outline';
  };

  const getUserStatus = (user: User) => {
    if (user.isBanned) return 'blocked';
    if (user.isActive) return 'active';
    return 'inactive';
  };

  if (loading) {
    return <div className="p-6">Loading users...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-1/2">
          <Input
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-1/3">
          <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as any)}>
            <SelectTrigger className="w-full">
              <SelectValue>{roleFilter === 'all' ? 'All roles' : roleFilter}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="campaign-leader">Campaign Leader</SelectItem>
              <SelectItem value="donor">Donor</SelectItem>
            </SelectContent>
          </Select>
        </div>

      </div>

      <br />

      <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
        <TabsList>
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="active">Active Users</TabsTrigger>
          <TabsTrigger value="blocked">Blocked Users</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          <div className="grid gap-4">
            {filteredUsers.map((user) => (
              <Card key={user._id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{user.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                      <Badge variant={getStatusBadgeColor(user)}>
                        {getUserStatus(user)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium">Total Donations</p>
                      <p className="text-2xl font-bold">LKR {user.stats?.totalDonated?.toLocaleString() || 0}</p>
                    </div>
                    <div>
                      {user.role === 'campaign-leader' ? (
                        <>
                          <p className="text-sm font-medium">Campaigns Created</p>
                          <p className="text-2xl font-bold">{user.stats?.campaignsCreated || 0}</p>
                        </>
                      ) : user.role === 'donor' ? (
                        <>
                          <p className="text-sm font-medium">Donor Level</p>
                          <p className="text-2xl font-bold">{user.stats?.donorLevel || 'Supporter'}</p>
                        </>
                      ) : user.role === 'admin' ? (
                        <>
                          <p className="text-sm font-medium">Admin Since</p>
                          <p className="text-2xl font-bold">{new Date(user.createdAt).toLocaleDateString()}</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-medium">Role Info</p>
                          <p className="text-2xl font-bold">{user.stats?.campaignsCreated ?? 0}</p>
                        </>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">Account Created</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Last Login</p>
                      <p className="text-sm text-muted-foreground">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {!user.isBanned && user.isActive ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleUserStatusChange(user._id, 'block')}
                        disabled={!!actionLoadingMap[user._id]}
                        aria-busy={!!actionLoadingMap[user._id]}
                      >
                        {actionLoadingMap[user._id] ? 'Processing…' : 'Block User'}
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleUserStatusChange(user._id, 'unblock')}
                        disabled={!!actionLoadingMap[user._id]}
                        aria-busy={!!actionLoadingMap[user._id]}
                      >
                        {actionLoadingMap[user._id] ? 'Processing…' : 'Unblock User'}
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminUserManagement;