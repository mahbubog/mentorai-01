import { Card } from "@/components/ui/card";

export const ChatPreview = () => {
  return (
    <Card className="mt-12 max-w-2xl mx-auto bg-white/80 backdrop-blur-sm shadow-lg">
      <div className="p-4">
        <div className="space-y-4 p-4">
          <div className="flex items-start gap-3 justify-start">
            <div className="bg-gray-100 rounded-lg p-3 text-sm max-w-xs">
              <p>How do I prepare for a software engineering interview?</p>
            </div>
          </div>
          <div className="flex items-start gap-3 justify-end">
            <div className="bg-primary text-primary-foreground rounded-lg p-3 text-sm max-w-xs">
              <p>
                Great question! Here's a comprehensive guide to help you
                prepare...
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};