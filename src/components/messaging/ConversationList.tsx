
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, Avatar as AvatarComponent, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Conversation } from '@/hooks/useMessages';
import { cn } from '@/lib/utils';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  isLoading: boolean;
}

const ConversationList = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  isLoading
}: ConversationListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center space-x-3 p-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-8">
        <p>No conversations yet</p>
        <p className="text-sm">Start a new conversation to begin messaging</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1">
        {conversations.map((conversation) => {
          const otherParticipant = conversation.participants[0];
          const participantName = otherParticipant?.profiles?.first_name 
            ? `${otherParticipant.profiles.first_name} ${otherParticipant.profiles.last_name || ''}`.trim()
            : 'Unknown User';

          return (
            <div
              key={conversation.id}
              className={cn(
                "flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50",
                selectedConversationId === conversation.id && "bg-blue-50 border border-blue-200"
              )}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <AvatarComponent className="h-10 w-10">
                <AvatarFallback>
                  {participantName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </AvatarComponent>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm truncate">{participantName}</p>
                  {conversation.latest_message && (
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(conversation.latest_message.created_at), { addSuffix: true })}
                    </span>
                  )}
                </div>
                {conversation.latest_message && (
                  <p className="text-sm text-gray-600 truncate">
                    {conversation.latest_message.content}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default ConversationList;
