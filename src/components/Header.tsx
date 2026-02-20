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
import { appName, logoUrl } from "@/config/app";

interface HeaderProps {
  isAuthenticated?: boolean;
}

export function Header({ isAuthenticated: propIsAuthenticated = false }: HeaderProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isAuthenticated = user !== null || propIsAuthenticated;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
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
              </DropdownMenuContent>
            </DropdownMenu>
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
