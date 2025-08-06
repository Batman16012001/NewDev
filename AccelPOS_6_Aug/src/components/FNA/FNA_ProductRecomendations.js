import React, { useEffect, useState } from "react";
import SidebarLayout from "../Dashboard/Template";
import { useNavigate } from "react-router-dom";
import { findRecordById } from "../../db/indexedDB";
import { Button, Card } from "react-bootstrap";

const FNA_ProductRecomendations = () => {
  const [goalPriorities, setGoalPriorities] = useState([]);
  const [recommendations, setRecommendations] = useState({});
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const fnaId = sessionStorage.getItem("fnaId");

      try {
        const goalRecord = await findRecordById("al_fna_goals", fnaId);
        const rawGoals = goalRecord?.result?.goals || {};
        const priorities = goalRecord?.result?.priorities || {};

        const readableGoalMap = {
          childrenEducation: "Children Education",
          marraige: "Marraige",
          healthLifestyle: "Health & Life Style",
          wealthPlanning: "Wealth Planning",
          retirementPlanning: "Retirement Planning",
          protection: "Protection Plan",
        };

        // Build payload as required by backend
        const payloadGoals = Object.entries(rawGoals)
          .filter(([_, selected]) => selected)
          .map(([key]) => ({
            goalsname: readableGoalMap[key] || key,
            priority: Number(priorities[key] || 0),
          }))
          .filter((g) => g.priority > 0)
          .sort((a, b) => a.priority - b.priority);

        setGoalPriorities(payloadGoals);

        const payload = { goals: payloadGoals };
        console.log("Payload being sent:", payload);

        // Use axios for POST request
        const res = await fetch(
          "http://192.168.2.55:5000/api/fna/productRecommendation",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        const data = await res.json();
        setRecommendations(data || {});
      } catch (err) {
        console.error("Failed to fetch product recommendations", err);
      }
    };

    fetchData();
  }, [navigate]); // Added navigate to dependency array as it's used inside

  const handleProductClick = (productName) => {
    // Navigate to product screen (adjust route if needed)
    navigate(`/insurance-products/${encodeURIComponent(productName)}`);
  };

  return (
    <SidebarLayout>
      <div className="customer-container p-4">
        {goalPriorities.map((goal) => {
          const solutions =
            recommendations[goal.goalsname]?.regular_solution || "";
          return (
            <Card className="mb-4 p-3 shadow-sm" key={goal.goalsname}>
              <h5>
                {goal.goalsname} (Priority {goal.priority})
              </h5>
              {solutions ? (
                <ul className="mt-2">
                  {solutions.split("|").map((product, idx) => (
                    <li key={idx}>
                      <Button
                        variant="link"
                        className="p-0 text-primary"
                        onClick={() => handleProductClick(product.trim())}
                      >
                        {product.trim()}
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No recommendations found.</p>
              )}
            </Card>
          );
        })}
        <div className="mt-4 text-center"></div>
        {!isKeyboardVisible && (
          <div className="iosfixednextprevbutton">
            <div className="fixednextprevbutton d-flex justify-content-between">
              <button
                type="button"
                className="btn btnprev"
                onClick={() => navigate("/fnasignature")}
              >
                Prev
              </button>
              <Button
                variant="btn otherproduct"
                // onClick={() => navigate("/insurance-products/all")}
              >
                Other Product Solutions
              </Button>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default FNA_ProductRecomendations;
