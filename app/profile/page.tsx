"use client";

import Link from "next/link";
import { useState } from "react";
import Header from "@/components/Header";
import  ProfileForm  from "@/components/ProfileForm";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Profile } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import toast from "react-hot-toast";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";

const profileFormSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  bio: z.string().min(1, { message: "Bio is required" }),
  isPublic: z.boolean(),
});

interface ProfileCardProps {
  userId: string;
  profile: Profile | null;
}

export default function Profile() {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: '',
      bio: '',
      isPublic: false,
    }
  });

  const onSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    try {
      setIsLoading(true);
      const response = await axios.post('/api/profile', values);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStripeAction = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/stripe/connect');
      window.location.href = response.data.url;
    } catch (error) {
      toast.error("Failed to process Stripe action");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 relative z-10">
          <Header />
        <div className="flex justify-end mb-4">
                <Button variant="outline" className="flex items-center gap-2" asChild>
                    <Link href="/">
                        <ArrowLeft className="h-4 w-4" />
                        Home
                    </Link>
                </Button>
            </div>
    <ProfileForm initialData={null} user={undefined} />
   </div>
  );
  }
