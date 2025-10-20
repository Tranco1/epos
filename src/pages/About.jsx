import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "purecss/build/pure-min.css";

export default function About() {
  return (

    <div>
    <h1> "my About" </h1>
<div class="pure-menu custom-restricted-width">
    <span class="pure-menu-heading">My App Menu</span>
    <ul class="pure-menu-list">
        <li class="pure-menu-item">
            <a href="/login" class="pure-menu-link">Login</a>
        </li>
        <li class="pure-menu-item">
            <a href="/shop" class="pure-menu-link">Continue Shopping</a>
        </li>
        <li class="pure-menu-item">
            <a href="/order-history" class="pure-menu-link">Order History</a>
        </li>
        <li class="pure-menu-item">
            <a href="/profile" class="pure-menu-link">Manage Profile</a>
        </li>
        <li class="pure-menu-heading">More Sites</li>
        <li class="pure-menu-item">
            <a href="#" class="pure-menu-link">Games</a>
        </li>
        <li class="pure-menu-item">
            <a href="#" class="pure-menu-link">News</a>
        </li>
        <li class="pure-menu-item">
            <a href="#" class="pure-menu-link">OMG!</a>
        </li>
    </ul>
</div>

    <img
      src="/img/1/chicken-chow-mein-recipe.jpg"
      alt="Example"
      style={{
        width: "200px",    // fixed width
        height: "150px",   // fixed height
        objectFit: "cover" // crop/scale to fit nicely
      }}
    />
    </div> 


);
}
