"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";

const formSchema = z.object({
  username: z.string().min(3).max(32),
  email: z.string().email(),
  location: z.string().max(100).optional(),
  bio: z.string().max(160).optional(),
});

interface ProfileFormProps {
  initialData: {
    name?: string;
    email?: string;
    location?: string;
    bio?: string;
    tokens?: number;
  } | null;
  user: any; // Replace with proper Clerk user type if needed
}

export default function ProfileForm({ initialData, user }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      location: initialData?.location || "",
      bio: initialData?.bio || "",
    },
  });

  const onSubmit = async (values: any) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Something went wrong");
      }

      toast.success("Profile updated!");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 max-w-md">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium block mb-1">Username</label>
          <Input
            {...form.register("name")}
            disabled={isLoading}
            className="h-8"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Email</label>
          <Input
            {...form.register("email")}
            type="email"
            disabled={isLoading}
            className="h-8"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium block mb-1">Location</label>
        <Input
          {...form.register("location")}
          disabled={isLoading}
          className="h-8"
        />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1">Bio</label>
        <Textarea
          {...form.register("bio")}
          disabled={isLoading}
          className="h-20 resize-none"
        />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1">Credits</label>
        <p className="text-xl font-bold">{initialData?.tokens || 0}</p>
      </div>
      <Button type="submit" disabled={isLoading} className="w-full h-9">
        Save Changes
      </Button>
    </form>
  );
} 