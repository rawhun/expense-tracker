"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { ArrowRight, Brain, Target, TrendingUp, Sparkles, LogIn } from "lucide-react";

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1, delayChildren: 0.2 } 
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1">
        <section className="relative overflow-hidden pt-24 pb-32 lg:pt-36 lg:pb-40">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
          
          <motion.div 
            className="container mx-auto px-4 md:px-6 flex flex-col items-center text-center"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary mb-6">
              <Sparkles className="mr-2 h-4 w-4" />
              <span>Meet your new AI Financial Coach</span>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            >
              Understand your spending, <br className="hidden md:inline" />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                improve your habits.
              </span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed"
            >
              HabitCoach uses advanced AI to engage you in natural conversations about your finances. 
              Break bad habits and reach your goals without the stress of manual tracking.
            </motion.p>
            
            <motion.div 
              variants={itemVariants}
              className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
            >
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto rounded-full text-base h-12 px-8">
                  Start Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full text-base h-12 px-8">
                  Login 
                  <LogIn className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="mt-20 w-full max-w-5xl mx-auto"
            >
              <div className="relative rounded-2xl border border-border/50 bg-card/50 glass shadow-2xl p-4 sm:p-8">
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none rounded-2xl" />
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  {/* Mock Chat bubbles */}
                  <div className="flex flex-col gap-4 w-full md:w-2/3 items-start">
                    <div className="bg-primary/10 text-foreground px-4 py-3 rounded-2xl rounded-bl-sm max-w-[80%] text-left text-sm md:text-base border border-primary/20">
                      Spent ₹350 on tea and cigarettes today. Am I budgeting well this week? 
                    </div>
                    <div className="bg-muted px-4 py-3 rounded-2xl rounded-br-sm max-w-[80%] self-end text-left text-sm md:text-base border border-border">
                      <div className="font-semibold text-primary text-xs mb-1">AI Coach</div>
                      I've logged your expense! You're currently slightly over budget for 'Impulse Buys'. 
                      Consider skipping takeout on Friday so we can stay on track for your Laptop savings goal! 🎯
                    </div>
                  </div>
                  {/* Mock stats */}
                  <div className="w-full md:w-1/3 flex flex-col gap-4 border-l border-border/50 pl-0 md:pl-6 pt-6 md:pt-0">
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-medium text-muted-foreground">Today's Insight</span>
                      <span className="font-semibold text-lg text-foreground mt-1">
                        You spend 34% more on weekends!
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        <section className="py-20 bg-secondary/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Not just an expense tracker</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover why your money goes where it does. Our AI creates meaningful financial memories out of your daily input.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-2xl border shadow-sm">
                <div className="p-3 bg-primary/10 rounded-full mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI-Powered Memory</h3>
                <p className="text-muted-foreground text-sm">
                  We don't just log numbers. The coach learns your habits, preferences, and recurring pain points.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-2xl border shadow-sm">
                <div className="p-3 bg-primary/10 rounded-full mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Goal Centric</h3>
                <p className="text-muted-foreground text-sm">
                  Whether quitting smoking or saving for a laptop, every expense is evaluated against your core objectives.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-2xl border shadow-sm">
                <div className="p-3 bg-primary/10 rounded-full mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Behavioral Insights</h3>
                <p className="text-muted-foreground text-sm">
                  Receive personalized, unbiased observations without judgment, backed by your actual spending data.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-background">
        <div className="container mx-auto px-4 md:px-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} HabitCoach AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
