import { LoginForm } from "@/components/auth/LoginForm";
import AuthBrandingPanel from "@/components/auth/AuthBrandingPanel";
import { Link } from "react-router-dom";

const LoginPage = () => {
  return (
    <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
      <AuthBrandingPanel />
      <div className="flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
            <p className="text-muted-foreground">
              Sign in to continue your learning journey
            </p>
          </div>
          <LoginForm />
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-primary hover:underline"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;