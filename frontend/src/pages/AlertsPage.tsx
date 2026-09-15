import React, { useState, useEffect } from 'react';
import {
  fetchAlerts,
  fetchTelegramStatus,
  fetchTelegramUpdates,
  sendActiveTelegramAlerts,
  sendTelegramAlert,
  sendTelegramTest,
  testTelegramBot
} from '../services/api';
import { AlertItem, TelegramStatus, TelegramUpdateChat } from '../types';
import { AlertBanner } from '../components/AlertBanner';
import { BellRing, CheckCircle2, Filter, Loader2, MessageCircle, RefreshCw, Send, ShieldCheck } from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [telegramStatus, setTelegramStatus] = useState<TelegramStatus | null>(null);
  const [telegramChats, setTelegramChats] = useState<TelegramUpdateChat[]>([]);
  const [telegramNotice, setTelegramNotice] = useState<string>('');
  const [telegramBusy, setTelegramBusy] = useState<string>('');
  const [sendingAlertId, setSendingAlertId] = useState<number | null>(null);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await fetchAlerts();
      setAlerts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadTelegramStatus = async () => {
    try {
      setTelegramStatus(await fetchTelegramStatus());
    } catch (err) {
      setTelegramNotice(err instanceof Error ? err.message : 'Telegram status unavailable');
    }
  };

  useEffect(() => {
    loadAlerts();
    loadTelegramStatus();
  }, []);

  const handleAcknowledge = (id: number) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'ACKNOWLEDGED' } : a))
    );
  };

  const runTelegramAction = async (key: string, action: () => Promise<string>) => {
    setTelegramBusy(key);
    setTelegramNotice('');
    try {
      setTelegramNotice(await action());
      await loadTelegramStatus();
    } catch (err) {
      setTelegramNotice(err instanceof Error ? err.message : 'Telegram action failed');
    } finally {
      setTelegramBusy('');
    }
  };

  const handleTestBot = () =>
    runTelegramAction('test-bot', async () => {
      const bot = await testTelegramBot();
      return bot.username ? `Bot verified: @${bot.username}` : 'Bot verified';
    });

  const handleDetectChats = () =>
    runTelegramAction('detect-chats', async () => {
      const chats = await fetchTelegramUpdates();
      setTelegramChats(chats);
      return chats.length ? `${chats.length} Telegram chat target${chats.length === 1 ? '' : 's'} detected` : 'No recent Telegram chats detected';
    });

  const handleSendTest = () =>
    runTelegramAction('send-test', async () => {
      const result = await sendTelegramTest();
      return result.detail;
    });

  const handleSendDigest = () =>
    runTelegramAction('send-digest', async () => {
      const result = await sendActiveTelegramAlerts();
      return `${result.detail}: ${result.sent_count} active alert${result.sent_count === 1 ? '' : 's'}`;
    });

  const handleSendAlert = async (id: number) => {
    setSendingAlertId(id);
    setTelegramNotice('');
    try {
      const result = await sendTelegramAlert(id);
      setTelegramNotice(result.detail);
    } catch (err) {
      setTelegramNotice(err instanceof Error ? err.message : 'Telegram alert send failed');
    } finally {
      setSendingAlertId(null);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter === 'ALL') return true;
    return a.severity.toUpperCase() === severityFilter.toUpperCase();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white font-['Outfit'] tracking-tight">
              Early Warning & Alert Command
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              {alerts.length} Active Surveillance Flags
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time automated ecological risk alerts triggered by threshold violations and predictive deterioration models
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Filter className="w-4 h-4 text-cyan-400" />
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MODERATE">Moderate</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      <section className="border border-slate-800 bg-slate-950/60 rounded-2xl p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-bold text-white font-['Outfit']">Telegram Dispatch</h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  telegramStatus?.configured ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                }`}>
                  {telegramStatus?.configured ? 'BOT READY' : 'BOT MISSING'}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  telegramStatus?.chat_configured ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                }`}>
                  {telegramStatus?.chat_configured ? 'CHAT READY' : 'CHAT NEEDED'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {telegramStatus?.bot_username ? `@${telegramStatus.bot_username}` : 'Server-side Telegram alert channel'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:flex gap-2">
            <button onClick={handleTestBot} disabled={telegramBusy === 'test-bot'} className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 border border-slate-800 text-xs text-slate-200 font-semibold flex items-center justify-center gap-1.5">
              {telegramBusy === 'test-bot' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              Bot
            </button>
            <button onClick={handleDetectChats} disabled={telegramBusy === 'detect-chats'} className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 border border-slate-800 text-xs text-slate-200 font-semibold flex items-center justify-center gap-1.5">
              {telegramBusy === 'detect-chats' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Chats
            </button>
            <button onClick={handleSendTest} disabled={telegramBusy === 'send-test'} className="px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 disabled:opacity-60 border border-cyan-500/30 text-xs text-cyan-200 font-semibold flex items-center justify-center gap-1.5">
              {telegramBusy === 'send-test' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Test
            </button>
            <button onClick={handleSendDigest} disabled={telegramBusy === 'send-digest'} className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 disabled:opacity-60 border border-amber-500/30 text-xs text-amber-200 font-semibold flex items-center justify-center gap-1.5">
              {telegramBusy === 'send-digest' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BellRing className="w-3.5 h-3.5" />}
              Digest
            </button>
          </div>
        </div>

        {(telegramNotice || telegramChats.length > 0) && (
          <div className="mt-4 border-t border-slate-800 pt-3 space-y-2">
            {telegramNotice && (
              <div className="text-xs text-slate-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{telegramNotice}</span>
              </div>
            )}
            {telegramChats.length > 0 && (
              <div className="grid md:grid-cols-2 gap-2">
                {telegramChats.map((chat) => (
                  <div key={`${chat.chat_id}-${chat.update_id || ''}`} className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-white truncate">
                        {chat.title || chat.username || [chat.first_name, chat.last_name].filter(Boolean).join(' ') || chat.chat_type || 'Telegram chat'}
                      </span>
                      <span className="text-[10px] text-cyan-300 font-mono shrink-0">{chat.chat_id}</span>
                    </div>
                    {chat.message_preview && <p className="text-[11px] text-slate-400 mt-1 truncate">{chat.message_preview}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Main Alerts List */}
      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading system alerts...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AlertBanner
            alerts={filteredAlerts}
            onAcknowledge={handleAcknowledge}
            onSendTelegram={handleSendAlert}
            sendingAlertId={sendingAlertId}
          />
        </div>
      )}
    </div>
  );
};
