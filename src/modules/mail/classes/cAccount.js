import store from 'src/store'

import typesUtils from 'src/utils/types.js'

import mailSettings from 'src/modules/mail/settings.js'

function cAccount (oData) {
// ** AccountID: 2696
// AllowAutoresponder: false
// AllowFilters: false
// AllowForward: false
// CanBeUsedToAuthorize: true
// ** Email: "nadine@afterlogic.com"
// ** EntityId: 2696
// ** Extend: {AllowChangePasswordOnMailServer: true}
// FoldersOrder: "["INBOX","Sent","Drafts","Spam","Trash","_Fetch woodfairy_","_Fetch woodfairy_\/&BBoEMARCBE8-","_Fetch woodfairy_\/&BBsENQQ9BDA-","_Fetch woodfairy_\/&BB0EMARBBEIETw-","_Fetch woodfairy_\/&BB4EOgRBBDAEPQQw-","_Fetch woodfairy_\/&BDAEPQQwBEEEQgQwBEEEOARP-","_Fetch woodfairy_\/&BDEESwRCBEw- &BDQEPgQxBEAEQw-","_Fetch woodfairy_\/&BDIEOgQ+BD0EQgQwBDoEQgQ1-","_Fetch woodfairy_\/&BDYEOAQyBD4EOQ- &BDYEQwRABD0EMAQ7-","_Fetch woodfairy_\/&BDoEOwQwBDIEPgQzBD4EPQQ6BDg-","_Fetch woodfairy_\/&BDwEPgQ5- &BDoEQARDBDM-","_Fetch woodfairy_\/&BDwEPgQ5- &BDwEOARABEA-","_Fetch woodfairy_\/&BD4EMwQ+BD0ENQQ6-","_Fetch woodfairy_\/&BD4ENAQ9BD4EOgQ7BDAEQQRBBD0EOAQ6BDg-","_Fetch woodfairy_\/&BD8EPgRBBEIEOAQ7BDA-","_Fetch woodfairy_\/&BEEEMARABDMEQwQ9BDAEQQ-","_Fetch woodfairy_\/&BEEENQQ6BEAENQRCBEs- &BDEEOAQ3BD0ENQRBBDA-","_Fetch woodfairy_\/&BEQEPgRABEMEPA- &BC4EJAQj-","_Fetch woodfairy_\/&BE0EOgQ+BD8EPgRBBDUEOwQ1BD0EOAQ1-","_Fetch woodfairy_\/&BE8EMgRM-","AfterLogicSent","AfterLogicTrash","asana","asana\/bug","asana\/bug\/backend","asana\/bug\/calendar","asana\/bug\/compose","asana\/bug\/compose - autocomplete","asana\/bug\/contacts","asana\/bug\/interface","asana\/bug\/js","asana\/bug\/MAIL","asana\/bug\/mail - contacts","asana\/bug\/mail - events","asana\/bug\/mobile","asana\/bug\/popups","asana\/bug\/reply","asana\/bug\/&BD0EMARBBEIEQAQ+BDkEOgQ4-","asana\/langs","asana\/medicity","asana\/p7","asana\/p8","asana\/research","asana\/&BD4EQQRCBDAEOwRMBD0EPgQ1-","asana\/&BEQEOARHBDA-","asana\/&BEQEOARHBDA-\/logout","asana\/&BEQEOARHBDA-\/MAIL","asana\/&BEQEOARHBDA-\/pgp","asana\/&BEQEOARHBDA-\/sso","asana\/&BEQEOARHBDA-\/tooltips","asana\/&BEQEOARHBDA-\/&BDgEPQREBD4EQAQ8BDAERgQ4BD4EPQQ9BEsENQ- &BEEEPgQ+BDEESQQ1BD0EOARP-","bug tracker","Customers","Customers\/Emome","Customers\/Medicity","Customers\/NetVision","Customers\/Telia Sonera","GitHub","Howto","Jira","Notes","orders","Personal","Project7","Sent Messages","Support","Templates","test-fetch","WebMail","&BB8EPgQzBD4EMgQ+BEAEOARCBEw-","&BDQEOwRP- &BEIENQRBBEIEOARABD4EMgQwBD0EOARP-","&BDQEOwRP- &BEIENQRBBEIEOARABD4EMgQwBD0EOARP-\/with eml, dat, msg","&BDQEOwRP- &BEIENQRBBEIEOARABD4EMgQwBD0EOARP-\/with zip","&BDQEOwRP- &BEIENQRBBEIEOARABD4EMgQwBD0EOARP-\/&BD4ERwQ1BD0ETA- &BDEEPgQ7BEwESAQ4BDU- &BD8EOARBBEwEPAQw-","&BDQEOwRP- &BEIENQRBBEIEOARABD4EMgQwBD0EOARP-\/&BEE- &BDoEMARABEIEOAQ9BDoEMAQ8BDg-","&BDQEOwRP- &BEIENQRBBEIEOARABD4EMgQwBD0EOARP-\/&BEE- &BDoEPgQ9BEIEMAQ6BEIEMAQ8BDg-","&BDQEOwRP- &BEIENQRBBEIEOARABD4EMgQwBD0EOARP-\/&BEE- &BEEEPgQxBEsEQgQ4BE8EPAQ4-"]"
// ** FriendlyName: ""
// ** IdUser: 2694
// IncomingLogin: "nadine@afterlogic.com"
// IsDisabled: false
// ** SaveRepliesToCurrFolder: false
// Server: Object
    // ServerAllowEditDomains: false
    // ** Domains: "afterlogic.com"
    // EnableSieve: false
    // EnableThreading: true
    // EntityId: 3
    // ExternalAccessImapPort: 143
    // ExternalAccessImapServer: ""
    // ExternalAccessSmtpPort: 25
    // ExternalAccessSmtpServer: ""
    // IncomingPort: 143
    // IncomingServer: "mail.afterlogic.com"
    // IncomingUseSsl: false
    // Name: "afterlogic.com"
    // OutgoingPort: 25
    // OutgoingServer: "mail.afterlogic.com"
    // OutgoingUseSsl: false
    // OwnerType: "tenant"
    // ServerId: 3
    // SetExternalAccessServers: false
    // SievePort: 4190
    // SmtpAuthType: "2"
    // SmtpLogin: ""
    // TenantId: 2
    // UUID: "04bfe02f-1dad-4816-8af2-4e40ccaf8b0d"
    // UseFullEmailAddressAsLogin: true
// ** ServerId: 3
// ** Signature: ""
// UUID: "f4d1b1ba-7710-452e-bacd-46483a3baafe"
// ** UseSignature: false
// ** UseThreading: true
// UseToAuthorize: true

  this.iAccountId = 0
  this.sEmail = ''
  this.iEntityId = 0
  this.oExtend = {
    AllowChangePasswordOnMailServer: false
  }
  this.sFriendlyName = ''
  this.iIdUser = 0
  this.bSaveRepliesToCurrFolder = false
  this.aServerDomains = []
  this.iServerId = 0
  this.sSignature = ''
  this.sUUID = ''
  this.bUseSignature = false
  this.bUseThreading = false
  this.aAliases = []
  this.aQuota = []

  if (typesUtils.isNonEmptyObject(oData)) {
    this.parse(oData)
  }

  this.bDefault = mailSettings.bAllowDefaultAccountForUser && this.sEmail === store.getters['user/getUserPublicId']
}

cAccount.prototype.parse = function (oData) {
  this.iAccountId = typesUtils.pInt(oData.AccountID)
  this.sEmail = typesUtils.pString(oData.Email)
  this.iEntityId = typesUtils.pInt(oData.EntityId)
  this.oExtend = typesUtils.pObject(oData.Extend, this.oExtend)
  this.sFriendlyName = typesUtils.pString(oData.FriendlyName)
  this.iIdUser = typesUtils.pInt(oData.IdUser)
  this.bSaveRepliesToCurrFolder = typesUtils.pBool(oData.SaveRepliesToCurrFolder)
  this.aServerDomains = typesUtils.pString(oData.ServerDomains).split('\r\n')
  this.iServerId = typesUtils.pInt(oData.ServerId)
  this.sSignature = typesUtils.pString(oData.Signature)
  this.sUUID = typesUtils.pString(oData.UUID)
  this.bUseSignature = typesUtils.pBool(oData.UseSignature)
  this.bUseThreading = typesUtils.pBool(oData.UseThreading)
}

export default cAccount
