import { ChangeEvent, useCallback, useState, useEffect } from 'react';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Upload, XCircle } from 'lucide-react'; // Removed unused Image, Video
import { slugify } from '../../../../utils/slugify';
import { Button } from '../../../ui/button';
import { CourseFormData } from '../../../../pages/admin/AdminCourseFormPage'; // Import CourseFormData

interface BasicInfoSectionProps {
  title: string;
  slug: string;
  short_description: string | null; // Allow null
  full_description: string | null; // Allow null
  thumbnail: string | null; // Allow null
  preview_video: string | null; // Allow null
  onFieldChange: (field: keyof CourseFormData, value: any) => void; // Changed field type to keyof CourseFormData
}

export function BasicInfoSection({
  title,
  slug,
  short_description,
  full_description,
  thumbnail,
  preview_video,
  onFieldChange,
}: BasicInfoSectionProps) {
  const [internalSlug, setInternalSlug] = useState(slug);
  const [isSlugEditable, setIsSlugEditable] = useState(false);

  useEffect(() => {
    if (!isSlugEditable && title) {
      const newSlug = slugify(title);
      setInternalSlug(newSlug);
      onFieldChange('slug', newSlug);
    }
  }, [title, isSlugEditable, onFieldChange]);

  useEffect(() => {
    setInternalSlug(slug);
  }, [slug]);

  const handleTitleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    onFieldChange('title', e.target.value);
  }, [onFieldChange]);

  const handleSlugChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInternalSlug(e.target.value);
    onFieldChange('slug', e.target.value);
  }, [onFieldChange]);

  const handleShortDescriptionChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    onFieldChange('short_description', e.target.value);
  }, [onFieldChange]);

  const handleFullDescriptionChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    onFieldChange('full_description', e.target.value);
  }, [onFieldChange]);

  const handleThumbnailUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFieldChange('thumbnail_file', file);
      onFieldChange('thumbnail', URL.createObjectURL(file)); // For immediate preview
    }
  }, [onFieldChange]);

  const handlePreviewVideoUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFieldChange('preview_video_file', file);
      onFieldChange('preview_video', URL.createObjectURL(file)); // For immediate preview
    }
  }, [onFieldChange]);

  const handlePreviewVideoUrlChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    onFieldChange('preview_video', e.target.value);
    onFieldChange('preview_video_file', undefined); // Clear file if URL is provided
  }, [onFieldChange]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Basic Information</h2>

      <div>
        <Label htmlFor="title">Course Title <span className="text-red-500">*</span></Label>
        <Input
          id="title"
          value={title}
          onChange={handleTitleChange}
          placeholder="e.g., Master React Development"
          required
        />
      </div>

      <div>
        <Label htmlFor="slug">Course Slug <span className="text-red-500">*</span></Label>
        <div className="flex items-center space-x-2">
          <Input
            id="slug"
            value={internalSlug}
            onChange={handleSlugChange}
            disabled={!isSlugEditable}
            placeholder="auto-generated-slug"
            required
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsSlugEditable(!isSlugEditable)}
          >
            {isSlugEditable ? 'Lock' : 'Edit'}
          </Button>
        </div>
      </div>

      <div>
        <Label htmlFor="short_description">Short Description <span className="text-red-500">*</span></Label>
        <Textarea
          id="short_description"
          value={short_description || ''}
          onChange={handleShortDescriptionChange}
          placeholder="A brief overview of the course (max 160 characters)"
          maxLength={160}
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          {short_description?.length || 0} / 160 characters
        </p>
      </div>

      <div>
        <Label htmlFor="full_description">Full Description</Label>
        <Textarea
          id="full_description"
          value={full_description || ''}
          onChange={handleFullDescriptionChange}
          placeholder="Provide a detailed description of the course content, target audience, etc."
          rows={8}
        />
        <p className="text-sm text-gray-500 mt-1">
          (Note: A rich text editor will be integrated here in a future update.)
        </p>
      </div>

      <div>
        <Label htmlFor="thumbnail">Course Thumbnail <span className="text-red-500">*</span></Label>
        <Input
          id="thumbnail"
          type="file"
          accept="image/*"
          onChange={handleThumbnailUpload}
          className="hidden"
        />
        <Label
          htmlFor="thumbnail"
          className="flex items-center justify-center w-full p-4 border-2 border-dashed rounded-md cursor-pointer hover:border-blue-500 transition-colors"
        >
          <Upload className="h-5 w-5 mr-2" />
          {thumbnail ? 'Change Thumbnail' : 'Upload Thumbnail'}
        </Label>
        {thumbnail && (
          <div className="mt-2 relative w-32 h-20 rounded-md overflow-hidden">
            <img src={thumbnail} alt="Thumbnail Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onFieldChange('thumbnail', '')}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="preview_video">Course Preview Video (URL or Upload)</Label>
        <Input
          id="preview_video_url"
          type="text"
          value={preview_video?.startsWith('blob:') ? '' : preview_video || ''}
          onChange={handlePreviewVideoUrlChange}
          placeholder="Enter YouTube/Vimeo URL or upload a file"
          className="mb-2"
        />
        <Input
          id="preview_video_file"
          type="file"
          accept="video/*"
          onChange={handlePreviewVideoUpload}
          className="hidden"
        />
        <Label
          htmlFor="preview_video_file"
          className="flex items-center justify-center w-full p-4 border-2 border-dashed rounded-md cursor-pointer hover:border-blue-500 transition-colors"
        >
          <Upload className="h-5 w-5 mr-2" />
          {preview_video && !preview_video.startsWith('http') ? 'Change Video File' : 'Upload Video File'}
        </Label>
        {preview_video && (
          <div className="mt-2 relative w-full aspect-video rounded-md overflow-hidden">
            {preview_video.startsWith('http') ? (
              <iframe
                src={preview_video.includes('youtube.com') ? `https://www.youtube.com/embed/${preview_video.split('v=')[1]?.split('&')[0]}` : preview_video}
                title="Preview Video"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            ) : (
              <video src={preview_video} controls className="w-full h-full object-cover" />
            )}
            <button
              type="button"
              onClick={() => onFieldChange('preview_video', '')}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}