import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "purecss/build/pure-min.css";

const OrderDetails = () => {
  const { orderId } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://192.168.1.107:5000/api/orders/${orderId}/items`);
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error("Error fetching order items:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [orderId]);

  const reorder = () => {
    const cart = items.map((item) => ({
      id: item.product_id,
      name: item.name,
      price: item.price,
      qty: item.quantity,
      img: item.img,
    }));
    localStorage.setItem("cart", JSON.stringify(cart));
    navigate("/cart");
  };

  return (

    <div className="pure-g" style={{ padding: "2rem", justifyContent: "center" }}>
      <div className="pure-u-1 pure-u-md-3-4 pure-u-lg-2-3">
        <h1
          style={{
            textAlign: "center",
            color: "#1f8dd6",
            marginBottom: "1.5rem",
          }}
        >Order #{orderId}</h1>
</div>
      {loading && <p>Loading...</p>}

      {!loading && items.length === 0 && <p>No items found for this order.</p>}

      {!loading && items.length > 0 && (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.product_id}
                      className="pure-u-1 pure-u-sm-1-2 pure-u-md-1-3 pure-u-lg-1-4"
        style={{
          color: "#555",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "1rem",
          backgroundColor: "#fff",
          textAlign: "center",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-3px)";
          e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
        }}
            >
              <img
//                src={item.img || "https://via.placeholder.com/64"}
                  src={item.img.startsWith("http")
                  ? item.img
                  : `http://192.168.1.107:5173${item.img}`
                  }
                alt={item.name}
                style={{
                width: "100%",
                height: "40px",
                objectFit: "scale-down",
                borderRadius: "4px",
                marginBottom: "10px",
                }}
              />
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-gray-500">
                  Qty: {item.quantity} | ${Number(item.price).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <button
      className="pure-button pure-button-primary"
      style={{
        backgroundColor: "#1f8dd6",
        color: "#fff",
        borderRadius: "6px",
        padding: "0.3rem 0.8rem",
      }}
          onClick={reorder}
        >
          Reorder These Items
        </button>
      )}
    </div>
  );
};

export default OrderDetails;
