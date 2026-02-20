import { Lock, MapPinned, ListOrdered } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { getDomainRestrictionMessage } from "@/config/app";

const features = [
  {
    icon: Lock,
    title: "Company-only access",
    useDomainMessage: true,
    description: "",
  },
  {
    icon: MapPinned,
    title: "Privacy-first sharing",
    useDomainMessage: false,
    description: "Share your nearest major city",
  },
  {
    icon: ListOrdered,
    title: "Distance-sorted list",
    useDomainMessage: false,
    description: "See teammates ordered by how close they are to you.",
  },
];

export function Features() {
  const domainMessage = getDomainRestrictionMessage();
  return (
    <section className="container max-w-6xl mx-auto px-4 py-16">
      <div className="grid md:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card
            key={index}
            className="border-border/50 bg-card/50 backdrop-blur hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
          >
            <CardContent className="pt-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.useDomainMessage ? domainMessage : feature.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
