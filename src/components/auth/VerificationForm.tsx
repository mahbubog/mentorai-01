"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

export function VerificationForm({ email }: { email: string }) {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pin: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    console.log(data);
    toast.success("Your account is verified!");
    navigate("/profile-setup");
  }

  const handleResendCode = () => {
    toast.info("Verification Code Resent (Placeholder)", {
      description: `A new code has been sent to ${email}.`,
    });
  };

  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold tracking-tight mb-2">Verify Email</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Step 2 of 2: Enter the 6-digit code sent to your email
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="pin"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">One-Time Password</FormLabel>
                <FormControl>
                  <InputOTP maxLength={6} {...field} containerClassName="justify-center"> {/* এখানে পরিবর্তন করা হয়েছে */}
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Verify Account
          </Button>
        </form>
      </Form>
      <div className="mt-4 text-center text-sm">
        Didn't receive the code?{" "}
        <Button variant="link" className="p-0 h-auto" onClick={handleResendCode}>
          Resend Code
        </Button>
      </div>
    </div>
  );
}