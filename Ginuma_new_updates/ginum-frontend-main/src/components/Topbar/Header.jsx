import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaBell, FaBars, FaUser, FaCog, FaSignOutAlt, FaTrash } from "react-icons/fa";
import PropTypes from "prop-types";
import api from "../../utils/api";

const Header = ({ toggleSidebar, isSidebarVisible }) => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] =
    useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  // Function to handle logout
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "http://167.71.206.166:3000/login";
  };

  // Function to close the sidebar on mobile/tablet screens
  const handleSidebarOnResize = () => {
    const isMobileOrTablet = window.matchMedia("(max-width: 1024px)").matches; // Tailwind's `lg` breakpoint
    if (isMobileOrTablet && isSidebarVisible) {
      toggleSidebar(); // Close the sidebar
    }
  };

  // Add event listener for window resize
  useEffect(() => {
    handleSidebarOnResize(); // Check on initial render
    window.addEventListener("resize", handleSidebarOnResize);

    // Cleanup the event listener
    return () => {
      window.removeEventListener("resize", handleSidebarOnResize);
    };
  }, []); // No dependencies, runs only on mount/unmount

  // Handle clicks outside the dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [companyProfile, setCompanyProfile] = useState({
    name: "Loading...",
    logo: "https://via.placeholder.com/150",
    roleText: "Admin"
  });

  const fetchNotifications = async (companyId) => {
    try {
      const res = await api.get(`/api/companies/${companyId}/notifications`);
      setNotifications(res.data || res);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    const fetchCompanyData = async () => {
      const companyId = localStorage.getItem("companyId");
      const companyName = localStorage.getItem("companyName");
      const storedLogo = localStorage.getItem("companyLogo");
      const role = localStorage.getItem("role");

      // Use localStorage logo immediately if available
      if (storedLogo) {
        console.log("🎨 Header: Using company logo from localStorage");
        setCompanyProfile(prev => ({
          ...prev,
          name: companyName || prev.name,
          logo: storedLogo
        }));
      }

      if (role === "ROLE_SUPER_ADMIN") {
        setCompanyProfile({
          name: "Super Admin",
          logo: "https://via.placeholder.com/150",
          roleText: "Super Admin"
        });
        return;
      }

      if (companyId) {
        try {
          // ensure api.js is imported
          const response = await api.get(`/api/companies/${companyId}`);
          setCompanyProfile({
            name: response.companyName || companyName || "Unknown Company",
            logo: storedLogo || (response.companyLogoBase64
              ? `data:image/png;base64,${response.companyLogoBase64}`
              : "https://via.placeholder.com/150"),
            roleText: "Company Admin"
          });

          // Fetch notifications dynamically now
          fetchNotifications(companyId);

        } catch (error) {
          console.error("Error fetching company profile:", error);
          setCompanyProfile({
            name: companyName || "Company Error",
            logo: storedLogo || "https://via.placeholder.com/150",
            roleText: "Admin"
          });
        }
      }
    };
    fetchCompanyData();

    // Also listen for logo updates in localStorage (e.g., after upload)
    const interval = setInterval(() => {
      const storedLogo = localStorage.getItem("companyLogo");
      if (storedLogo) {
        setCompanyProfile(prev => ({
          ...prev,
          logo: storedLogo
        }));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Function to mark a notification as read
  const markNotificationAsRead = async (id) => {
    const companyId = localStorage.getItem("companyId");
    try {
      await api.put(`/api/companies/${companyId}/notifications/${id}/read`);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === id ? { ...notification, readStatus: true } : notification
        )
      );
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  // Function to handle "Show All Notifications"
  const handleShowAllNotifications = () => {
    // Navigate to a notifications page or expand the dropdown further
    console.log("Show All Notifications clicked");
    // You can add your logic here, like navigating to a notifications page
  };

  // Function to clear all notifications
  const clearAllNotifications = async () => {
    const companyId = localStorage.getItem("companyId");
    try {
      await api.delete(`/api/companies/${companyId}/notifications`);
      setNotifications([]);
      setIsNotificationDropdownOpen(false);
    } catch (err) {
      console.error("Failed to clear notifications", err);
    }
  };

  // Count of unread notifications
  const unreadNotificationsCount = notifications.filter((n) => !n.readStatus).length;

  return (
    <div
      className={`bg-white shadow px-6 py-4 flex justify-between items-center fixed top-0 ${isSidebarVisible ? "left-72" : "left-0"
        } right-0 transition-all duration-300 z-50`}
    >
      {/* Sidebar Toggle Button and Search Bar */}
      <div className="flex items-center w-1/3">
        <button
          onClick={toggleSidebar}
          className="text-gray-600 mr-4 focus:outline-none cursor-pointer"
        >
          <FaBars className="text-xl" />
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-6">
        {/* Notification Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() =>
              setIsNotificationDropdownOpen(!isNotificationDropdownOpen)
            }
            className="relative text-gray-600 focus:outline-none cursor-pointer"
          >
            <FaBell className="text-xl" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown Menu with Fade-Down Animation */}
          <div
            className={`absolute ${window.innerWidth < 768 ? "left-3/4 -translate-x-1/2" : "right-0"
              } mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 transition-all duration-300 ease-in transform ${isNotificationDropdownOpen
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2 pointer-events-none"
              }`}
          >
            {/* Header with Clear Button */}
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">Notifications</span>
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  title="Clear all notifications"
                >
                  <FaTrash className="text-sm" />
                </button>
              )}
            </div>
            <div className="py-2">
              {notifications.length === 0 ? (
                <div className="px-4 py-3 text-center text-sm text-gray-500">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-2 ${notification.readStatus ? "bg-gray-50" : "bg-blue-50"
                      } hover:bg-gray-100 cursor-pointer`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <p className="text-sm text-gray-700">{notification.message}</p>
                    {!notification.readStatus && (
                      <span className="text-xs text-blue-500">New</span>
                    )}
                  </div>
                ))
              )}
              {/* Show All Notifications Button */}
              <button
                onClick={handleShowAllNotifications}
                className="w-full text-center px-4 py-2 text-sm text-zinc-900 hover:bg-gray-100"
              >
                Show All Notifications
              </button>
            </div>
          </div>
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center space-x-2 focus:outline-none cursor-pointer"
          >
            <img
              src={companyProfile.logo}
              alt="User"
              className="w-10 h-10 rounded-full"
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">
                {companyProfile.name}
              </span>
              <span className="text-sm text-gray-500">{companyProfile.roleText}</span>
            </div>
          </button>

          {/* Profile Dropdown Menu with Fade-Down Animation */}
          <div
            className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 transition-all duration-300 ease-in transform ${isProfileDropdownOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2 pointer-events-none"
              }`}
          >
            <div className="py-1">
              <Link to="/app/profile">
                <button
                  navigate
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <FaUser className="mr-2" /> Profile
                </button>
              </Link>
              <Link to={"/app/settings"}>
                <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center">
                  <FaCog className="mr-2" /> Settings
                </button>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-700 hover:bg-gray-100 flex items-center"
              >
                <FaSignOutAlt className="mr-2" /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Header.propTypes = {
  toggleSidebar: PropTypes.func.isRequired,
  isSidebarVisible: PropTypes.bool.isRequired,
};

export default Header;
