'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAuditEvents } from '@/lib/api';

type AuditEvent = {
  id: number;
  actor_user_id: number;
  action: string;
  entity_type: string;
  entity_id: number;
  before: string | null;
  after: string | null;
  created_at: string;
  actor_name: string | null;
  actor_email: string | null;
  actor_role: string | null;
};

const ACTION_LABELS: Record<string, string> = {
  ticket_status_updated: 'Changed ticket status',
  ticket_assigned: 'Assigned ticket',
  ticket_unassigned: 'Unassigned ticket',
  ticket_created: 'Created ticket',
  ticket_title_body_updated: 'Updated ticket',
  note_created: 'Added note',
  escalated_ticket: 'Escalated ticket',
  user_registered: 'Registered',
  user_logged_in: 'Logged in',
  user_logged_out: 'Logged out',
};

function formatAuditDate(dateStr: string) {
  const date = new Date(dateStr.replace(' ', 'T'));
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();
  const time = date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return { month, day, time };
}

function getEntityTitle(event: AuditEvent): string | null {
  if (event.action === 'ticket_created' && event.after) {
    try {
      const parsed = JSON.parse(event.after) as { title?: string };
      return parsed.title ?? null;
    } catch {
      return null;
    }
  }
  return null;
}

function getEntityLabel(event: AuditEvent): string {
  if (event.entity_type === 'ticket') return `Ticket #${event.entity_id}`;
  if (event.entity_type === 'notes') return `Note #${event.entity_id}`;
  return `${event.entity_type} #${event.entity_id}`;
}

export default function AuditPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    if (!user && !loading) {
      router.replace('/login');
    }
  }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    setLoadingEvents(true);
    getAuditEvents(0)
      .then((res) => {
        const data = (res.data ?? []) as AuditEvent[];
        setEvents(data);
        setHasMore(data.length === 50);
        setOffset(data.length);
      })
      .catch((error) => {
        console.error(error);
        setHasMore(false);
      })
      .finally(() => setLoadingEvents(false));
  }, [user]);

  function handleLoadMore() {
    if (!hasMore || loadingEvents) return;
    setLoadingEvents(true);
    getAuditEvents(offset)
      .then((res) => {
        const data = (res.data ?? []) as AuditEvent[];
        setEvents((prev) => [...prev, ...data]);
        setHasMore(data.length === 50);
        setOffset((prev) => prev + data.length);
      })
      .catch((error) => {
        console.error(error);
        setHasMore(false);
      })
      .finally(() => setLoadingEvents(false));
  }

  const actionLabel = (action: string) =>
    ACTION_LABELS[action] ?? action.replace(/_/g, ' ');

  return (
    <main className="max-w-[1200px] mx-auto px-4 py-6">
      <div className="w-full max-w-[720px] mx-auto">
        <h1 className="text-2xl font-semibold text-[#e8eefc] m-0 mb-6">
          Audit Log
        </h1>

        {loadingEvents && events.length === 0 ? (
          <p className="text-[#aab6d6]">Loading...</p>
        ) : (
          <>
            <div className="flex flex-col">
              {events.map((event) => {
                const { month, day, time } = formatAuditDate(event.created_at);
                const entityTitle = getEntityTitle(event);
                const entityLabel = getEntityLabel(event);
                return (
                  <article
                    key={event.id}
                    className="py-4 border-b border-[#1e2a44] last:border-b-0"
                  >
                    <p className="m-0 text-sm text-[#aab6d6] mb-1">
                      <span className="text-[#e8b86d]">
                        {month} {day}
                      </span>
                      <span className="text-[#e8b86d]">, {time}</span>
                      <span className="text-[#5a6478] mx-1.5">·</span>
                      <span className="text-[#e8eefc]">
                        {event.actor_name ?? 'Unknown'} (
                        {event.actor_role ?? 'unknown'})
                      </span>
                      <span className="text-[#5a6478] mx-1.5">·</span>
                      <span className="text-[#4ade80]">
                        {event.actor_email ?? '—'}
                      </span>
                    </p>
                    <p className="m-0 text-base font-medium text-[#e8eefc] mb-1">
                      {actionLabel(event.action)}
                    </p>
                    <p className="m-0 text-sm text-[#aab6d6] mb-1">
                      <span className="text-[#e8b86d]">{entityLabel}</span>
                      {entityTitle && (
                        <>
                          <span className="text-[#aab6d6]"> – </span>
                          <span className="text-[#e8eefc]">
                            &quot;{entityTitle}&quot;
                          </span>
                        </>
                      )}
                    </p>
                    {event.before != null && event.after != null && (
                      <p className="m-0 text-sm text-[#aab6d6]">
                        <span className="text-[#e8eefc]">{event.before}</span>
                        <span className="text-[#5a6478] mx-1">→</span>
                        <span className="text-[#e8eefc]">{event.after}</span>
                      </p>
                    )}
                    {event.before == null && event.after != null && (
                      <p className="m-0 text-sm text-[#aab6d6]">
                        {event.after}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>

            {hasMore && (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingEvents}
                  className="py-2 px-4 rounded-[10px] border border-[#2a3b62] bg-[#1c2a47] text-[#e8eefc] text-sm font-medium cursor-pointer hover:brightness-110 transition-[filter] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingEvents ? 'Loading...' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
