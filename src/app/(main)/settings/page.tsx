
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop, User as UserIcon, Palette, Bell, Loader2 } from "lucide-react";
import { updateUserProfileData, uploadFile } from '@/lib/firebase';

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
  const { user, profile, loading, reloadProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
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
        let avatarUrl = profile.avatar;
        
        // If a new avatar file was selected, upload it
        if (data.avatar instanceof File) {
            const avatarFile = data.avatar;
            const filePath = `avatars/${user.uid}/avatar.jpg`;
            avatarUrl = await uploadFile(avatarFile, filePath);
        }

        const profileDataToUpdate = {
            displayName: data.displayName,
            username: data.username,
            bio: data.bio,
            avatar: avatarUrl,
        };
        
        await updateUserProfileData(user.uid, profileDataToUpdate);
        await reloadProfile(); // Reloads profile from backend to update UI everywhere

        toast({
            title: "Profile Updated!",
            description: "Your changes have been saved.",
        });
        
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

  if (loading || !user) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Loading settings...</p>
      </div>
    );
  }
  
  if (!profile) {
    return (
       <div className="container mx-auto py-8 text-center">
        <p className="text-destructive">Could not load profile. Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-2xl font-heading font-bold mb-6">Settings</h1>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile"><UserIcon className="mr-2 h-4 w-4"/> Profile</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="mr-2 h-4 w-4"/> Appearance</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4"/> Notifications</TabsTrigger>
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
                          src={avatarPreview || `https://avatar.iran.liara.run/public/?username=${profile?.username}`}
                          alt="Avatar preview"
                          width={80}
                          height={80}
                          className="rounded-full aspect-square object-cover"
                          data-ai-hint="user avatar"
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
                         <FormDescription>This is your unique handle.</FormDescription>
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
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                <div className="space-y-2">
                    <p className="text-sm font-medium">Theme</p>
                    <div className="grid grid-cols-3 gap-2 rounded-lg border p-1">
                        <Button variant={theme === 'light' ? 'secondary' : 'ghost'} onClick={() => setTheme('light')}><Sun className="mr-2 h-4 w-4"/>Light</Button>
                        <Button variant={theme === 'dark' ? 'secondary' : 'ghost'} onClick={() => setTheme('dark')}><Moon className="mr-2 h-4 w-4"/>Dark</Button>
                        <Button variant={theme === 'system' ? 'secondary' : 'ghost'} onClick={() => setTheme('system')}><Laptop className="mr-2 h-4 w-4"/>System</Button>
                    </div>
                </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage how you receive notifications from Pollitago.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <FormLabel>Email Notifications</FormLabel>
                        <FormDescription>
                            Receive emails about analysis completion and critical alerts.
                        </FormDescription>
                    </div>
                    <Switch
                        aria-readonly
                        disabled
                    />
                </div>
                 <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <FormLabel>In-App Notifications</FormLabel>
                        <FormDescription>
                            Show notifications within the dashboard for new insights.
                        </FormDescription>
                    </div>
                    <Switch
                        aria-readonly
                        disabled
                        defaultChecked
                    />
                </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
