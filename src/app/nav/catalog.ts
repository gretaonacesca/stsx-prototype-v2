import type { LucideIcon } from "lucide-react";
import {
  Briefcase, Truck, Users, Package, Upload, Database, ShieldAlert,
  FileText, Settings2,
} from "lucide-react";

export type OperationId =
  | "add-job" | "edit-job" | "enter-piecemark" | "find-piecemark"
  | "view-load"
  | "edit-employee" | "edit-employee-class"
  | "inventory-item" | "inventory-reorder" | "inventory-capacity"
  | "kiss-import" | "tekla" | "eje" | "sds" | "excel"
  | "customers" | "carriers" | "status-codes" | "routing-codes"
  | "records-delete" | "records-recall" | "records-purge"
  | "foxfire" | "status-report" | "barcode-labels" | "raw-labels" | "label-fields"
  | "prefs" | "printer-prefs" | "division" | "logon" | "permissions" | "view-log" | "license-info";

export type NavLeaf = {
  id: OperationId;
  label: string;
};

export type NavCategory = {
  id: string;
  label: string;
  Icon: LucideIcon;
  children: NavLeaf[];
};

export const NAV_CATEGORIES: NavCategory[] = [
  {
    id: "import",
    label: "Import",
    Icon: Upload,
    children: [
      { id: "kiss-import", label: "KISS Import" },
      { id: "tekla", label: "Tekla XSR Import" },
      { id: "eje", label: "EJE Delimited Import" },
      { id: "sds", label: "SDS/XML Import" },
      { id: "excel", label: "Excel Import" },
    ],
  },
  {
    id: "jobs",
    label: "Jobs",
    Icon: Briefcase,
    children: [
      { id: "add-job", label: "Add New Job" },
      { id: "edit-job", label: "Edit Job Information" },
      { id: "enter-piecemark", label: "Enter Piecemark" },
      { id: "find-piecemark", label: "Find a Piecemark" },
    ],
  },
  {
    id: "shipping",
    label: "Shipping",
    Icon: Truck,
    children: [{ id: "view-load", label: "View Load Information" }],
  },
  {
    id: "reports",
    label: "Reports & labels",
    Icon: FileText,
    children: [
      { id: "foxfire", label: "Foxfire Reports" },
      { id: "status-report", label: "Status Report" },
      { id: "barcode-labels", label: "Barcode ID Labels" },
      { id: "raw-labels", label: "Raw Material Labels" },
      { id: "label-fields", label: "Label Field Report" },
    ],
  },
  {
    id: "people",
    label: "People",
    Icon: Users,
    children: [
      { id: "edit-employee", label: "Edit Employee Information" },
      { id: "edit-employee-class", label: "Edit Employee Class Info" },
    ],
  },
  {
    id: "reference",
    label: "Reference data",
    Icon: Database,
    children: [
      { id: "customers", label: "Edit Customer Information" },
      { id: "carriers", label: "Edit Carrier Information" },
      { id: "status-codes", label: "Edit Status Codes" },
      { id: "routing-codes", label: "Edit Routing Codes" },
    ],
  },
  {
    id: "inventory",
    label: "Inventory",
    Icon: Package,
    children: [
      { id: "inventory-item", label: "Item Detail" },
      { id: "inventory-reorder", label: "Reorder" },
      { id: "inventory-capacity", label: "Capacity" },
    ],
  },
  {
    id: "admin",
    label: "Admin",
    Icon: Settings2,
    children: [
      { id: "prefs", label: "Preferences" },
      { id: "printer-prefs", label: "Barcode Printer Preferences" },
      { id: "division", label: "Division & License Management" },
      { id: "logon", label: "Logon & Access Management" },
      { id: "permissions", label: "Application Permissions" },
      { id: "view-log", label: "View Log" },
      { id: "license-info", label: "View Logon License Info" },
    ],
  },
  {
    id: "records",
    label: "Records",
    Icon: ShieldAlert,
    children: [
      { id: "records-delete", label: "Active Record Delete" },
      { id: "records-recall", label: "Recall Deleted Records" },
      { id: "records-purge", label: "Purge Deleted Records" },
    ],
  },
];

export function findOperation(id: OperationId): { category: NavCategory; leaf: NavLeaf } | null {
  for (const category of NAV_CATEGORIES) {
    const leaf = category.children.find((c) => c.id === id);
    if (leaf) return { category, leaf };
  }
  return null;
}
