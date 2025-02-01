"use client"

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import  Profile from '@prisma/client';
import  profileFormSchema  from '@/lib/validations/profile';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface Profile {
  userId: string;
  id: string;
  name: string | null;
  imageUrl: string | null;
  email: string | null;
  bio: string | null;
  status: string | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  twitch?: string | null;
  youtube?: string | null;
  instagram?: string | null;
  twitter?: string | null;
}

interface ProfileClientProps {
  initialProfile: Profile | null;
  userId: string;
}

export default function ProfileClient({ initialProfile, userId }: ProfileClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: initialProfile?.name || '',
      bio: initialProfile?.bio || '',
      isPublic: initialProfile?.isPublic || false,
    }
  });

  const onSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    try {
      setIsLoading(true);
      const response = await axios.post('/api/profile', values);
      toast.success('Profile updated successfully!');
      // Optionally refresh the data
      window.location.reload();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 mb-4 ml-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Your name" 
                    {...field} 
                    className="h-8 max-w-sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Bio</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Tell us about yourself"
                    className="resize-none h-20 max-w-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isPublic"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm">
                    Make profile public
                  </FormLabel>
                  <FormDescription className="text-xs">
                    This will make your profile visible to others
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          
          <Button type="submit" disabled={isLoading} className="w-24 h-8">
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </form>
      </Form>
    </div>
  );
} 