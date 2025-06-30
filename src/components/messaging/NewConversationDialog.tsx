
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateConversation } from '@/hooks/useMessages';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationCreated: (conversationId: string) => void;
}

const NewConversationDialog = ({ open, onOpenChange, onConversationCreated }: NewConversationDialogProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const createConversation = useCreateConversation();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .neq('id', user?.id)
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: !!searchTerm.trim() && open,
  });

  const handleCreateConversation = async (otherUserId: string) => {
    try {
      const conversation = await createConversation.mutateAsync(otherUserId);
      onConversationCreated(conversation.id);
      setSearchTerm('');
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start New Conversation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="search">Search for users</Label>
            <Input
              id="search"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {searchTerm.trim() && (
            <div className="max-h-60">
              <ScrollArea className="h-full">
                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : users && users.length > 0 ? (
                  <div className="space-y-2">
                    {users.map((profile) => {
                      const displayName = profile.first_name 
                        ? `${profile.first_name} ${profile.last_name || ''}`.trim()
                        : profile.email || 'Unknown User';

                      return (
                        <div
                          key={profile.id}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {displayName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{displayName}</p>
                              {profile.email && (
                                <p className="text-xs text-gray-500">{profile.email}</p>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleCreateConversation(profile.id)}
                            disabled={createConversation.isPending}
                          >
                            Chat
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">No users found</p>
                )}
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewConversationDialog;
