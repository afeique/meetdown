
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { X, Plus } from 'lucide-react';

interface ActivityTag {
  id: string;
  name: string;
  category: string | null;
}

interface UserInterest {
  id: string;
  tag_id: string;
  activity_tags: ActivityTag;
}

const InterestTags = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userInterests, setUserInterests] = useState<UserInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const [newInterest, setNewInterest] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserInterests();
    }
  }, [user]);

  const fetchUserInterests = async () => {
    try {
      // Fetch user's current interests
      const { data: interests, error: interestsError } = await supabase
        .from('user_interests')
        .select(`
          id,
          tag_id,
          activity_tags (
            id,
            name,
            category
          )
        `)
        .eq('user_id', user?.id);

      if (interestsError) throw interestsError;

      setUserInterests(interests || []);
    } catch (error: any) {
      toast({
        title: "Error loading interests",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addInterest = async () => {
    if (!user || !newInterest.trim()) return;

    setAdding(true);
    try {
      // First, check if the tag already exists
      let { data: existingTag, error: tagError } = await supabase
        .from('activity_tags')
        .select('id')
        .eq('name', newInterest.trim())
        .single();

      let tagId;

      if (tagError && tagError.code === 'PGRST116') {
        // Tag doesn't exist, create it
        const { data: newTag, error: createTagError } = await supabase
          .from('activity_tags')
          .insert({
            name: newInterest.trim(),
            category: null
          })
          .select('id')
          .single();

        if (createTagError) throw createTagError;
        tagId = newTag.id;
      } else if (tagError) {
        throw tagError;
      } else {
        tagId = existingTag.id;
      }

      // Check if user already has this interest
      const { data: existingInterest } = await supabase
        .from('user_interests')
        .select('id')
        .eq('user_id', user.id)
        .eq('tag_id', tagId)
        .single();

      if (existingInterest) {
        toast({
          title: "Interest already added",
          description: "You already have this interest in your list.",
          variant: "destructive",
        });
        setNewInterest('');
        setAdding(false);
        return;
      }

      // Add the interest to user's profile
      const { error } = await supabase
        .from('user_interests')
        .insert({
          user_id: user.id,
          tag_id: tagId
        });

      if (error) throw error;

      // Refetch data to update the UI
      fetchUserInterests();
      setNewInterest('');
      
      toast({
        title: "Interest added!",
        description: "Successfully added to your interests.",
      });
    } catch (error: any) {
      toast({
        title: "Error adding interest",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  const removeInterest = async (interestId: string) => {
    try {
      const { error } = await supabase
        .from('user_interests')
        .delete()
        .eq('id', interestId);

      if (error) throw error;

      // Refetch data to update the UI
      fetchUserInterests();
      
      toast({
        title: "Interest removed!",
        description: "Successfully removed from your interests.",
      });
    } catch (error: any) {
      toast({
        title: "Error removing interest",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addInterest();
    }
  };

  if (loading) {
    return (
      <Card className="backdrop-blur-sm bg-white/80 shadow-xl border-0">
        <CardContent className="p-6">
          <div className="text-center">Loading interests...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-sm bg-white/80 shadow-xl border-0">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800">
          My Interests
        </CardTitle>
        <p className="text-sm text-gray-600">
          Add activities and things you're interested in to help others find you
        </p>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Current Interests */}
        {userInterests.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium text-gray-700">Your Interests</h3>
            <div className="flex flex-wrap gap-2">
              {userInterests.map((interest) => (
                <Badge
                  key={interest.id}
                  variant="default"
                  className="bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center gap-1"
                >
                  {interest.activity_tags.name}
                  <button
                    onClick={() => removeInterest(interest.id)}
                    className="ml-1 hover:bg-blue-300 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {userInterests.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            No interests added yet. Add some interests to help others find you!
          </div>
        )}

        {/* Add New Interest */}
        <div className="space-y-2">
          <h3 className="font-medium text-gray-700">Add New Interest</h3>
          <div className="flex gap-2">
            <Input
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter an interest (e.g., hiking, photography, cooking)"
              className="flex-1"
            />
            <Button
              onClick={addInterest}
              disabled={adding || !newInterest.trim()}
              className="flex items-center gap-1"
            >
              <Plus size={16} />
              {adding ? 'Adding...' : 'Add'}
            </Button>
          </div>
        </div>
        
      </CardContent>
    </Card>
  );
};

export default InterestTags;
