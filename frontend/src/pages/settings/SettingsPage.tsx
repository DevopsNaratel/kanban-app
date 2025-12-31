import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertCircle, CheckCircle, Loader2, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function SettingsPage() {
    const { user, updateProfile, changePassword } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Profile Form State
    const [name, setName] = useState(user?.name || "");
    const [email] = useState(user?.email || ""); // Email usually not editable directly without verification

    // Password Form State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            await updateProfile(name);
            setMessage({ type: 'success', text: "Profile updated successfully." });
        } catch (error) {
            setMessage({ type: 'error', text: error instanceof Error ? error.message : "Failed to update profile." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: "New passwords do not match." });
            setIsLoading(false);
            return;
        }

        if (newPassword.length < 6) {
             setMessage({ type: 'error', text: "Password must be at least 6 characters." });
             setIsLoading(false);
             return;
        }

        try {
            await changePassword(currentPassword, newPassword);
            setMessage({ type: 'success', text: "Password changed successfully." });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            setMessage({ type: 'error', text: error instanceof Error ? error.message : "Failed to change password." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link to="/dashboard">
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
                    </div>
                </div>

                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                    </TabsList>

                    <div className="mt-6">
                        {message && (
                            <Alert variant={message.type === 'error' ? "destructive" : "default"} className={`mb-6 ${message.type === 'success' ? 'border-green-500 text-green-600 dark:text-green-400' : ''}`}>
                                {message.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4 text-green-500" />}
                                <AlertDescription>{message.text}</AlertDescription>
                            </Alert>
                        )}

                        <TabsContent value="profile">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Profile Information</CardTitle>
                                    <CardDescription>
                                        Update your public profile information.
                                    </CardDescription>
                                </CardHeader>
                                <form onSubmit={handleUpdateProfile}>
                                    <CardContent className="space-y-6">
                                        <div className="flex flex-col sm:flex-row gap-6 items-start">
                                            <div className="flex flex-col items-center gap-2">
                                                <Avatar className="h-24 w-24">
                                                    <AvatarImage src={user?.avatarUrl} />
                                                    <AvatarFallback className="text-2xl">{user?.name?.charAt(0) || "U"}</AvatarFallback>
                                                </Avatar>
                                                {/* Placeholder for Avatar Upload - could implement later */}
                                                <Button type="button" variant="outline" size="sm" className="text-xs" disabled>
                                                    Change Avatar
                                                </Button>
                                            </div>
                                            <div className="space-y-4 flex-1 w-full">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="name">Full Name</Label>
                                                    <Input 
                                                        id="name" 
                                                        value={name} 
                                                        onChange={(e) => setName(e.target.value)} 
                                                        disabled={isLoading}
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="email">Email</Label>
                                                    <Input 
                                                        id="email" 
                                                        value={email} 
                                                        disabled 
                                                        className="bg-muted text-muted-foreground cursor-not-allowed"
                                                    />
                                                    <p className="text-[0.8rem] text-muted-foreground">
                                                        Email addresses cannot be changed at this time.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="border-t bg-muted/20 px-6 py-4">
                                        <Button type="submit" disabled={isLoading}>
                                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Save Changes
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        </TabsContent>

                        <TabsContent value="security">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Change Password</CardTitle>
                                    <CardDescription>
                                        Ensure your account is secure by using a strong password.
                                    </CardDescription>
                                </CardHeader>
                                <form onSubmit={handleChangePassword}>
                                    <CardContent className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="current">Current Password</Label>
                                            <Input 
                                                id="current" 
                                                type="password" 
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="new">New Password</Label>
                                            <Input 
                                                id="new" 
                                                type="password" 
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="confirm">Confirm New Password</Label>
                                            <Input 
                                                id="confirm" 
                                                type="password" 
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="border-t bg-muted/20 px-6 py-4">
                                        <Button type="submit" disabled={isLoading}>
                                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Update Password
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
