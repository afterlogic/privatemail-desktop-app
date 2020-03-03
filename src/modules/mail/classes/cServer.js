import typesUtils from 'src/utils/types.js'

function cServer (oData) {
  this.bAllowEditDomains = false
  this.sDomains = ''
  this.bEnableSieve = false
  this.bEnableThreading = false
  this.iEntityId = 0
  this.iExternalAccessImapPort = 0
  this.sExternalAccessImapServer = ''
  this.iExternalAccessSmtpPort = 0
  this.sExternalAccessSmtpServer = ''
  this.iIncomingPort = 0
  this.sIncomingServer = ''
  this.bIncomingUseSsl = false
  this.sName = ''
  this.iOutgoingPort = 0
  this.sOutgoingServer = ''
  this.bOutgoingUseSsl = false
  this.sOwnerType = ''
  this.iServerId = 0
  this.bSetExternalAccessServers = false
  this.iSievePort = 0
  this.sSmtpAuthType = ''
  this.sSmtpLogin = ''
  this.iTenantId = 0
  this.sUUID = ''
  this.bUseFullEmailAddressAsLogin = false

  if (typesUtils.isNonEmptyObject(oData)) {
    this.parse(oData)
  }
}

cServer.prototype.parse = function (oData) {
  this.bAllowEditDomains = typesUtils.pBool(oData.AllowEditDomains, this.bAllowEditDomains)
  this.sDomains = typesUtils.pString(oData.Domains, this.sDomains)
  this.bEnableSieve = typesUtils.pBool(oData.EnableSieve, this.bEnableSieve)
  this.bEnableThreading = typesUtils.pBool(oData.EnableThreading, this.bEnableThreading)
  this.iEntityId = typesUtils.pInt(oData.EntityId, this.iEntityId)
  this.iExternalAccessImapPort = typesUtils.pInt(oData.ExternalAccessImapPort, this.iExternalAccessImapPort)
  this.sExternalAccessImapServer = typesUtils.pString(oData.ExternalAccessImapServer, this.sExternalAccessImapServer)
  this.iExternalAccessSmtpPort = typesUtils.pInt(oData.ExternalAccessSmtpPort, this.iExternalAccessSmtpPort)
  this.sExternalAccessSmtpServer = typesUtils.pString(oData.ExternalAccessSmtpServer, this.sExternalAccessSmtpServer)
  this.iIncomingPort = typesUtils.pInt(oData.IncomingPort, this.iIncomingPort)
  this.sIncomingServer = typesUtils.pString(oData.IncomingServer, this.sIncomingServer)
  this.bIncomingUseSsl = typesUtils.pBool(oData.IncomingUseSsl, this.bIncomingUseSsl)
  this.sName = typesUtils.pString(oData.Name, this.sName)
  this.iOutgoingPort = typesUtils.pInt(oData.OutgoingPort, this.iOutgoingPort)
  this.sOutgoingServer = typesUtils.pString(oData.OutgoingServer, this.sOutgoingServer)
  this.bOutgoingUseSsl = typesUtils.pBool(oData.OutgoingUseSsl, this.bOutgoingUseSsl)
  this.sOwnerType = typesUtils.pString(oData.OwnerType, this.sOwnerType)
  this.iServerId = typesUtils.pInt(oData.ServerId, this.iServerId)
  this.bSetExternalAccessServers = typesUtils.pBool(oData.SetExternalAccessServers, this.bSetExternalAccessServers)
  this.iSievePort = typesUtils.pInt(oData.SievePort, this.iSievePort)
  this.sSmtpAuthType = typesUtils.pString(oData.SmtpAuthType, this.sSmtpAuthType)
  this.sSmtpLogin = typesUtils.pString(oData.SmtpLogin, this.sSmtpLogin)
  this.iTenantId = typesUtils.pInt(oData.TenantId, this.iTenantId)
  this.sUUID = typesUtils.pString(oData.UUID, this.sUUID)
  this.bUseFullEmailAddressAsLogin = typesUtils.pBool(oData.UseFullEmailAddressAsLogin, this.bUseFullEmailAddressAsLogin)
}

export default cServer
