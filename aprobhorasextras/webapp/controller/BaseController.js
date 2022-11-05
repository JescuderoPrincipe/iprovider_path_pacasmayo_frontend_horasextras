sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"
], function (Controller, History) {
	"use strict";

	return Controller.extend("Aprob.Horas.Extras.controller.BaseController", {

		getRouter : function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		
		fechaSAP: function(fecha){
			var dia = String(fecha.getDate());
			var mes = String(fecha.getMonth() + 1);
			var year = String(fecha.getFullYear());
			
			if(dia.length === 1){
				dia = "0" + dia;
			}
			
			if(mes.length === 1){
				mes = "0" + mes;
			}
			return year + mes + dia;
		},
		
		Date: function(fecha){
			if (fecha === "00000000" || fecha === "0000-00-00" || fecha === null || fecha === "" || fecha == undefined) {
			return;
		} else {
			var oDateFormat = sap.ui.core.format.DateFormat.getInstance({
				source: {
					pattern: "ddMMyyyy"
				},
				pattern: "dd-MM-yyyy"
			});
			fecha = oDateFormat.parse(fecha);
			return oDateFormat.format(new Date(fecha));
		}
			
		}

//		onNavBack: function (oEvent) {
//			var oHistory, sPreviousHash;
//
//			oHistory = History.getInstance();
//			sPreviousHash = oHistory.getPreviousHash();
//
//			if (sPreviousHash !== undefined) {
//				window.history.go(-1);
//			} else {
//				this.getRouter().navTo("login", {}, true /*no history*/);
//			}
//		}

	});

});
