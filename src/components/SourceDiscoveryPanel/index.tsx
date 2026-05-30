import React, { useEffect, useState, useCallback } from 'react';
import {
  generateSourceCandidates,
  generateSearchTerms,
} from '../../utils/sourceDiscovery';
import type { EventLike } from '../../utils/sourceDiscovery';
import type { SourceCandidate, InboxEntry, UrlStatus } from '../../types/source';

interface Props {
  // Timeline で使っている既存の Event 型を渡してよい（EventLike と互換）
  event: EventLike | null;
}

const STATUS_LABEL: Record<UrlStatus, string> = {
  unchecked: '未確認',
  checking: '確認中…',
  ok: '200 ✓',
  '403': '403 ⚠',
  '404': '404 ✗',
  timeout: 'TOut',
  error: 'ERR',
};

const STATUS_COLOR: Record<UrlStatus, string> = {
  unchecked: '#4a5568',
  checking: '#f5a623',
  ok: '#27ae60',
  '403': '#e67e22',
  '404': '#e74c3c',
  timeout: '#7f8c8d',
  error: '#c0392b',
};

export const SourceDiscoveryPanel: React.FC<Props> = ({ event }) => {
  const [candidates, setCandidates] = useState<SourceCandidate[]>([]);
  const [terms, setTerms] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [registered, setRegistered] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(true);

  // カードが変わるたびに候補を再生成
  useEffect(() => {
    if (!event) {
      setCandidates([]);
      setTerms([]);
      setRegistered(new Set());
      return;
    }
    setCandidates(generateSourceCandidates(event));
    setTerms(generateSearchTerms(event));
    setRegistered(new Set());
    setOpen(true);
  }, [event?.id, event?.title]);

  // 1件チェック
  const checkOne = useCallback(async (id: string, url: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, urlStatus: 'checking' } : c))
    );
    try {
      const raw = (await (window as any).electronAPI.checkUrlStatus(url)) as string;
      const s: UrlStatus =
        raw === '200' || raw === 'ok'
          ? 'ok'
          : raw === '403' || raw === '401'
          ? '403'
          : raw === '404'
          ? '404'
          : raw === 'timeout'
          ? 'timeout'
          : 'error';
      setCandidates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, urlStatus: s } : c))
      );
    } catch {
      setCandidates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, urlStatus: 'error' } : c))
      );
    }
  }, []);

  // 全件チェック（600ms 間隔）
  const checkAll = useCallback(async () => {
    if (isChecking) return;
    setIsChecking(true);
    for (const c of candidates) {
      await checkOne(c.id, c.url);
      await new Promise((r) => setTimeout(r, 600));
    }
    setIsChecking(false);
  }, [candidates, checkOne, isChecking]);

  // インボックスに登録
  const register = useCallback(
    async (c: SourceCandidate) => {
      if (!event || registered.has(c.id)) return;
      const entry: InboxEntry = {
        id: `inbox-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        eventId: event.id ?? null,
        eventTitle: event.title,
        archiveName: c.archiveName,
        url: c.url,
        query: c.query,
        sourceType: c.sourceType,
        note: c.note,
        urlStatus: c.urlStatus,
        addedAt: new Date().toISOString(),
        userMemo: '',
      };
      try {
        await (window as any).electronAPI.addToInbox(entry);
        setRegistered((prev) => new Set(prev).add(c.id));
      } catch (e) {
        console.error('inbox error:', e);
      }
    },
    [event, registered]
  );

  // 外部ブラウザで開く
  const openUrl = (url: string) => {
    const api = (window as any).electronAPI;
    if (api?.openExternal) {
      api.openExternal(url);
    } else {
      window.open(url, '_blank');
    }
  };

  if (!event) return null;

  return (
    <div
      style={{
        marginTop: 20,
        border: '1px solid #1e2a3a',
        borderRadius: 6,
        background: '#080c14',
        fontFamily: '"Courier New", monospace',
        fontSize: 12,
      }}
    >
      {/* ─ ヘッダー ─ */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 14px',
          borderBottom: open ? '1px solid #1a2535' : 'none',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <span style={{ color: '#5ab4f0', letterSpacing: 1 }}>
          ▸ AUTO SOURCE DISCOVERY
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {open && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                checkAll();
              }}
              disabled={isChecking}
              style={{
                fontSize: 11,
                padding: '2px 10px',
                background: isChecking ? '#111' : '#0a1f35',
                border: '1px solid #1e3a5a',
                color: isChecking ? '#555' : '#5ab4f0',
                borderRadius: 3,
                cursor: isChecking ? 'default' : 'pointer',
              }}
            >
              {isChecking ? '確認中…' : `全件確認 (${candidates.length})`}
            </button>
          )}
          <span style={{ color: '#3a5a7a', fontSize: 11 }}>{open ? '▲' : '▼'}</span>
        </div>
      </div>

      {open && (
        <div style={{ padding: '10px 14px' }}>
          {/* ─ 検索語チップ ─ */}
          <div
            style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}
          >
            {terms.map((t, i) => (
              <span
                key={i}
                style={{
                  fontSize: 10,
                  padding: '2px 8px',
                  background: '#0d1a2a',
                  border: '1px solid #1e3a5a',
                  color: '#4a8aaa',
                  borderRadius: 10,
                }}
              >
                {t}
              </span>
            ))}
          </div>

          {/* ─ 候補リスト ─ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {candidates.map((c) => (
              <div
                key={c.id}
                style={{
                  background: '#0a1020',
                  border: '1px solid #1a2535',
                  borderRadius: 4,
                  padding: '7px 10px',
                }}
              >
                {/* 行1：アーカイブ名 + ステータス */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 3,
                  }}
                >
                  <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: 9,
                        padding: '1px 5px',
                        borderRadius: 2,
                        background:
                          c.sourceType === 'primary' ? '#0a2015' : '#1a1a0a',
                        color:
                          c.sourceType === 'primary' ? '#3a9a5a' : '#9a8a2a',
                        border: `1px solid ${
                          c.sourceType === 'primary' ? '#1a5a2a' : '#4a3a0a'
                        }`,
                      }}
                    >
                      {c.sourceType === 'primary' ? '一次' : '二次'}
                    </span>
                    <span style={{ color: '#b0c8e0' }}>{c.archiveName}</span>
                  </div>
                  <span
                    style={{ fontSize: 11, color: STATUS_COLOR[c.urlStatus] }}
                  >
                    {STATUS_LABEL[c.urlStatus]}
                  </span>
                </div>

                {/* 行2：URL */}
                <div
                  onClick={() => openUrl(c.url)}
                  title={c.url}
                  style={{
                    fontSize: 10,
                    color: '#3a7aaa',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginBottom: 4,
                  }}
                >
                  {c.url}
                </div>

                {/* 行3：備考 */}
                <div
                  style={{ color: '#3a4a5a', fontSize: 10, marginBottom: 6 }}
                >
                  {c.note}
                </div>

                {/* 行4：ボタン */}
                <div style={{ display: 'flex', gap: 5 }}>
                  <button
                    onClick={() => checkOne(c.id, c.url)}
                    disabled={c.urlStatus === 'checking'}
                    style={{
                      fontSize: 10,
                      padding: '1px 8px',
                      background: '#0a1525',
                      border: '1px solid #1e2a3a',
                      color: '#5a7a9a',
                      borderRadius: 2,
                      cursor: 'pointer',
                    }}
                  >
                    確認
                  </button>
                  <button
                    onClick={() => register(c)}
                    disabled={registered.has(c.id)}
                    style={{
                      fontSize: 10,
                      padding: '1px 8px',
                      background: registered.has(c.id) ? '#0a1a0a' : '#0a1525',
                      border: `1px solid ${
                        registered.has(c.id) ? '#1a4a1a' : '#1e3a5a'
                      }`,
                      color: registered.has(c.id) ? '#3a8a4a' : '#5ab4f0',
                      borderRadius: 2,
                      cursor: registered.has(c.id) ? 'default' : 'pointer',
                    }}
                  >
                    {registered.has(c.id) ? '登録済 ✓' : '登録'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
