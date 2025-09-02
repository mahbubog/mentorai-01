"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const preferences = [
  { id: "academic", label: "Academic Tone" },
  { id: "professional", label: "Professional Tone" },
  { id: "bengali", label: "Bengali Language" },
] as const;

const formSchema = z.object({
  profilePicture: z.any().optional(),
  role: z.enum(["student", "job_seeker", "both"], {
    required_error: "You need to select a role.",
  }),
  preferences: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one preference.",
  }),
});

export function ProfileSetupForm() {
  const navigate = useNavigate();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "student",
      preferences: ["academic"],
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  function onSubmit(data: z.infer<typeof formSchema>) {
    console.log("Profile Data:", data);
    toast.success("Profile setup complete!");
    // Next step: Redirect to onboarding/welcome, then to the main chat interface.
    // For now, we'll navigate to the homepage.
    navigate("/onboarding"); 
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Profile Setup</h2>
        <p className="text-muted-foreground">Step 3 of 3: Customize your experience (Optional)</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="profilePicture"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center">
                <FormLabel>Profile Picture</FormLabel>
                <FormControl>
                  <>
                    <Avatar className="w-24 h-24 mb-4">
                      <AvatarImage src={avatarPreview || undefined} alt="Profile Picture" />
                      <AvatarFallback>
                        <User className="w-12 h-12" />
                      </AvatarFallback>
                    </Avatar>
                    <Input
                      type="file"
                      accept="image/*"
                      className="max-w-xs mx-auto"
                      onChange={(e) => {
                        field.onChange(e.target.files);
                        handleFileChange(e);
                      }}
                    />
                  </>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Select your role:</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="student" />
                      </FormControl>
                      <FormLabel className="font-normal">Student</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="job_seeker" />
                      </FormControl>
                      <FormLabel className="font-normal">Job Seeker</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="both" />
                      </FormControl>
                      <FormLabel className="font-normal">Both</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preferences"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base">Choose your preferences:</FormLabel>
                  <FormDescription>
                    Select the tones and languages you prefer.
                  </FormDescription>
                </div>
                {preferences.map((item) => (
                  <FormField
                    key={item.id}
                    control={form.control}
                    name="preferences"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={item.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, item.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== item.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {item.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-y-4">
            <Button type="submit" className="w-full">Finish Setup</Button>
            <Button variant="ghost" className="w-full" onClick={() => navigate('/onboarding')}>Skip for now</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}