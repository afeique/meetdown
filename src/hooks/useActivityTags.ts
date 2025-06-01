
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Tag {
  id: string;
  name: string;
  category: string;
}

export const useActivityTags = (isExpanded: boolean) => {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isExpanded) {
      fetchTags();
    }
  }, [isExpanded]);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('activity_tags')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setAvailableTags(data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  };

  return { availableTags, loading };
};
