import React, { useEffect } from "react";
import "./App.css";
import AppRouter from "./routes/AppRouter";
import { silentSyncCustomers } from "./utils/syncApi";

function App() {
  useEffect(() => {
    // Auto-sync customer data from Middeniya on app load
    const companyId = localStorage.getItem("companyId");
    if (companyId) {
      silentSyncCustomers(parseInt(companyId), parseInt(companyId));
    }
  }, []);

  return (
    <>
      {/* Main Content */}
      <div className="mt-4">
        <AppRouter />
      </div>
    </>
  );
}

export default App;
