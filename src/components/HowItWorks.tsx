import { Card, CardContent } from "./ui/card";
import { getSignInPrompt } from "@/config/app";

function getSteps() {
  return [
    {
      number: "01",
      title: getSignInPrompt(),
    },
    {
      number: "02",
      title: "Enter your nearest major city (or general area)",
    },
    {
      number: "03",
      title: "Explore the map or switch to a distance-sorted list",
    },
  ];
}

export function HowItWorks() {
  return (
    <section className="container max-w-6xl mx-auto px-4 py-16">
      <div className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">How it works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get started in three simple steps
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {getSteps().map((step, index) => (
            <Card
              key={index}
              className="border-border/50 bg-gradient-to-br from-card to-card/50 hover:from-card hover:to-card transition-all duration-300"
            >
              <CardContent className="pt-6 space-y-4">
                <div className="text-5xl font-bold text-primary/20">
                  {step.number}
                </div>
                <p className="text-lg font-medium leading-relaxed">
                  {step.title}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
