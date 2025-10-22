import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import "purecss/build/pure-min.css";

function Shop() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopName, setShopName] = useState("🛍️ The Golden Draon");
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Safely get user from localStorage
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  // Fetch dealer info (shop name)
  useEffect(() => {
    const fetchDealer = async () => {
      try {
          const res = await fetch(
            `http://192.168.1.107:5000/api/dealer`
          );

          const data = await res.json();
          if (data?.tname) {
            setShopName(`🛍️ ${data.tname}`);
       console.log("shop name",setShopName);
          }
        
      } catch (err) {
        console.error("Error fetching dealer:", err);
      }
    };

    fetchDealer();
  }, [user?.dealer_id]);


  // ✅ Fetch products on load
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://192.168.1.107:5000/api/products");
        const data = await res.json();

        setProducts(data);
        const cats = ["All", ...new Set(data.map((p) => p.category))];
        setCategories(cats);
      } catch (err) {
        console.error("❌ Error fetching products:", err);
      }
    };

    fetchProducts();
  }, []);

  // 🛒 Add to cart
  const addToCart = (product) => {
    const stored = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = stored.find((p) => p.id === product.id);
    const newCart = existing
      ? stored.map((p) =>
          p.id === product.id ? { ...p, qty: p.qty + 1 } : p
        )
      : [...stored, { ...product, qty: 1 }];

    localStorage.setItem("cart", JSON.stringify(newCart));
    alert(`${product.name} added to cart!`);
  };

  // 🚪 Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // 🧩 Filter products
  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

  // ✅ Utility for menu link styles
  const isActive = (path) =>
    location.pathname === path
      ? "text-blue-700 font-semibold underline"
      : "text-gray-700 hover:text-blue-700";

  const handleLinkClick = () => setMenuOpen(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🌟 NAVIGATION BAR */}
<nav className="w-full bg-white shadow-md px-6 py-3 flex justify-between items-center relative">
  {/* LEFT: Brand */}

<Link to="/" className="text-xl font-bold text-blue-600">
  {shopName}
</Link>


  {/* RIGHT: Cart + User Controls + Hamburger */}
  <div className="flex items-center space-x-4 ml-auto">
    {/* Cart link */}
    <Link
      to="/cart"
      className="text-green-600 hover:text-green-800 font-medium"
    >
      🛒 Cart
    </Link>

    {/* Optional user greeting + logout (hide on mobile) */}
    {user ? (
      <>
        <span className="text-gray-700 hidden sm:inline">
          👋 Welcome, {user.username}
        </span>
        <button
          onClick={handleLogout}
          className="text-red-600 hover:text-red-800 font-medium hidden sm:inline"
        >
          Logout
        </button>
      </>
    ) : (
      <Link to="/login" className={isActive("/login")}>
        🔐 Login
      </Link>
    )}

    {/* Hamburger icon (only visible on mobile) */}
    <button
      className="text-gray-700 md:hidden"
      onClick={() => setMenuOpen(!menuOpen)}
    >
      {menuOpen ? <X size={26} /> : <Menu size={26} />}
    </button>
  </div>
</nav>

  {/* MOBILE MENU (unchanged) */}
  {menuOpen && (
    <div className="absolute top-full left-0 w-full bg-white shadow-lg border-t z-50 flex flex-col p-4 space-y-3">
      <Link to="/" className={isActive("/")} onClick={() => setMenuOpen(false)}>
        🏠 Shop
      </Link>
      <Link
        to="/about"
        className={isActive("/about")}
        onClick={() => setMenuOpen(false)}
      >
        ℹ️ About
      </Link>

      {user && (
        <>
          <Link
            to="/order-history"
            className={isActive("/order-history")}
            onClick={() => setMenuOpen(false)}
          >
            📦 Order History
          </Link>
          <Link
            to="/profile"
            className={isActive("/profile")}
            onClick={() => setMenuOpen(false)}
          >
            👤 Manage Profile
          </Link>
        </>
      )}

      <hr className="border-gray-200" />

      {user ? (
        <button
          onClick={() => {
            handleLogout();
            setMenuOpen(false);
          }}
          className="text-red-600 hover:text-red-800 text-left"
        >
          🚪 Logout
        </button>
      ) : (
        <Link
          to="/login"
          className={isActive("/login")}
          onClick={() => setMenuOpen(false)}
        >
          🔐 Login
        </Link>
      )}
    </div>
  )}

      {/* 🗂️ CATEGORY FILTER */}
      <div className="p-4">
        {categories.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full border transition-colors ${
                  activeCategory === cat
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white hover:bg-blue-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mb-4">Loading categories...</p>
        )}

{/* 🧾 PRODUCT GRID */}
{filteredProducts.length === 0 ? (
  <p style={{ textAlign: "center", color: "#666" }}>No products found.</p>
) : (
  <div
    className="pure-g"
    style={{
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "1rem",
      padding: "1rem",
    }}
  >
    {filteredProducts.map((p) => (
      <div
        key={p.id}
        className="pure-u-1 pure-u-sm-1-2 pure-u-md-1-3 pure-u-lg-1-4"
        style={{
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
          src={p.img || "https://via.placeholder.com/200?text=No+Image"}
          alt={p.name}
          style={{
            width: "100%",
            height: "150px",
            objectFit: "scale-down",
            borderRadius: "4px",
            marginBottom: "10px",
          }}
        />

        <h3
          style={{
            fontWeight: "600",
            fontSize: "1.1rem",
            marginBottom: "0.25rem",
          }}
        >
          {p.name}
        </h3>

        <p style={{ color: "#555", marginBottom: "0.75rem" }}>
          ${Number(p.price).toFixed(2)}
        </p>

        <button
          className="pure-button pure-button-primary"
          style={{
            backgroundColor: "#1f8dd6",
            color: "white",
            borderRadius: "6px",
            padding: "0.4rem 1rem",
            fontWeight: "bold",
            cursor: "pointer",
          }}
          onClick={() => addToCart(p)}
        >
          Add to Cart
        </button>
      </div>
    ))}
  </div>
)}

      </div>
    </div>
  );
}

export default Shop;
