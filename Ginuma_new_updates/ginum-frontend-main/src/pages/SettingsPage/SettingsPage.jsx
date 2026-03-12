import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom"; // Import useSearchParams
import ResetPassword from "../../components/ResetPassword/ResetPassword";
import CompanyInformationSettings from "../../components/settings/CompanyInformationSettings";

const SettingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams(); // Get search params
  const [activeSection, setActiveSection] = useState("company");

  // Sync activeSection with URL
  useEffect(() => {
    const sectionFromURL = searchParams.get("section");
    if (
      sectionFromURL &&
      ["company", "taxes", "advanced"].includes(sectionFromURL)
    ) {
      setActiveSection(sectionFromURL);
    }
  }, [searchParams]);

  // Handle section change
  const handleSectionChange = (sectionKey) => {
    setActiveSection(sectionKey);
    setSearchParams({ section: sectionKey }); // Update URL with the new section
  };

  return (
    <div className="flex items-center justify-center py-4">
      <div className="w-full max-w-6xl bg-white rounded-lg shadow-md p-4 flex flex-col">
        {/* Sections Navigation */}
        <div className="flex flex-wrap border-b border-gray-300 overflow-x-auto">
          {[
            { key: "company", label: "Company Information" },
            { key: "taxes", label: "Taxes" },
            { key: "advanced", label: "Advanced Settings" },
          ].map((section) => (
            <button
              key={section.key}
              className={`py-2 px-4 text-lg font-medium flex-1 sm:flex-none text-center ${activeSection === section.key
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-500 hover:text-gray-700"
                }`}
              onClick={() => handleSectionChange(section.key)}
            >
              {section.label}
            </button>
          ))}
        </div>

        {/* Section Content */}
        <div className="mt-6 p-4">
          {activeSection === "company" && <CompanyInformationSettings />}

          {activeSection === "taxes" && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Taxes</h2>
              <p className="text-gray-600">
                Configure tax settings for your business.
              </p>
            </div>
          )}

          {activeSection === "advanced" && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Advanced Settings</h2>
              <p className="text-gray-600 mb-3">
                Manage advanced configurations.
              </p>
              <ResetPassword />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
