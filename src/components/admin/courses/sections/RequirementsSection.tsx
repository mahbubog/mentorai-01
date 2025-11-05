import { ChangeEvent, useCallback } from 'react';
import { Input } from '../../../ui/input';
import { Button } from '../../../ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface RequirementsSectionProps {
  requirements: { id?: string; requirement: string; display_order: number }[];
  onRequirementsChange: (requirements: { id?: string; requirement: string; display_order: number }[]) => void;
}

export function RequirementsSection({ requirements, onRequirementsChange }: RequirementsSectionProps) {
  const addRequirement = useCallback(() => {
    onRequirementsChange([
      ...requirements,
      { requirement: '', display_order: requirements.length },
    ]);
  }, [requirements, onRequirementsChange]);

  const updateRequirement = useCallback((index: number, value: string) => {
    const updatedRequirements = [...requirements];
    updatedRequirements[index] = { ...updatedRequirements[index], requirement: value };
    onRequirementsChange(updatedRequirements);
  }, [requirements, onRequirementsChange]);

  const removeRequirement = useCallback((index: number) => {
    const updatedRequirements = requirements.filter((_, i) => i !== index);
    onRequirementsChange(updatedRequirements.map((req, i) => ({ ...req, display_order: i })));
  }, [requirements, onRequirementsChange]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>

      {requirements.length === 0 && (
        <p className="text-gray-600">No requirements added yet. Click "Add Requirement" to list prerequisites for this course.</p>
      )}

      <div className="space-y-3">
        {requirements.map((req, index) => (
          <div key={req.id || `new-req-${index}`} className="flex items-center space-x-2">
            <Input
              value={req.requirement}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateRequirement(index, e.target.value)}
              placeholder="e.g., Basic knowledge of programming"
              className="flex-1"
              required
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => removeRequirement(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button type="button" onClick={addRequirement} variant="outline" className="mt-4 w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Requirement
      </Button>
    </div>
  );
}