import { useState } from "react";
import {
  Search,
  Filter,
  Ticket,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  Download,
  Eye,
  Printer,
} from "lucide-react";

interface TicketItem {
  id: string;
  code: string;
  date: string;
  time: string;
  customer: string;
  seller: string;
  picks: number;
  risk: number;
  toWin: number;
  status: "ganador" | "perdedor" | "pendiente" | "cancelado";
}

const ticketsData: TicketItem[] = [
  {
    id: "T-001",
    code: "TK-784521",
    date: "2