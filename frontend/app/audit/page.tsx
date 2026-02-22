'use client';

/** Mock data for UI only - will be replaced with real data later */
const MOCK_AUDIT_EVENTS = [
  {
    id: 1,
    created_at: '2025-02-22 08:31:00',
    actor_name: 'John Doe',
    actor_role: 'Admin',
    actor_email: 'john@example.com',
    action: 'Changed ticket status',
    entity_type: 'ticket',
    entity_id: 57,
    entity_title: 'Login broken on Safari',
    before: 'open',
    after: 'in_progress',
  },
  {
    id: 2,
    created_at: '2025-02-22 08:15:00',
    actor_name: 'Jane Smith',
    actor_role: 'Admin',
    actor_email: 'jane@example.com',
    action: 'Assigned ticket',
    entity_type: 'ticket',
    entity_id: 57,
    entity_title: 'Login broken on Safari',
    before: null,
    after: 'Assigned to John Doe',
  },
  {
    id: 3,
    created_at: '2025-02-21 14:22:00',
    actor_name: 'Alice User',
    actor_role: 'User',
    actor_email: 'alice@example.com',
    action: 'Created ticket',
    entity_type: 'ticket',
    entity_id: 58,
    entity_title: 'Password reset not working',
    before: null,
    after: null,
  },
];

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

export default function AuditPage() {
  return (
    <main className="max-w-[1200px] mx-auto px-4 py-6">
      <div className="w-full max-w-[720px] mx-auto">
        <h1 className="text-2xl font-semibold text-[#e8eefc] m-0 mb-6">
          Audit Log
        </h1>

        <div className="flex flex-col">
          {MOCK_AUDIT_EVENTS.map((event) => {
            const { month, day, time } = formatAuditDate(event.created_at);
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
                    {event.actor_name} ({event.actor_role})
                  </span>
                  <span className="text-[#5a6478] mx-1.5">·</span>
                  <span className="text-[#4ade80]">{event.actor_email}</span>
                </p>
                <p className="m-0 text-base font-medium text-[#e8eefc] mb-1">
                  {event.action}
                </p>
                <p className="m-0 text-sm text-[#aab6d6] mb-1">
                  <span className="text-[#e8b86d]">
                    Ticket #{event.entity_id}
                  </span>
                  <span className="text-[#aab6d6]"> – </span>
                  <span className="text-[#e8eefc]">&quot;{event.entity_title}&quot;</span>
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
      </div>
    </main>
  );
}
