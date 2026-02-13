import { useState, useEffect } from "react";
import axios from "axios";
import "./planJourney.css";
import SuggestedRoutes from "../../components/suggestedRoutes/SuggestedRoutes";

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

  // 🔴 ADD THIS STATE: This was causing your error
  const [journeyResult, setJourneyResult] = useState(null); 

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

  const planJourney = async () => {
    if (!source || !destination) return;
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/journey/book", { from: source, to: destination });
      
      // 🟢 SAVE THE DATA: Update both segments and the full result
      setSegments(res.data.route || []);
      setJourneyResult(res.data); 

    } catch (err) {
      alert("Error finding route.");
    } finally {
      setLoading(false);
    }
  };

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
      />
    </div>
  );
}