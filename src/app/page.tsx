"use client";

import { ShoppingCart, FileText, TrendingUp, Users, ArrowRight, Package } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  const stats = [
    { label: "Today's Orders", value: "₹45,200", icon: ShoppingCart, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
    { label: "Pending Quotes", value: "12", icon: FileText, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-500/10" },
    { label: "Monthly Sales", value: "₹12.5L", icon: TrendingUp, color: "text-green-500", bg: "bg-green-50 dark:bg-green-500/10" },
    { label: "Active Clients", value: "148", icon: Users, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10" },
  ];

  const quickActions = [
    { name: "New Quote", href: "/quotes/create", icon: FileText, gradient: "from-blue-500 to-indigo-600" },
    { name: "New Order", href: "/orders/create", icon: ShoppingCart, gradient: "from-emerald-400 to-teal-500" },
    { name: "Add Client", href: "/masters/clients/create", icon: Users, gradient: "from-orange-400 to-red-500" },
    { name: "Add Product", href: "/masters/products/create", icon: Package, gradient: "from-purple-500 to-pink-500" },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex flex-col gap-6 animate-in">
      {/* Hello Section */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Good Morning, Admin
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Here is your business overview today.
        </p>
      </div>

      {/* KPI Cards */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3"
      >
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={i} variants={item}>
              <div className="glass-card rounded-2xl p-4 flex flex-col gap-3 transition-transform active:scale-95">
                <div className={`p-2 w-fit rounded-xl ${stat.bg}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Quick Actions */}
      <div className="mt-2">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Quick Actions</h3>
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-4 gap-4"
        >
          {quickActions.map((action, i) => (
            <motion.div key={i} variants={item} className="flex flex-col items-center gap-2">
              <Link 
                href={action.href}
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.gradient} text-white flex justify-center items-center shadow-lg shadow-indigo-500/20 active:scale-90 transition-transform`}
              >
                <action.icon className="w-6 h-6" />
              </Link>
              <span className="text-[10px] font-semibold text-center text-gray-600 dark:text-gray-300">
                {action.name}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="mt-2 pb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Recent Activity</h3>
          <button className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 active:opacity-70">
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="glass-card p-4 rounded-2xl flex items-center justify-between active:scale-[0.98] transition-transform">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-500/10 flex justify-center items-center text-green-600 dark:text-green-500">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Order #ORD-{1024 + i}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Acme Corp • ₹12,400</p>
                </div>
              </div>
              <span className="text-xs font-medium text-gray-400">2h ago</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
