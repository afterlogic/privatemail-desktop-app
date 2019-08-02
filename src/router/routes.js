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
      {path: "", component: () => import("pages/MailUI.vue") },
      {path: "contacts", component: () => import("pages/ContactsUI.vue") },
      {path: "files", component: () => import("pages/FilesUI.vue") },
      {path: "calendar", component: () => import("pages/CalendarUI.vue") },
      {path: "settings", component: () => import("pages/SettingsUI.vue") }
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
