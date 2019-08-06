const routes = [
  {
    path: "/old",
    component: () => import("layouts/MyLayout.vue"),
    children: [{ path: "", component: () => import("pages/Index.vue") }]
  },
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {path: "", component: () => import("pages/login/LoginUI.vue") },
      {path: "mail", component: () => import("pages/mail/MailUI.vue") },
      {path: "contacts", component: () => import("pages/contacts/ContactsUI.vue") },
      {path: "files", component: () => import("pages/files/FilesUI.vue") },
      {path: "calendar", component: () => import("pages/calendar/CalendarUI.vue") },
      {path: "settings", component: () => import("pages/settings/SettingsUI.vue") }
    ]
  }
];

// Always leave this as last one
if (process.env.MODE !== "ssr") {
  routes.push({
    path: "*",
    component: () => import("pages/Error404.vue")
  });
}

export default routes;
