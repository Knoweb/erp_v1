import api from "./api";

/**
 * Trigger customer data sync from Middeniya to Ginuma
 */
export const syncCustomersFromMiddeniya = async (companyId, orgId) => {
  try {
    const response = await api.post(
      `/api/customers/sync/middeniya/${companyId}/${orgId}`
    );
    console.log("✅ Customer sync completed:", response);
    return response;
  } catch (error) {
    console.error("❌ Customer sync failed:", error);
    throw error;
  }
};

/**
 * Trigger sync and handle silently (for background sync)
 */
export const silentSyncCustomers = async (companyId, orgId) => {
  try {
    await syncCustomersFromMiddeniya(companyId, orgId);
  } catch (error) {
    // Log silently, don't interrupt user
    console.debug("Silent sync error (non-blocking):", error.message);
  }
};
