import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ForgotPasswordPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-bold tracking-tight">Forgot Password</h1>
        <p className="mt-2 text-muted-foreground">
          Enter your email and we'll send you a link to reset your password.
        </p>
        <form className="mt-8 space-y-4 text-left">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input type="email" id="email" placeholder="name@example.com" />
          </div>
          <Button type="submit" className="w-full">
            Send Reset Link
          </Button>
        </form>
        <Button asChild variant="link" className="mt-4">
          <Link to="/login">Back to Login</Link>
        </Button>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;