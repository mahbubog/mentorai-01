import { useState, useEffect, useCallback } from 'react';
import { CourseFormData, SectionFormData } from '../../../pages/admin/AdminCourseFormPage';
import { BasicInfoSection } from './sections/BasicInfoSection';
import { CourseDetailsSection } from './sections/CourseDetailsSection';
import { LiveCourseDetailsSection } from './sections/LiveCourseDetailsSection';
import { CurriculumSection } from './sections/CurriculumSection';
import { InstructorSection } from './sections/InstructorSection';
import { CourseIncludesSection } from './sections/CourseIncludesSection';
import { RequirementsSection } from './sections/RequirementsSection';
import { LearningOutcomesSection } from './sections/LearningOutcomesSection';
import { SeoSection } from './sections/SeoSection';
import { PublishingOptionsSection } from './sections/PublishingOptionsSection';
// Removed unused import: import { CourseRow } from '../../../lib/database.types';

interface CourseFormProps {
  initialData: CourseFormData;
  onSave: (formData: CourseFormData, publish: boolean) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function CourseForm({ initialData, onSave, onCancel, isSaving }: CourseFormProps) {
  const [formData, setFormData] = useState<CourseFormData>(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleFieldChange = useCallback((field: keyof CourseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSectionChange = useCallback((sections: SectionFormData[]) => {
    setFormData(prev => ({ ...prev, sections }));
  }, []);

  const handleRequirementsChange = useCallback((requirements: { id?: string; requirement: string; display_order: number | null }[]) => {
    setFormData(prev => ({ ...prev, requirements }));
  }, []);

  const handleLearningOutcomesChange = useCallback((learning_outcomes: { id?: string; outcome: string; display_order: number | null }[]) => {
    setFormData(prev => ({ ...prev, learning_outcomes }));
  }, []);

  const handleSave = (publish: boolean) => {
    onSave(formData, publish);
  };

  return (
    <div className="space-y-8">
      <BasicInfoSection
        title={formData.title}
        slug={formData.slug}
        short_description={formData.short_description}
        full_description={formData.full_description}
        thumbnail={formData.thumbnail}
        preview_video={formData.preview_video}
        onFieldChange={handleFieldChange}
      />

      <CourseDetailsSection
        course_type={formData.course_type}
        category_ids={formData.category_ids}
        difficulty_level={formData.difficulty_level}
        language={formData.language}
        price={formData.price}
        discount_price={formData.discount_price}
        duration={formData.duration}
        onFieldChange={handleFieldChange}
      />

      {formData.course_type === 'live' && (
        <LiveCourseDetailsSection
          start_date={formData.start_date}
          end_date={formData.end_date}
          meeting_link={formData.meeting_link}
          max_students={formData.max_students}
          onFieldChange={handleFieldChange}
        />
      )}

      {formData.course_type === 'recorded' && (
        <CurriculumSection
          sections={formData.sections}
          onSectionsChange={handleSectionChange}
        />
      )}

      <InstructorSection
        instructor_id={formData.instructor_id}
        instructor_name={formData.instructor_name}
        instructor_bio={formData.instructor_bio}
        instructor_credentials={formData.instructor_credentials}
        onFieldChange={handleFieldChange}
      />

      <CourseIncludesSection
        includes_certificate={formData.includes_certificate}
        includes_lifetime_access={formData.includes_lifetime_access}
        includes_resources={formData.includes_resources}
        includes_mobile_access={formData.includes_mobile_access}
        includes_qa_support={formData.includes_qa_support}
        onFieldChange={handleFieldChange}
      />

      <RequirementsSection
        requirements={formData.requirements}
        onRequirementsChange={handleRequirementsChange}
      />

      <LearningOutcomesSection
        learning_outcomes={formData.learning_outcomes}
        onLearningOutcomesChange={handleLearningOutcomesChange}
      />

      <SeoSection
        meta_title={formData.meta_title || ''}
        meta_description={formData.meta_description || ''}
        onFieldChange={handleFieldChange}
      />

      <PublishingOptionsSection
        status={formData.status}
        is_featured={formData.is_featured}
        onFieldChange={handleFieldChange}
        onSave={() => handleSave(false)}
        onPublish={() => handleSave(true)}
        onCancel={onCancel}
        isSaving={isSaving}
      />
    </div>
  );
}