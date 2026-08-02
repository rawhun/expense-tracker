"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { ArrowRight, MessageSquare, Target, BarChart3, LogIn } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        <section className="relative overflow-hidden pt-24 pb-28 lg:pt-32 lg:pb-36">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

          <div className="container mx-auto px-4 md:px-6 flex flex-col items-center text-center">
            <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Track spending.
              <br className="hidden sm:block" />
              <span className="text-primary">Build better habits.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
              HabitCoach helps you log expenses quickly, set savings goals, and stay on top of where your money goes.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto rounded-full text-base h-12 px-8">
                  Create account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full text-base h-12 px-8">
                  Log in
                  <LogIn className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="mt-16 w-full max-w-3xl mx-auto rounded-2xl border border-border/60 bg-card/60 p-6 sm:p-8 text-left">
              <p className="text-sm text-muted-foreground mb-4">Example</p>
              <div className="space-y-3">
                <div className="bg-primary/10 px-4 py-3 rounded-2xl rounded-bl-sm max-w-[90%] text-sm border border-primary/20">
                  Spent ₹350 on tea and snacks today
                </div>
                <div className="bg-muted px-4 py-3 rounded-2xl rounded-br-sm max-w-[90%] ml-auto text-sm border border-border">
                  Logged under Food &amp; Drinks. You&apos;ve spent ₹1,240 in that category this week.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-secondary/40">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">What you get</h2>
              <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
                Simple tools for day-to-day money tracking.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center p-2">
                <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Expense tracking</h3>
                <p className="text-muted-foreground text-sm">
                  Add purchases in plain language or review your history anytime.
                </p>
              </div>
              <div className="text-center p-2">
                <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Savings goals</h3>
                <p className="text-muted-foreground text-sm">
                  Set a target, add money over time, and see how close you are.
                </p>
              </div>
              <div className="text-center p-2">
                <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Money coach</h3>
                <p className="text-muted-foreground text-sm">
                  Ask questions about your spending and get practical next steps.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-10 bg-background">
        <div className="container mx-auto px-4 md:px-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} HabitCoach</p>
        </div>
      </footer>
    </div>
  );
}
