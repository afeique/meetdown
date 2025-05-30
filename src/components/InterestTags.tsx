
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  const [availableTags, setAvailableTags] = useState<ActivityTag[]>([]);
  const [userInterests, setUserInterests] = useState<UserInterest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch all available tags
      const { data: tags, error: tagsError } = await supabase
        .from('activity_tags')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (tagsError) throw tagsError;

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

      setAvailableTags(tags || []);
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

  const addInterest = async (tagId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_interests')
        .insert({
          user_id: user.id,
          tag_id: tagId
        });

      if (error) throw error;

      // Refetch data to update the UI
      fetchData();
      
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
      fetchData();
      
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

  const isInterestSelected = (tagId: string) => {
    return userInterests.some(interest => interest.tag_id === tagId);
  };

  const groupTagsByCategory = () => {
    const grouped: { [key: string]: ActivityTag[] } = {};
    availableTags.forEach(tag => {
      const category = tag.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(tag);
    });
    return grouped;
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

  const groupedTags = groupTagsByCategory();

  return (
    <Card className="backdrop-blur-sm bg-white/80 shadow-xl border-0">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800">
          My Interests
        </CardTitle>
        <p className="text-sm text-gray-600">
          Select activities and things you're interested in to help others find you
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selected Interests */}
        {userInterests.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium text-gray-700">Your Selected Interests</h3>
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

        {/* Available Tags by Category */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-700">Available Interests</h3>
          {Object.entries(groupedTags).map(([category, tags]) => (
            <div key={category} className="space-y-2">
              <h4 className="text-sm font-medium text-gray-600">{category}</h4>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const isSelected = isInterestSelected(tag.id);
                  return (
                    <Button
                      key={tag.id}
                      variant={isSelected ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => addInterest(tag.id)}
                      disabled={isSelected}
                      className={`flex items-center gap-1 ${
                        isSelected ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Plus size={12} />
                      {tag.name}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default InterestTags;
