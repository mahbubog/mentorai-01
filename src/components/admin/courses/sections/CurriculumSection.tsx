import { useCallback } from 'react';
import { Button } from '../../../ui/button';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { SectionFormData } from '../../../pages/admin/AdminCourseFormPage';
import { CourseSectionItem } from '../CourseSectionItem';

interface CurriculumSectionProps {
  sections: SectionFormData[];
  onSectionsChange: (sections: SectionFormData[]) => void;
}

export function CurriculumSection({ sections, onSectionsChange }: CurriculumSectionProps) {
  const addSection = useCallback(() => {
    onSectionsChange([
      ...sections,
      {
        title: '',
        description: '',
        display_order: sections.length,
        lessons: [],
      },
    ]);
  }, [sections, onSectionsChange]);

  const updateSection = useCallback((index: number, newSection: SectionFormData) => {
    const updatedSections = [...sections];
    updatedSections[index] = newSection;
    onSectionsChange(updatedSections);
  }, [sections, onSectionsChange]);

  const removeSection = useCallback((index: number) => {
    const updatedSections = sections.filter((_, i) => i !== index);
    onSectionsChange(updatedSections.map((s, i) => ({ ...s, display_order: i })));
  }, [sections, onSectionsChange]);

  const moveSection = useCallback((index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < sections.length) {
      const updatedSections = [...sections];
      const [movedSection] = updatedSections.splice(index, 1);
      updatedSections.splice(newIndex, 0, movedSection);
      onSectionsChange(updatedSections.map((s, i) => ({ ...s, display_order: i })));
    }
  }, [sections, onSectionsChange]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Curriculum (Recorded Courses)</h2>

      {sections.length === 0 && (
        <p className="text-gray-600">No sections added yet. Click "Add Section" to start building your course curriculum.</p>
      )}

      <div className="space-y-8">
        {sections.map((section, index) => (
          <div key={section.id || `new-section-${index}`} className="border p-4 rounded-lg bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Section {index + 1}</h3>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => moveSection(index, 'up')}
                  disabled={index === 0}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => moveSection(index, 'down')}
                  disabled={index === sections.length - 1}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeSection(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CourseSectionItem
              section={section}
              onSectionChange={(newSection) => updateSection(index, newSection)}
            />
          </div>
        ))}
      </div>

      <Button type="button" onClick={addSection} className="mt-6">
        <Plus className="h-5 w-5 mr-2" />
        Add Section
      </Button>
    </div>
  );
}