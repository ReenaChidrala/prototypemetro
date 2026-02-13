import { useLocation, useNavigate } from "react-router-dom";

export default function Payment() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const handlePayment = () => {
    // simulate payment success
    navigate("/qr", { state });
  };

  return (
    <div className="card">
      <h2>Payment</h2>

      <p>Total Segments: {state.segments.length}</p>
      <p>Total Fare: ₹{state.segments.length * 20}</p>

      <button onClick={handlePayment}>Pay & Generate QR</button>
    </div>
  );
}
