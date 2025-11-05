import { useCallback } from 'react';
import { Label } from '../../../ui/label';
import { Checkbox } from '../../../ui/checkbox';

interface CourseIncludesSectionProps {
  includes_certificate: boolean;
  includes_lifetime_access: boolean;
  includes_resources: boolean;
  includes_mobile_access: boolean;
  includes_qa_support: boolean;
  onFieldChange: (field: keyof any, value: any) => void;
}

export function CourseIncludesSection({
  includes_certificate,
  includes_lifetime_access,
  includes_resources,
  includes_mobile_access,
  includes_qa_support,
  onFieldChange,
}: CourseIncludesSectionProps) {
  const handleCheckboxChange = useCallback((field: keyof CourseIncludesSectionProps, checked: boolean) => {
    onFieldChange(field, checked);
  }, [onFieldChange]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">This Course Includes</h2>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="includes_certificate"
            checked={includes_certificate}
            onCheckedChange={(checked: boolean) => handleCheckboxChange('includes_certificate', checked)}
          />
          <Label htmlFor="includes_certificate">Certificate of Completion</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="includes_lifetime_access"
            checked={includes_lifetime_access}
            onCheckedChange={(checked: boolean) => handleCheckboxChange('includes_lifetime_access', checked)}
          />
          <Label htmlFor="includes_lifetime_access">Lifetime Access</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="includes_resources"
            checked={includes_resources}
            onCheckedChange={(checked: boolean) => handleCheckboxChange('includes_resources', checked)}
          />
          <Label htmlFor="includes_resources">Downloadable Resources</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="includes_mobile_access"
            checked={includes_mobile_access}
            onCheckedChange={(checked: boolean) => handleCheckboxChange('includes_mobile_access', checked)}
          />
          <Label htmlFor="includes_mobile_access">Mobile Access</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="includes_qa_support"
            checked={includes_qa_support}
            onCheckedChange={(checked: boolean) => handleCheckboxChange('includes_qa_support', checked)}
          />
          <Label htmlFor="includes_qa_support">Q&A Support</Label>
        </div>
      </div>
    </div>
  );
}