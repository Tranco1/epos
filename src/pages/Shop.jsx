// src/pages/Shop.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Shop() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [customerName, setCustomerName] = useState("");

  useEffect(() => {
    fetch("http://192.168.1.106:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        if (data.length > 0) setSelectedCategory(data[0].category);
      })
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  const categories = [...new Set(products.map((p) => p.category))];
  const filteredProducts = products.filter(
    (p) => p.category === selectedCategory
  );

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: Math.max(item.quantity + delta, 0) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const submitOrder = async () => {
    if (!customerName) {
      alert("Please enter your name before submitting the order.");
      return;
    }
    try {
      const res = await fetch("http://192.168.1.106:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_name: customerName, cart }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ Order placed! Order ID: ${data.order_id}`);
        setCart([]);
        setShowCart(false);
        setCustomerName("");
      } else {
        alert("❌ Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error placing order.");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🛍️ My Shop</h1>
        <Link
          to="/login"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          🔐 Login
        </Link>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap justify-center mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full ${
              selectedCategory === cat
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className="border rounded-xl p-4 shadow flex flex-col justify-between hover:shadow-lg transition-shadow"
          >
            <div>
              <img
                src={p.img || "https://via.placeholder.com/150?text=No+Image"}
                alt={p.name}
                className="w-full h-40 object-cover rounded-lg mb-3"
              />
              <h3 className="font-semibold text-lg">{p.name}</h3>
              <p className="text-gray-600">${Number(p.price).toFixed(2)}</p>
            </div>
            <button
              onClick={() => addToCart(p)}
              className="mt-3 bg-green-500 text-white py-1 rounded hover:bg-green-600"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      {/* Floating Cart Link */}
      <button
        onClick={() => setShowCart(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700"
      >
        🛒 View Cart ({cart.reduce((sum, i) => sum + i.quantity, 0)})
      </button>

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative">
            <button
              onClick={() => setShowCart(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4">🛒 Your Cart</h2>

            {cart.length === 0 ? (
              <p>No items in cart.</p>
            ) : (
              <ul className="mb-4">
                {cart.map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between items-center mb-2"
                  >
                    <div>
                      {item.name} (${item.price}) × {item.quantity}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="px-2 bg-red-500 text-white rounded"
                      >
                        -
                      </button>
                      <button
                        onClick={() => updateQuantity(item.id, +1)}
                        className="px-2 bg-blue-500 text-white rounded"
                      >
                        +
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="mb-3 font-semibold">
              Total: ${total.toFixed(2)}
            </div>

            <input
              type="text"
              placeholder="Enter your name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="border p-2 rounded w-full mb-3"
            />

            <button
              onClick={submitOrder}
              disabled={cart.length === 0}
              className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700"
            >
              Submit Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Shop;
