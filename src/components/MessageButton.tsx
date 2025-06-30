
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MessageButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate('/messages')}
      className="flex items-center gap-2"
    >
      <MessageSquare className="h-4 w-4" />
      Messages
    </Button>
  );
};

export default MessageButton;
