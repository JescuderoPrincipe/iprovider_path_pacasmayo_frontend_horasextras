sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History"
], function (BaseController, MessageBox, Utilities, History) {
	"use strict";
	    //var urlGlobal = 'https://cpcslfioridev.cpsaa.com.pe:44350/sap/opu/odata4/sap/zgfd0001/default/sap/zs_fd_mncp/0001',
		//var urlGlobal = '/sap/opu/odata4/sap/zgfd0001/default/sap/zs_fd_mncp/0001',
		//urlGlobal2 = "/sap/opu/odata4/sap/zgfd0001/default/sap/zs_fd_mncp_rpt/0001",
        var urlGlobal = './ERP/sap/opu/odata/sap/zgfd0001/default/sap/zs_fd_mncp/0001',
		urlGlobal2 = "./ERP/sap/opu/odata/sap/zgfd0001/default/sap/zs_fd_mncp_rpt/0001",
		plants = "",
		uname,
		thes,
		auth,
		oLStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
	return BaseController.extend("com.cementos.pacasmayo.cpgestionstock.controller.GestionDeStock", {
		handleRouteMatched: function (oEvent) {
			var sAppId = "App5bc527f55cf70901057297f5";

			var oParams = {};

			if (oEvent.mParameters.data.context) {
				this.sContext = oEvent.mParameters.data.context;

			} else {
				if (this.getOwnerComponent().getComponentData()) {
					var patternConvert = function (oParam) {
						if (Object.keys(oParam).length !== 0) {
							for (var prop in oParam) {
								if (prop !== "sourcePrototype") {
									return prop + "(" + oParam[prop][0] + ")";
								}
							}
						}
					};

					this.sContext = patternConvert(this.getOwnerComponent().getComponentData().startupParameters);

				}
			}

			var oPath;

			if (this.sContext) {
				oPath = {
					path: "/" + this.sContext,
					parameters: oParams
				};
				this.getView().bindObject(oPath);
			}

		},

		_onButtonPress: function (oEvent) {
			//if (plants.length > 0) {
				var oBindingContext = oEvent.getSource().getBindingContext();

				return new Promise(function (fnResolve) {

					this.doNavigate("MedicionDiaria", oBindingContext, fnResolve, "");
				}.bind(this)).catch(function (err) {
					if (err !== undefined) {
						MessageBox.error(err.message);
					}
				});
			 /*else {
				sap.ui.core.BusyIndicator.hide();
				var Dialogo = new sap.m.Dialog({ title: "Mensajes" });
				var messageStrip = new sap.m.MessageStrip({ text: "Usuario sin Autorizacion.", type: "Error", showIcon: true });
				var label = new sap.m.Label({ text: "" });
				Dialogo.addContent(messageStrip);
				Dialogo.addContent(label);

				var ButtonCerrar =
					Dialogo.addButton(new sap.m.Button({
						text: "Cerrar", type: "Reject", press: function () {
							Dialogo.destroy();
						}
					})
					);
				Dialogo.open();
			}*/
		},
		doNavigate: function (sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {
			var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
			var oModel = (oBindingContext) ? oBindingContext.getModel() : null;

			var sEntityNameSet;
			if (sPath !== null && sPath !== "") {
				if (sPath.substring(0, 1) === "/") {
					sPath = sPath.substring(1);
				}
				sEntityNameSet = sPath.split("(")[0];
			}
			var sNavigationPropertyName;
			var sMasterContext = this.sMasterContext ? this.sMasterContext : sPath;

			if (sEntityNameSet !== null) {
				sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(sEntityNameSet, sRouteName);
			}
			if (sNavigationPropertyName !== null && sNavigationPropertyName !== undefined) {
				if (sNavigationPropertyName === "") {
					this.oRouter.navTo(sRouteName, {
						context: sPath,
						masterContext: sMasterContext
					}, false);
				} else {
					oModel.createBindingContext(sNavigationPropertyName, oBindingContext, null, function (bindingContext) {
						if (bindingContext) {
							sPath = bindingContext.getPath();
							if (sPath.substring(0, 1) === "/") {
								sPath = sPath.substring(1);
							}
						} else {
							sPath = "undefined";
						}

						// If the navigation is a 1-n, sPath would be "undefined" as this is not supported in Build
						if (sPath === "undefined") {
							this.oRouter.navTo(sRouteName);
						} else {
							this.oRouter.navTo(sRouteName, {
								context: sPath,
								masterContext: sMasterContext
							}, false);
						}
					}.bind(this));
				}
			} else {
				this.oRouter.navTo(sRouteName);
			}

			if (typeof fnPromiseResolve === "function") {
				fnPromiseResolve();
			}

		},
		_onButtonPress1: function (oEvent) {
			//if (plants.length > 0) {
				var oBindingContext = oEvent.getSource().getBindingContext();

				return new Promise(function (fnResolve) {

					this.doNavigate("StockEnBolsas", oBindingContext, fnResolve, "");
				}.bind(this)).catch(function (err) {
					if (err !== undefined) {
						MessageBox.error(err.message);
					}
				});
			/* else {
				sap.ui.core.BusyIndicator.hide();
				var Dialogo = new sap.m.Dialog({ title: "Mensajes" });
				var messageStrip = new sap.m.MessageStrip({ text: "Usuario sin Autorizacion.", type: "Error", showIcon: true });
				var label = new sap.m.Label({ text: "" });
				Dialogo.addContent(messageStrip);
				Dialogo.addContent(label);

				var ButtonCerrar =
					Dialogo.addButton(new sap.m.Button({
						text: "Cerrar", type: "Reject", press: function () {
							Dialogo.destroy();
						}
					})
					);
				Dialogo.open();
			}*/
		},
		_onButtonPress2: function (oEvent) {
			//if (plants.length > 0) {
				var oBindingContext = oEvent.getSource().getBindingContext();

				return new Promise(function (fnResolve) {

					this.doNavigate("CubicajeMensual", oBindingContext, fnResolve, "");
				}.bind(this)).catch(function (err) {
					if (err !== undefined) {
						MessageBox.error(err.message);
					}
				});
			/* else {
				sap.ui.core.BusyIndicator.hide();
				var Dialogo = new sap.m.Dialog({ title: "Mensajes" });
				var messageStrip = new sap.m.MessageStrip({ text: "Usuario sin Autorizacion.", type: "Error", showIcon: true });
				var label = new sap.m.Label({ text: "" });
				Dialogo.addContent(messageStrip);
				Dialogo.addContent(label);

				var ButtonCerrar =
					Dialogo.addButton(new sap.m.Button({
						text: "Cerrar", type: "Reject", press: function () {
							Dialogo.destroy();
						}
					})
					);
				Dialogo.open();
			}*/
		},
		_onButtonPress3: function (oEvent) {
			//if (plants.length > 0) {
				var oBindingContext = oEvent.getSource().getBindingContext();

				return new Promise(function (fnResolve) {

					this.doNavigate("ReporteEvolucionStock", oBindingContext, fnResolve, "");
				}.bind(this)).catch(function (err) {
					if (err !== undefined) {
						MessageBox.error(err.message);
					}
				});
			/* else {
				sap.ui.core.BusyIndicator.hide();
				var Dialogo = new sap.m.Dialog({ title: "Mensajes" });
				var messageStrip = new sap.m.MessageStrip({ text: "Usuario sin Autorizacion.", type: "Error", showIcon: true });
				var label = new sap.m.Label({ text: "" });
				Dialogo.addContent(messageStrip);
				Dialogo.addContent(label);

				var ButtonCerrar =
					Dialogo.addButton(new sap.m.Button({
						text: "Cerrar", type: "Reject", press: function () {
							Dialogo.destroy();
						}
					})
					);
				Dialogo.open();
			}
			*/
		},
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("GestionDeStock").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			thes = this;

			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("GestionDeStock").attachMatched(function (oEvent) {
				oLStorage.put("detalleMedicion", 0);
				oLStorage.put("detalleCubicaje", 0);
				// thes.onGetPlanta();
			});
			thes.onGetAuth();
			thes.onGetAuthReporte();
		},
		onGetPlanta: function () {
			try {
				sap.ui.core.BusyIndicator.show(0);
				//Obtener dato de la Planta
				$.ajax({
					url: urlGlobal + '/PLANTS',
					type: 'GET',
					data: {
						"$format": "json",
						"$count": true,
						"$filter": "UNAME eq '" + uname + "'"
					},
					async: false,
					success: function (data) {
						sap.ui.core.BusyIndicator.hide();
						plants = data.value;
					},
					error: function (jqXHR, textStatus, errorThrown) {
						sap.ui.core.BusyIndicator.hide();
						MessageBox.error(jqXHR.statusText);
					}
				});
			} catch (err) {
				MessageBox.error(err.message);
				sap.ui.core.BusyIndicator.hide();
			}
		},
		
		onGetAuth: function () {
			try {
				sap.ui.core.BusyIndicator.show(0);
				//Obtener dato de las autorizaciones
				$.ajax({
					url: urlGlobal + '/AUTHS',
					type: 'GET',
					async: false,
					success: function (data) {
						sap.ui.core.BusyIndicator.hide();
						if (data.value.length > 0) {
							if (data.value[0].TYPE != "E") {
								auth = data.value;
								var AuxModelo = [];
								var AuxModelo01 = [];
								var AuxModelo10 = [];
								//evaluacion para cod autorizacion 01 o si tiene 01,10
								if (auth[0].LOW === "01"){
								$.each(auth, function (i, item) {
									if ("10" === item.LOW || "01" === item.LOW || "03" === item.LOW ) {
										AuxModelo.push(item);
									}									 
									else{
										console.log("salio");
									}
									
								});
								
							   if (AuxModelo.length ===2 ){
									thes.getView().byId("tileEvolucionStock").setVisible(false);
								}
								else if (AuxModelo.length ===1){
									thes.getView().byId("tilemedicion").setVisible(false);
									thes.getView().byId("tileEvolucionStock").setVisible(false);
								}	
								else if (AuxModelo.length ===3)	{
									thes.getView().byId("tilemedicion").setVisible(true);
									thes.getView().byId("tileEvolucionStock").setVisible(true);
									thes.getView().byId("tilecubicaje").setVisible(true);

								}
								else{
									console.log("---");
								}
							}
							//fin de evaluacion
							
							//Evaluamos para el codigo auth 10
								 else if (auth[0].LOW === "10") {									
									thes.getView().byId("tilemedicion").setVisible(false);
									thes.getView().byId("tileEvolucionStock").setVisible(false);
								}	
								//fin de	evaluacion					

								 else if (auth[0].LOW === "03") {
									thes.getView().byId("tilemedicion").setVisible(true);
									thes.getView().byId("tileEvolucionStock").setVisible(true);
									thes.getView().byId("tilecubicaje").setVisible(true);
								}
							} else {
								console.log("sin data");
							}
						}
					},
					error: function (jqXHR, textStatus, errorThrown) {
						sap.ui.core.BusyIndicator.hide();
						MessageBox.error(jqXHR.statusText);
					}
				});
			} catch (err) {
				MessageBox.error(err.message);
				sap.ui.core.BusyIndicator.hide();
			}
		},
		
		onGetAuthReporte: function () {
			try {
				sap.ui.core.BusyIndicator.show(0);
				//Obtener dato de las autorizaciones
				$.ajax({
					url: urlGlobal2 + '/AUTHS',
					type: 'GET',
					async: false,
					success: function (data) {
						sap.ui.core.BusyIndicator.hide();
						if (data.value.length > 0) {
							if (data.value[0].TYPE != "E") {
								auth = data.value;
								var AuxModelo = [];
								$.each(auth, function (i, item) {
									if ("RPT_EVLSTCK" === item.LOW) {
										AuxModelo.push(item);
									}
								});
								auth = AuxModelo;
								if (auth.length >0) {

									thes.getView().byId("tileEvolucionStock").setVisible(true);


								} else {
									thes.getView().byId("tileEvolucionStock").setVisible(false);
									
								}
							
							} else {
								console.log("salio2");
							}
						}
					},
					error: function (jqXHR, textStatus, errorThrown) {
						sap.ui.core.BusyIndicator.hide();
						MessageBox.error(jqXHR.statusText);
					}
				});
			} catch (err) {
				MessageBox.error(err.message);
				sap.ui.core.BusyIndicator.hide();
			}
		},



	});
}, /* bExport= */ true);
