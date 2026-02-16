export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main>
      <h1>Ticket Detail</h1>
      <p>Ticket detail + notes + assign will go here. (Protected)</p>
      <p>ID: {id}</p>
    </main>
  );
}
