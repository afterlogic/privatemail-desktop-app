const routes = [
  {
    path: '/old',
    component: () => import('layouts/MyLayout.vue'),
    children: [{ path: '', component: () => import('pages/Index.vue') }]
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {path: '', component: () => import('pages/LoadingUI.vue') },
      {path: 'login', component: () => import('pages/login/LoginUI.vue') },
      {path: 'mail', component: () => import('pages/mail/MailUI.vue') },
      {
        path: 'contacts',
        component: () => import('pages/contacts/ContactsUI.vue'),
        children: [
          {
            path: 'group/:name',
            component: () => import('pages/contacts/ContactsView'),
            children: [
              {
                path: '/:uuid/view',
                component: () => import('pages/contacts/ContactView'),
              },
              {
                path: '/:uuid/edit',
                component: () => import('pages/contacts/ContactEditView')
              },
              {
                path: '/:uuid/group-view',
                component: () => import('pages/contacts/GroupView')
              },
              {
                path: 'group-edit',
                component: () => import('pages/contacts/GroupEditView')
              },
              {
                path: 'group-create',
                component: () => import('pages/contacts/GroupCreateView')
              },
              {
                path: 'import',
                component: () => import('pages/contacts/ContactImport')
              },
              {
                path: 'no-contact',
                component: () => import('pages/contacts/ContactEmpty')
              },
              {
                path: 'group-view',
                component: () => import('pages/contacts/GroupView')
              },
              {
                path: 'create',
                component: () => import('pages/contacts/ContactEditView')
              }
            ]
          },
          {
            path: 'groups',
            component: () => import('pages/contacts/ContactsView'),
            children: [
              {
                path: 'no-contact',
                component: () => import('pages/contacts/ContactEmpty')
              },
            ]
          }
        ]
      },
      // {path: 'files', component: () => import('pages/files/FilesUI.vue') },
      // {path: 'calendar', component: () => import('pages/calendar/CalendarUI.vue') },
      {
        path: 'settings',
        component: () => import('pages/settings/SettingsUI.vue'),
        children: [
          { path: 'common', component: () => import('pages/settings/Common.vue')},
          { path: 'mail', component: () => import('pages/settings/Mail.vue') },
          {
            path: 'accounts',
            component: () => import('pages/settings/MailAccounts.vue'),
            children: [
              {
                path: 'account/:accountId',
                component: () => import('pages/settings/edit-accounts/edit-account/editAccountsUI.vue'),
                children: [
                  {path: 'props', component: () => import('pages/settings/edit-accounts/edit-account/Properties.vue')},
                  {path: 'folders', component: () => import('pages/settings/edit-accounts/edit-account/ManageFolders.vue')},
                  {path: 'forward', component: () => import('pages/settings/edit-accounts/edit-account/Forward.vue')},
                  {path: 'autoresponder', component: () => import('pages/settings/edit-accounts/edit-account/Autoresponder.vue')},
                ]
              },
              {
                path: 'identity/:accountId/:identityId',
                component: () => import('pages/settings/edit-accounts/edit-identity/editIdentityUI.vue'),
                children: [
                  {path: 'props', component: () => import('pages/settings/edit-accounts/edit-identity/Properties.vue')},
                  {path: 'signature', component: () => import('pages/settings/edit-accounts/edit-identity/Signature.vue')},
                ]
              },
              { path: 'alias/:accountId/:aliasId',
                component: () => import('pages/settings/edit-accounts/edit-alias/editAliasUI.vue'),
                children: [
                  {path: 'props', component: () => import('pages/settings/edit-accounts/edit-alias/Properties.vue')},
                  {path: 'signature', component: () => import('pages/settings/edit-accounts/edit-alias/Signature.vue')},
                ]
              },
            ]
          },
          { path: 'contacts', component: () => import('pages/settings/Contacts.vue') },
          { path: 'open-pgp', component: () => import('pages/settings/OpenPgp.vue') },
          { path: 'about', component: () => import('pages/settings/About.vue') },
        ]
      },
    ]
  },
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue'),
  })
}

export default routes
