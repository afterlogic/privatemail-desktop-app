<template>
    <q-dialog
      v-model="dialog"
      persistent
      content-class="compose-dialog"
      :seamless="maximizedToggle"
      :maximized="maximizedToggle"
      transition-show="slide-up"
      transition-hide="slide-down"
      @before-hide="onBeforeHide"
    >
      <q-dialog v-model="convertToPlainConfirm" persistent>
        <q-card>
          <q-card-section class="row items-center">
            <span class="q-ml-sm">OpenPGP supports plain text only. Click OK to remove all the formatting and continue.</span>
          </q-card-section>
          <q-card-section class="row items-center" v-if="attachments.length > 0">
            <span class="q-ml-sm">Also, attachments cannot be encrypted or signed and will stay as-is.</span>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Ok" color="primary" @click="openPgpSignEncryptDialog" v-close-popup />
            <q-btn flat label="Cancel" color="grey-6" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog v-model="pgpSignEncryptDialog" persistent>
        <q-card class="q-px-sm">
          <q-card-section>
            <div class="text-h6">OpenPGP Sign/Encrypt</div>
          </q-card-section>

          <q-item tag="label">
            <q-item-section side top>
              <q-checkbox v-model="signCheckbox" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Sign</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-input type="password" outlined dense v-model="signPassword" label="Password" @click.stop.prevent="signCheckbox = true" />
            </q-item-section>
          </q-item>
          
          <q-item tag="label">
            <q-item-section side top>
              <q-checkbox v-model="encryptCheckbox" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Encrypt</q-item-label>
            </q-item-section>
          </q-item>
          <q-card-actions align="right">
            <q-btn flat label="PGP Sign/Encrypt" color="primary" @click="signAndEncrypt" v-if="signCheckbox && encryptCheckbox" />
            <q-btn flat label="Sign" color="primary" @click="sign" v-if="signCheckbox && !encryptCheckbox" />
            <q-btn flat label="Encrypt" color="primary" @click="encrypt" v-if="!signCheckbox && encryptCheckbox" />
            <q-btn flat label="Cancel" color="grey-6" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog v-model="selfDestructingEmailDialog" persistent>
        <q-card class="q-px-sm">
          <q-card-section class="non-selectable">
            <div class="text-h6">Send a self-destructing secure email</div>
          </q-card-section>

          <q-item class="non-selectable">
            <q-item-section>
              <q-item-label caption>The Self-destructing secure messages support plain text only. All the formatting will be removed. Also, attachments cannot be encrypted and will be removed from the message.</q-item-label>
            </q-item-section>
          </q-item>

          <q-item class="non-selectable">
            <q-item-section>
              <q-item-label>Recipient:</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label v-if="selfDestructingShowPassword !== ''" disable>{{selfDestructingRecipient.full}}</q-item-label>
              <q-select v-if="selfDestructingShowPassword === ''"
                dense outlined style="width: 350px;"
                use-input input-debounce="0" fill-input hide-selected
                ref="selfDestructingRecipientSelect"
                v-model="selfDestructingRecipient" :options="selfDestructingRecipientOptions"
                @filter="getSelfDestructingRecipientOptionsOptions"
                @input-value="checkSelfDestructingRecipient"
              >
                <template v-if="selfDestructingRecipient && selfDestructingRecipient.key" v-slot:append>
                  <q-icon color="primary" name="vpn_key" />
                </template>
                <!-- <template v-slot:selected>
                  <span>
                    <q-item v-if="selfDestructingRecipient">
                      <q-item-section class="non-selectable">
                        <q-item-label v-html="selfDestructingRecipient.label" />
                      </q-item-section>
                      <q-item-section avatar v-if="selfDestructingRecipient.key">
                        <q-icon color="primary" name="vpn_key" />
                      </q-item-section>
                    </q-item>
                  </span>
                </template> -->
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      No results
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                    <q-item-section class="non-selectable">
                      <q-item-label v-html="scope.opt.encodedLabel" />
                    </q-item-section>
                    <q-item-section avatar v-if="scope.opt.key">
                      <q-icon color="primary" name="vpn_key" />
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </q-item-section>
          </q-item>

          <q-item class="non-selectable" style="padding-top: 0; margin-top: -14px;" v-if="selfDestructingShowPassword === ''">
            <q-item-section>
              <q-item-label caption v-if="!selfDestructingRecipient">Please select recipient first.</q-item-label>
              <q-item-label caption v-if="selfDestructingRecipient && !selfDestructingRecipient.key">Selected recipient has no PGP public key. The key based encryption is not allowed.</q-item-label>
              <q-item-label caption v-if="selfDestructingRecipient && selfDestructingRecipient.key">Selected recipient has PGP public key. The message can be encrypted using this key.</q-item-label>
            </q-item-section>
          </q-item>

          <q-item v-if="selfDestructingShowPassword === ''" class="non-selectable">
            <q-item-section>
              <q-item-label>Message lifetime:</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-select dense outlined v-model="selfDestructingLifetime" :options="selfDestructingLifetimeOptions" style="width: 350px;">
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                    <q-item-section class="non-selectable">
                      <q-item-label v-html="scope.opt.label" />
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </q-item-section>
          </q-item>

          <q-item :disable="!selfDestructingRecipient" v-if="selfDestructingShowPassword === ''" class="non-selectable">
            <q-item-section>
              <q-item-label>Encryption type:</q-item-label>
            </q-item-section>
            <q-item-section side style="flex-direction: row; justify-content: flex-start;" class="q-gutter-sm">
              <q-radio :disable="!selfDestructingRecipient || !selfDestructingRecipient.key" v-model="selfDestructingEncryptType" val="key" label="Key based" />
              <q-radio :disable="!selfDestructingRecipient" v-model="selfDestructingEncryptType" val="password" label="Password based" />
            </q-item-section>
          </q-item>

          <q-item style="padding-bottom: 0; margin-bottom: -14px;" v-if="selfDestructingShowPassword === '' && selfDestructingRecipient" class="non-selectable">
            <q-item-section>
              <q-item-label v-if="selfDestructingEncryptType === 'password'" caption>The Password based encryption will be used.</q-item-label>
              <q-item-label v-if="selfDestructingEncryptType === 'key'" caption>The Key based encryption will be used.</q-item-label>
            </q-item-section>
          </q-item>
          <q-item tag="label" :disable="!selfDestructingRecipient || selfDestructingEncryptType === 'password'" v-if="selfDestructingShowPassword === ''">
            <q-item-section side top>
              <q-checkbox v-model="selfDestructingAddSignature" :disable="!selfDestructingRecipient || selfDestructingEncryptType === 'password'" />
            </q-item-section>
            <q-item-section class="non-selectable">
              <q-item-label>Add digital signature</q-item-label>
            </q-item-section>
            <q-item-section v-if="selfDestructingAddSignature" side>
              <q-item-label>Password:</q-item-label>
            </q-item-section>
            <q-item-section v-if="selfDestructingAddSignature" side>
              <q-input type="password" outlined dense v-model="selfDestructingSignaturePassword" />
            </q-item-section>
          </q-item>
          <q-item style="padding-top: 0; margin-top: -14px;" v-if="selfDestructingShowPassword === ''" class="non-selectable">
            <q-item-section>
              <q-item-label v-if="selfDestructingAddSignature" caption>Will sign the data with your private key.</q-item-label>
              <q-item-label v-if="!selfDestructingAddSignature" caption>Will not sign the data.</q-item-label>
            </q-item-section>
          </q-item>

          <q-card-actions align="right" v-if="selfDestructingShowPassword === ''" class="non-selectable">
            <q-btn flat label="Encrypt" v-if="selfDestructingRecipient" color="primary" @click="sendSelfDestructingSecureEmail" />
            <q-btn flat label="Cancel" color="grey-6" v-close-popup />
          </q-card-actions>

          <q-item v-if="selfDestructingShowPassword !== ''">
            <q-item-section>
              <span class="rounded-borders q-pa-md bg-grey-2">
              <q-item-label class="h6 non-selectable">Encrypted message password:</q-item-label>
              <q-item-label lines="2" class="text-bold">{{ selfDestructingShowPassword }}</q-item-label>
              </span>
            </q-item-section>
            <q-item-section side>
            </q-item-section>
          </q-item>

          <q-item v-if="selfDestructingShowPassword !== ''" class="non-selectable">
            <q-item-section>
              <q-item-label caption>The password must be sent using a different channel. Store the password somewhere. You will not be able to recover it otherwise.</q-item-label>
            </q-item-section>
          </q-item>

          <q-card-actions align="right" v-if="selfDestructingShowPassword !== ''" class="non-selectable">
            <q-btn flat label="Ok" v-if="selfDestructingRecipient" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <div class="column bg-white" style="min-width: 300px;" v-show="maximizedToggle">
        <q-toolbar class="col-auto q-pa-md bg-grey-9 theme-text">
          <q-toolbar-title @dblclick="maximizedToggle = false">
            {{subjectText !== '' ? subjectText : 'New message'}}
          </q-toolbar-title>
          <q-space />
          <q-btn flat icon="minimize" @click="maximizedToggle = true" :disable="maximizedToggle">
            <!-- <q-tooltip content-class="bg-white text-primary">Minimize</q-tooltip> -->
          </q-btn>
          <q-btn flat icon="crop_square" @click="maximizedToggle = false" :disable="!maximizedToggle">
            <!-- <q-tooltip content-class="bg-white text-primary">Maximize</q-tooltip> -->
          </q-btn>
          <q-btn flat icon="close" @click="saveAndClose">
            <q-tooltip content-class="bg-white text-primary">Save&nbsp;and&nbsp;Close</q-tooltip>
          </q-btn>
        </q-toolbar>
      </div>
      <div class="column no-wrap bg-white non-selectable" style="width: 90%; max-width: initial; height: 90%; " v-show="!maximizedToggle">
        <q-toolbar class="col-auto q-pa-md bg-grey-9 theme-text">
          <q-btn flat icon="send" label="Send" @click="send" :disable="!isEnableSending" />
          <q-btn flat icon="save" label="Save" @click="save" />
          <q-btn-dropdown flat icon-color="grey" text-color="white" icon="priority_high" label="Importance">
            <q-list class="non-selectable">
              <q-item clickable :class="iImportance === 5 ? 'bg-grey-3' : ''" v-close-popup @click="setImportance(5)">
                <q-item-section>
                  <q-item-label>Low</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable :class="iImportance === 3 ? 'bg-grey-3' : ''" v-close-popup @click="setImportance(3)">
                <q-item-section>
                  <q-item-label>Normal</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable :class="iImportance === 1 ? 'bg-grey-3' : ''" v-close-popup @click="setImportance(1)">
                <q-item-section>
                  <q-item-label>High</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
          <q-btn flat :icon="bReadingConfirmation ? 'check_box' : 'check_box_outline_blank'" label="Reading confirmation" @click="triggerReadingConfirmation" />
          <q-btn flat icon="vpn_key" v-if="!pgpApplied" label="PGP Sign/Encrypt" @click="confirmOpenPgp" />
          <q-btn flat icon="vpn_key" v-if="pgpApplied" label="Undo PGP" @click="undoPGP" />
          <q-btn flat icon="mail_outline" label="Send a self-destructing email" @click="openSelfDestructingEmailDialog" />
          <q-space />
          <q-btn flat icon="minimize" @click="maximizedToggle = true" :disable="maximizedToggle">
            <!-- <q-tooltip content-class="bg-white text-primary">Minimize</q-tooltip> -->
          </q-btn>
          <q-btn flat icon="crop_square" @click="maximizedToggle = false" :disable="!maximizedToggle">
            <!-- <q-tooltip content-class="bg-white text-primary">Maximize</q-tooltip> -->
          </q-btn>
          <q-btn flat icon="close" @click="saveAndClose">
            <q-tooltip content-class="bg-white text-primary">Save&nbsp;and&nbsp;Close</q-tooltip>
          </q-btn>
        </q-toolbar>
        <div class="col">
          <div class="row full-height full-width">
            <div class="col column full-height">
              <div class="col-auto">
                <q-list>
                  <q-item style="background: #96c671; color: white; border: solid 1px #82b35d;" v-show="allowAtoEncryptSignMessage">
                    <q-item-section side>
                      <q-icon color="white" name="lock" />
                    </q-item-section>
                    <q-item-section>
                      <div>
                        <q-checkbox dark v-model="autoEncryptSignMessage" label="The message will be automatically encrypted and/or signed for contacts with OpenPgp keys" />
                      </div>
                      <div>
                        <q-item-label>OpenPGP supports plain text only. All the formatting will be removed before encryption.</q-item-label>
                      </div>
                    </q-item-section>
                  </q-item>
                  <q-item v-if="allIdentities.length > 1">
                    <q-item-section side center style="min-width: 100px;">
                      From
                    </q-item-section>
                    <q-item-section>
                      <q-select dense outlined v-model="selectedIdentity" :options="allIdentitiesOptions"></q-select>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section side center style="min-width: 100px;">
                      To
                    </q-item-section>
                    <q-item-section>
                      <q-select
                        dense outlined class="recipients-select"
                        use-input use-chips multiple input-debounce="0"
                        ref="toAddrSelect"
                        v-model="selectedToAddr" :options="toAddrOptions" :disable="disableRecipients"
                        @filter="getToAddrOptions"
                      >
                        <template v-slot:selected>
                          <span v-if="selectedToAddr">
                            <q-chip flat v-for="oAddr in selectedToAddr" :key="oAddr.value" removable @remove="removeSelectedToAddr(oAddr.value)">
                              {{ oAddr.short }}
                              <q-icon v-if="oAddr.hasPgpKey && oAddr.pgpEncrypt" color="green" name="lock" />
                              <q-icon v-if="oAddr.hasPgpKey && !oAddr.pgpEncrypt" color="orange" name="lock_open" />
                              <q-icon v-if="oAddr.hasPgpKey && oAddr.pgpSign" color="green" name="edit" />
                              <q-tooltip content-class="text-caption">{{ oAddr.full }}</q-tooltip>
                            </q-chip>
                          </span>
                        </template>
                        <template v-slot:no-option>
                          <q-item>
                            <q-item-section class="text-grey">
                              No results
                            </q-item-section>
                          </q-item>
                        </template>
                        <template v-slot:option="scope">
                          <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                            <q-item-section class="non-selectable">
                              <q-item-label>
                                {{ scope.opt.label }}
                                <q-icon v-if="scope.opt.hasPgpKey" name="vpn_key" />
                              </q-item-label>
                            </q-item-section>
                          </q-item>
                        </template>
                      </q-select>
                    </q-item-section>
                    <q-item-section style="max-width: 100px;" v-show="!isCcShowed || !isBccShowed">
                      <a href="javascript:void(0)" v-show="!isCcShowed" @click="showCc" class="text-primary">Show CC</a>
                      <a href="javascript:void(0)" v-show="!isBccShowed" @click="showBcc" class="text-primary">Show BCC</a>
                    </q-item-section>
                  </q-item>
                  <q-item v-show="isCcShowed">
                    <q-item-section side center style="min-width: 100px;">
                      CC
                    </q-item-section>
                    <q-item-section>
                      <q-select
                        dense outlined class="recipients-select"
                        use-input use-chips multiple input-debounce="0"
                        ref="ccAddrSelect"
                        v-model="selectedCcAddr" :options="ccAddrOptions" :disable="disableRecipients"
                        @filter="getCcAddrOptions"
                      >
                        <template v-slot:selected>
                          <span v-if="selectedCcAddr">
                            <q-chip flat v-for="oAddr in selectedCcAddr" :key="oAddr.value" removable @remove="removeSelectedCcAddr(oAddr.value)">
                              {{ oAddr.short }}
                              <q-icon v-if="oAddr.hasPgpKey && oAddr.pgpEncrypt" color="green" name="lock" />
                              <q-icon v-if="oAddr.hasPgpKey && !oAddr.pgpEncrypt" color="orange" name="lock_open" />
                              <q-icon v-if="oAddr.hasPgpKey && oAddr.pgpSign" color="green" name="edit" />
                              <q-tooltip content-class="text-caption">{{ oAddr.full }}</q-tooltip>
                            </q-chip>
                          </span>
                        </template>
                        <template v-slot:no-option>
                          <q-item>
                            <q-item-section class="text-grey">
                              No results
                            </q-item-section>
                          </q-item>
                        </template>
                        <template v-slot:option="scope">
                          <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                            <q-item-section class="non-selectable">
                              <q-item-label>
                                {{ scope.opt.label }}
                                <q-icon v-if="scope.opt.hasPgpKey" name="vpn_key" />
                              </q-item-label>
                            </q-item-section>
                          </q-item>
                        </template>
                      </q-select>
                    </q-item-section>
                  </q-item>
                  <q-item v-show="isBccShowed">
                    <q-item-section side center style="min-width: 100px;">
                      BCC
                    </q-item-section>
                    <q-item-section>
                      <q-select
                        dense outlined class="recipients-select"
                        use-input use-chips multiple input-debounce="0"
                        ref="bccAddrSelect"
                        v-model="selectedBccAddr" :options="bccAddrOptions" :disable="disableRecipients"
                        @filter="getBccAddrOptions"
                      >
                        <template v-slot:selected>
                          <span v-if="selectedBccAddr">
                            <q-chip flat v-for="oAddr in selectedBccAddr" :key="oAddr.value" removable @remove="removeSelectedBccAddr(oAddr.value)">
                              {{ oAddr.short }}
                              <q-icon v-if="oAddr.hasPgpKey && oAddr.pgpEncrypt" color="green" name="lock" />
                              <q-icon v-if="oAddr.hasPgpKey && !oAddr.pgpEncrypt" color="orange" name="lock_open" />
                              <q-icon v-if="oAddr.hasPgpKey && oAddr.pgpSign" color="green" name="edit" />
                              <q-tooltip content-class="text-caption">{{ oAddr.full }}</q-tooltip>
                            </q-chip>
                          </span>
                        </template>
                        <template v-slot:no-option>
                          <q-item>
                            <q-item-section class="text-grey">
                              No results
                            </q-item-section>
                          </q-item>
                        </template>
                        <template v-slot:option="scope">
                          <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                            <q-item-section class="non-selectable">
                              <q-item-label>
                                {{ scope.opt.label }}
                                <q-icon v-if="scope.opt.hasPgpKey" name="vpn_key" />
                              </q-item-label>
                            </q-item-section>
                          </q-item>
                        </template>
                      </q-select>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section side center style="min-width: 100px;">
                      Subject
                    </q-item-section>
                    <q-item-section>
                      <q-input dense outlined v-model="subjectText" style="width: 100%;" />
                    </q-item-section>
                  </q-item>
                </q-list>
                <!-- :definitions="{
                  colors: {
                    tip: 'Font & background colors',
                    icon: 'text_format',
                    handler: changeColors
                  },
                }" -->
              </div>
              <div class="col q-pa-md full-width "> 
                <q-editor class="full-height"
                  ref="editor" 
                  v-model="editortext"
                  height="calc(100% - 32px)"
                  :disable="disableEditor"
                  :toolbar="editorToolbar"
                  :fonts="{
                    arial: 'Arial',
                    arial_black: 'Arial Black',
                    courier_new: 'Courier New',
                    tahoma: 'Tahoma',
                    times_new_roman: 'Times New Roman',
                    verdana: 'Verdana'
                  }"
                >
                  <template v-slot:image>
                    <q-btn-dropdown
                      flat
                      dense
                      size="sm"
                      class="arrowless"
                      icon="image"
                      ref="insertImageDropdown"
                      @hide="imageUrl=''"
                    >
                      <template v-slot:label>
                        <q-tooltip>Insert Image</q-tooltip>
                      </template>

                      <q-card class="">
                          <q-item-label header>Please select an image file to upload</q-item-label>
                          <q-item>
                            <q-btn outline class="full-width" color="primary" @click="insertImage" label="Choose File" />
                          </q-item>

                          <q-item-label header>or enter an URL:</q-item-label>
                          <q-item>
                            <q-input outlined dense type="text" class="full-width" v-model="imageUrl" />
                          </q-item>
                  
                        <q-card-actions align="right">
                          <q-btn flat color="primary" label="Insert" @click="insertImageByUrl" />
                          <q-btn flat color="grey-6" label="Cancel" @click="cancelInsertImage" />
                        </q-card-actions>
                      </q-card>
                      <div>
                      </div>
                    </q-btn-dropdown>
                  </template>
                </q-editor>
                <q-uploader style="display: none;"
                    ref="imageUploader"
                    auto-upload
                    hide-upload-btn
                    :accept="acceptedImageTypes"
                    :factory="uploaderFactory"
                    @added="onImageFileAdded"
                    @uploaded="onFileUploaded"
                    @failed="onFileUploadFailed"
                  >
                    <template v-slot:header="scope">
                      <q-uploader-add-trigger />
                    </template>
                    <template v-slot:list="scope" >
                    </template>
                </q-uploader>
              </div>
            </div>
            <div class="col-auto q-py-md q-pr-md column full-height" style="min-width: 350px;">
              <div class="col-auto column items-center">
                <q-btn no-wrap no-caps unelevated icon="attachment" @click="pickFiles">
                  <q-tooltip>Pick Files</q-tooltip>
                </q-btn>
              </div>
              <div class="col-auto">
                <q-separator />
              </div>
              
              <div class="attachments-uploader col column full-height full-width">
                <q-uploader
                    style="max-height: initial"
                    class="col full-height full-width"
                    flat
                    ref="uploader"
                    multiple
                    auto-upload
                    hide-upload-btn
                    :factory="uploaderFactory"
                    @added="onFileAdded"
                    @uploaded="onFileUploaded"
                    @failed="onFileUploadFailed"
                  >
                    <template v-slot:header="scope">
                      <div class="" style="opacity: 0; height: 0px;">
                        <!-- <q-btn v-if="scope.queuedFiles.length > 0" icon="clear_all" @click="scope.removeQueuedFiles" round dense flat >
                          <q-tooltip>Clear All</q-tooltip>
                        </q-btn>
                        <q-btn v-if="scope.uploadedFiles.length > 0" icon="done_all" @click="scope.removeUploadedFiles" round dense flat >
                          <q-tooltip>Remove Uploaded Files</q-tooltip>
                        </q-btn>
                        <q-spinner v-if="scope.isUploading" class="q-uploader__spinner">
                        </q-spinner>
                        <div class="col">
                          <div class="q-uploader__title">Upload your files</div>
                          <div class="q-uploader__subtitle">{{ scope.uploadSizeLabel }} / {{ scope.uploadProgressLabel }}</div>
                        </div> -->
                        <q-btn dense flat type="a" icon="add_box">
                          <q-uploader-add-trigger />
                          <q-tooltip>Pick Files</q-tooltip>
                        </q-btn>
                        <!-- <q-btn v-if="scope.canUpload" icon="cloud_upload" @click="scope.upload" round dense flat >
                          <q-tooltip>Upload Files</q-tooltip>
                        </q-btn>

                        <q-btn v-if="scope.isUploading" icon="clear" @click="scope.abort" round dense flat >
                          <q-tooltip>Abort Upload</q-tooltip>
                        </q-btn> -->
                      </div>
                    </template>
                    <template v-slot:list="scope" class="full-height">
                      <q-scroll-area class="full-height full-width">
                        <q-list separator>
                          <q-item v-for="attach in notLinkedAttachments" :key="attach.sLocalPath || attach.sHash">
                            <q-item-section>
                              <q-item-label class="full-width ellipsis">
                                {{ attach.sFileName }}
                              </q-item-label>
                              <q-item-label caption>
                                Status: <span :style="attach.bUploadFailed ? 'color: red;' : (attach.iProgressPercent === 100 ? 'color: green;' : 'color: orange;')">{{ attach.getStatus() }}</span>
                              </q-item-label>
                              <q-item-label caption>
                                <span v-if="attach.getFriendlySize() !== '0B'">{{ attach.getFriendlySize() }} / </span>{{ attach.getProgressPercent() }}%
                              </q-item-label>
                            </q-item-section>
                            <q-item-section side 
                              v-if="attach.sThumbnailLink"
                              class="gt-xs thumb"
                              
                            >
                              <img :src="sApiHost + '/' + attach.sThumbnailLink">
                            </q-item-section>

                            <q-item-section  side>
                              <q-btn
                                v-if="attach.iProgressPercent === 100"
                                class="gt-xs"
                                size="12px"
                                flat
                                dense
                                round
                                icon="delete"
                                @click="removeAttachment(scope, attach)"
                              />
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </q-scroll-area>
                      <!-- <q-list separator>

                        <q-item v-for="file in scope.files" :key="file.name">
                          <q-item-section>
                            <q-item-label class="full-width ellipsis">
                              {{ file.name }}
                            </q-item-label>

                            <q-item-label caption>
                              Status: {{ file.__status }}
                            </q-item-label>

                            <q-item-label caption>
                              {{ file.__sizeLabel }} / {{ file.__progressLabel }}
                            </q-item-label>
                          </q-item-section>

                          <q-item-section
                            v-if="file.__img"
                            thumbnail
                            class="gt-xs"
                          >
                            <img :src="file.__img.src">
                          </q-item-section>

                          <q-item-section top side>
                            <q-btn
                              class="gt-xs"
                              size="12px"
                              flat
                              dense
                              round
                              icon="delete"
                              @click="scope.removeFile(file)"
                            />
                          </q-item-section>
                        </q-item>

                      </q-list> -->
                    </template>
                  </q-uploader>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- <q-bar> -->
      <!-- </q-bar> -->
    </q-dialog>
</template>

<style lang="scss">
.attachments-uploader {
  .q-uploader {
    border-radius: 0px;
  }
  .q-uploader__header {
    background: none;
    display:none;
  }
  .q-uploader__list {
    padding: 0px;
    overflow: hidden;

    .thumb {
      width: 100px;
      max-height: 80px;
      justify-content: flex-start;
      overflow: hidden;

      img {
        width: 100%;
      }
    }
  }
  .q-uploader__dnd {
    outline: 0px;
    top: 5px;
    background: rgba(#fffdd6, 0.5);
    border: 2px dashed #e2da36;
    border-radius: 5px;
  }
}

.compose-dialog {
  .q-dialog__inner > div {
    overflow: hidden;
  }
  .q-dialog__inner--maximized {
    align-items: flex-end;
    justify-content: flex-end;

    & > div {
      height: 60px;
      width: 500px;
      max-height: 100vh;
      max-width: 100vw;
      border-radius: 0 !important;
    }
  } 
}

.arrowless {
  .q-btn-dropdown__arrow {
    display: none;
  }

}

.recipients-select {
  width: 100%;

  .remove-recipient-icon {
    cursor: pointer;
    margin-left: 4px;
  }
}
</style>

<script>
import { ipcRenderer } from 'electron'
import moment from 'moment-timezone'

import addressUtils from 'src/utils/address.js'
import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'
import textUtils from 'src/utils/text.js'
import typesUtils from 'src/utils/types.js'
import webApi from 'src/utils/webApi'

import coreSettings from 'src/modules/core/settings.js'

import cAttachment from 'src/modules/mail/classes/cAttachment.js'
import cIdentity from 'src/modules/mail/classes/cIdentity.js'
import cAlias from 'src/modules/mail/classes/cAlias.js'
import composeUtils from 'src/modules/mail/utils/compose.js'
import mailSettings from 'src/modules/mail/settings.js'

import OpenPgp from 'src/modules/openpgp/OpenPgp.js'
import openpgpSettings from 'src/modules/openpgp/settings.js'

import cContact from 'src/modules/contacts/classes/CContact.js'

export default {
  name: 'MailCompose',

  components: {
  },

  data () {
    return {
      dialog: false,
      maximizedToggle: false,

      allowInsertImage: false,

      sending: false, // indicates if sending is happening right now
      saving: false, // indicates if saving is happening right now
      allAttachmentsUploaded: true, // indicates if all attachments are loaded from server (for forward or sending files from other modules)
      oCommitedMessageData: null,

      selectedIdentity: null,

      autoEncryptSignMessage: false,

      plainText: false,
      disableEditor: false,
      pgpApplied: false,
      editortext: '',
      editortextBeforePgp: '',
      disableRecipients: false,
      subjectText: '',
      iImportance: 3,
      bReadingConfirmation: false,

      draftInfo: [],
      draftUid: '',
      attachments: [],
      inReplyTo: '',
      references: '',

      isCcShowed: false,
      isBccShowed: false,

      iAutosaveTimer: 0,

      acceptedImageTypes: 'image/*',
      imageUrl: '',

      convertToPlainConfirm: false,
      pgpSignEncryptDialog: false,
      signCheckbox: true,
      encryptCheckbox: true,
      signPassword: '',

      selectedToAddr: null,
      toAddrOptions: [],
      selectedCcAddr: null,
      ccAddrOptions: [],
      selectedBccAddr: null,
      bccAddrOptions: [],

      selfDestructingEmailDialog: false,
      selfDestructingRecipient: '',
      selfDestructingRecipientOptions: [],
      selfDestructingLifetime: { label: '24 hrs', value: 24 },
      selfDestructingLifetimeOptions: [
        { label: '24 hrs', value: 24 },
        { label: '72 hrs', value: 72 },
        { label: '7 days', value: 168 }
      ],
      selfDestructingEncryptType: '',
      selfDestructingAddSignature: false,
      selfDestructingSignaturePassword: '',
      selfDestructingShowPassword: '',
    }
  },

  computed: {
    sApiHost () {
      return this.$store.getters['main/getApiHost']
    },
    currentFolderList () {
      return this.$store.getters['mail/getCurrentFolderList']
    },
    currentAccount () {
      return this.$store.getters['mail/getCurrentAccount']
    },
    allIdentities () {
      let aAliases = this.currentAccount && _.isArray(this.currentAccount.aAliases) ? this.currentAccount.aAliases : []
      let aIdentities = this.$store.getters['mail/getCurrentIdentities']
      if (!_.isArray(aIdentities)) {
        aIdentities = []
      }
      return aIdentities.concat(aAliases)
    },
    allIdentitiesOptions () {
      return _.map(this.allIdentities, function (oIdentity) {
        return {
          label: textUtils.encodeHtml(oIdentity.getFull()),
          value: oIdentity,
        }
      })
    },
    toAddrComputed () {
      return _.map(this.selectedToAddr, function (oAddr) {
        return oAddr.full
      }).join(',')
    },
    ccAddrComputed () {
      return _.map(this.selectedCcAddr, function (oAddr) {
        return oAddr.full
      }).join(',')
    },
    bccAddrComputed () {
      return _.map(this.selectedBccAddr, function (oAddr) {
        return oAddr.full
      }).join(',')
    },
    /**
     * Determines if sending a message is allowed.
     */
    isEnableSending () {
      let
        bRecipientIsEmpty = this.toAddrComputed.length === 0 && this.ccAddrComputed.length === 0 && this.bccAddrComputed.length === 0,
        bCurrentFolderListLoaded = !!this.currentFolderList && this.currentFolderList.AccountId !== 0

      return bCurrentFolderListLoaded && !this.sending && !bRecipientIsEmpty && this.allAttachmentsUploaded
    },
    notLinkedAttachments () {
      return _.filter(this.attachments, function (oAttach) {
        return !oAttach.bLinked
      })
    },
    recipientEmails () {
      let
        aRecip = [this.toAddrComputed, this.ccAddrComputed, this.bccAddrComputed].join(',').split(','),
        aEmails = []

      _.each(aRecip, function (sRecip) {
        let sTrimmedRecip = _.trim(sRecip)
        if (sTrimmedRecip !== '') {
          let oRecip = addressUtils.getEmailParts(sTrimmedRecip)
          if (oRecip.email) {
            aEmails.push(oRecip.email)
          }
        }
      })

      return aEmails
    },
    editorToolbar () {
      if (this.disableEditor) {
        return []
      }
      let aLastSection = this.allowInsertImage ? ['link', 'image', 'removeFormat'] : ['link', 'removeFormat']
      return [
        ['undo', 'redo'],
        ['bold', 'italic', 'underline', 'strike'],
        [{
          list: 'no-icons',
          options: [
            'default_font',
            'arial',
            'arial_black',
            'courier_new',
            'tahoma',
            'times_new_roman',
            'verdana'
          ],
        }, {
          list: 'no-icons',
          options: [
            'size-2',
            'size-3',
            'size-5',
            'size-7'
          ],
        },
        'colors'],
        ['unordered', 'ordered'],
        aLastSection
      ]
    },
    allowAtoEncryptSignMessage () {
      let aAllAddr = []
      aAllAddr = aAllAddr.concat(this.selectedToAddr, this.selectedCcAddr, this.selectedBccAddr)
      return !!_.find(aAllAddr, (oAddr) => {
        return oAddr && oAddr.hasPgpKey && (oAddr.pgpSign || oAddr.pgpEncrypt)
      })
    },
  },

  watch: {
    allIdentities () {
      this.setSelectedIdentity()
    },
    selectedIdentity () {
      let re = composeUtils.getSignatureRegexp()
      let bSignatureFound = !!this.editortext.match(re)
      if (bSignatureFound) {
        let oIdentity = this.selectedIdentity && this.selectedIdentity.value
        let sSignature = oIdentity && oIdentity.bUseSignature ? typesUtils.pString(oIdentity.sSignature, '') : ''
        this.editortext = this.editortext.replace(re, composeUtils.getTagWrappedSignature(sSignature))
      }
    },
    allowAtoEncryptSignMessage () {
      this.autoEncryptSignMessage = this.allowAtoEncryptSignMessage
    },
    selectedToAddr (aAddr, aPrevAddr) {
      aAddr = typesUtils.pArray(aAddr)
      aPrevAddr = typesUtils.pArray(aPrevAddr)
      if (aAddr.length > aPrevAddr.length && this.$refs.toAddrSelect) {
        this.$refs.toAddrSelect.updateInputValue('')
      }
    },
    selectedCcAddr (aAddr, aPrevAddr) {
      aAddr = typesUtils.pArray(aAddr)
      aPrevAddr = typesUtils.pArray(aPrevAddr)
      if (aAddr.length > aPrevAddr.length && this.$refs.ccAddrSelect) {
        this.$refs.ccAddrSelect.updateInputValue('')
      }
    },
    selectedBccAddr (aAddr, aPrevAddr) {
      aAddr = typesUtils.pArray(aAddr)
      aPrevAddr = typesUtils.pArray(aPrevAddr)
      if (aAddr.length > aPrevAddr.length && this.$refs.bccAddrSelect) {
        this.$refs.bccAddrSelect.updateInputValue('')
      }
    },
    selfDestructingEncryptType () {
      this.selfDestructingAddSignature = this.selfDestructingEncryptType === 'key'
    },
    selfDestructingRecipient () {
      if (this.selfDestructingRecipient) {
        this.selfDestructingEncryptType = 'password'
      } else {
        this.selfDestructingEncryptType = ''
      }
    },
  },

  beforeDestroy: function () {
    this.clearAutosaveTimer()
  },

  methods: {
    setImportance (iImportance) {
      this.iImportance = iImportance
    },
    triggerReadingConfirmation () {
      this.bReadingConfirmation = !this.bReadingConfirmation
    },
    checkSelfDestructingRecipient (sNewValue) {
      if (this.selfDestructingRecipient && this.selfDestructingRecipient.label !== sNewValue) {
        this.selfDestructingRecipient = null
      }
    },
    getSelfDestructingRecipientOptionsOptions (sSearch, update, abort) {
      ipcRenderer.once('contacts-get-frequently-used-contacts', (oEvent, { aContacts }) => {
        let sFromEmail = this.selectedIdentity ? this.selectedIdentity.value.sEmail : ''
        let aPublicKeys = _.filter(this.$store.getters['main/getOpenPgpKeys'], function (oKey) {
          let oKeyEmail = addressUtils.getEmailParts(oKey.sEmail)
          return oKey.bPublic && oKeyEmail.email !== sFromEmail
        })
        let aEmailsToExclude = []
        let sEncodedSearch = textUtils.encodeHtml(sSearch)
        let iExactlySearchIndex = -1
        let aOptions = []
        _.each(aContacts, function (oContactData, iIndex) {
          let oContact = new cContact(oContactData)
          if (oContact.ViewEmail !== sFromEmail) {
            let sEncodedFull = textUtils.encodeHtml(oContact.getFull())
            if (sEncodedSearch === sEncodedFull) {
              iExactlySearchIndex = iIndex
            }
            let bKey = !!_.find(aPublicKeys, function (oKey) {
              let oKeyEmail = addressUtils.getEmailParts(oKey.sEmail)
              return oKeyEmail.email === oContact.ViewEmail
            })
            aOptions.push({
              encodedLabel: sEncodedFull,
              value: 'id_' + oContact.EntityId,
              label: oContact.getFull(),
              short: oContact.FullName || oContact.ViewEmail,
              email: oContact.ViewEmail,
              key: bKey
            })
            if (bKey) {
              aEmailsToExclude.push(oContact.ViewEmail)
            }
          }
        })
        let bAddFirstOption = sEncodedSearch !== '' && iExactlySearchIndex === -1
        if (bAddFirstOption) {
          let oEmailParts = addressUtils.getEmailParts(sSearch)
          aOptions.unshift({
            encodedLabel: sEncodedSearch,
            value: 'rand_' + Math.round(Math.random() * 10000),
            label: sSearch,
            short: oEmailParts.name || oEmailParts.email,
            email: oEmailParts.email,
            key: !!_.find(aPublicKeys, function (oKey) {
              let oKeyEmail = addressUtils.getEmailParts(oKey.sEmail)
              return oKeyEmail.email === oEmailParts.email
            })
          })
        }
        _.each(aPublicKeys, (oKey) => {
          let oKeyEmail = addressUtils.getEmailParts(oKey.sEmail)
          if (oKey.sEmail.indexOf(sSearch) !== -1 && _.indexOf(aEmailsToExclude, oKeyEmail.email) === -1) {
            aOptions.push({
              encodedLabel: textUtils.encodeHtml(oKeyEmail.full),
              value: 'keyid_' + oKey.sId,
              label: oKeyEmail.full,
              short: oKeyEmail.name || oKeyEmail.email,
              email: oKeyEmail.email,
              key: true
            })
          }
        })
        update(async () => {
          this.selfDestructingRecipientOptions = aOptions
          if (bAddFirstOption) {
            await this.$nextTick()
            this.$refs.selfDestructingRecipientSelect.setOptionIndex(0)
          } else if (iExactlySearchIndex >= 0) {
            await this.$nextTick()
            this.$refs.selfDestructingRecipientSelect.setOptionIndex(iExactlySearchIndex)
          }
        })
      })
      ipcRenderer.send('contacts-get-frequently-used-contacts', { sSearch })
    },
    getToAddrOptions (sSearch, update, abort) {
      this.getRecipientOptions(sSearch, update, abort, 'toAddrOptions', 'toAddrSelect')
    },
    getCcAddrOptions (sSearch, update, abort) {
      this.getRecipientOptions(sSearch, update, abort, 'ccAddrOptions', 'ccAddrSelect')
    },
    getBccAddrOptions (sSearch, update, abort) {
      this.getRecipientOptions(sSearch, update, abort, 'bccAddrOptions', 'bccAddrSelect')
    },
    getRecipientOptions (sSearch, update, abort, sOptionsName, sSelectName) {
      ipcRenderer.once('contacts-get-frequently-used-contacts', (oEvent, { aContacts }) => {
        let iExactlySearchIndex = -1
        let aOptions = []
        _.each(aContacts, function (oContactData, iIndex) {
          let oContact = new cContact(oContactData)
          if (sSearch === oContact.getFull()) {
            iExactlySearchIndex = iIndex
          }
          aOptions.push({
            label: oContact.getFull(),
            value: 'id_' + oContact.EntityId,
            full: oContact.getFull(),
            short: oContact.FullName || oContact.ViewEmail,
            email: oContact.ViewEmail,
            hasPgpKey: !!oContact.PublicPgpKey,
            pgpEncrypt: oContact.PgpEncryptMessages,
            pgpSign: oContact.PgpSignMessages,
          })
        })
        let bAddFirstOption = sSearch !== '' && iExactlySearchIndex === -1
        if (bAddFirstOption) {
          let oEmailParts = addressUtils.getEmailParts(sSearch)
          aOptions.unshift({
            label: sSearch,
            value: 'rand_' + Math.round(Math.random() * 10000),
            full: sSearch,
            short: oEmailParts.name || oEmailParts.email,
            email: oEmailParts.email,
            hasPgpKey: false,
            pgpEncrypt: false,
            pgpSign: false,
          })
        }
        update(async () => {
          this[sOptionsName] = aOptions
          if (bAddFirstOption) {
            await this.$nextTick()
            this.$refs[sSelectName].setOptionIndex(0)
          } else if (iExactlySearchIndex >= 0) {
            await this.$nextTick()
            this.$refs[sSelectName].setOptionIndex(iExactlySearchIndex)
          }
        })
      })
      ipcRenderer.send('contacts-get-frequently-used-contacts', { sSearch })
    },
    removeSelectedToAddr (sValue) {
      this.selectedToAddr = _.filter(this.selectedToAddr, function (oAddr) {
        return oAddr.value !== sValue
      })
    },
    removeSelectedCcAddr (sValue) {
      this.selectedCcAddr = _.filter(this.selectedCcAddr, function (oAddr) {
        return oAddr.value !== sValue
      })
    },
    removeSelectedBccAddr (sValue) {
      this.selectedBccAddr = _.filter(this.selectedBccAddr, function (oAddr) {
        return oAddr.value !== sValue
      })
    },
    confirmOpenPgp () {
      if (this.recipientEmails.length === 0) {
        notification.showError('To encrypt your message you need to specify at least one recipient.')
      } else if (!this.plainText) {
        this.convertToPlainConfirm = true
      } else {
        this.openPgpSignEncryptDialog()
      }
    },
    openPgpSignEncryptDialog () {
      this.signCheckbox = true
      this.encryptCheckbox = true
      this.signPassword = ''
      this.pgpSignEncryptDialog = true
    },
    getPlainEditorText () {
      return textUtils.htmlToPlain(this.editortext)
    },
    getPrivateCurrentKey () {
      let aOpenPgpKeys = this.$store.getters['main/getOpenPgpKeys']
      let aPrivateCurrentKey = _.filter(aOpenPgpKeys, (oKey) => {
        let oKeyEmail = addressUtils.getEmailParts(oKey.sEmail)
        return !oKey.bPublic && oKeyEmail.email === this.currentAccount.sEmail
      })
      if (aPrivateCurrentKey.length > 0) {
        return aPrivateCurrentKey[0]
      } else {
        notification.showError('No private key found for ' + this.currentAccount.sEmail + ' user.')
        return null
      }
    },
    async sign () {
      let oPrivateCurrentKey = this.getPrivateCurrentKey()
      if (oPrivateCurrentKey) {
        let { sSignedData, sError, oPgpResult } = await OpenPgp.sign(this.getPlainEditorText(), oPrivateCurrentKey, this.signPassword)
        if (sSignedData) {
          this.plainText = true
          this.disableEditor = true
          this.pgpApplied = true
          this.editortextBeforePgp = this.editortext
          this.editortext = '<pre>' + sSignedData + '</pre>'
          this.pgpSignEncryptDialog = false
        } else {
          notification.showError(sError)
        }
      }
    },
    getRecipientPublicKeys () {
      let aOpenPgpKeys = this.$store.getters['main/getOpenPgpKeys']
      let aRecipientPublicKeys = []
      let aNotFoundEmails = []

      _.each(this.recipientEmails, function (sEmail) {
        let oPublicKey = _.find(aOpenPgpKeys, function (oKey) {
          let oKeyEmail = addressUtils.getEmailParts(oKey.sEmail)
          return oKey.bPublic && oKeyEmail.email === sEmail
        })
        if (oPublicKey) {
          aRecipientPublicKeys.push(oPublicKey)
        } else {
          aNotFoundEmails.push(sEmail)
        }
      })

      if (aNotFoundEmails.length > 0) {
        notification.showError('No public key found for ' + aNotFoundEmails.join(', ') + ' user(s).')
        return []
      } else {
        return aRecipientPublicKeys
      }
    },
    async encrypt () {
      let aRecipientPublicKeys = this.getRecipientPublicKeys()
      if (aRecipientPublicKeys.length > 0) {
        let { sEncryptedData, sError, oPgpResult } = await OpenPgp.encrypt(this.getPlainEditorText(), aRecipientPublicKeys)
        if (sEncryptedData) {
          this.plainText = true
          this.disableEditor = true
          this.disableRecipients = true
          this.pgpApplied = true
          this.editortextBeforePgp = this.editortext
          this.editortext = '<pre>' + sEncryptedData + '</pre>'
          this.pgpSignEncryptDialog = false
        } else {
          notification.showError(sError)
        }
      }
    },
    async signAndEncrypt () {
      let oPrivateCurrentKey = this.getPrivateCurrentKey()
      let aRecipientPublicKeys = this.getRecipientPublicKeys()
      if (aRecipientPublicKeys.length > 0 && oPrivateCurrentKey) {
        let { sEncryptedSignedData, sError, oPgpResult } = await OpenPgp.signAndEncrypt(this.getPlainEditorText(), aRecipientPublicKeys, oPrivateCurrentKey, this.signPassword)
        if (sEncryptedSignedData) {
          this.plainText = true
          this.disableEditor = true
          this.disableRecipients = true
          this.pgpApplied = true
          this.editortextBeforePgp = this.editortext
          this.editortext = '<pre>' + sEncryptedSignedData + '</pre>'
          this.pgpSignEncryptDialog = false
        } else {
          notification.showError(sError)
        }
      }
    },
    undoPGP () {
      this.editortext = this.editortextBeforePgp
      this.plainText = false
      this.disableEditor = false
      this.disableRecipients = false
      this.pgpApplied = false
    },
    onBeforeHide () {
      this.clearAutosaveTimer() 
    },
    getEditorTextForSend () {
      let sEditortext = this.editortext
      if (this.plainText) {
        return sEditortext.replace('<pre>', '').replace('</pre>', '')
      }
      return sEditortext
    },
    getMessageData () {
      return {
        oCurrentAccount: this.currentAccount,
        oCurrentFolderList: this.currentFolderList,
        iIdentityId: (this.selectedIdentity && this.selectedIdentity.value instanceof cIdentity) ? this.selectedIdentity.value.iEntityId : 0,
        iAliasId: (this.selectedIdentity && this.selectedIdentity.value instanceof cAlias) ? this.selectedIdentity.value.iEntityId : 0,
        sToAddr: this.toAddrComputed,
        sCcAddr: this.ccAddrComputed,
        sBccAddr: this.bccAddrComputed,
        sSubject: this.subjectText,
        sText: this.getEditorTextForSend(),
        bPlainText: this.plainText,
        aAttachments: this.attachments,
        sDraftUid: this.draftUid,
        aDraftInfo: this.draftInfo,
        sInReplyTo: this.inReplyTo,
        sReferences: this.references,
        iImportance: this.iImportance,
        bReadingConfirmation: this.bReadingConfirmation,
      }
    },
    isMessageDataChanged () {
      let oCurrentMessageData = this.getMessageData()
      return (oCurrentMessageData.oCurrentAccount && oCurrentMessageData.oCurrentAccount.iAccountId) !== (this.oCommitedMessageData.oCurrentAccount && this.oCommitedMessageData.oCurrentAccount.iAccountId)
            || (oCurrentMessageData.oCurrentFolderList && oCurrentMessageData.oCurrentFolderList.AccountId) !== (this.oCommitedMessageData.oCurrentFolderList && this.oCommitedMessageData.oCurrentFolderList.AccountId)
            || oCurrentMessageData.iIdentityId !== this.oCommitedMessageData.iIdentityId
            || oCurrentMessageData.iAliasId !== this.oCommitedMessageData.iAliasId
            || oCurrentMessageData.sToAddr !== this.oCommitedMessageData.sToAddr
            || oCurrentMessageData.sCcAddr !== this.oCommitedMessageData.sCcAddr
            || oCurrentMessageData.sBccAddr !== this.oCommitedMessageData.sBccAddr
            || oCurrentMessageData.sSubject !== this.oCommitedMessageData.sSubject
            || oCurrentMessageData.sText !== this.oCommitedMessageData.sText
            || oCurrentMessageData.bPlainText !== this.oCommitedMessageData.bPlainText
            || !_.isEqual(oCurrentMessageData.aAttachments, this.oCommitedMessageData.aAttachments)
            || oCurrentMessageData.sInReplyTo !== this.oCommitedMessageData.sInReplyTo
            || oCurrentMessageData.sReferences !== this.oCommitedMessageData.sReferences
    },
    commitMessageData () {
      this.oCommitedMessageData = this.getMessageData()
    },
    send () {
      if (this.isEnableSending) {
        this.commitMessageData()
        this.clearAutosaveTimer()
        this.sending = true
        composeUtils.sendMessage(
          this.getMessageData(),
          (oResult, oError) => {
            this.sending = false
            if (oResult) {
              notification.showReport('Your message has been sent.')
              this.closeCompose()
              this.$store.dispatch('mail/asyncRefresh')
            } else {
              notification.showError(errors.getText(oError, 'Error occurred while sending message'))
            }
          }
        )
      }
    },
    save () {
      if (!this.saving && !this.sending) {
        this.commitMessageData()
        this.clearAutosaveTimer()
        this.saving = true
        composeUtils.saveMessage(
          this.getMessageData(),
          (oResult, oError, oParameters) => {
            this.saving = false
            if (oResult) {
              notification.showReport('Your message has been saved.')
              if (oParameters && oParameters.DraftUid === this.draftUid) {
                this.draftUid = typesUtils.pString(oResult.NewUid)
              }
              this.$store.dispatch('mail/asyncRefresh')
              this.setAutosaveTimer()
            } else {
              notification.showError(errors.getText(oError, 'Error occurred while saving message'))
            }
          }
        )
      }
    },
    setSelectedIdentity () {
      if (this.allIdentities.length === 0) {
        this.selectedIdentity = null
      } else {
        let mSelectedIdentityId = this.selectedIdentity ? this.selectedIdentity.value.iEntityId : false
        let mSelectedIdentityAccountId = this.selectedIdentity ? this.selectedIdentity.value.iIdAccount : false
        let oSelectedIdentity = _.find(this.allIdentities, function (oIdentity) {
          return oIdentity.iEntityId === mSelectedIdentityId && oIdentity.iIdAccount === mSelectedIdentityAccountId
        })
        if (!oSelectedIdentity) {
          let oIdentity = _.find(this.allIdentities, function (oIdentity) {
            return oIdentity.bDefault
          })
          if (!oIdentity) {
            oIdentity = this.allIdentities[0]
          }
          this.selectedIdentity = {
            label: textUtils.encodeHtml(oIdentity.getFull()),
            value: oIdentity,
          }
        }
      }
    },
    async openCompose ({ aDraftInfo, sDraftUid, oIdentity, aToContacts, aCcContacts, aBccContacts, sSubject, sText, aAttachments, sInReplyTo, sReferences, iImportance, bReadingConfirmation }) {
      this.allowInsertImage = mailSettings.bAllowInsertImage
      this.selectedIdentity = oIdentity ? {
        label: textUtils.encodeHtml(oIdentity.getFull()),
        value: oIdentity,
      } : null
      this.setSelectedIdentity()
      if (typesUtils.isNonEmptyArray(aToContacts)) {
        this.selectedToAddr = _.map(aToContacts, function (oContactData) {
          return {
            full: oContactData.full,
            label: textUtils.encodeHtml(oContactData.full),
            value: 'id_' + oContactData.id,
            short: oContactData.name || oContactData.email,
            email: oContactData.email,
          }
        })
      } else {
        this.selectedToAddr = []
      }
      if (typesUtils.isNonEmptyArray(aCcContacts)) {
        this.selectedCcAddr = _.map(aCcContacts, function (oContactData) {
          return {
            full: oContactData.full,
            label: textUtils.encodeHtml(oContactData.full),
            value: 'id_' + oContactData.id,
            short: oContactData.name || oContactData.email,
            email: oContactData.email,
          }
        })
      } else {
        this.selectedCcAddr = []
      }
      if (typesUtils.isNonEmptyArray(aBccContacts)) {
        this.selectedBccAddr = _.map(aBccContacts, function (oContactData) {
          return {
            full: oContactData.full,
            label: textUtils.encodeHtml(oContactData.full),
            value: 'id_' + oContactData.id,
            short: oContactData.name || oContactData.email,
            email: oContactData.email,
          }
        })
      } else {
        this.selectedBccAddr = []
      }
      this.subjectText = typesUtils.pString(sSubject)
      this.plainText = false
      this.disableEditor = false
      this.disableRecipients = false
      this.pgpApplied = false

      if (typesUtils.isNonEmptyString(sText)) {
        this.editortext = sText
      } else {
        let oIdentity = this.selectedIdentity && this.selectedIdentity.value
        let sSignature = oIdentity && oIdentity.bUseSignature ? typesUtils.pString(oIdentity.sSignature, '') : ''
        this.editortext = '<br><br>' + composeUtils.getTagWrappedSignature(sSignature)
      }

      this.attachments = []
      if (typesUtils.isNonEmptyArray(aAttachments)) {
        let aHashes = []
        _.each(aAttachments, (oAttachData) => {
          let oAttach = new cAttachment()
          oAttach.parseDataFromServer(oAttachData)
          this.attachments.push(oAttach)
          if (typesUtils.isNonEmptyString(oAttach.sHash)) {
            aHashes.push(oAttach.sHash)
          }
        })
        if (aHashes.length > 0) {
          webApi.sendRequest({
            sApiHost: this.sApiHost,
            sModule: 'Mail',
            sMethod: 'SaveAttachmentsAsTempFiles',
            oParameters: {
              Attachments: aHashes,
              AccountID: this.$store.getters['mail/getCurrentAccountId'],
            },
            fCallback: (aResult, oError) => {
              if (aResult) {
                _.each(aResult, (sHash, sTempName) => {
                  let oAttach = _.find(this.attachments, (oTmpAttach) => {
                    return oTmpAttach.sHash === sHash
                  })
                  if (oAttach) {
                    oAttach.setTempName(sTempName)
                    oAttach.onUploadComplete()
                  }
                })
                this.commitMessageData()
              } else {
                notification.showError(errors.getText(oError, 'Error occurred while preparing attachments'))
              }
            },
          })
        } else if (typesUtils.isNonEmptyString(aAttachments[0].Content)) {
          webApi.sendRequest({
            sApiHost: this.sApiHost,
            sModule: 'Core',
            sMethod: 'SaveContentAsTempFile',
            oParameters: aAttachments[0],
            fCallback: (oResult, oError) => {
              if (oResult) {
                let oAttach = this.attachments[0]
                if (oAttach) {
                  if (oResult.Size === 0) {
                    oResult.Size = aAttachments[0].Content.length
                  }
                  oAttach.parseDataFromServer(oResult)
                  oAttach.onUploadComplete()
                }
                this.commitMessageData()
              } else {
                notification.showError(errors.getText(oError, 'Error occurred while preparing attachments'))
              }
            },
          })
        } else if (typesUtils.isNonEmptyString(aAttachments[0].ContactUUID)) {
          webApi.sendRequest({
            sApiHost: this.sApiHost,
            sModule: 'Contacts',
            sMethod: 'SaveContactAsTempFile',
            oParameters: { 'UUID': aAttachments[0].ContactUUID, 'FileName': aAttachments[0].FileName },
            fCallback: (oResult, oError) => {
              if (oResult) {
                let oAttach = this.attachments[0]
                if (oAttach) {
                  oAttach.parseDataFromServer(oResult)
                  oAttach.onUploadComplete()
                }
                this.commitMessageData()
              } else {
                notification.showError(errors.getText(oError, 'Error occurred while preparing attachments'))
              }
            },
          })
        }
      }

      this.draftUid = typesUtils.pString(sDraftUid)
      this.draftInfo = typesUtils.pArray(aDraftInfo)
      this.inReplyTo = typesUtils.pString(sInReplyTo)
      this.references = typesUtils.pString(sReferences)
      this.iImportance = typesUtils.pInt(iImportance, 3)
      this.bReadingConfirmation = typesUtils.pBool(bReadingConfirmation, false)

      this.isCcShowed = typesUtils.isNonEmptyString(this.ccAddrComputed)
      this.isBccShowed = typesUtils.isNonEmptyString(this.bccAddrComputed)
      this.dialog = true

      await this.$nextTick()
      this.commitMessageData()
      this.setAutosaveTimer()
    },
    closeCompose () {
      this.dialog = false
    },
    setAutosaveTimer () {
      this.clearAutosaveTimer()
      if (this.dialog && mailSettings.bAllowAutosaveInDrafts && mailSettings.iAutoSaveIntervalSeconds > 0) {
        this.iAutosaveTimer = setTimeout(() => {
          if (this.isMessageDataChanged()) {
            this.save()
          } else {
            this.setAutosaveTimer()
          }
        }, mailSettings.iAutoSaveIntervalSeconds * 1000)
      }
    },
    clearAutosaveTimer () {
      clearTimeout(this.iAutosaveTimer)
    },
    showCc () {
      this.isCcShowed = true
    },
    showBcc () {
      this.isBccShowed = true
    },
    changeColors () {
      console.log('changeColors')
    },
    insertImage () {
      this.$refs.editor.focus()
      this.$refs.imageUploader.pickFiles()
    },
    insertImageByUrl () {
      this.$refs.editor.focus()
      document.execCommand('insertHTML', true, '<img src="' + this.imageUrl + '" />')
    },
    cancelInsertImage () {
      this.$refs.insertImageDropdown.hide()
    },
    uploaderFactory () {
      let url = this.sApiHost + '/?/Api/'
      let sAuthToken = this.$store.getters['user/getAuthToken']
      let headers = []
      if (sAuthToken) {
        headers.push({name: 'Authorization', value: 'Bearer ' + sAuthToken})
      }
      let iAccountId = this.currentAccount ? this.currentAccount.iAccountId : 0
      return {
        url,
        method: 'POST',
        headers,
        fieldName: 'jua-uploader',
        formFields: [
          { name: 'jua-post-type', value: 'ajax' },
          { name: 'Module', value: 'Mail' },
          { name: 'Method', value: 'UploadAttachment' },
          { name: 'Parameters', value: JSON.stringify({ 'AccountID': iAccountId }) },
        ],
      }
    },
    onImageFileAdded (files) {
      if (typesUtils.isNonEmptyArray(files)) {
        _.each(files, (oFile) => {
          let oAttach = new cAttachment()
          oAttach.parseUploaderFile(oFile, true)
          this.attachments.push(oAttach)
        })
      }
    },
    onFileAdded (files) {
      if (typesUtils.isNonEmptyArray(files)) {
        _.each(files, (oFile) => {
          let oAttach = new cAttachment()
          oAttach.parseUploaderFile(oFile, false)
          this.attachments.push(oAttach)
        })
      }
    },
    onFileUploaded ({ files, xhr }) {
      let oFile = typesUtils.isNonEmptyArray(files) ? files[0] : null
      let oAttach = oFile ? _.find(this.attachments, (oTmpAttach) => {
        return oTmpAttach.sLocalPath === oFile.path
      }) : null
      if (oAttach) {
        let oResponse = typesUtils.pStringToJson(xhr.responseText)
        if (oResponse && oResponse.Result && oResponse.Result.Attachment) {
          oAttach.parseDataFromServer(oResponse.Result.Attachment)
          oAttach.onUploadComplete()
          if (oAttach.bLinked) {
            document.execCommand('insertHTML', true, '<img src="' + this.sApiHost + '/' + oAttach.sViewLink + '" data-x-src-cid="' + oAttach.sCid + '" />')
            this.$refs.imageUploader.removeFile(oFile)
            oAttach.oFile = null
          }
        } else {
          notification.showError(errors.getText(oResponse, 'Error occurred while uploading file'))
          oAttach.onUploadFailed()
        }
      }
    },
    onFileUploadFailed ({ files, xhr }) {
      let oFile = typesUtils.isNonEmptyArray(files) ? files[0] : null
      let oAttach = oFile ? _.find(this.attachments, (oTmpAttach) => {
        return oTmpAttach.sLocalPath === oFile.path
      }) : null
      if (oAttach) {
        let oResponse = typesUtils.pStringToJson(xhr.responseText)
        notification.showError(errors.getText(oResponse, 'Error occurred while uploading file'))
        oAttach.onUploadFailed()
      }
    },
    removeAttachment (scope, oAttach) {
      if (oAttach.oFile) {
        scope.removeFile(oAttach.oFile)
      }
      this.attachments = _.filter(this.attachments, (oTmpAttach) => {
        return oTmpAttach.sHash !== oAttach.sHash
      })
    },
    pickFiles () {
      this.$refs.uploader.pickFiles()
    },
    saveAndClose () {
      if (this.isMessageDataChanged()) {
        this.save()
      }
      this.closeCompose()
    },
    openSelfDestructingEmailDialog () {
      if (typesUtils.isNonEmptyArray(this.selectedToAddr)) {
        let oRecipient = this.selectedToAddr[0]
        this.selfDestructingRecipient = {
          encodedLabel: oRecipient.label,
          value: oRecipient.value,
          label: oRecipient.full,
          short: oRecipient.short,
          email: oRecipient.email,
          key: !!_.find(this.$store.getters['main/getOpenPgpKeys'], function (oKey) {
            return oKey.bPublic && oKey.sEmail === oRecipient.email
          })
        }
      } else {
        this.selfDestructingRecipient = null
      }
      this.selfDestructingShowPassword = ''
      this.selfDestructingEmailDialog = true
    },
    async createSelfDestrucPublicLink (sSubject, sData, sRecipientEmail, sEncryptionBasedMode, iLifetimeHrs) {
      const oPromiseCreateSelfDestrucPublicLink = new Promise( (resolve, reject) => {
        ipcRenderer.once('openpgp-create-self-destruc-public-link', (oEvent, { oResult, oError }) => {
          if (oResult && oResult.link) {
            resolve(oResult.link)
          } else {
            reject(new Error(errors.getText(oError, 'Error on public link creation')))
          }
        })
        ipcRenderer.send('openpgp-create-self-destruc-public-link', {
          sApiHost: this.$store.getters['main/getApiHost'],
          sAuthToken: this.$store.getters['user/getAuthToken'],
          sSubject,
          sData,
          sRecipientEmail,
          sEncryptionBasedMode,
          iLifetimeHrs,
        })
      })

      try {
        return { sLink: await oPromiseCreateSelfDestrucPublicLink }
      } catch (oError) {
        return { sError: oError && oError.message ? oError.message : 'Error on public link creation' }
      }
    },
    async sendSelfDestructingSecureEmail () {
      this.isEncrypting = true
      let sUserEmail = this.currentAccount ? this.currentAccount.sEmail : ''
      const { sEncryptedData, sPassword, sError } = await OpenPgp.encryptData(
        this.getPlainEditorText(),
        sUserEmail,
        this.selfDestructingRecipient.email,
        this.selfDestructingEncryptType === 'password',
        this.selfDestructingAddSignature,
        this.selfDestructingSignaturePassword
      )
      if (typesUtils.isNonEmptyString(sError)) {
        notification.showError(sError)
      } else {
        //create link
        let { sLink, sError } = await this.createSelfDestrucPublicLink(
          this.subjectText, sEncryptedData,
          this.selfDestructingRecipient.email,
          this.selfDestructingEncryptType,
          this.selfDestructingLifetime.value
        )
        if (typesUtils.isNonEmptyString(sError) || !typesUtils.isNonEmptyString(sLink)) {
          notification.showError(sError || 'Could not create public link.')
        } else {
          const sFullLink = this.$store.getters['main/getApiHost'] + sLink + '#' + openpgpSettings.sSelfDestructMessageHash

          //compose message
          const sSubject = 'The secure message was shared with you'
          let sBody = ''
          let sBrowserTimezone = moment.tz.guess()
          let sServerTimezone = coreSettings.sTimezone
          let sCurrentTime = moment.tz(new Date(), sBrowserTimezone || sServerTimezone).format('MMM D, YYYY HH:mm [GMT] ZZ')

          if (this.selfDestructingRecipient.key) {//encrypt message with key
            if (sPassword) {
              sBody = 'Hello,%BR%%EMAIL% user sent you a self-destructing secure email.%BR%You can read it by the following link: %URL%%BR%The message is password-protected. The password is: %PASSWORD%%BR%The message will be accessible for %HOURS% hours starting from %CREATING_TIME_GMT%'
              sBody = sBody
                          .replace(/%URL%/g, sFullLink)
                          .replace(/%BR%/g, '\r\n')
                          .replace(/%PASSWORD%/g, sPassword)
                          .replace(/%EMAIL%/g, sUserEmail)
                          .replace(/%HOURS%/g, this.selfDestructingLifetime.value)
                          .replace(/%CREATING_TIME_GMT%/g, sCurrentTime)
            } else {
              sBody = 'Hello,%BR%%EMAIL% user sent you a self-destructing secure email.%BR%You can read it by the following link: %URL%%BR%The message will be accessible for %HOURS% hours starting from %CREATING_TIME_GMT%'
              sBody = sBody
                          .replace(/%URL%/g, sFullLink)
                          .replace(/%BR%/g, '\r\n')
                          .replace(/%EMAIL%/g, sUserEmail)
                          .replace(/%HOURS%/g, this.selfDestructingLifetime.value)
                          .replace(/%CREATING_TIME_GMT%/g, sCurrentTime)
            }
            this.subjectText = sSubject
            this.editortext = sBody
            this.selectedToAddr = [this.selfDestructingRecipient]
            if (this.selfDestructingAddSignature) {
              this.signAndEncrypt()
            } else {
              this.encrypt()
            }
            this.selfDestructingEmailDialog = false
          } else {
            //send not encrypted message
            //if the recipient does not have a key, the message can only be encrypted with a password 
            if (sPassword) {
              sBody = 'Hello,%BR%%EMAIL% user sent you a self-destructing secure email.%BR%You can read it by the following link: <a href=\"%URL%\">%URL%</a>%BR%The message will be accessible for %HOURS% hours starting from %CREATING_TIME_GMT%'
              sBody = sBody
                          .replace(/%URL%/g, sFullLink)
                          .replace(/%BR%/g, '<br>')
                          .replace(/%EMAIL%/g, sUserEmail)
                          .replace(/%HOURS%/g, this.selfDestructingLifetime.value)
                          .replace(/%CREATING_TIME_GMT%/g, sCurrentTime)
              this.selfDestructingShowPassword = sPassword
              this.subjectText = sSubject
              this.editortext = sBody
              this.plainText = false
              this.selectedToAddr = [this.selfDestructingRecipient]
            }
          }
        }
      }
      this.isEncrypting = false
    },
  },
}
</script>
