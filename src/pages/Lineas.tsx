import { useState } from "react";
import {
  Filter,
  Star,
  ChevronDown,
  TrendingUp,
} from "lucide-react";

interface BettingLine {
  id: string;
  sport: string;
  league: string;
  period: string;
  gameTime: string;
  rotation: string;
  team: string;
  teamCode: string;
  spread: string;
  spreadOdds: string;
  moneyline: string;
  total: string;
  totalOdds: string;
  isFavorite: boolean;
}

const linesData: BettingLine[] = [
  {
    id: "L-001",
    sport: "NBA",
    leag