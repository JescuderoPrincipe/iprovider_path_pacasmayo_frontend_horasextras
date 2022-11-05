sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
 ], function (Controller, MessageToast) {
    "use strict";
    return Controller.extend("com.cementos.pacasmayo.cpgestionstock.controller.App", {
        onInit: function () {
             // sessionStorage.urlGlobal = "/ODATA_PMSI/odata/SAP/ZSCP_MSI_SRV/";
         }
    });
 });