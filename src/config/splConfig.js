// src/config/splConfig.js
export const splFeatureModel = {
  // Core Assets - selalu ada
  core: {
    authentication: true,
    navigation: true,
    responsive: true,
    components: ["Button", "Icon", "TextField", "Select", "TextArea", "Label"],
  },

  // Variability Points
  variability: {
    userRoles: {
      student: {
        allowedFeatures: ["dashboard", "tickets", "profile"],
        allowedButtonTypes: ["primary", "secondary"],
        dashboardLayout: "student-kanban",
        sidebarMenus: ["inbox"],
        permissions: ["read", "create_ticket"],
      },
      admin: {
        allowedFeatures: [
          "dashboard",
          "tickets",
          "profile",
          "management",
          "users",
        ],
        allowedButtonTypes: ["primary", "secondary", "danger"],
        dashboardLayout: "admin-grid",
        sidebarMenus: ["inbox", "management", "users"],
        permissions: ["read", "write", "delete", "manage"],
      },
      disposition: {
        allowedFeatures: ["dashboard", "tickets", "profile", "review"],
        allowedButtonTypes: ["primary", "secondary", "outline"],
        dashboardLayout: "disposition-list",
        sidebarMenus: ["inbox", "review"],
        permissions: ["read", "write", "review"],
      },
    },

    contexts: {
      mobile: {
        sidebarType: "drawer",
        buttonSizes: ["large"],
        navigation: "bottom-tabs",
      },
      desktop: {
        sidebarType: "fixed",
        buttonSizes: ["small", "medium", "large"],
        navigation: "sidebar",
      },
    },
  },
};

// SPL Configuration Manager
export class SPLManager {
  static getCurrentConfig() {
    const userRole = localStorage.getItem("userRole") || "student";
    const isMobile = window.innerWidth < 768;
    const context = isMobile ? "mobile" : "desktop";

    return {
      role: userRole,
      context: context,
      features: splFeatureModel.variability.userRoles[userRole],
      contextSettings: splFeatureModel.variability.contexts[context],
    };
  }

  static validateFeature(featureName) {
    const config = this.getCurrentConfig();
    return config.features.allowedFeatures.includes(featureName);
  }

  static getComponentConfig(componentType, additionalProps = {}) {
    const config = this.getCurrentConfig();

    switch (componentType) {
      case "button":
        return {
          allowedTypes: config.features.allowedButtonTypes,
          allowedSizes: config.contextSettings.buttonSizes,
          defaultType: config.features.allowedButtonTypes[0],
          ...additionalProps,
        };

      case "sidebar":
        return {
          type: config.contextSettings.sidebarType,
          allowedMenus: config.features.sidebarMenus,
          role: config.role,
          ...additionalProps,
        };

      default:
        return additionalProps;
    }
  }
}
