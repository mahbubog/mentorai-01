import { ChangeEvent, useCallback } from 'react';
import { Input } from '../../../ui/input';
import { Button } from '../../../ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { CourseFormData } from '../../../../pages/admin/AdminCourseFormPage'; // Import CourseFormData

interface LearningOutcomesSectionProps {
  learning_outcomes: { id?: string; outcome: string; display_order: number | null }[];
  onLearningOutcomesChange: (learning_outcomes: { id?: string; outcome: string; display_order: number | null }[]) => void;
}

export function LearningOutcomesSection({ learning_outcomes, onLearningOutcomesChange }: LearningOutcomesSectionProps) {
  const addOutcome = useCallback(() => {
    onLearningOutcomesChange([
      ...learning_outcomes,
      { outcome: '', display_order: learning_outcomes.length },
    ]);
  }, [learning_outcomes, onLearningOutcomesChange]);

  const updateOutcome = useCallback((index: number, value: string) => {
    const updatedOutcomes = [...learning_outcomes];
    updatedOutcomes[index] = { ...updatedOutcomes[index], outcome: value };
    onLearningOutcomesChange(updatedOutcomes);
  }, [learning_outcomes, onLearningOutcomesChange]);

  const removeOutcome = useCallback((index: number) => {
    const updatedOutcomes = learning_outcomes.filter((_, i) => i !== index);
    onLearningOutcomesChange(updatedOutcomes.map((out, i) => ({ ...out, display_order: i })));
  }, [learning_outcomes, onLearningOutcomesChange]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">What You'll Learn</h2>

      {learning_outcomes.length === 0 && (
        <p className="text-gray-600">No learning outcomes added yet. Click "Add Outcome" to list what students will achieve.</p>
      )}

      <div className="space-y-3">
        {learning_outcomes.map((out, index) => (
          <div key={out.id || `new-out-${index}`} className="flex items-center space-x-2">
            <Input
              value={out.outcome}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateOutcome(index, e.target.value)}
              placeholder="e.g., Build a complete web application"
              className="flex-1"
              required
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => removeOutcome(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button type="button" onClick={addOutcome} variant="outline" className="mt-4 w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Learning Outcome
      </Button>
    </div>
  );
}