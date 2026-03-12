/**
 * Subscription Access API Service
 * Handles communication with the subscription service backend (port 8091)
 * for fetching subscribed systems and access control
 */

const API_BASE_URL = import.meta.env.VITE_SUBSCRIPTION_API_URL || 'http://localhost:8091/api/subscriptions';

/**
 * SystemAccessResponse interface matching backend DTO
 */
export interface SystemAccessResponse {
  orgId: number;
  companyName: string;
  contactEmail: string;
  status: 'ACTIVE' | 'BLOCKED' | 'PENDING';
  planType?: 'TRIAL' | 'PAID'; // Plan type for the company
  subscribedSystems: string[];
  isActive: boolean;
  isBlocked: boolean;
  createdAt: string;
  statusMessage: string;
  systemCount: number;
}

/**
 * Get all subscribed systems for an organization
 * @param orgId - Organization ID
 * @returns Promise<SystemAccessResponse>
 * @throws Error if request fails
 */
export const getMySubscribedSystems = async (orgId: number): Promise<SystemAccessResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/my-systems/${orgId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Organization not found. Please contact support.');
      }
      throw new Error(`Failed to fetch subscribed systems: ${response.statusText}`);
    }

    const data: SystemAccessResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching subscribed systems:', error);
    throw error;
  }
};

/**
 * Check if organization has access to a specific system
 * @param orgId - Organization ID
 * @param systemCode - System code (GINUMA or INVENTORY)
 * @returns Promise<boolean>
 */
export const checkSystemAccess = async (orgId: number, systemCode: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/my-systems/${orgId}/access/${systemCode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('System access check failed');
      return false;
    }

    const data = await response.json();
    return data.hasAccess;
  } catch (error) {
    console.error('Error checking system access:', error);
    return false;
  }
};

/**
 * Get company status only
 * @param orgId - Organization ID
 * @returns Promise with status information
 */
export const getCompanyStatus = async (orgId: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/my-systems/${orgId}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch company status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching company status:', error);
    throw error;
  }
};

/**
 * Health check for subscription service
 */
export const checkSubscriptionServiceHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('Subscription service health check failed:', error);
    return false;
  }
};
