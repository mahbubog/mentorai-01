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
  FormDescription,
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
    message: "আপনার ওয়ান-টাইম পাসওয়ার্ড অবশ্যই ৬ অক্ষরের হতে হবে।",
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
    // দ্রষ্টব্য: এটি ওটিপি ভেরিফিকেশনের জন্য একটি প্লেসহোল্ডার।
    console.log(data);
    toast.success("Your account is verified!");
    // সফল ভেরিফিকেশনের পর লগইন পেজে রিডাইরেক্ট করুন
    navigate("/login");
  }

  const handleResendCode = () => {
    // দ্রষ্টব্য: কোড পুনরায় পাঠানোর যুক্তির জন্য প্লেসহোল্ডার
    toast.info("Verification Code Resent (Placeholder)", {
      description: `A new code has been sent to ${email}.`,
    });
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold tracking-tight mb-2">আপনার ইমেল চেক করুন</h2>
      <p className="text-sm text-muted-foreground mb-6">
        আমরা আপনার <span className="font-medium text-foreground">{email}</span> ঠিকানায় একটি ৬-সংখ্যার কোড পাঠিয়েছি।
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
                  <InputOTP maxLength={6} {...field}>
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
                <FormDescription className="sr-only">
                  আপনার ইমেলে পাঠানো ওয়ান-টাইম পাসওয়ার্ডটি প্রবেশ করান।
                </FormDescription>
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
        কোড পাননি?{" "}
        <Button variant="link" className="p-0 h-auto" onClick={handleResendCode}>
          Resend Code
        </Button>
      </div>
    </div>
  );
}