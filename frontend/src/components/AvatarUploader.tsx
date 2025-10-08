import React, { useRef, useState } from 'react';
import Modal from './ui/modal';
import { Button } from '@/components/ui/button';
import { uploadService } from '@/services/upload';
import { useToast } from '@/hooks/use-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUploaded: (url: string) => void;
}

const AvatarUploader: React.FC<Props> = ({ isOpen, onClose, onUploaded }) => {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleChoose = () => fileRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = uploadService.validateImageFile(file);
    if (!validation.valid) {
      toast({ title: 'Invalid file', description: validation.error, variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Use uploadService generic endpoint for avatar (POST /uploads/avatar)
      const result = await uploadService.uploadAvatar(file);
      if (result.error) {
        toast({ title: 'Upload failed', description: result.error, variant: 'destructive' });
        return;
      }

      if (result.data && result.data.url) {
        toast({ title: 'Avatar uploaded' });
        onUploaded(result.data.url);
        onClose();
      } else {
        toast({ title: 'Upload failed', description: 'No URL returned', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Upload error', description: 'Failed to upload avatar', variant: 'destructive' });
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Avatar">
      <div className="flex flex-col gap-4">
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        <div className="text-sm text-muted-foreground">Choose an image under 5MB. JPG, PNG, WebP supported.</div>
        <div className="flex gap-2">
          <Button onClick={handleChoose} disabled={loading}>{loading ? 'Uploading…' : 'Choose Image'}</Button>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </Modal>
  );
};

export default AvatarUploader;
