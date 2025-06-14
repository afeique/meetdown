
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SocialSection = () => {
  const navigate = useNavigate();

  return (
    <Card className="backdrop-blur-sm bg-white/80 shadow-xl border-0 mb-6">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <User size={20} />
          Social
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <Button
            onClick={() => navigate('/followers')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <User size={16} />
            View My Followers
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialSection;
