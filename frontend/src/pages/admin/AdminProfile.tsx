import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services';
import { convertApiUser } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import AvatarUploader from '@/components/AvatarUploader';

const AdminProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [uploaderOpen, setUploaderOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    avatar: ''
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Prefer fresh data from server
        const res = await authService.getCurrentUser();
        const u: any = (res.data) ? res.data : user;
        // If we received fresh data, update the global auth context so other UI (navbar) matches
        if (res.data) {
          try {
            // Avoid unnecessary updates that may retrigger effects: only update if key fields changed
            const fetched = res.data as any;
            const contextId = (user as any)?.id;
            const contextAvatar = (user as any)?.avatar;
            const contextUpdated = (user as any)?.updatedAt;

            const shouldUpdateContext = !contextId || fetched._id !== contextId || fetched.avatar !== contextAvatar || fetched.updatedAt !== contextUpdated;

            if (shouldUpdateContext) {
              updateUser(convertApiUser(res.data));
            }
          } catch (e) {
            // swallow
          }
        }
        if (!u) {
          setError('No user data available');
          return;
        }

        setProfile({
          firstName: (u.name || '').split(' ')[0] || '',
          lastName: (u.name || '').split(' ').slice(1).join(' ') || '',
          email: u.email || '',
          phone: u.profile?.phone || '',
          bio: u.profile?.bio || '',
          avatar: u.avatar || ''
        });
      } catch (err) {
        console.error('Failed to load admin profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    // Run once on mount to fetch fresh profile data. Do not depend on `user` here
    // to avoid an update loop where updating the auth context triggers another fetch.
    load();
  }, []);

  // Keep local profile in sync if the global user updates (so avatar and dates refresh immediately)
  useEffect(() => {
    if (!user) return;
    setProfile(prev => ({
      ...prev,
      firstName: (user.name || '').split(' ')[0] || prev.firstName,
      lastName: (user.name || '').split(' ').slice(1).join(' ') || prev.lastName,
      email: user.email || prev.email,
      avatar: (user as any).avatar || prev.avatar,
      phone: user.profile?.phone || prev.phone,
      bio: user.profile?.bio || prev.bio,
    }));
  }, [user]);

  // Avatar upload handled by AvatarUploader modal

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updateData: any = {
        name: `${profile.firstName} ${profile.lastName}`.trim(),
        email: profile.email,
        profile: {
          bio: profile.bio,
          phone: profile.phone
        }
      };

      const res = await authService.updateProfile(updateData, profile.email);
      if (res.data) {
        updateUser(res.data);
        toast({ title: 'Profile updated' });
        setIsEditing(false);
      } else {
        toast({ title: 'Update failed', description: res.error || 'Failed to update profile' });
      }
    } catch (err) {
      console.error('Failed to save admin profile', err);
      toast({ title: 'Save failed', description: (err as any)?.message || 'Failed to save profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading profile...</div>;
  if (error) return <div className="p-6">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Profile</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  {(() => {
                    const ctxUser: any = user as any;
                    // Prefer base64 avatarData if available (this is what Navbar uses)
                    if (ctxUser?.avatarData) {
                      return <AvatarImage src={ctxUser.avatarData} alt={profile.firstName || 'Admin'} />;
                    }

                    const maybeUrl = profile.avatar || ctxUser?.avatar;
                    if (!maybeUrl) return null;

                    // If it's a relative path (starts with '/'), prefix with API base (strip possible '/api')
                    let src = maybeUrl as string;
                    if (src.startsWith('/')) {
                      const apiBaseRaw = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
                      const apiBase = apiBaseRaw.replace(/\/api\/?$/, '');
                      src = `${apiBase}${src}`;
                    }

                    return <AvatarImage src={src} alt={profile.firstName || 'Admin'} />;
                  })()}
                  <AvatarFallback>{(profile.firstName || 'A').charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">{`${profile.firstName} ${profile.lastName}`}</CardTitle>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">admin</Badge>
              <Badge variant={(user as any).isActive ? 'default' : 'outline'}>{(user as any).isActive ? 'active' : 'inactive'}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>First name</Label>
                  <Input value={profile.firstName} onChange={(e) => setProfile(p => ({ ...p, firstName: e.target.value }))} />
                </div>
                <div>
                  <Label>Last name</Label>
                  <Input value={profile.lastName} onChange={(e) => setProfile(p => ({ ...p, lastName: e.target.value }))} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={profile.email} onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={profile.phone} onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <Label>Bio</Label>
                  <Textarea value={profile.bio} onChange={(e) => setProfile(p => ({ ...p, bio: e.target.value }))} />
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button onClick={() => setUploaderOpen(true)} disabled={uploadingAvatar}>{uploadingAvatar ? 'Uploading…' : 'Change Avatar'}</Button>
                <Button variant="outline" onClick={() => { setIsEditing(!isEditing); }}>{isEditing ? 'Cancel' : 'Edit'}</Button>
                {isEditing && <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Button>}
              </div>
              <AvatarUploader isOpen={uploaderOpen} onClose={() => setUploaderOpen(false)} onUploaded={(url) => {
                setProfile(p => ({ ...p, avatar: url }));
          authService.getCurrentUser().then(r => { if (r.data) updateUser(convertApiUser(r.data)); }).catch(()=>{});
              }} />
            </div>

            <div>
              <p className="text-sm font-medium">Account Created</p>
              <p className="text-sm text-muted-foreground">{new Date((user as any).createdAt || '').toLocaleDateString()}</p>
              <Separator className="my-4" />
              <p className="text-sm font-medium">Last Login</p>
              <p className="text-sm text-muted-foreground">{(user as any).lastLogin ? new Date((user as any).lastLogin).toLocaleDateString() : 'Never'}</p>

              <Separator className="my-4" />
              <p className="text-sm font-medium">Notification Preferences</p>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">System Alerts</p>
                    <p className="text-xs text-muted-foreground">Receive important system and security updates</p>
                  </div>
                  <input type="checkbox" checked={true} readOnly />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Admin Digest</p>
                    <p className="text-xs text-muted-foreground">Weekly summary of platform activity</p>
                  </div>
                  <input type="checkbox" checked={true} readOnly />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProfile;
