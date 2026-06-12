import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  Banknote,
  Building2,
  CircleDollarSign,
  CreditCard,
  Gauge,
  ShieldCheck,
  Users,
  UserRound,
} from "lucide-react";

export type RouteItem = {
  label: string;
  path: string;
  icon: LucideIcon;
};

export const navigationItems: RouteItem[] = [
  { label: "Dashboard", path: "/", icon: Gauge },
  { label: "Customers", path: "/customers", icon: Users },
  { label: "Accounts", path: "/accounts", icon: CreditCard },
  { label: "Transactions", path: "/transactions", icon: ArrowLeftRight },
  { label: "Loans", path: "/loans", icon: Banknote },
  { label: "Branches", path: "/branches", icon: Building2 },
  { label: "Employees", path: "/employees", icon: UserRound },
  { label: "Stored Procedures", path: "/procedures", icon: CircleDollarSign },
  { label: "Trigger Demonstration", path: "/triggers", icon: ShieldCheck },
];

export const routeMeta = {
  "/": { title: "Dashboard", breadcrumb: "Dashboard" },
  "/customers": { title: "Customer Management", breadcrumb: "Customers" },
  "/accounts": { title: "Account Management", breadcrumb: "Accounts" },
  "/transactions": { title: "Transaction Management", breadcrumb: "Transactions" },
  "/loans": { title: "Loan Management", breadcrumb: "Loans" },
  "/branches": { title: "Branch Management", breadcrumb: "Branches" },
  "/employees": { title: "Employee Management", breadcrumb: "Employees" },
  "/procedures": { title: "Stored Procedure Demonstration", breadcrumb: "Stored Procedures" },
  "/triggers": { title: "Trigger Demonstration", breadcrumb: "Trigger Demonstration" },
} as const;

export const dashboardCards = [
  {
    title: "Customers",
    description: "Manage customer records",
    href: "/customers",
    icon: Users,
    accentClassName: "from-sky-500 to-cyan-500",
  },
  {
    title: "Accounts",
    description: "Manage customer accounts",
    href: "/accounts",
    icon: CreditCard,
    accentClassName: "from-blue-500 to-indigo-500",
  },
  {
    title: "Transactions",
    description: "View and manage transactions",
    href: "/transactions",
    icon: ArrowLeftRight,
    accentClassName: "from-emerald-500 to-teal-500",
  },
  {
    title: "Loans",
    description: "Manage customer loans",
    href: "/loans",
    icon: Banknote,
    accentClassName: "from-amber-500 to-orange-500",
  },
  {
    title: "Branches",
    description: "Manage branch records",
    href: "/branches",
    icon: Building2,
    accentClassName: "from-violet-500 to-fuchsia-500",
  },
  {
    title: "Employees",
    description: "Manage employee records",
    href: "/employees",
    icon: UserRound,
    accentClassName: "from-slate-700 to-slate-500",
  },
] as const;

export const databaseCards = [
  {
    title: "Stored Procedure Demo",
    description: "Execute database procedures",
    href: "/procedures",
    icon: CircleDollarSign,
    accentClassName: "from-blue-600 to-sky-500",
    highlights: ["Fund Transfer", "Monthly Interest Calculation"],
  },
  {
    title: "Trigger Demo",
    description: "Demonstrate database triggers",
    href: "/triggers",
    icon: ShieldCheck,
    accentClassName: "from-emerald-600 to-teal-500",
    highlights: ["Minimum Balance Validation", "Automatic Balance Update"],
  },
] as const;
