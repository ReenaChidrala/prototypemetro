import { useState, useEffect } from "react";
import axios from "axios";
import "./planJourney.css";
import SuggestedRoutes from "../../components/suggestedRoutes/SuggestedRoutes";
import BookingConfirmation from "../../components/bookingConfirmation/BookingConfirmation";
import { useNavigate } from "react-router-dom";

const LINE_COLORS = {
  L1: "#1f6feb", L2A: "#22c55e", L3: "#06b6d4", L4: "#a855f7", L7: "#f97316",
};

export default function PlanJourney() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [allStations, setAllStations] = useState([]);
  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSourceList, setShowSourceList] = useState(false);
  const [showDestList, setShowDestList] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  // 🔴 ADD THIS STATE: This was causing your error
  const [journeyResult, setJourneyResult] = useState(null); 

  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:5000/api/metro/stations")
      .then(res => {
        setAllStations(res.data);
      })
      .catch(err => console.error("Error loading stations:", err));
  }, []);

  useEffect(() => {
    const filtered = source.trim().length > 0 
      ? allStations.filter(s => s.name.toLowerCase().includes(source.toLowerCase()))
      : [];
    setSourceSuggestions(filtered);
  }, [source, allStations]);

  useEffect(() => {
    const filtered = destination.trim().length > 0 
      ? allStations.filter(s => s.name.toLowerCase().includes(destination.toLowerCase()) && s.name !== source)
      : [];
    setDestinationSuggestions(filtered);  
  }, [destination, allStations, source]);



  const handlePayment = async () => {
  // 1. Get user from localStorage (to get their phone/id)
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return alert("Please login to book a ticket");
  if (isPaying) return;

  try {
    setIsPaying(true);
    // 2. Create the Order on the backend (Locked Amount)
    const { data: orderData } = await axios.post("http://localhost:5000/api/payment/checkout", { 
      amount: journeyResult.totalFare 
    });

    const options = {
      key: "rzp_test_SMOfc3E3F8KjOX", // Your Key ID
      amount: orderData.order.amount,
      currency: "INR",
      name: "Mumbai Metro",
      description: `Ticket: ${source} to ${destination}`,
      order_id: orderData.order.id,
      handler: async function (response) {
        // 3. This runs only IF payment is successful
        try {
          await axios.post("http://localhost:5000/api/auth/update-balance", {
            userId: user.id,
            amount: -journeyResult.totalFare // Deducting the exact fare
          });
          
          // 4. Now move to the Booking Confirmation screen
          setIsBooked(true); 
        } catch (err) {
          alert("Payment verified but failed to update ticket status.");
        }
      },
      prefill: {
        name: user.name,
        contact: user.mobile // Prefills their login number
      },
      theme: { color: "#1f6feb" }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (error) {
    console.error("Payment failed", error);
    alert("Could not start payment. Check your internet or server.");
  }
};

const planJourney = async () => {
  if (!source || !destination) return;
  try {
    setLoading(true);
    setIsBooked(false);
    const res = await axios.post("http://localhost:5000/api/journey/book", { from: source, to: destination });
    
    // 🔍 DEBUG LOGS
    console.log("Full API Response:", res.data);
    console.log("Route Segments:", res.data.route);
    
    if (res.data.route.length > 1) {
      console.log(`✅ Interchange detected! Total segments: ${res.data.route.length}`);
      res.data.route.forEach((seg, i) => {
        console.log(`Segment ${i + 1}: ${seg.from} to ${seg.to} via ${seg.line}`);
      });
    } else {
      console.log("ℹ️ No interchange: This is a single-line journey.");
    }
const finalData = {
      ...res.data,
      from: source,      // 🟢 Add this
      to: destination    // 🟢 Add this
    };
    setSegments(res.data.route || []);
    setJourneyResult(finalData); 

  } catch (err) {
    console.error("Error finding route:", err);
    alert("Error finding route.");
  } finally {
    setLoading(false);
  }
};


const handleStartJourney = () => {
  navigate('/QRScan', { state: { journeyId: journeyResult.journeyId } });
    // Navigate to your QR scanning page or logic
    console.log("Starting journey...");
  };

if (isBooked && journeyResult) {
    return (
      <BookingConfirmation 
        journeyData={journeyResult} 
        onStart={handleStartJourney} 
      />
    );
  }

  return (
    <div className="page-container">
    <div className="card">
      <h2>Plan Your Journey</h2>

      <div className="autocomplete">
        <input
          id="source-input"
          name="sourceStation"
          placeholder="Start typing source..."
          value={source}
          onFocus={() => setShowSourceList(true)}
          onBlur={() => setTimeout(() => setShowSourceList(false), 250)}
          onChange={(e) => setSource(e.target.value)}
        />
        {showSourceList && sourceSuggestions.length > 0 && (
          <ul className="suggestions">
            {sourceSuggestions.map((s) => (
              <li key={s._id} onMouseDown={(e) => {
                e.preventDefault();
                setSource(s.name);
                setShowSourceList(false);
              }}>
                {s.name} <span className="line-badge" style={{ background: LINE_COLORS[s.line] }}>{s.line}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="autocomplete">
        <input
          id="destination-input"
          name="destinationStation"
          placeholder="Start typing destination..."
          value={destination}
          onFocus={() => setShowDestList(true)}
          onBlur={() => setTimeout(() => setShowDestList(false), 250)}
          onChange={(e) => setDestination(e.target.value)}
        />
        {showDestList && destinationSuggestions.length > 0 && (
          <ul className="suggestions">
            {destinationSuggestions.map((d) => (
              <li key={d._id} onMouseDown={(e) => {
                e.preventDefault();
                setDestination(d.name);
                setShowDestList(false);
              }}>
                {d.name} <span className="line-badge" style={{ background: LINE_COLORS[d.line] }}>{d.line}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button onClick={planJourney} disabled={loading || !source || !destination}>
        {loading ? "Finding Route..." : "Find Route"}
      </button>
      </div>

      {/* This will now work because journeyResult is defined */}
      <SuggestedRoutes 
        journeyResult={journeyResult} 
        segments={segments} 
        source={source} 
        destination={destination} 
        onBook={handlePayment}
      />
    </div>
  );
}