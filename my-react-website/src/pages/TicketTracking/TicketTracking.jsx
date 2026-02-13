export default function TicketTracking() {
  const steps = [
    "Ticket Generated",
    "Entry Scan Completed",
    "Interchange Scan Completed",
    "Exit Scan Completed"
  ];

  return (
    <div  className="tracking-step" style={{ padding: 20 }}>
      <h2>Ticket Tracking</h2>

      {steps.map((step, index) => (
        <p key={index}>✅ {step}</p>
      ))}
    </div>
  );
}
