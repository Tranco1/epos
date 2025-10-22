import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "purecss/build/pure-min.css";

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  // ✅ Fetch user's orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `http://192.168.1.107:5000/api/orders?id=${user.id}`
        );
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error("❌ Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.id]);

  // 🧭 Navigate to order details
  const viewDetails = (orderId) => {
    navigate(`/order-details/${orderId}`);
  };

  if (loading) {
    return <p style={{ textAlign: "center", color: "#555" }}>Loading...</p>;
  }

  if (!user) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <h2>Please log in to view your order history</h2>
        <Link to="/login" className="pure-button pure-button-primary">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="pure-g" style={{ padding: "2rem", justifyContent: "center" }}>
      <div className="pure-u-1 pure-u-md-3-4 pure-u-lg-2-3">
        <h1
          style={{
            textAlign: "center",
            color: "#1f8dd6",
            marginBottom: "1.5rem",
          }}
        >
          📦 Order History
        </h1>

        {orders.length === 0 ? (
          <p style={{ textAlign: "center", color: "#555" }}>
            You have no past orders.
          </p>
        ) : (
          <table
            className="pure-table pure-table-horizontal"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "#fff",
              borderRadius: "8px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
              overflow: "hidden",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f7f7f7" }}>
                <th>ID</th>
                <th>Date</th>
                <th>Total ($)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  style={{
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f9f9f9")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "white")
                  }
                >
                  <td>{order.id}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>{Number(order.total).toFixed(2)}</td>
                  <td>{order.status || "Completed"}</td>
                  <td>
                    <button
                      className="pure-button pure-button-primary"
                      style={{
                        backgroundColor: "#1f8dd6",
                        color: "#fff",
                        borderRadius: "6px",
                        padding: "0.3rem 0.8rem",
                      }}
                      onClick={() => viewDetails(order.id)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default OrderHistory;
