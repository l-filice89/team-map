import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { MapPin } from "lucide-react";
import { showInternalToolLabel, getSignInPrompt } from "@/config/app";

export function Hero() {
  return (
    <section className="container max-w-6xl mx-auto px-4 py-16 md:py-24">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="space-y-4">
            {showInternalToolLabel && (
              <p className="text-sm font-semibold text-primary uppercase tracking-wider">
                Internal Tool
              </p>
            )}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Find your teammates on the map
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Company-only access to view and share where you're working from—without exposing exact locations.{" "}
              {getSignInPrompt()}
            </p>
          </div>
          
          <div>
            <Button 
              asChild 
              size="lg" 
              className="rounded-full text-base px-8"
            >
              <Link to="/app">
                Enter the App →
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="relative">
          <div className="aspect-square rounded-2xl bg-card border border-border shadow-lg overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full p-8">
                <svg viewBox="0 0 400 400" className="w-full h-full opacity-20">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="400" height="400" fill="url(#grid)" />
                  <circle cx="120" cy="150" r="80" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
                  <circle cx="280" cy="250" r="100" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
                  <circle cx="200" cy="200" r="120" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
                </svg>
                
                <div className="absolute top-1/3 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    <MapPin className="h-8 w-8 text-primary drop-shadow-lg" fill="currentColor" />
                    <div className="absolute inset-0 animate-ping">
                      <MapPin className="h-8 w-8 text-primary opacity-75" fill="currentColor" />
                    </div>
                  </div>
                </div>
                
                <div className="absolute top-1/2 right-1/3 transform translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    <MapPin className="h-8 w-8 text-accent drop-shadow-lg" fill="currentColor" />
                    <div className="absolute inset-0 animate-ping" style={{ animationDelay: '1s' }}>
                      <MapPin className="h-8 w-8 text-accent opacity-75" fill="currentColor" />
                    </div>
                  </div>
                </div>
                
                <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                  <div className="relative">
                    <MapPin className="h-8 w-8 text-primary drop-shadow-lg" fill="currentColor" />
                    <div className="absolute inset-0 animate-ping" style={{ animationDelay: '2s' }}>
                      <MapPin className="h-8 w-8 text-primary opacity-75" fill="currentColor" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
