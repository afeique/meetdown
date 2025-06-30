
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus } from 'lucide-react';
import { useConversations } from '@/hooks/useMessages';
import ConversationList from '@/components/messaging/ConversationList';
import ChatInterface from '@/components/messaging/ChatInterface';
import NewConversationDialog from '@/components/messaging/NewConversationDialog';
import TopBar from '@/components/TopBar';

const Messages = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const { data: conversations, isLoading } = useConversations();

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-8rem)]">
          {/* Conversation List */}
          <div className="lg:w-1/3">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Messages
                </CardTitle>
                <Button
                  size="sm"
                  onClick={() => setShowNewConversation(true)}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  New
                </Button>
              </CardHeader>
              <CardContent className="h-[calc(100%-5rem)] overflow-hidden">
                <ConversationList
                  conversations={conversations || []}
                  selectedConversationId={selectedConversationId}
                  onSelectConversation={setSelectedConversationId}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:w-2/3">
            <Card className="h-full">
              <CardContent className="h-full p-0">
                {selectedConversationId ? (
                  <ChatInterface conversationId={selectedConversationId} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select a conversation to start messaging</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <NewConversationDialog
        open={showNewConversation}
        onOpenChange={setShowNewConversation}
        onConversationCreated={(conversationId) => {
          setSelectedConversationId(conversationId);
          setShowNewConversation(false);
        }}
      />
    </div>
  );
};

export default Messages;
