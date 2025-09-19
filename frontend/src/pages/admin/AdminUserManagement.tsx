import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminService } from '@/services/admin';
import type { User } from '@/services/admin';

const AdminUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'blocked'>('all');

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
      if (action === 'block') {
        await adminService.blockUser(userId);
      } else {
        await adminService.unblockUser(userId);
      }
      loadUsers(); // Refresh the list
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
    }
  };

  const filteredUsers = Array.isArray(users) ? users.filter(user => {
    if (filter === 'all') return true;
    if (filter === 'active') return user.isActive && !user.isBanned;
    if (filter === 'blocked') return user.isBanned || !user.isActive;
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
                      <p className="text-2xl font-bold">${user.stats?.totalDonated?.toLocaleString() || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Campaigns Created</p>
                      <p className="text-2xl font-bold">{user.stats?.campaignsCreated || 0}</p>
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
                      >
                        Block User
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleUserStatusChange(user._id, 'unblock')}
                      >
                        Unblock User
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