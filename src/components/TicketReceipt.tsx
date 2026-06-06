// TicketReceipt.tsx — Renders a ticket in physical receipt format
// Based on the real FSB ticket format for printing and WhatsApp/Telegram sharing

import { forwardRef } from 'react';
import type { Ticket, Play } from '@/lib/storage';
import { findTeamByCode } from '@/lib/playCodes';
import { findPlayCode } from '@/lib/playCodes';

interface TicketReceiptProps {
  ticket: Ticket;
  copyLabel?: string; // e.g. "*** COPIA ***" or "*** ORIGINAL ***"
}

// ── Helpers ────────────────────────────────────────────────

function formatTicketDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${day}/${month}/${year} ${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
}

function formatTimeOnly(dateStr: string): string {
  const d = new Date(dateStr);
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours.toString().padStart(2, '0')}:${minutes}${ampm}`;
}

function getShortHash(ticketId: string): string {
  // Create a deterministic hash from the ticket ID
  let hash = 0;
  for (let i = 0; i < ticketId.length; i++) {
    const char = ticketId.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash).toString(16).padStart(32, '0').slice(0, 32);
}

function extractTeamCodeFromPlay(play: Play): string {
  // Try to extract the 4-digit team code from teamCode field (format: "2001/2002")
  if (play.teamCode) {
    const codes = play.teamCode.split('/');
    // Return the first code that's not empty
    for (const c of codes) {
      const trimmed = c.trim();
      if (trimmed.length === 4 && /^\d+$/.test(trimmed)) return trimmed;
    }
  }
  // Fallback: try to find a 4-digit code in the detail
  const match = play.detail?.match(/(\d{4})/);
  if (match) return match[1];
  return '0000';
}

function extractLeagueFromPlay(play: Play): string {
  // Infer league from teamCode or detail
  const code = extractTeamCodeFromPlay(play);
  const num = parseInt(code);
  if (num >= 2001 && num <= 2030) return 'NBA';
  if (num >= 3001 && num <= 3015) return 'MLB';
  if (num >= 4001 && num <= 4032) return 'NFL';
  if (num >= 2041 && num <= 2052) return 'WNBA';
  if (num >= 5001 && num <= 5008) return 'CFL';
  if (num >= 1001 && num <= 1020) return 'SOCCER';
  return 'MLB'; // Default
}

function getTeamAbbreviation(play: Play): string {
  const code = extractTeamCodeFromPlay(play);
  const teamName = findTeamByCode(code);
  if (teamName) {
    // Generate abbreviation from team name (first 3 letters)
    return teamName.substring(0, 3).toUpperCase();
  }
  return 'UNK';
}

function formatOddsForReceipt(odds: number): string {
  if (odds >= 0) return `+${odds}`;
  return `${odds}`;
}

function getPlayDescription(play: Play): string {
  const playCode = findPlayCode(play.playType);
  if (playCode) return playCode.code;
  return play.playType;
}

// ── Component ──────────────────────────────────────────────

const TicketReceipt = forwardRef<HTMLDivElement, TicketReceiptProps>(
  ({ ticket, copyLabel = '*** COPIA ***' }, ref) => {
    const now = new Date();
    const createdDate = formatTicketDate(ticket.date);
    const printedDate = formatTicketDate(now.toISOString());
    const hash = getShortHash(ticket.id);

    return (
      <div
        ref={ref}
        className="ticket-receipt"
        style={{
          fontFamily: '"Courier New", Courier, monospace',
          background: '#FFFFFF',
          color: '#000000',
          padding: '16px 12px',
          maxWidth: '320px',
          margin: '0 auto',
          fontSize: '12px',
          lineHeight: 1.4,
          textAlign: 'center',
        }}
      >
        {/* ── Header ── */}
        <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '2px' }}>
          SPORT MMW 04
        </div>
        <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>
          {copyLabel}
        </div>
        <div style={{ marginBottom: '8px' }}>
          {printedDate}
        </div>

        {/* ── Ticket Info ── */}
        <div style={{ textAlign: 'left', marginBottom: '4px' }}>
          <span style={{ fontWeight: 'bold' }}>Num:</span>{ticket.id}
        </div>
        <div style={{ textAlign: 'left', marginBottom: '2px' }}>
          <span style={{ fontWeight: 'bold' }}>Fecha:</span> {createdDate}
        </div>
        <div style={{ textAlign: 'left', fontSize: '10px', marginBottom: '8px', fontFamily: 'monospace' }}>
          {hash}
        </div>

        {/* ── Separator ── */}
        <div style={{ borderTop: '2px solid #000', margin: '8px 0' }} />

        {/* ── Plays ── */}
        {ticket.plays.map((play, idx) => {
          const teamCode = extractTeamCodeFromPlay(play);
          const teamName = findTeamByCode(teamCode) || play.detail?.split(' vs ')[0]?.split(' ').slice(1).join(' ') || 'Unknown';
          const league = extractLeagueFromPlay(play);
          const abbrev = getTeamAbbreviation(play);
          const playDesc = getPlayDescription(play);
          const oddsStr = formatOddsForReceipt(play.odds);
          const gameTime = formatTimeOnly(ticket.date);

          return (
            <div key={play.id || idx} style={{ textAlign: 'left', marginBottom: '6px' }}>
              {/* Line 1: Team code + name + abbrev + league */}
              <div style={{ fontWeight: 'bold', fontSize: '13px' }}>
                {teamCode} {teamName} ({abbrev}) {league}
              </div>
              {/* Line 2: Game time + play type + odds + pitcher (if applicable) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span>{gameTime}</span>
                <span style={{ fontWeight: 'bold' }}>{playDesc}</span>
                <span>{oddsStr}</span>
              </div>
            </div>
          );
        })}

        {/* ── Separator ── */}
        <div style={{ borderTop: '2px solid #000', margin: '8px 0' }} />

        {/* ── Totals ── */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '2px' }}>
            APOSTADO: ${ticket.amount.toFixed(2)}
          </div>
          <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '2px' }}>
            GANANCIA: ${ticket.profit.toFixed(2)}
          </div>
        </div>

        {/* ── Separator ── */}
        <div style={{ borderTop: '2px solid #000', margin: '8px 0' }} />

        {/* ── Total to collect ── */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
            A COBRAR: ${ticket.payout.toFixed(2)}
          </div>
        </div>

        {/* ── Separator ── */}
        <div style={{ borderTop: '2px solid #000', margin: '8px 0' }} />

        {/* ── Disclaimer ── */}
        <div style={{ fontSize: '10px', textAlign: 'center', lineHeight: 1.3 }}>
          <div>No se pagan errores de linea ni</div>
          <div>juegos comenzados</div>
          <div>R/L es valido despues del 5to</div>
          <div>inning</div>
          <div style={{ marginTop: '4px' }}>No se anulan tickets despues de</div>
          <div>5 min. Buena suerte!</div>
        </div>
      </div>
    );
  }
);

TicketReceipt.displayName = 'TicketReceipt';

export default TicketReceipt;
