package com.inventory.subscription.config;

// ============================================================
// CORS IS HANDLED BY THE API GATEWAY (Port 8080)
// ============================================================
// DO NOT add CORS configuration here. All requests from the
// frontend go through the API Gateway (Spring Cloud Gateway),
// which already applies CorsWebFilter with all allowed origins.
//
// Adding CORS config here causes a DUPLICATE Access-Control-Allow-Origin
// header (one from Gateway + one from this service), which browsers
// reject with: "The 'Access-Control-Allow-Origin' header contains
// multiple values".
//
// See:
// Knoweb_inventory/api-gateway/src/main/java/com/inventory/gateway/config/CorsConfig.java
// ============================================================
