import { Download, FileText, Link, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useEffect, useState } from 'react';

interface LessonResourcesProps {
  lessonId: string;
}

interface Resource {
  id: string;
  title: string;
  file_url: string;
  file_type: string | null;
}

export function LessonResources({ lessonId }: LessonResourcesProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResources();
  }, [lessonId]);

  const loadResources = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lesson_resources')
        .select('*')
        .eq('lesson_id', lessonId);

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
        <AlertCircle className="h-8 w-8 mx-auto mb-3 text-gray-400" />
        <p>No downloadable resources available for this lesson.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {resources.map((resource) => (
        <a
          key={resource.id}
          href={resource.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 transition"
        >
          <div className="flex items-center space-x-3">
            {resource.file_type?.toLowerCase().includes('pdf') ? (
              <FileText className="h-6 w-6 text-red-600" />
            ) : (
              <Link className="h-6 w-6 text-blue-600" />
            )}
            <div>
              <p className="font-medium text-gray-900">{resource.title}</p>
              <p className="text-sm text-gray-500">{resource.file_type || 'File'}</p>
            </div>
          </div>
          <Download className="h-5 w-5 text-blue-600 flex-shrink-0" />
        </a>
      ))}
    </div>
  );
}