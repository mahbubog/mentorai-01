import { Button } from "@/components/ui/button";
import { GraduationCap, Briefcase } from "lucide-react";

interface ConversationTypeProps {
  type: 'academic' | 'career';
  onTypeChange: (type: 'academic' | 'career') => void;
}

export function ConversationType({ type, onTypeChange }: ConversationTypeProps) {
  return (
    <div className="flex gap-2 p-2">
      <Button
        variant={type === 'academic' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onTypeChange('academic')}
        className="flex-1"
      >
        <GraduationCap className="h-4 w-4 mr-2" />
        Academic
      </Button>
      <Button
        variant={type === 'career' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onTypeChange('career')}
        className="flex-1"
      >
        <Briefcase className="h-4 w-4 mr-2" />
        Career
      </Button>
    </div>
  );
}