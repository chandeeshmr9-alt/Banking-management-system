export {
  navigationItems as navItems,
  dashboardCards as moduleCards,
  databaseCards as databaseOperationCards,
} from "@/data/routes";

export type {
  RouteItem as NavItem,
} from "@/data/routes";

export type ModuleCard = (typeof import("@/data/routes").dashboardCards)[number];

export type DatabaseOperationCard = (typeof import("@/data/routes").databaseCards)[number];
