import HexUtils from 'src/utils/Hex'
import coreParanoidSettings from 'src/modules/core-Paranoid-encryption/settings'
import TextUtils from 'src/utils/text'
import OpenPgp from 'src/modules/openpgp/OpenPgp'
import _ from 'lodash'
import store from 'src/store'
import FileSaver from 'src/utils/FileSaver'
import types from 'src/utils/types'

/**
 * @constructor
 */
function CCrypto()
{
	this.iChunkNumber = 0;
	this.iChunkSize = coreParanoidSettings.chunkSize;
	this.iCurrChunk = 0;
	this.oChunk = null;
	this.iv = null;
	// Queue of files awaiting upload
	this.oChunkQueue = {
		isProcessed: false,
		aFiles: []
	};
	this.aStopList = [];
	this.fOnUploadCancelCallback = null;
	this.oKey = null;
}

CCrypto.prototype.start = async function (oFileInfo, ParanoidKey = '')
{
	this.oFileInfo = oFileInfo;
	this.oFile = oFileInfo.file;
	this.iChunkNumber = Math.ceil(oFileInfo.file.size/this.iChunkSize);
	this.iCurrChunk = 0;
	this.oChunk = null;
	this.iv = window.crypto.getRandomValues(new Uint8Array(16));
	this.oFileInfo.Hidden = { 'RangeType': 1, 'Overwrite': true };
	this.oFileInfo.Hidden.ExtendedProps = {
		'InitializationVector': HexUtils.Array2HexString(new Uint8Array(this.iv))
	};

	if (ParanoidKey)
	{
		this.oFileInfo.Hidden.ExtendedProps.ParanoidKey = ParanoidKey;
	}
};

CCrypto.prototype.startUpload = async function (oFileInfo, sUid, fOnChunkEncryptCallback, fCancelCallback, privateKey, publicKeys, currentAccountEmail, askOpenPgpKeyPassword, callBack) {
  this.oChunkQueue.isProcessed = true;
  this.oKey = await this.generateKey();
  const sKeyData = await this.convertKeyToString(this.oKey);
  if (privateKey && sKeyData) {
    const CurrentUserPublicKey = publicKeys;
    if (CurrentUserPublicKey) {
      const sEncryptedKey = await this.encryptParanoidKey(sKeyData, [CurrentUserPublicKey], '', privateKey, currentAccountEmail, askOpenPgpKeyPassword);
      if (sEncryptedKey) {
        await this.start(oFileInfo, sEncryptedKey);
        await this.readChunk(sUid, this.fOnChunkReadyCallback, callBack);
      } else if (_.isFunction(fCancelCallback)) {
        fCancelCallback();
      }
    } else if (_.isFunction(fCancelCallback)) {
      fCancelCallback();
    }
  } else if (_.isFunction(fCancelCallback)) {
    fCancelCallback();
  }
}

CCrypto.prototype.readChunk = async function (sUid, fOnChunkEncryptCallback, callBack) {
  var
    iStart = this.iChunkSize * this.iCurrChunk,
    iEnd = (this.iCurrChunk < (this.iChunkNumber - 1)) ? this.iChunkSize * (this.iCurrChunk + 1) : this.oFile.size,
    oReader = new FileReader(),
    oBlob = null
  ;

  if (this.aStopList.indexOf(sUid) !== -1) { // if user canceled uploading file with uid = sUid
    this.aStopList.splice(this.aStopList.indexOf(sUid), 1);
    this.checkQueue();
    return;
  } else {
    // Get file chunk
    if (this.oFile.slice) {
      oBlob = this.oFile.slice(iStart, iEnd);
    } else if (this.oFile.webkitSlice) {
      oBlob = this.oFile.webkitSlice(iStart, iEnd);
    } else if (this.oFile.mozSlice) {
      oBlob = this.oFile.mozSlice(iStart, iEnd);
    }
    if (oBlob) {
      try { //Encrypt file chunk
        oReader.onloadend = _.bind(async function (evt) {
          if (evt.target.readyState === FileReader.DONE) {
            this.oChunk = evt.target.result;
            this.iCurrChunk++;
            await this.encryptChunk(sUid, this.fOnChunkReadyCallback, callBack);
          }
        }, this);

        oReader.readAsArrayBuffer(oBlob);
      } catch (err) {
        console.log('error 7')
        //Screens.showError(TextUtils.i18n('%MODULENAME%/ERROR_ENCRYPTION'));
      }
    }
  }
};

CCrypto.prototype.encryptChunk = async function (sUid, fOnChunkEncryptCallback, callBack)
{
	await crypto.subtle.encrypt({ name: 'AES-CBC', iv: this.iv }, this.oKey, this.oChunk)
		.then(_.bind(function (oEncryptedContent) {
			//delete padding for all chunks except last one
			oEncryptedContent = (this.iChunkNumber > 1 && this.iCurrChunk !== this.iChunkNumber) ? oEncryptedContent.slice(0, oEncryptedContent.byteLength - 16) : oEncryptedContent;
			var
				oEncryptedFile = new Blob([oEncryptedContent], {type: "text/plain", lastModified: new Date()}),
				//fProcessNextChunkCallback runs after previous chunk uploading
				fProcessNextChunkCallback = _.bind(function (sUid, fOnChunkEncryptCallback) {
					if (this.iCurrChunk < this.iChunkNumber)
					{// if it was not last chunk - read another chunk
						this.readChunk(sUid, this.fOnChunkReadyCallback);
					}
					else
					{// if it was last chunk - check Queue for files awaiting upload
						this.oChunkQueue.isProcessed = false;
						this.checkQueue();
					}
				}, this)
			;
			this.oFileInfo.File = oEncryptedFile;
			//use last 16 byte of current chunk as initial vector for next chunk
			this.iv = new Uint8Array(oEncryptedContent.slice(oEncryptedContent.byteLength - 16));
			if (this.iCurrChunk === 1)
			{ // for first chunk enable 'FirstChunk' attribute. This is necessary to solve the problem of simultaneous loading of files with the same name
				this.oFileInfo.Hidden.ExtendedProps.FirstChunk = true;
			}
			else
			{
				delete this.oFileInfo.Hidden.ExtendedProps.FirstChunk;
			}

			if (this.iCurrChunk == this.iChunkNumber)
			{ // unmark file as loading
				delete this.oFileInfo.Hidden.ExtendedProps.Loading;
			}
			else
			{ // mark file as loading until upload doesn't finish
				this.oFileInfo.Hidden.ExtendedProps.Loading = true;
			}
			// call upload of encrypted chunk
      //this.fOnChunkReadyCallback(sUid, this.oFileInfo, fProcessNextChunkCallback, this.iCurrChunk, this.iChunkNumber, (this.iCurrChunk - 1) * this.iChunkSize);
			this.uploadTask(sUid, this.oFileInfo, fProcessNextChunkCallback, this.iCurrChunk, this.iChunkNumber, (this.iCurrChunk - 1) * this.iChunkSize, callBack);
		}, this))
		.catch(function(err)
		{
      console.log('error 1', err)
			//Screens.showError(TextUtils.i18n('%MODULENAME%/ERROR_ENCRYPTION'));
		})
	;
};
CCrypto.prototype.fOnChunkReadyCallback = function (sUid, oFileInfo, fProcessNextChunkCallback, iCurrChunk, iChunkNumber, iProgressOffset) {
  var fOnUploadCallback = null;
  // fOnUploadCallback runs when server have responded for upload
  fOnUploadCallback = function (sResponse, sFileUploadUid)
  {
    var oResponse = null;

    try
    { // Suppress exceptions in the connection failure case
      oResponse = JSON.parse(sResponse);
    }
    catch (err)
    {
    }
    if (oResponse && oResponse.Result && !oResponse.Result.Error && !oResponse.ErrorCode)
    {//if response contains result and have no errors
      fProcessNextChunkCallback(sUid, CCrypto.prototype.fOnChunkReadyCallback);
    }
    else if (oResponse && oResponse.Result && oResponse.Result.Error)
    {
      console.log('err 1')
    }
    else if (oResponse && oResponse.ErrorCode)
    {
      console.log('err 2')
    }
    else
    {
      console.log('err 3')
    }
  };

/*  var
    aHidden = getValue(this.oOptions, 'hidden', {}),
    oParsedHiddenParameters = JSON.parse(getStringOrCallFunction(aHidden.Parameters, [oFileInfo]))
  ;
  this.oDriver.regTaskUid(sUid);*/
  this.uploadTask(sUid, oFileInfo, this.fOnChunkReadyCallback , fOnUploadCallback, iCurrChunk < iChunkNumber, true, iProgressOffset);
}
CCrypto.prototype.generateKey = async function ()
{
  let oKey = false;

  try
  {
    oKey = await window.crypto.subtle.generateKey(
      {
        name: "AES-CBC",
        length: 256
      },
      true,
      ["encrypt", "decrypt"]
    );
  }
  catch (e)
  {
    console.log('error generate key')
  }

  return oKey;
};
CCrypto.prototype.convertKeyToString = async function (oKey)
{
  let sKeyData = ''

  if (oKey)
  {
    try
    {
      let aKeyData = await window.crypto.subtle.exportKey(
        "raw",
        oKey
      )
      sKeyData = HexUtils.Array2HexString(new Uint8Array(aKeyData))
    }
    catch (e)
    {
      /*Screens.showError(TextUtils.i18n('%MODULENAME%/ERROR_EXPORT_KEY'));*/
      console.log(' error convertKeyToString')
    }
  }
  return sKeyData;
}
CCrypto.prototype.downloadDividedFile = async function (
  oFile,
  iv,
  fProcessBlobCallback,
  fProcessBlobErrorCallback,
  sParanoidEncryptedKey = '',
  aesKey = '')
{
	if (aesKey !== false)
	{
		new CDownloadFile(oFile, iv, oFile.Size, fProcessBlobCallback, fProcessBlobErrorCallback, aesKey);
	}
};

CCrypto.prototype.uploadTask = function (sUid, oFileInfo, fCallback, bSkipCompleteFunction, bUseResponce, iProgressOffset, callBack)
{
  if (!sUid || !oFileInfo || !oFileInfo['File'])
  {
    fCallback(null, sUid);
    return false;
  }

  try
  {
    var
      oXhr = new XMLHttpRequest(),
      oFormData = new FormData(),
      sAction = store.getters['main/getApiHost'] + '/?/Api/',
      aHidden = {
        Method: 'UploadFile',
        Module: 'Files',
        Parameters: JSON.stringify({
          'Type': store.getters['files/getCurrentStorage'].Type,
          'SubPath': '',
          'Path': oFileInfo?.folder,
          'Overwrite': false,
          'ExtendedProps': {
            'InitializationVector': oFileInfo?.Hidden?.ExtendedProps?.InitializationVector,
            'ParanoidKey': oFileInfo?.Hidden?.ExtendedProps?.ParanoidKey,
            'FirstChunk': oFileInfo?.Hidden?.ExtendedProps?.FirstChunk,
          }
        }),
        TenantName: "Default"
      }
  /*   fStartFunction = this.oJua.getEvent('onStart'),
      fCompleteFunction = this.oJua.getEvent('onComplete'),
      fProgressFunction = this.oJua.getEvent('onProgress')
    ;*/

    oXhr.open('POST', sAction, true);
    oXhr.setRequestHeader('Authorization', 'Bearer ' + store.getters['user/getAuthToken']);
    oXhr.setRequestHeader('X-Client', 'WebClient');

    oFormData.append('jua-post-type', 'ajax');
    oFormData.append('jua-uploader', oFileInfo['File'], oFileInfo['fileName']);
    let getStringOrCallFunction = function (mStringOrFunction, aFunctionParams) {
      return types.pString(_.isFunction(mStringOrFunction) ?
        mStringOrFunction.apply(null, _.isArray(aFunctionParams) ? aFunctionParams : []) :
        mStringOrFunction);
    }
    //extending jua hidden parameters with file hidden parameters
    _.each(aHidden, function (mValue, sKey) {
      oFormData.append(sKey, getStringOrCallFunction(mValue, [oFileInfo]));
    });

    oXhr.send(oFormData);
    callBack()
    setTimeout( () => { store.dispatch('files/getFiles', {
      currentStorage: store.getters['files/getCurrentStorage'].Type,
      path: store.getters['files/getCurrentPath']
    }) }, 1000)
    return true;
  }
  catch (oError)
  {
    if (window.console)
    {
      window.console.error(oError);
    }
  }

  fCallback(null, sUid);
  return false;
}

CCrypto.prototype.encryptParanoidKey = async function (sParanoidKey, aPublicKeys, sPassword = '', oPrivateKey, currentAccountEmail, askOpenPgpKeyPassword)
{
	let sEncryptedKey = "";

	if (oPrivateKey)
	{

		const oPGPEncryptionResult = await OpenPgp.encryptData(
      sParanoidKey,
      currentAccountEmail,
      currentAccountEmail,
      false,
      true,
      askOpenPgpKeyPassword
		);
		if (oPGPEncryptionResult.sEncryptedData)
		{
			let data = oPGPEncryptionResult.sEncryptedData;
			let password = oPGPEncryptionResult.sPassword;
			sEncryptedKey = data;
		}
		else if (oPGPEncryptionResult.hasErrors() || oPGPEncryptionResult.hasNotices())
		{
			OpenPgpEncryptor.showPgpErrorByCode(
				oPGPEncryptionResult,
				'',
				TextUtils.i18n('%MODULENAME%/ERROR_LOAD_KEY')
			);
		}
	}

	return sEncryptedKey;
};

/**
* Checking Queue for files awaiting upload
*/
CCrypto.prototype.checkQueue = function ()
{
	var aNode = null;
	if (this.oChunkQueue.aFiles.length > 0)
	{
		aNode = this.oChunkQueue.aFiles.shift();
		aNode.fStartUploadCallback.apply(aNode.fStartUploadCallback, [aNode.oFileInfo, aNode.sUid, aNode.fOnChunkEncryptCallback]);
	}
};

function CDownloadFile(oFile, iv, iChunkSize, fProcessBlobCallback, fProcessBlobErrorCallback, sKey = '')
{
	this.oWriter = new CWriter(oFile.Name, fProcessBlobCallback);
	this.init(oFile, iv, iChunkSize, fProcessBlobErrorCallback, sKey);
}

CDownloadFile.prototype.init = async function (oFile, iv, iChunkSize, fProcessBlobErrorCallback, sKey) {
  this.sHash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  this.oFile = oFile;
  this.sFileName = oFile.Name;
  this.iFileSize = oFile.Size;
  this.sDownloadLink = store.getters['main/getApiHost'] + '/' + oFile?.Actions?.download?.url
  this.iCurrChunk = 0;
  this.iv = new Uint8Array(HexUtils.HexString2Array(iv));
  this.key = null;
  this.iChunkNumber = Math.ceil(this.iFileSize / iChunkSize);
  this.iChunkSize = iChunkSize;
  this.fProcessBlobErrorCallback = fProcessBlobErrorCallback;
  //clear parameters after & if DownloadLink contains any
  if (this.sDownloadLink.indexOf('&') > 0) {
    this.sDownloadLink = this.sDownloadLink.substring(0, this.sDownloadLink.indexOf('&'));
  }
  const fCancelCallback = () => {
    if (_.isFunction(this.fProcessBlobErrorCallback)) {
      this.fProcessBlobErrorCallback();
    }
    //this.stopDownloading();
  };
  if (sKey) {//the key was transferred from outside
    let oKey = await this.getKeyFromString(sKey);
    if (oKey) {
      this.key = oKey;
      this.decryptChunk();
    } else {
      fCancelCallback();
    }
  } else {//read the key from local storage
    console.log('Add encryption key')
   /* JscryptoKey.getKey(
      oKey => {
        this.key = oKey;
        this.decryptChunk();
      },
      fCancelCallback
    );*/
  }
};

CDownloadFile.prototype.getKeyFromString = async function (sParanoidKey)
{
  let oKey = null;
  let aKeyData = HexUtils.HexString2Array(sParanoidKey);
  if (aKeyData.length > 0)
  {
    aKeyData = new Uint8Array(aKeyData);
  }
  else
  {
    console.log('error 2', sParanoidKey)
    //Screens.showError(TextUtils.i18n('%MODULENAME%/ERROR_LOAD_KEY'));
  }

  try
  {
    oKey = await this.generateKeyFromArray(aKeyData);
  }
  catch (e)
  {
    console.log('error 3')
    //Screens.showError(TextUtils.i18n('%MODULENAME%/ERROR_LOAD_KEY'));
  }

  return oKey;
};

CDownloadFile.prototype.generateKeyFromArray = function (aKey)
{
  return window.crypto.subtle.importKey(
    "raw",
    aKey,
    {
      name: "AES-CBC"
    },
    true,
    ["encrypt", "decrypt"]
  );
};

CDownloadFile.prototype.writeChunk = function (oDecryptedUint8Array) {
  this.oWriter.write(oDecryptedUint8Array); //write decrypted chunk
  if (this.iCurrChunk < this.iChunkNumber) { //if it was not last chunk - decrypting another chunk
    this.decryptChunk();
  } else {
    this.oWriter.close();
  }
};

CDownloadFile.prototype.decryptChunk = function () {
  var oReq = new XMLHttpRequest();
  let sAuthToken = store.getters['user/getAuthToken']
  oReq.open("GET", this.getChunkLink(), true);
  oReq.setRequestHeader('Authorization','Bearer ' + sAuthToken)

  oReq.responseType = 'arraybuffer';
  oReq.onload = _.bind(function () {
      let oArrayBuffer = oReq.response
      let oDataWithPadding = {}
    if (oReq.status === 200 && oArrayBuffer) {
      oDataWithPadding = new Uint8Array(oArrayBuffer.byteLength + 16);
      oDataWithPadding.set(new Uint8Array(oArrayBuffer), 0);
      if (this.iCurrChunk !== this.iChunkNumber) {// for all chunk except last - add padding
        crypto.subtle.encrypt(
          {
            name: 'AES-CBC',
            iv: new Uint8Array(oArrayBuffer.slice(oArrayBuffer.byteLength - 16))
          },
          this.key,
          (new Uint8Array([16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16])).buffer // generate padding for chunk
        ).then(_.bind(function (oEncryptedContent) {
            // add generated padding to data
            // oEncryptedContent.slice(0, 16) - use only first 16 bytes of generated padding, other data is padding for our padding
            oDataWithPadding.set(new Uint8Array(new Uint8Array(oEncryptedContent.slice(0, 16))), oArrayBuffer.byteLength);
            // decrypt data
            crypto.subtle.decrypt({name: 'AES-CBC', iv: this.iv}, this.key, oDataWithPadding.buffer)
              .then(_.bind(function (oDecryptedArrayBuffer) {
                console.log('decrypt')
                var oDecryptedUint8Array = new Uint8Array(oDecryptedArrayBuffer);
                // use last 16 byte of current chunk as initial vector for next chunk
                this.iv = new Uint8Array(oArrayBuffer.slice(oArrayBuffer.byteLength - 16));
                this.writeChunk(oDecryptedUint8Array);
              }, this))
              .catch(_.bind(function (err) {
                //this.stopDownloading();
                if (_.isFunction(this.fProcessBlobErrorCallback)) {
                  this.fProcessBlobErrorCallback();
                }
                console.log('error 4', err)
                //Screens.showError(TextUtils.i18n('%MODULENAME%/ERROR_DECRYPTION'));
              }, this));
          }, this)
        );
      } else { //for last chunk just decrypt data
        crypto.subtle.decrypt({name: 'AES-CBC', iv: this.iv}, this.key, oArrayBuffer)
          .then(_.bind(function (oDecryptedArrayBuffer) {
            console.log('then 1')
            var oDecryptedUint8Array = new Uint8Array(oDecryptedArrayBuffer);
            // use last 16 byte of current chunk as initial vector for next chunk
            this.iv = new Uint8Array(oArrayBuffer.slice(oArrayBuffer.byteLength - 16));
            this.writeChunk(oDecryptedUint8Array);
          }, this))
          .catch(_.bind(function (err) {
            //this.stopDownloading();
            if (_.isFunction(this.fProcessBlobErrorCallback)) {
              this.fProcessBlobErrorCallback();
            }
            console.error(err)
            //Screens.showError(TextUtils.i18n('%MODULENAME%/ERROR_DECRYPTION'));
          }, this))
        ;
      }
    }
  }, this);
  oReq.send(null);
};

/**
 * Generate link for downloading current chunk
 */
CDownloadFile.prototype.getChunkLink = function ()
{
	return this.sDownloadLink + '/download/' + this.iCurrChunk++ + '/' + this.iChunkSize + '&' + this.sHash;
};

/**
* Writing chunks in file
*
* @constructor
* @param {String} sFileName
* @param {Function} fProcessBlobCallback
*/
function CWriter(sFileName, fProcessBlobCallback)
{
	this.sName = sFileName;
	this.aBuffer = [];
	if (_.isFunction(fProcessBlobCallback))
	{
		this.fProcessBlobCallback = fProcessBlobCallback;
	}
}
CWriter.prototype.write = function (oDecryptedUint8Array)
{
	this.aBuffer.push(oDecryptedUint8Array);
};
CWriter.prototype.close = function ()
{
	let file = new Blob(this.aBuffer);

	if (typeof this.fProcessBlobCallback !== 'undefined')
	{
		this.fProcessBlobCallback(file);
	}
	else
	{
		FileSaver.saveAs(file, this.sName);
	}
	file = null;
};

/**
* Writing chunks in blob for viewing
*
* @constructor
* @param {String} sFileName
*/
function CBlobViewer(sFileName) {
	this.sName = sFileName;
	this.aBuffer = [];
	this.imgWindow = window.open("", "_blank", "height=auto, width=auto,toolbar=no,scrollbars=no,resizable=yes");
}

CBlobViewer.prototype = Object.create(CWriter.prototype);
CBlobViewer.prototype.constructor = CBlobViewer;
CBlobViewer.prototype.close = function ()
{
	try
	{
		var
			file = new Blob(this.aBuffer),
			link = window.URL.createObjectURL(file),
			img = null
		;
		this.imgWindow.document.write("<head><title>" + this.sName + '</title></head><body><img src="' + link + '" /></body>');

		img = $(this.imgWindow.document.body).find('img');
		img.on('load', function () {
			//remove blob after showing image
			window.URL.revokeObjectURL(link);
		});
	}
	catch (err)
	{
    console.log('error 6')
		//Screens.showError(TextUtils.i18n('%MODULENAME%/ERROR_POPUP_WINDOWS'));
	}
};

export default new  CCrypto();
