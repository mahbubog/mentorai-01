import { GraduationCap } from "lucide-react";

const SignUpBrandingPanel = () => {
  return (
    <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400 text-primary-foreground p-12">
      <div className="max-w-sm text-center">
        <GraduationCap className="h-20 w-20 mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-4">Start Your Journey</h1>
        <p className="text-lg opacity-90">
          Join thousands of students and professionals who are advancing their
          careers with AI guidance.
        </p>
      </div>
    </div>
  );
};

export default SignUpBrandingPanel;