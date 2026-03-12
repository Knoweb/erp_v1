import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './routes/AppRouter';
import App from './App.jsx'

// 🚨 ULTRA-AGGRESSIVE LOGOUT BYPASS (Runs BEFORE React)
// This MUST run before ReactDOM.createRoot to prevent React Router from mounting
const fullURL = window.location.href;
const pathname = window.location.pathname;
const searchParams = window.location.search;

console.log('🔍🔍🔍 [GINUMA ULTRA-AGGRESSIVE BYPASS] CHECKING...');
console.log('📍 Full URL:', fullURL);
console.log('📍 Pathname:', pathname);
console.log('📍 Search:', searchParams);

// ULTRA-AGGRESSIVE CONDITIONS - Check EVERYTHING
const hasLogoutInPath = pathname.includes('/auth/logout');
const hasReturnToInURL = fullURL.includes('returnTo=');
const hasReturnToInSearch = searchParams.includes('returnTo=');

console.log('✅ Logout in path?', hasLogoutInPath, '(checking if pathname contains "/auth/logout")');
console.log('✅ ReturnTo in URL?', hasReturnToInURL, '(checking full href)');
console.log('✅ ReturnTo in search?', hasReturnToInSearch, '(checking search params)');

// TRIGGER if ANY condition is true
const shouldWipeStorage = hasLogoutInPath || hasReturnToInURL || hasReturnToInSearch;

console.log('🎯 FINAL DECISION: shouldWipeStorage =', shouldWipeStorage);

if (shouldWipeStorage) {
  console.error('');
  console.error('🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨');
  console.error('🚨     GINUMA EMERGENCY STORAGE WIPE ACTIVATED     🚨');
  console.error('🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨');
  console.error('');
  console.error('!!! GINUMA EMERGENCY WIPE EXECUTED !!!');
  console.log('🛑 React Router WILL NOT MOUNT');
  console.log('🔥 Trigger reason:', 
    hasLogoutInPath ? '✓ LOGOUT PATH' : '✗ No logout path',
    hasReturnToInURL ? '✓ RETURNTO IN URL' : '✗ No returnTo in URL',
    hasReturnToInSearch ? '✓ RETURNTO IN SEARCH' : '✗ No returnTo in search'
  );
  
  // Extract returnTo parameter
  const urlParams = new URLSearchParams(searchParams);
  const returnTo = urlParams.get('returnTo') || 'http://localhost:5173/login';
  console.log('🔗 Redirect target:', returnTo);
  
  // NUCLEAR OPTION: Remove specific keys from BOTH localStorage AND sessionStorage
  console.log('');
  console.log('🧹🧹🧹 PHASE 1: Removing specific Ginuma keys from BOTH storages...');
  console.log('');
  
  // 🔴 localStorage specific keys
  console.log('   📦 localStorage:');
  try {
    localStorage.removeItem('auth_token');
    console.log('      ✅ auth_token removed from localStorage');
  } catch (e) { console.log('      ⚠️ auth_token removal failed:', e.message); }
  
  try {
    localStorage.removeItem('companyId');
    console.log('      ✅ companyId removed from localStorage');
  } catch (e) { console.log('      ⚠️ companyId removal failed:', e.message); }
  
  try {
    localStorage.removeItem('role');
    console.log('      ✅ role removed from localStorage');
  } catch (e) { console.log('      ⚠️ role removal failed:', e.message); }
  
  console.log('');
  
  // 🔴 sessionStorage specific keys (THE HIDDEN BUG!)
  console.log('   📦 sessionStorage (ROOT CAUSE OF BUG):');
  try {
    sessionStorage.removeItem('auth_token');
    console.log('      ✅ auth_token removed from sessionStorage');
  } catch (e) { console.log('      ⚠️ auth_token removal failed:', e.message); }
  
  try {
    sessionStorage.removeItem('companyId');
    console.log('      ✅ companyId removed from sessionStorage');
  } catch (e) { console.log('      ⚠️ companyId removal failed:', e.message); }
  
  try {
    sessionStorage.removeItem('role');
    console.log('      ✅ role removed from sessionStorage');
  } catch (e) { console.log('      ⚠️ role removal failed:', e.message); }
  
  console.log('');
  console.log('🧹🧹🧹 PHASE 2: Nuclear wipe - clear() on BOTH storages...');
  try {
    localStorage.clear();
    console.log('   ✅ localStorage.clear() executed');
  } catch (e) { console.log('   ⚠️ localStorage.clear() failed:', e.message); }
  
  try {
    sessionStorage.clear();
    console.log('   ✅ sessionStorage.clear() executed');
  } catch (e) { console.log('   ⚠️ sessionStorage.clear() failed:', e.message); }
  
  console.log('');
  console.error('💥💥💥 !!! BOTH STORAGES NUKED !!! 💥💥💥');
  console.error('✅✅✅ GINUMA STORAGE WIPED SUCCESSFULLY ✅✅✅');
  console.log('✅ All Ginuma auth data destroyed from BOTH localStorage & sessionStorage');
  console.log('✅ Keys removed: auth_token, companyId, role (from BOTH storages)');
  console.log('');
  
  // Show immediate RED emergency screen
  document.body.innerHTML = `
    <div style="
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      background: linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      z-index: 999999;
    ">
      <div style="
        width: 80px; height: 80px;
        border: 7px solid rgba(255, 255, 255, 0.25);
        border-top: 7px solid #ffffff;
        border-radius: 50%;
        animation: spin 0.4s linear infinite;
        margin-bottom: 32px;
      "></div>
      <h2 style="font-size: 32px; font-weight: 900; margin-bottom: 16px; color: #ffffff; text-shadow: 0 2px 10px rgba(0,0,0,0.3);">
        🚨 EMERGENCY LOGOUT 🚨
      </h2>
      <p style="font-size: 18px; color: #fecaca; text-align: center; max-width: 380px; line-height: 1.7; font-weight: 700;">
        Ginuma ERP Session Terminated
      </p>
      <p style="font-size: 14px; color: #fca5a5; margin-top: 16px; font-weight: 600;">
        All tokens wiped: auth_token, companyId, role
      </p>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </div>
  `;
  
  // Use window.location.replace() to prevent back button
  console.error(`🔗🔗🔗 [REDIRECT] Using window.location.replace() to: ${returnTo}`);
  console.log('⏱️ Redirecting in 300ms...');
  console.log('');
  
  setTimeout(() => {
    console.log('🚀 REDIRECT NOW!');
    window.location.replace(returnTo);
  }, 300);
  
  // CRITICAL: Throw error to stop React from mounting
  throw new Error('[GINUMA ULTRA-AGGRESSIVE BYPASS] Emergency logout complete - React mount BLOCKED');
}

console.log('');
console.log('✅✅✅ [GINUMA ULTRA-AGGRESSIVE BYPASS] No logout detected - mounting React app normally');
console.log('');

// Normal React app mounting (only reached if NOT logout URL)
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);