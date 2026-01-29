import React, { useState, useEffect } from 'react';
import { Play, Database } from 'lucide-react';
import { ExecuteQuery, GetActiveSessions } from '../../../wailsjs/go/connection/ConnectionService';
import { connection } from '../../../wailsjs/go/models';
import { ResultTable } from '../results/ResultTable';
import { useTranslation } from 'react-i18next';

interface SqlEditorProps {
    sessionId: string | null;
}

export const SqlEditor: React.FC<SqlEditorProps> = ({ sessionId }) => {
    const { t } = useTranslation();
    const [query, setQuery] = useState('SELECT 1');
    const [result, setResult] = useState<connection.QueryResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sessionInfo, setSessionInfo] = useState<connection.SessionSummary | null>(null);

    useEffect(() => {
        if (sessionId) {
            fetchSessionInfo();
        }
    }, [sessionId]);

    const fetchSessionInfo = async () => {
        try {
            const sessions = await GetActiveSessions();
            const info = sessions.find(s => s.id === sessionId);
            if (info) {
                setSessionInfo(info);
            }
        } catch (err) {
            console.error("Failed to fetch session info:", err);
        }
    };

    const handleRun = async () => {
        if (!sessionId) {
            setError(t("app.editor.no_session_error", "No active session selected"));
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await ExecuteQuery(sessionId, query);
            setResult(res);
            if (res.error) setError(res.error);
        } catch (err: any) {
            setError(err.toString());
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-900 text-white animate-in fade-in duration-300">
            {/* Session Summary Header */}
            <div className="p-4 bg-gray-800 border-b border-gray-700 flex flex-wrap gap-6 items-center shadow-md relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-green-500/10 rounded-lg border border-green-500/20">
                        <Database size={24} className="text-green-500" />
                    </div>
                    <div>
                        <div className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em]">{t("app.editor.live_session")}</div>
                        <div className="text-xl font-bold text-gray-100">{sessionInfo?.profile_name || t("app.loading")}</div>
                    </div>
                </div>

                <div className="flex gap-6 border-l border-gray-700 pl-8 h-10 items-center">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{t("app.editor.status")}</span>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-green-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            {t("app.editor.connected")}
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{t("app.editor.session_started")}</span>
                        <div className="text-xs font-semibold text-gray-300">
                            {sessionInfo ? new Date(sessionInfo.connected_at).toLocaleTimeString() : '--:--'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-gray-800 p-2 flex items-center gap-2 border-b border-gray-700 shadow-sm">
                <button 
                    onClick={handleRun}
                    disabled={loading || !sessionId}
                    className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 rounded font-medium disabled:opacity-50 text-white text-sm transition-colors"
                >
                    <Play size={14} fill="currentColor" /> {t("app.editor.run_query")}
                </button>
                <div className="h-4 w-[1px] bg-gray-700 mx-2" />
                <div className="text-xs text-gray-500 font-mono">
                    ID: {sessionId?.substring(0, 8)}
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 min-h-[200px] relative">
                <textarea
                    className="w-full h-full bg-gray-900 text-gray-100 p-4 font-mono outline-none resize-none text-sm leading-relaxed"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder={t("app.editor.placeholder", "Write your SQL here...")}
                    spellCheck={false}
                />
            </div>

            {/* Results Pane */}
            <div className="h-1/2 border-t border-gray-700 bg-gray-950 flex flex-col shadow-inner">
                <div className="bg-gray-900/50 p-1 px-3 border-b border-gray-800 text-[10px] uppercase font-bold text-gray-500 tracking-widest flex justify-between items-center">
                    <span>{t("app.editor.results")}</span>
                    {loading && <span className="animate-pulse text-blue-400">{t("app.editor.executing")}</span>}
                </div>
                <div className="flex-1 overflow-auto">
                    {error && (
                        <div className="p-4 text-red-400 text-sm font-mono whitespace-pre-wrap bg-red-500/5">
                            <div className="font-bold mb-1 underline">{t("app.editor.error")}:</div>
                            {error}
                        </div>
                    )}
                    {result && !result.error && <ResultTable result={result} />}
                    {!result && !error && !loading && (
                        <div className="h-full flex items-center justify-center text-gray-600 text-sm italic">
                            {t("app.editor.empty_results")}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
