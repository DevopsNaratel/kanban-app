"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Layout, Shield, Zap, Menu, X, Users, Clock, TrendingUp, Star, ChevronRight, Globe, ShieldCheck, BadgeCheck, Sparkles, BarChart, Target, Calendar, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const testimonials = [
    { name: "Alex Johnson", role: "Product Manager", company: "TechCorp", content: "hantuin transformed our team's productivity. We're shipping 40% faster!", avatar: "AJ", rating: 5 },
    { name: "Sam Rivera", role: "Engineering Lead", company: "StartupXYZ", content: "The intuitive interface and powerful automation saved us countless hours.", avatar: "SR", rating: 5 },
    { name: "Morgan Lee", role: "Design Director", company: "Creative Inc", content: "Finally a tool that both designers and developers love to use!", avatar: "ML", rating: 4 },
  ];

  const pricingPlans = [
    { name: "Free", price: "$0", description: "For individuals getting started", features: ["Up to 3 projects", "Basic Kanban board", "1GB storage", "Community support"] },
    { name: "Pro", price: "$12", description: "For growing teams", features: ["Unlimited projects", "Advanced workflows", "10GB storage", "Priority support", "Custom fields", "Analytics"], popular: true },
    { name: "Enterprise", price: "$29", description: "For organizations", features: ["Everything in Pro", "Unlimited storage", "SLA 99.9%", "Dedicated support", "SSO & SAML", "Advanced security"] },
  ];

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      {/* Enhanced Header */}
      <header className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        scrolled ? "bg-background/95 backdrop-blur-md shadow-sm" : "bg-background/80 backdrop-blur-sm"
      )}>
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3 font-bold text-xl">
            <Link to="/" className="flex items-center gap-3">
              <div className="relative">
                <Layout className="h-7 w-7 text-primary" />
                <Sparkles className="h-3 w-3 text-primary absolute -top-1 -right-1" />
              </div>
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">hantuin</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-8 text-sm font-medium">
            <a href="#features" className="hover:text-primary transition-colors flex items-center gap-1">
              Features
            </a>
            <a href="#testimonials" className="hover:text-primary transition-colors flex items-center gap-1">
              Testimonials
            </a>
            <a href="#pricing" className="hover:text-primary transition-colors flex items-center gap-1">
              Pricing
            </a>
            <a href="#faq" className="hover:text-primary transition-colors flex items-center gap-1">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex gap-2" asChild>
              <Link to="/login">
                <BadgeCheck className="h-4 w-4" />
                Log in
              </Link>
            </Button>
            <Button size="sm" className="gap-2 group" asChild>
              <Link to="/register">
                Get Started
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t animate-in slide-in-from-top-5">
            <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
              <a href="#features" className="py-2 hover:text-primary" onClick={() => setIsMenuOpen(false)}>Features</a>
              <a href="#testimonials" className="py-2 hover:text-primary" onClick={() => setIsMenuOpen(false)}>Testimonials</a>
              <a href="#pricing" className="py-2 hover:text-primary" onClick={() => setIsMenuOpen(false)}>Pricing</a>
              <a href="#faq" className="py-2 hover:text-primary" onClick={() => setIsMenuOpen(false)}>FAQ</a>
              <div className="pt-4 border-t">
                <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                  <Link to="/login">
                    <BadgeCheck className="h-4 w-4" />
                    Log in
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* Enhanced Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/10" />
          <div className="absolute top-20 right-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-20 left-10 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />

          <div className="container mx-auto relative px-4 py-24 sm:px-8 lg:py-32">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto gap-8">
              <Badge variant="secondary" className="gap-2 px-4 py-1.5 animate-pulse">
                <Sparkles className="h-3 w-3" />
                v2.0 is now live
              </Badge>

              <h1 className="text-4xl font-extrabold tracking-tight lg:text-7xl text-balance leading-tight">
                Manage projects with{" "}
                <span className="relative">
                  <span className="relative z-10 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    clarity
                  </span>
                  <div className="absolute bottom-2 left-0 w-full h-3 bg-primary/20 -rotate-1" />
                </span>{" "}
                and{" "}
                <span className="relative">
                  <span className="relative z-10 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    speed
                  </span>
                  <div className="absolute bottom-2 left-0 w-full h-3 bg-primary/20 rotate-1" />
                </span>
              </h1>

              <p className="text-xl text-muted-foreground text-balance max-w-2xl leading-relaxed">
                The modern Kanban board for high-performance teams. Visualize work, maximize efficiency,
                and ship faster than ever before. Trusted by 10,000+ teams worldwide.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
                <Button size="lg" className="gap-2 group px-8" asChild>
                  <Link to="/register">
                    Start free trial <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="gap-2">
                  <Play className="h-4 w-4" />
                  Watch demo
                </Button>
              </div>

              <div className="mt-12 w-full max-w-5xl">
                <div className="relative rounded-2xl border-2 bg-gradient-to-b from-background to-muted/50 p-3 shadow-2xl shadow-primary/10">
                  <div className="aspect-video w-full rounded-xl bg-gradient-to-br from-muted/80 to-background border flex items-center justify-center overflow-hidden">
                    <div className="relative w-full h-full flex items-center justify-center">
                      {/* Mock Kanban Board */}
                      <div className="absolute inset-0 flex gap-4 p-8">
                        {["Backlog", "In Progress", "Review", "Done"].map((column, i) => (
                          <div key={column} className="flex-1 flex flex-col gap-3">
                            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                              <h3 className="font-semibold">{column}</h3>
                              <Badge variant="outline">{i + 2}</Badge>
                            </div>
                            {Array.from({ length: 3 }).map((_, j) => (
                              <div key={j} className="bg-background rounded-lg p-4 border shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className={`h-2 w-2 rounded-full ${j === 0 ? "bg-green-500" : j === 1 ? "bg-yellow-500" : "bg-blue-500"}`} />
                                  <span className="text-xs font-medium">Task {j + 1}</span>
                                </div>
                                <p className="text-sm">Update documentation for API v2</p>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                      <div className="relative z-10 bg-background/90 backdrop-blur-sm border rounded-xl p-8 shadow-lg">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Layout className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">hantuin Dashboard</h3>
                            <p className="text-muted-foreground">Real-time project visualization</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="px-4 py-1 bg-background border shadow-sm">
                      Interactive preview • Drag cards to try
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-4 py-16 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <StatCard icon={<Users className="h-6 w-6" />} value="10K+" label="Active Teams" />
            <StatCard icon={<TrendingUp className="h-6 w-6" />} value="42%" label="Faster Shipping" />
            <StatCard icon={<Globe className="h-6 w-6" />} value="150+" label="Countries" />
            <StatCard icon={<Star className="h-6 w-6" />} value="4.9/5" label="Rating" />
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section id="features" className="container mx-auto px-4 py-24 sm:px-8">
          <div className="flex flex-col items-center text-center gap-4 mb-16">
            <Badge variant="outline" className="mb-2">Features</Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Everything you need to ship</h2>
            <p className="text-muted-foreground max-w-[600px] text-lg">
              Powerful features built for modern product teams.
            </p>
          </div>

          <Tabs defaultValue="productivity" className="w-full">
            <TabsList className="grid grid-cols-3 max-w-md mx-auto mb-12">
              <TabsTrigger value="productivity">Productivity</TabsTrigger>
              <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="productivity" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard
                  icon={<Zap className="h-10 w-10 text-primary mb-4" />}
                  title="Lightning Fast"
                  description="Built for speed with instant updates and real-time collaboration. No lag, just progress."
                  features={["Real-time sync", "Offline mode", "Instant search"]}
                />
                <FeatureCard
                  icon={<Clock className="h-10 w-10 text-primary mb-4" />}
                  title="Time Tracking"
                  description="Built-in time tracking for accurate project estimations and billing."
                  features={["Pomodoro timer", "Automatic tracking", "Reports"]}
                />
                <FeatureCard
                  icon={<CheckCircle className="h-10 w-10 text-primary mb-4" />}
                  title="Automated Workflows"
                  description="Automate repetitive tasks and focus on what matters most."
                  features={["Custom triggers", "Multi-step actions", "Slack integration"]}
                />
              </div>
            </TabsContent>

            <TabsContent value="collaboration">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard
                  icon={<Users className="h-10 w-10 text-primary mb-4" />}
                  title="Team Collaboration"
                  description="Work together seamlessly with built-in communication tools."
                  features={["Team mentions", "File sharing", "Threaded comments"]}
                />
                <FeatureCard
                  icon={<ShieldCheck className="h-10 w-10 text-primary mb-4" />}
                  title="Smart Permissions"
                  description="Granular control over who sees and does what in your projects."
                  features={["Role-based access", "Guest access", "Audit logs"]}
                />
                <FeatureCard
                  icon={<Calendar className="h-10 w-10 text-primary mb-4" />}
                  title="Calendar Sync"
                  description="Sync tasks with Google Calendar, Outlook, and Apple Calendar."
                  features={["2-way sync", "Smart scheduling", "Conflict detection"]}
                />
              </div>
            </TabsContent>

            <TabsContent value="insights">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard
                  icon={<BarChart className="h-10 w-10 text-primary mb-4" />}
                  title="Advanced Analytics"
                  description="Deep insights into your team's performance and project health."
                  features={["Burn-down charts", "Cycle time analysis", "Custom reports"]}
                />
                <FeatureCard
                  icon={<Target className="h-10 w-10 text-primary mb-4" />}
                  title="OKR Tracking"
                  description="Align team goals with company objectives and track progress."
                  features={["Goal setting", "Progress tracking", "Automated updates"]}
                />
                <FeatureCard
                  icon={<Shield className="h-10 w-10 text-primary mb-4" />}
                  title="Enterprise Security"
                  description="Bank-grade encryption and advanced permission controls."
                  features={["SOC 2 compliant", "GDPR ready", "Data encryption"]}
                />
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="bg-gradient-to-b from-muted/30 to-background py-24">
          <div className="container mx-auto px-4 sm:px-8">
            <div className="flex flex-col items-center text-center gap-4 mb-16">
              <Badge variant="outline" className="mb-2">Testimonials</Badge>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Loved by teams worldwide</h2>
              <p className="text-muted-foreground max-w-[600px]">
                See what our users have to say about their experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="relative overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-bold">
                        {testimonial.avatar}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{testimonial.name}</CardTitle>
                        <CardDescription>{testimonial.role} • {testimonial.company}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < testimonial.rating ? "text-yellow-500 fill-yellow-500" : "text-muted"}`} />
                      ))}
                    </div>
                    <p className="italic text-muted-foreground">"{testimonial.content}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="container mx-auto px-4 py-24 sm:px-8">
          <div className="flex flex-col items-center text-center gap-4 mb-16">
            <Badge variant="outline" className="mb-2">Pricing</Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Simple, transparent pricing</h2>
            <p className="text-muted-foreground max-w-[600px]">
              Choose the plan that's right for your team. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={cn(
                "relative overflow-hidden",
                plan.popular && "border-primary shadow-lg shadow-primary/10"
              )}>
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground py-2 text-center text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <CardHeader className={cn(plan.popular ? "pt-12" : "pt-6")}>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                    asChild
                  >
                    <Link to="/register">
                      Get Started
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="container mx-auto px-4 py-24 sm:px-8 bg-muted/30 rounded-3xl my-12">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col items-center text-center gap-4 mb-16">
              <Badge variant="outline" className="mb-2">FAQ</Badge>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Frequently asked questions</h2>
              <p className="text-muted-foreground">
                Can't find the answer you're looking for? Contact our support team.
              </p>
            </div>

            <div className="space-y-6">
              {[
                { q: "Is there a free trial?", a: "Yes! All paid plans come with a 14-day free trial. No credit card required." },
                { q: "Can I change plans later?", a: "Absolutely! You can upgrade or downgrade your plan at any time." },
                { q: "How secure is my data?", a: "We use enterprise-grade security with end-to-end encryption and regular security audits." },
                { q: "Do you offer discounts for non-profits?", a: "Yes, we offer 50% off for registered non-profit organizations." },
              ].map((item, index) => (
                <div key={index} className="border-b pb-6">
                  <h3 className="font-semibold text-lg mb-2">{item.q}</h3>
                  <p className="text-muted-foreground">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="container mx-auto px-4 py-24 sm:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-primary to-primary/80 px-6 py-16 sm:px-16 md:py-24 text-center text-primary-foreground relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/10" />
            <div className="absolute top-0 right-0 -mt-20 -mr-20 h-[300px] w-[300px] rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-[300px] w-[300px] rounded-full bg-white/10 blur-3xl" />

            <div className="relative z-10">
              <Badge variant="secondary" className="mb-6">Limited Time Offer</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl mb-6">
                Ready to streamline your workflow?
              </h2>
              <p className="text-primary-foreground/80 max-w-xl mx-auto mb-10 text-lg">
                Join 10,000+ teams who have transformed how they build software.
                Get 2 months free on annual plans.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter your work email"
                    className="pl-10 bg-background text-foreground"
                  />
                </div>
                <Button size="lg" variant="secondary" className="gap-2 group" asChild>
                  <Link to="/register">
                    Get Started Today
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>

              <p className="text-sm text-primary-foreground/60 mt-4">
                Free 14-day trial • No credit card required
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Enhanced Footer */}
      <footer className="border-t bg-gradient-to-b from-background to-muted/10">
        <div className="container mx-auto px-4 sm:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 font-bold text-xl mb-6">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Layout className="h-6 w-6 text-primary" />
                </div>
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">hantuin</span>
              </div>
              <p className="text-muted-foreground max-w-md">
                Making project management simple, fast, and effective for teams of all sizes.
              </p>
              <div className="flex gap-4 mt-6">
                {["Twitter", "LinkedIn", "GitHub", "Discord"].map((social) => (
                  <Button key={social} variant="ghost" size="icon" className="h-10 w-10">
                    <div className="h-4 w-4 bg-muted-foreground rounded-full" />
                  </Button>
                ))}
              </div>
            </div>

            {[
              { title: "Product", links: ["Features", "Pricing", "Changelog", "Integrations", "API"] },
              { title: "Company", links: ["About", "Careers", "Blog", "Press", "Contact"] },
              { title: "Resources", links: ["Documentation", "Help Center", "Community", "Tutorials", "Status"] },
            ].map((column, index) => (
              <div key={index}>
                <h3 className="font-semibold mb-4">{column.title}</h3>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 hantuin Inc. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground">Privacy Policy</a>
              <a href="#" className="hover:text-foreground">Terms of Service</a>
              <a href="#" className="hover:text-foreground">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) {
  return (
    <div className="flex flex-col items-center p-6 rounded-xl border bg-card hover:shadow-md transition-shadow">
      <div className="mb-4 p-3 rounded-full bg-primary/10">
        {icon}
      </div>
      <div className="text-3xl font-bold mb-2">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  features
}: {
  icon: React.ReactNode,
  title: string,
  description: string,
  features?: string[]
}) {
  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader>
        {icon}
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{description}</p>
        {features && (
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                {feature}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function Play(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}