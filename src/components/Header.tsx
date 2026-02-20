import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAuth } from "@/auth/AuthContext";
import { NavLink } from "./NavLink";
import { AvatarManager } from "./AvatarManager";
import placeholderAvatar from "@/assets/placeholder-avatar.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteAccount } from "@/lib/accountApi";
import { appName, logoUrl } from "@/config/app";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface HeaderProps {
  isAuthenticated?: boolean;
}

export function Header({ isAuthenticated: propIsAuthenticated = false }: HeaderProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteAccountConfirmEmail, setDeleteAccountConfirmEmail] = useState("");
  const isAuthenticated = user !== null || propIsAuthenticated;

  const deleteAccountConfirmMatches =
    user?.email != null &&
    deleteAccountConfirmEmail.trim().toLowerCase() === user.email.toLowerCase();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeletingAccount(true);
      await deleteAccount();
      setShowDeleteAccountDialog(false);
      await signOut();
      navigate("/");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete account";
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between max-w-6xl mx-auto px-4">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img
            src={logoUrl}
            alt={`${appName} logo`}
            className="h-8"
          />
          <span className="font-semibold text-lg">{appName}</span>
        </Link>
        
          <nav className="flex items-center gap-6">
          {isAuthenticated && user && (
            <div className="hidden md:flex items-center gap-6">
              <NavLink
                to="/app"
                className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm px-2 py-1"
                activeClassName="text-foreground font-semibold"
              >
                Map
              </NavLink>
              <NavLink
                to="/list"
                className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm px-2 py-1"
                activeClassName="text-foreground font-semibold"
              >
                List
              </NavLink>
            </div>
          )}
          
          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="User menu"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatarUrl || placeholderAvatar} alt={user.displayName} />
                      <AvatarFallback>
                        {user.displayName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.displayName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <AvatarManager />
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    Sign out
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowDeleteAccountDialog(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    Delete account
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <AlertDialog
                open={showDeleteAccountDialog}
                onOpenChange={(open) => {
                  setShowDeleteAccountDialog(open);
                  if (!open) setDeleteAccountConfirmEmail("");
                }}
              >
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      All your data (profile, location, avatar) will be permanently deleted from our systems and cannot be recovered. This action is for data minimization and cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="py-4">
                    <Label htmlFor="delete-account-email" className="text-sm font-medium">
                      Type your email address to confirm
                    </Label>
                    <Input
                      id="delete-account-email"
                      type="email"
                      autoComplete="email"
                      placeholder={user?.email ?? "your@email.com"}
                      value={deleteAccountConfirmEmail}
                      onChange={(e) => setDeleteAccountConfirmEmail(e.target.value)}
                      className="mt-2"
                      disabled={isDeletingAccount}
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeletingAccount}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteAccount();
                      }}
                      disabled={isDeletingAccount || !deleteAccountConfirmMatches}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeletingAccount ? "Deleting..." : "Delete my account"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <Button
              variant="ghost"
              onClick={() => navigate("/signin")}
            >
              Sign In
            </Button>
          )}
          
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
