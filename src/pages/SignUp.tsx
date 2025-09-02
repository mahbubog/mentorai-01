import { useState } from "react";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { VerificationForm } from "@/components/auth/VerificationForm";
import { Link } from "react-router-dom";
import SignUpBrandingPanel from "@/components/auth/SignUpBrandingPanel";

const SignUpPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");

  const handleSignUpSuccess = (userEmail: string) => {
    setEmail(userEmail);
    setStep(2);
  };

  return (
    <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
      <SignUpBrandingPanel />
      <div className="flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-md">
          {step === 1 ? (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight">
                  Create Account
                </h1>
                <p className="text-muted-foreground">
                  Step 1 of 2: Basic Information
                </p>
              </div>
              <SignUpForm onSignUpSuccess={handleSignUpSuccess} />
              <p className="mt-8 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-primary hover:underline"
                >
                  Sign in here
                </Link>
              </p>
            </>
          ) : (
            <VerificationForm email={email} />
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;