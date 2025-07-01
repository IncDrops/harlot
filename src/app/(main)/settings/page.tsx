
"use client"

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';
import { useTheme } from "next-themes";
import { useSettings } from "@/hooks/use-settings";
import { uploadFile, updateUserProfileData, getUserByUsername } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';
import { Sun, Moon, Laptop, EyeOff, Eye, User as UserIcon, Palette, Shield } from "lucide-react";

const profileFormSchema = z.object({
  avatar: z.any().optional(),
  displayName: z.string().min(2, "Display name must be at least 2 characters.").max(50),
  username: z.string()
    .min(3, "Username must be at least 3 characters.")
    .max(20, "Username must be 20 characters or less.")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores are allowed."),
  bio: z.string().max(160, "Bio must be 160 characters or less.").optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function SettingsPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { showNsfw, toggleNsfw } = useSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: '',
      username: '',
      bio: '',
    },
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    } else if (profile) {
      form.reset({
        displayName: profile.displayName || '',
        username: profile.username || '',
        bio: profile.bio || '',
      });
      setAvatarPreview(profile.avatar || null);
    }
  }, [user, profile, loading, router, form]);
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('avatar', file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };
  
  async function onSubmit(data: ProfileFormValues) {
    if (!user || !profile) return;
    setIsSubmitting(true);
    toast({ title: "Updating profile..." });

    try {
        if (data.username !== profile.username) {
            const existingUser = await getUserByUsername(data.username);
            if (existingUser) {
                form.setError("username", { type: "manual", message: "This username is already taken." });
                setIsSubmitting(false);
                return;
            }
        }
        
        let newAvatarUrl = profile.avatar;
        if (data.avatar && data.avatar instanceof File) {
            const filePath = `avatars/${user.uid}/${uuidv4()}-${data.avatar.name}`;
            newAvatarUrl = await uploadFile(data.avatar, filePath);
        }

        const updatedProfileData = {
            displayName: data.displayName,
            username: data.username,
            bio: data.bio,
            avatar: newAvatarUrl,
        };

        await updateUserProfileData(user.uid, updatedProfileData);

        toast({
            title: "Profile Updated!",
            description: "Your changes have been saved.",
        });
        
        router.refresh();

    } catch (error: any) {
        console.error("Error updating profile:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "Could not update profile.",
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  if (loading || !user || !profile) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Tabs defaultValue="profile" className="max-w-2xl mx-auto">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile"><UserIcon className="mr-2 h-4 w-4"/> Profile</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="mr-2 h-4 w-4"/> Appearance</TabsTrigger>
          <TabsTrigger value="content"><Shield className="mr-2 h-4 w-4"/> Content</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your public profile details.</CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="avatar"
                    render={() => (
                      <FormItem className="flex items-center gap-4">
                        <Image
                          src={avatarPreview || `https://avatar.iran.liara.run/public/?username=${profile.username}`}
                          alt="Avatar preview"
                          width={80}
                          height={80}
                          className="rounded-full aspect-square object-cover"
                        />
                        <div className="space-y-2">
                            <FormLabel>Profile Picture</FormLabel>
                            <Input
                                type="file"
                                ref={avatarInputRef}
                                onChange={handleAvatarChange}
                                accept="image/png, image/jpeg, image/gif"
                                className="hidden"
                            />
                            <Button type="button" variant="outline" onClick={() => avatarInputRef.current?.click()}>
                                Change Avatar
                            </Button>
                             <FormDescription>PNG, JPG, or GIF. 2MB max.</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your display name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">@</span>
                                <Input placeholder="your_username" className="pl-7" {...field} />
                            </div>
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
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Tell us a little about yourself" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of the app.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <RadioGroup
                    value={theme}
                    onValueChange={setTheme}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                    >
                    <Label htmlFor="light" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
                        <RadioGroupItem value="light" id="light" className="sr-only" />
                        <Sun className="mb-3 h-6 w-6" />
                        Light
                    </Label>
                    <Label htmlFor="dark" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
                        <RadioGroupItem value="dark" id="dark" className="sr-only" />
                        <Moon className="mb-3 h-6 w-6" />
                        Dark
                    </Label>
                    <Label htmlFor="system" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
                        <RadioGroupItem value="system" id="system" className="sr-only" />
                        <Laptop className="mb-3 h-6 w-6" />
                        System
                    </Label>
                </RadioGroup>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Content Filtering</CardTitle>
              <CardDescription>Manage your content preferences.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                    <Label className="flex items-center gap-2 text-base">
                        {showNsfw ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                        Show NSFW Content
                    </Label>
                    <CardDescription>
                        Enable to see content marked as Not Safe For Work across the app.
                    </CardDescription>
                    </div>
                    <Switch
                        checked={showNsfw}
                        onCheckedChange={toggleNsfw}
                        aria-label="Toggle NSFW content visibility"
                    />
                </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
