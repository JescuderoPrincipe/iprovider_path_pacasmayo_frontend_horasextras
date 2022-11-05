sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	"com/cementos/pacasmayo/cpgestionstock/util/Formatter",
	"sap/ui/model/json/JSONModel",
	"sap/suite/ui/microchart/HarveyBallMicroChart",
	"sap/suite/ui/microchart/HarveyBallMicroChartItem",
	"sap/ui/model/odata/v4/ODataModel",
	"jquery.sap.storage"
], function(BaseController, MessageBox, Utilities, History, formatter, JSONModel, HarveyBallMicroChart, HarveyBallMicroChartItem, ODataModel) {
	"use strict";
    //var urlGlobal = 'https://cpcslfioridev.cpsaa.com.pe:44350/sap/opu/odata4/sap/zgfd0001/default/sap/ZS_FD_MNCP/0001',
	//var urlGlobal = '/sap/opu/odata4/sap/zgfd0001/default/sap/zs_fd_mncp/0001',
    var urlGlobal = './ERP/sap/opu/odata/sap/zgfd0001/default/sap/zs_fd_mncp/0001',
		urlGlobal2 = 'https://intappprod.cpsaa.com.pe:8443/pi-integracion/service/mediciones.wsdl',
		tipoMedioConstante = "MA03",
		//tipoMedioConstante="YM10",
		thes,
		oModel,
		uname,
		plants = "",
		auth,
		centro = [],
		producto = [],
		cabecera = [],
		valores = [],
		historial = [],
		turn = [],
		csrf_token,
		ln,
		oLStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
	return BaseController.extend("com.cementos.pacasmayo.cpgestionstock.controller.MedicionDiaria", {
		formatter: formatter,
		handleRouteMatched: function(oEvent) {
			var sAppId = "App5bc527f55cf70901057297f5";

			var oParams = {};

			if (oEvent.mParameters.data.context) {
				this.sContext = oEvent.mParameters.data.context;

			} else {
				if (this.getOwnerComponent().getComponentData()) {
					var patternConvert = function(oParam) {
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
		_onPageNavButtonPress: function(oEvent) {

			// thes.getView().byId("dpfechaActual").setDateValue(new Date());
			// var tabla = thes.getView().byId("tblMedicionMedia");
			// tabla.destroyItems();

			// thes.getView().byId("cblCentro").setSelectedKey("");
			// thes.getView().byId("slTurno").setSelectedKey("");

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function(fnResolve) {

				this.doNavigate("GestionDeStock", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
			// thes.getOwnerComponent().getRouter().navTo("GestionDeStock");

		},
		doNavigate: function(sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {
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
					oModel.createBindingContext(sNavigationPropertyName, oBindingContext, null, function(bindingContext) {
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
		_onRowPress: function(oEvent) {
			if(thes.getView().byId("slTurno").getSelectedKey() != undefined && thes.getView().byId("slTurno").getSelectedKey() != "" && thes.getView().byId("slTurno").getSelectedKey() &&
				thes.getView().byId("cblCentro").getSelectedKey() != undefined && thes.getView().byId("cblCentro").getSelectedKey() != "" && thes.getView().byId("cblCentro").getSelectedKey()){
				var datos = oEvent.getCells(),
					turno = thes.getView().byId("slTurno").getSelectedKey(),
					turnoTxt = thes.getView().byId("slTurno").getSelectedItem().getText(),
					tipoMedioTxt = thes.getView().byId("slTipoMedio").getSelectedItem().getText(),
					procesoTxt = thes.getView().byId("slProceso").getSelectedItem().getText(),
					fecha = thes.getView().byId("dpfechaActual").getValue(),
					array = [];

				$.each(datos, function(k, v){
					if(k != 3 && k != datos.length-1){
						if(k == 4){
							array.push(v.getSelectedKey());
							array.push(v.getSelectedItem().getText());
						}else if (k == 5){
							array.push(v.getText());
						}else{
							array.push(v.getValue());
						}
					}
		        });

		        array.push(turno);
		        array.push(turnoTxt);
		        array.push(tipoMedioTxt);
		        array.push(procesoTxt);
		        array.push(fecha);

		        thes.onGetHistorial(array[0], array[1], array[array.length-5], array[3], array[2], array[array.length-1]);

		        if(historial.length > 0){
					oLStorage.put("medicion", window.btoa(JSON.stringify(array)));
					oLStorage.put("cabecera", window.btoa(JSON.stringify(cabecera)));
					oLStorage.put("producto", window.btoa(JSON.stringify(producto)));
					oLStorage.put("historial", window.btoa(JSON.stringify(historial)));

					thes.getOwnerComponent().getRouter().navTo("DetalleDeMedicionDiaria");
				}

				
				// var oBindingContext = oEvent.getSource().getBindingContext();

				// return new Promise(function(fnResolve) {

				// 	this.doNavigate("DetalleDeMedicionDiaria", oBindingContext, fnResolve, "");
				// }.bind(this)).catch(function(err) {
				// 	if (err !== undefined) {
				// 		MessageBox.error(err.message);
				// 	}
				// });
			}else{
				sap.ui.core.BusyIndicator.hide();
				var Dialogo = new sap.m.Dialog({title: "Mensajes"});
                var messageStrip = new sap.m.MessageStrip({text: "Debe llenar los campos obligatorio.", type: "Error", showIcon: true});
                var label = new sap.m.Label({text: ""});
                Dialogo.addContent(messageStrip);
                Dialogo.addContent(label);

                var ButtonCerrar = 
                	Dialogo.addButton(new sap.m.Button({text: "Cerrar", type: "Reject", press: function(){
                            Dialogo.destroy();
                		}
                   	})
             	);
                Dialogo.open();
			}
		},
		_onRowPress1: function(oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function(fnResolve) {

				this.doNavigate("DetalleDeMedicionDiaria", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_onRowPress2: function(oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function(fnResolve) {

				this.doNavigate("DetalleDeMedicionDiaria", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_onRowPress3: function(oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function(fnResolve) {

				this.doNavigate("DetalleDeMedicionDiaria", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_onButtonPress: function() {
			return new Promise(function(fnResolve) {
				sap.m.MessageBox.confirm("Desea guardar los cambios de Medicion Diaria", {
					title: "Confirmacion",
					actions: ["Si", "No"],
					onClose: function(sActionClicked) {
						if(sActionClicked === 'Si'){
							thes.onSave();
						}
					}
				});
			}).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err);
				}
			});

		},
		_onButtonPress1: function(oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function(fnResolve) {

				this.doNavigate("GestionDeStock", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("MedicionDiaria").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			thes = this;

			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("MedicionDiaria").attachMatched(function(oEvent) {
				var detalleMed = oLStorage.get("detalleMedicion");
				if(detalleMed != 1){
					var tabla = thes.getView().byId("tblMedicionMedia");
					tabla.destroyItems();

					thes.getView().byId("cblCentro").setSelectedKey("");
					thes.getView().byId("slTurno").setSelectedKey("");

					oLStorage.put("medicion", "");
					oLStorage.put("cabecera", "");
					oLStorage.put("producto", "");
					oLStorage.put("historial", "");

					var model = new JSONModel({
                    	"tipoMedioitems": []
                    });

                    model.setSizeLimit(999999999);
                	thes.getView().byId('slTipoMedio').setModel(model, "tipoMedio");

                	var model = new JSONModel({
                    	"procesoitems": []
                    });

                    model.setSizeLimit(999999999);
                	thes.getView().byId('slProceso').setModel(model, "proceso");

                	thes.getView().byId('slTipoMedio').setValueState("None");
                	thes.getView().byId("dpfechaActual").setValueState("None");
                	thes.getView().byId("cblCentro").setValueState("None");
					thes.getView().byId("slTurno").setValueState("None");
					thes.getView().byId('slProceso').setValueState("None");

					var model = new JSONModel([]);

					thes.getView().byId("tblMedicionMediaTotal").setModel(model);
					thes.getView().byId("tblMedicionMediaTotal").getModel().refresh();

					thes.onGetPlanta();
					thes.onGetTurno();
					thes.getView().byId("dpfechaActual").setDateValue(new Date());
				}
				
				setTimeout(function(){ thes.onGetAuth(); thes.onChangeNumber(); }, 1000);
			});
		},
		//Covertir XML a JSON
		xmlToJson: function(xml) {
			try{
				// Create the return object
				var obj = {};

				if (xml.nodeType == 1) { // element
					// do attributes
					if (xml.attributes.length > 0) {
					obj["@attributes"] = {};
						for (var j = 0; j < xml.attributes.length; j++) {
							var attribute = xml.attributes.item(j);
							obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
						}
					}
				} else if (xml.nodeType == 3) { // text
					obj = xml.nodeValue;
				}

				// do children
				if (xml.hasChildNodes()) {
					for(var i = 0; i < xml.childNodes.length; i++) {
						var item = xml.childNodes.item(i);
						var nodeName = item.nodeName;
						if (typeof(obj[nodeName]) == "undefined") {
							obj[nodeName] = thes.xmlToJson(item);
						} else {
							if (typeof(obj[nodeName].push) == "undefined") {
								var old = obj[nodeName];
								obj[nodeName] = [];
								obj[nodeName].push(old);
							}
							obj[nodeName].push(thes.xmlToJson(item));
						}
					}
				}
				return obj;
			}catch(err) {
                MessageBox.error(err.message);
                sap.ui.core.BusyIndicator.hide();
            }
		},
		onGetWSDL: function(){
			try{
				sap.ui.core.BusyIndicator.show(0);
				//Obtener valores del Servicio Web WSDL
				var fecha = this.getView().byId("dpfechaActual").getValue();
				var turno = this.getView().byId("slTurno").getSelectedKey();
				var fechaFinal = fecha.substr(0, 4) + '-' + fecha.substr(4, 2) + '-' + fecha.substr(6, 2);
				var hora = '000000';
				var horaTurnoFin = '000000';
				var mensaje = '';

				$.each(turn, function(k, v){
					if(turno == v.SHIFT){
						hora = v.INI_HOUR;
						horaTurnoFin = v.END_HOUR;
					}
		        });

				//Validando si la fecha hora fin es mayor a la fecha hora inicio
				var dateInicio = new Date(fechaFinal + " " + hora.substr(0, 2) + ":" + hora.substr(2, 2));
				var dateFin = new Date(fechaFinal + " " + horaTurnoFin.substr(0, 2) + ":" + horaTurnoFin.substr(2, 2));

				var diferenciaTiempo =  dateFin - dateInicio;

				if(diferenciaTiempo < 0){
					var fechaFinal2 = new Date(fechaFinal+ " 00:00");
					fechaFinal2.setDate(fechaFinal2.getDate() + 1)
					fechaFinal =fechaFinal2.getFullYear()+'-'+ ('0'+(fechaFinal2.getMonth() + 1)).slice(-2) +'-'+  ('0'+fechaFinal2.getDate()).slice(-2);
				}


				var horaFinal = horaTurnoFin.substr(0, 2) + ":" + horaTurnoFin.substr(2, 2) + ":" + horaTurnoFin.substr(4, 2);
				
				$.each(cabecera, function(k, v){
					if(v.TAG_COD != undefined && v.TAG_COD != null && v.TAG_COD != ''){
						mensaje += '<med:tag>'+v.TAG_COD+'</med:tag>';
					}
		        });

				if (mensaje != "") {
					var soapMessage = 
					'<?xml version="1.0" encoding="UTF-8"?>' +
					'<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:med="http://integracionespi.cpsaa.com.pe/mediciones">' +
					   '<soapenv:Header/>' +
					   '<soapenv:Body>' +
					      '<med:ObtenerMedicionesRequest>' +
					         '<med:fechaFinTurno>' + fechaFinal + '</med:fechaFinTurno>' +
					         '<med:horaMinutoFinTurno>' + horaFinal + '</med:horaMinutoFinTurno>' +
					         '<med:codigoPlanta>' + plants.PLANTID + '</med:codigoPlanta>' +
					         '<med:tagsMediciones>' +
					            mensaje +
					         '</med:tagsMediciones>' +
					      '</med:ObtenerMedicionesRequest>' +
					   '</soapenv:Body>' +
					'</soapenv:Envelope>';

					$.ajax({
						url: urlGlobal2,
					    contentType: "text/xml; charset=utf-8",
					    type: "POST", //important
					    dataType: "xml",
					    cache: false,
					    data: soapMessage,
					    async: false,
					    success: function(data, textStatus, request) {
							sap.ui.core.BusyIndicator.hide();
							var log = thes.xmlToJson(data);
							var wsdl = log["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ns2:ObtenerMedicionesResponse"]["ns2:MedicionesSilos"];
							if(wsdl["ns2:medicion"] != undefined){
								$.each(cabecera, function(k, v){
									if(wsdl["ns2:medicion"].length > 1){
										$.each(wsdl["ns2:medicion"], function(kw, vw){
											if(vw["ns2:tag"]["#text"].toLowerCase() == v.TAG_COD.toLowerCase()){
												cabecera[k].VALOR_TAG_COD = vw["ns2:valor"]["#text"];
											}
										});
									}else{
										if(wsdl["ns2:medicion"]["ns2:tag"]["#text"].toLowerCase() == v.TAG_COD.toLowerCase()){
											cabecera[k].VALOR_TAG_COD = wsdl["ns2:medicion"]["ns2:valor"]["#text"];
										}
									}
								});
							}
						},
						error: function(jqXHR,textStatus,errorThrown) {
							sap.ui.core.BusyIndicator.hide();
							MessageBox.error("Error al ejecutar el WSDL.");
						}

					});
				}
			}catch(err) {
                MessageBox.error(err.message);
                sap.ui.core.BusyIndicator.hide();
            }
		},
		onGetPlanta: function(){
			try{
				sap.ui.core.BusyIndicator.show(0);
				//Obtener dato de la Planta
				$.ajax({
					url: urlGlobal + '/PLANTS',
					type: 'GET',
					data : {
						"$format" : "json",
						"$count": true
					},
					async: false,
					success: function(data) {
						sap.ui.core.BusyIndicator.hide();
						centro = data.value;
						//Seteando los valores obtenidos al input de Centro.
						var model = new JSONModel({
	                    	"centroitems": data.value
	                    });

	                    model.setSizeLimit(999999999);
	                	thes.getView().byId('cblCentro').setModel(model, "centro");

						if(data.value.length > 1){
							// plants = data.value[0];
							// thes.getView().byId("idCentro").setValue(data.value[0].PLANTNAME);
		                	thes.getView().byId('cblCentro').setEnabled(true);
						}else{
							thes.getView().byId('cblCentro').setSelectedKey(data.value[0].PLANTID);
							thes.getView().byId('cblCentro').setEnabled(false);
							thes.getView().byId('cblCentro').fireChange();
						}
					},
					error: function(jqXHR,textStatus,errorThrown) {
						sap.ui.core.BusyIndicator.hide();
						MessageBox.error(jqXHR.statusText);
					}
				});
			}catch(err) {
                MessageBox.error(err.message);
                sap.ui.core.BusyIndicator.hide();
            }
		},
		// Data de los permisos o autorizaciones.
		onGetAuth: function(){
			try{
				sap.ui.core.BusyIndicator.show(0);
				//Obtener dato de la Planta
				$.ajax({
					url: urlGlobal + '/AUTHS',
					type: 'GET',
					async: false,
					success: function(data) {
						sap.ui.core.BusyIndicator.hide();
						if(data.value.length > 0){
							if(data.value[0].TYPE != "E"){
								auth = data.value;
								if(auth[0].LOW == "03"){
									thes.getView().byId("btnSave").setEnabled(false);
									/*
									var DialogoAuth = new sap.m.Dialog({title: "Mensajes",
										escapeHandler: function(oPromise) {
				                            DialogoAuth.destroy();
										}
									});

									$.each(auth, function(key, item){
			                            var text = item.MESSAGE;
			                            var type = item.TYPE;
			                            if(type == "I"){
			                                type = "Information";
			                            }else if(type == "W"){
			                                type = "Warning";
			                            }else if(type == "S"){
			                                type = "Success";
			                            }else{
			                                type = "Error";
			                            }
			                            var messageStrip = new sap.m.MessageStrip({text: text, type: type, showIcon: true});
			                            var label = new sap.m.Label({text: ""});
			                            DialogoAuth.addContent(messageStrip);
			                            DialogoAuth.addContent(label);
			                        });
					                var ButtonCerrar = 
					                	DialogoAuth.addButton(new sap.m.Button({text: "Cerrar", type: "Reject", press: function(e){
					                            DialogoAuth.destroy();
					                		}
					                   	})
					             	);
									DialogoAuth.open();
									*/
								}else if(auth[0].LOW == "01"){
									thes.getView().byId("btnSave").setEnabled(true);
								}
								else if (auth[0].LOW === "01" && auth[1].LOW === "10"){
									thes.getView().byId("btnSave").setEnabled(true);
								}
							}else{
								var DialogoAuth = new sap.m.Dialog({title: "Mensajes",
									escapeHandler: function(oPromise) {
			                            DialogoAuth.destroy();
										thes._onPageNavButtonPress();
									}
								});
								$.each(data.value, function(key, item){
		                            var text = item.MESSAGE;
		                            var type = item.TYPE;
		                            if(type == "I"){
		                                type = "Information";
		                            }else if(type == "W"){
		                                type = "Warning";
		                            }else if(type == "S"){
		                                type = "Success";
		                            }else{
		                                type = "Error";
		                            }
		                            var messageStrip = new sap.m.MessageStrip({text: text, type: type, showIcon: true});
		                            var label = new sap.m.Label({text: ""});
		                            DialogoAuth.addContent(messageStrip);
		                            DialogoAuth.addContent(label);
		                        });
				                var ButtonCerrar = 
				                	DialogoAuth.addButton(new sap.m.Button({text: "Cerrar", type: "Reject", press: function(e){
				                            DialogoAuth.destroy();
				                			thes._onPageNavButtonPress();
				                		}
				                   	})
				             	);
				                DialogoAuth.open();
							}
						}
					},
					error: function(jqXHR,textStatus,errorThrown) {
						sap.ui.core.BusyIndicator.hide();
						MessageBox.error(jqXHR.statusText);
					}
				});
			}catch(err) {
                MessageBox.error(err.message);
                sap.ui.core.BusyIndicator.hide();
            }
		},
		onGetTipoMedio: function(e){
			try{
				sap.ui.core.BusyIndicator.show(0);
				//Obtener datos del Combo de Tipo Medio
				thes.onValidar(e);

				var centroId = thes.getView().byId("cblCentro").getSelectedKey();

				var arrayCentro = centro.filter(function(item){
					if(item.PLANTID == centroId){
						return item;
					}
				});

				if(arrayCentro.length > 0){
					plants = arrayCentro[0];
				}else{
					plants = "";
				}

				if(plants != ""){
					$.ajax({
						url: urlGlobal + '/TYSMNS',
						type: 'GET',
						data : {
							"$format" : "json",
							"$count": true,
							"$filter" : "PLANTID eq '" + plants.PLANTID + "'"
							// "$filter" : "PLANTID eq '0101'"
						},
						async: false,
						success: function(data) {
							sap.ui.core.BusyIndicator.hide();

							if(data.value.length > 0){
								var model = new JSONModel({
			                    	"tipoMedioitems": data.value
			                    });

			                    model.setSizeLimit(999999999);
			                	thes.getView().byId('slTipoMedio').setModel(model, "tipoMedio");
			                	thes.getView().byId('slTipoMedio').setSelectedKey(tipoMedioConstante);
			                	thes.onGetProceso();

			                	if(thes.getView().byId('slTipoMedio').getSelectedKey() != "" && thes.getView().byId('slTipoMedio').getSelectedKey() != undefined && thes.getView().byId('slTipoMedio').getSelectedKey()){
									thes.getView().byId('slTipoMedio').setValueState("Success");
					            	thes.getView().byId('slTipoMedio').setValueStateText("");
								}else{
									thes.getView().byId('slTipoMedio').setValueState("Error");
					            	thes.getView().byId('slTipoMedio').setValueStateText("Debe ingresar datos correctos.");
								}
							}else{
								var model = new JSONModel({
			                    	"tipoMedioitems": []
			                    });

			                    model.setSizeLimit(999999999);
			                	thes.getView().byId('slTipoMedio').setModel(model, "tipoMedio");

			                	thes.getView().byId('slTipoMedio').setValueState("Error");
					            thes.getView().byId('slTipoMedio').setValueStateText("Debe ingresar datos correctos.");

			                	var modelp = new JSONModel({
			                    	"procesoitems": []
			                    });

			                    model.setSizeLimit(999999999);
			                	thes.getView().byId('slProceso').setModel(modelp, "proceso");
			                	thes.getView().byId('slProceso').setEnabled(true);

			                	thes.getView().byId('slProceso').setValueState("Error");
					            thes.getView().byId('slProceso').setValueStateText("Debe ingresar datos correctos.");
			                	sap.ui.core.BusyIndicator.hide();
							}
						},
						error: function(jqXHR,textStatus,errorThrown) {
							sap.ui.core.BusyIndicator.hide();
							MessageBox.error(jqXHR.statusText);
						}
					});
				}else{
					var model = new JSONModel({
                    	"tipoMedioitems": []
                    });

                    model.setSizeLimit(999999999);
                	thes.getView().byId('slTipoMedio').setModel(model, "tipoMedio");

                	thes.getView().byId('slTipoMedio').setValueState("Error");
					thes.getView().byId('slTipoMedio').setValueStateText("Debe ingresar datos correctos.");

                	var modelp = new JSONModel({
                    	"procesoitems": []
                    });

                    model.setSizeLimit(999999999);
                	thes.getView().byId('slProceso').setModel(modelp, "proceso");
                	thes.getView().byId('slProceso').setEnabled(false);

                	thes.getView().byId('slProceso').setValueState("Error");
					thes.getView().byId('slProceso').setValueStateText("Debe ingresar datos correctos.");
					
                	sap.ui.core.BusyIndicator.hide();
				}
			}catch(err) {
                MessageBox.error(err.message);
                sap.ui.core.BusyIndicator.hide();
            }
		},
		onGetProceso: function(){
			try{
				sap.ui.core.BusyIndicator.show(0);
				//Obtener datos del Combo de Proceso
				$.ajax({
					url: urlGlobal + '/PROCESS',
					type: 'GET',
					data : {
						"$format" : "json",
						"$count": true,
						"$filter" : "PLANTID eq '" + plants.PLANTID + "'" +
									" and TYPE_PROCESS eq 'G'"
					},
					async: false,
					success: function(data) {
						sap.ui.core.BusyIndicator.hide();

						if(data.value.length > 0){
							var model = new JSONModel({
		                    	"procesoitems": data.value
		                    });

		                    model.setSizeLimit(999999999);
		                	thes.getView().byId('slProceso').setModel(model, "proceso");
		                	thes.getView().byId('slProceso').setEnabled(true);
						}
					},
					error: function(jqXHR,textStatus,errorThrown) {
						sap.ui.core.BusyIndicator.hide();
						MessageBox.error(jqXHR.statusText);
					}
				});
			}catch(err) {
                MessageBox.error(err.message);
                sap.ui.core.BusyIndicator.hide();
            }
		},
		onGetTurno: function(){
			try{
				sap.ui.core.BusyIndicator.show(0);
				//Obtener datos del Combo de Proceso
				$.ajax({
					url: urlGlobal + '/TURNS',
					type: 'GET',
					data : {
						"$format" : "json",
						"$count": true
					},
					async: false,
					success: function(data) {
						turn = data.value;
						sap.ui.core.BusyIndicator.hide();

						if(data.value.length > 0){
							var model = new JSONModel({
		                    	"turnoitems": data.value
		                    });

		                    model.setSizeLimit(999999999);
		                	thes.getView().byId('slTurno').setModel(model, "turno");
						}
					},
					error: function(jqXHR,textStatus,errorThrown) {
						sap.ui.core.BusyIndicator.hide();
						MessageBox.error(jqXHR.statusText);
					}
				});
			}catch(err) {
                MessageBox.error(err.message);
                sap.ui.core.BusyIndicator.hide();
            }
		},
		// Borrar la lista
		onClear: function(){
			var master = this.getView().byId("idLista");

			master.destroyItems();
		},
		onGetProducto: function(planta, tipoMedio){
			try{
				sap.ui.core.BusyIndicator.show(0);
				//Obtener datos del Combo de Proceso
				$.ajax({
					url: urlGlobal + '/SMNMTS',
					type: 'GET',
					data : {
						"$format" : "json",
						"$count": true,
						"$filter" : "PLANTID eq '" + planta + "'" +
									" and TYPE eq '" + tipoMedio + "'" +
									" and TYPE_MEASU eq 'D'"
					},
					async: false,
					success: function(data) {
						producto = data.value;
					},
					error: function(jqXHR,textStatus,errorThrown) {
						sap.ui.core.BusyIndicator.hide();
						MessageBox.error(jqXHR.statusText);
					}
				});
			}catch(err) {
                MessageBox.error(err.message);
                sap.ui.core.BusyIndicator.hide();
            }
		},
		onGetCabecera: function(planta, tipoMedio){
			try{
				sap.ui.core.BusyIndicator.show(0);
				var proceso = thes.getView().byId("slProceso").getSelectedKey();
				//Obtener datos del Combo de Proceso
				$.ajax({
					url: urlGlobal + '/FORMS',
					type: 'GET',
					data : {
						"$format" : "json",
						"$count": true,
						"$filter" : "PLANTID eq '" + plants.PLANTID + "'" +
									" and TYPE eq '" + tipoMedio + "'" +
									" and PROCESS eq '" + proceso + "'" +
									" and TYPE_FORM eq 'D'"
					},
					async: false,
					success: function(data) {
						cabecera = data.value;
						thes.onGetWSDL();
					},
					error: function(jqXHR,textStatus,errorThrown) {
						sap.ui.core.BusyIndicator.hide();
						MessageBox.error(jqXHR.statusText);
					}
				});
			}catch(err) {
                MessageBox.error(err.message);
                sap.ui.core.BusyIndicator.hide();
            }
		},
		onGetValores: function(planta, tipoMedio, turn, material, medium, fecha){
			try{
				sap.ui.core.BusyIndicator.show(0);
				//Obtener datos del Combo de Proceso
				csrf_token = "";
				$.ajax({
					url: urlGlobal + '/MEASUS',
					type: 'GET',
					data : {
						"$format" : "json",
						"$count": true,
						"$filter" : "PLANTID eq '" + plants.PLANTID + "'" +
									// " and DATE_MED eq ''"  + 
									" and TURN eq '" + turn + "'" +
									// " and MATERIAL eq '" + material + "'" +
									" and MEDIUM_TYPE eq '" + tipoMedio + "'" +
									" and MEDIUM eq '" + medium + "'" +
									" and DATE_MED eq '" + fecha + "'" +
									" and XHIST eq 'X'" +
									" and XLASTR eq 'X'" +
									" and TYPE_MEASU eq 'D'"
					},
					async: false,
					headers : {
								"X-CSRF-TOKEN": "FETCH"	
					},
					success: function(data, textStatus, request) {
						valores = data.value;
						// thes.onGetWSDL();
						csrf_token = request.getResponseHeader("X-CSRF-TOKEN");
						sap.ui.core.BusyIndicator.hide();
					},
					error: function(jqXHR,textStatus,errorThrown) {
						sap.ui.core.BusyIndicator.hide();
						MessageBox.error(jqXHR.statusText);
					}
				});
			}catch(err) {
                MessageBox.error(err.message);
                sap.ui.core.BusyIndicator.hide();
            }
		},
		onGetValoresChange: function(planta, tipoMedio, turn, material, datos, item, medium, fecha){
			try{
				sap.ui.core.BusyIndicator.show(0);
				//Obtener datos del Combo de Proceso
				$.ajax({
					url: urlGlobal + '/MEASUS',
					type: 'GET',
					data : {
						"$format" : "json",
						"$count": true,
						"$filter" : "PLANTID eq '" + plants.PLANTID + "'" +
									// " and DATE_MED eq ''"  + 
									" and TURN eq '" + turn + "'" +
									" and MATERIAL eq '" + material + "'" +
									" and MEDIUM_TYPE eq '" + tipoMedio + "'" +
									" and MEDIUM eq '" + medium + "'" +
									" and DATE_MED eq '" + fecha + "'" +
									" and XHIST eq 'X'" +
									" and XLASTR eq 'X'" +
									" and TYPE_MEASU eq 'D'"
					},
					async: false,
					success: function(data) {
						sap.ui.core.BusyIndicator.hide();
						var val = data.value,
							arrayValores = [],
							formula = "",
							oCells = item.getCells(),
							celdasT = oCells.length,
							total = 0.00,
							color = "",
							maxCapacity = 0,
							totalP = 0.00,
							variable = 0,
							tot = 0.000,
							cont = 0;

						$.each(producto, function(k, i){
							if(i.MEDIUM == oCells[2].getValue() && i.MATERIAL == material){
								maxCapacity = i.MAX_CAPACITY;
							}
						});

						if(val.length > 0){
							$.each(val, function(key2, item2){
		                		if(oCells[0].getValue() == item2.PLANTID && oCells[1].getValue() == item2.MEDIUM_TYPE && oCells[2].getValue() == item2.MEDIUM){
		                		// if('0101' == item2.PLANTID && 'T001' == item2.MEDIUM_TYPE && oCells[2].getValue() == item2.MEDIUM){
		                			$.each(oCells, function(key3, item3){
		                				if(key3 > 5 && key3 < (celdasT-2)){
											if(item3.getName().split('&&')[0] == item2.PARAM){
												var items = item3.getName().split('&&');
												if(item3.getName().split('&&')[6] == 'A'){
													$.each(cabecera, function(ck, cv){
														if(oCells[2].getValue() == cv.MEDIUM && items[0] == cv.PARAM){
															formula = cv.DETAIL_FORM.toLowerCase();
															if(cv.VALOR_TAG_COD != undefined){
																item3.setValue(formatter.redondearDec(parseFloat(cv.VALOR_TAG_COD), 3));
																item3.setName(items[0]+'&&'+items[1]+'&&a&&'+item2.MEASURE+'&&'+item2.ITEM+'&&'+item2.RECORD+'&&'+items[6]+'&&'+items[7]);
																total = item2.MEASUREMENT;
																// arrayValores.push({"PARAM": cv.PARAM, "PARAM_VALUE": cv.VALOR_TAG_COD});
																// item3.fireChange();
																// return false;
															}else{
																item3.setValue(formatter.redondearDec(parseFloat(item2.END_VAL), 3));
																item3.setName(items[0]+'&&'+items[1]+'&&a&&'+item2.MEASURE+'&&'+item2.ITEM+'&&'+item2.RECORD+'&&'+items[6]+'&&'+items[7]);
																total = item2.MEASUREMENT;
																// arrayValores.push({"PARAM": cv.PARAM, "PARAM_VALUE": item2.END_VAL});
																// item3.fireChange();
																// return false;
															}
														}

														if(oCells[2].getValue() == cv.MEDIUM){
															if(cv.VALOR_TAG_COD != undefined){
																arrayValores.push({"PARAM": cv.PARAM, "PARAM_VALUE": cv.VALOR_TAG_COD});
																item3.fireChange();
															}else{
																arrayValores.push({"PARAM": cv.PARAM, "PARAM_VALUE": item2.END_VAL});
																item3.fireChange();
															}
														}
													});

													// item3.setValue(formatter.redondearDec(parseFloat(item3.getName().split('&&')[7]), 3));
				                					// item3.setName(items[0]+'&&'+items[1]+'&&'+items[2]+'&&'+item3.MEASURE+'&&'+item3.ITEM+'&&'+item3.RECORD+'&&'+items[6]+'&&'+items[7]);
				                					// item3.setValue(6);
			                						// total = item2.MEASUREMENT;
				                					// return false;
				                				}else{
				                					item3.setValue(formatter.redondearDec(parseFloat(item2.END_VAL), 3));
				                					item3.setName(items[0]+'&&'+items[1]+'&&a&&'+item2.MEASURE+'&&'+item2.ITEM+'&&'+item2.RECORD+'&&'+items[6]+'&&'+items[7]);
				                					// item3.setValue(6);
			                						total = item2.MEASUREMENT;
			                						arrayValores.push({"PARAM": item2.PARAM, "PARAM_VALUE": item2.END_VAL});
				                					item3.fireChange();
				                					// return false;
				                				}
			                				}
		                				}
		                			// 	else if(key3 == (celdasT-2)){
		                			// 		item3.setValue(formatter.redondearDec(parseFloat(total), 3));
		                			// 	}
		                			});
		                		}
				            });
						}else{
							
							$.each(oCells, function(key3, item3){
	            				if(key3 > 5 && key3 < (celdasT-2)){
	            					// if(item3.getName().split('&&')[0] == item2.PARAM){
	                					// item3.setValue(item2.END_VAL);
	                					var items = item3.getName().split('&&');
	                					// item3.setValue(0);

	                					$.each(cabecera, function(ck, cv){
											if(oCells[2].getValue() == cv.MEDIUM && items[0] == cv.PARAM){
												formula = cv.DETAIL_FORM.toLowerCase();
												if(cv.VALOR_TAG_COD != undefined){
													item3.setValue(formatter.redondearDec(parseFloat(cv.VALOR_TAG_COD), 3));
													tot += parseFloat(cv.VALOR_TAG_COD);
													// arrayValores.push({"PARAM": cv.PARAM, "PARAM_VALUE": cv.VALOR_TAG_COD});
													// item3.fireChange();
													cont++;
	                								// return false;
												}else{
													item3.setValue(formatter.redondearDec(parseFloat(cv.PARAM_VALUE), 3));
													tot += parseFloat(cv.PARAM_VALUE);
													// arrayValores.push({"PARAM": cv.PARAM, "PARAM_VALUE": cv.PARAM_VALUE});
													// item3.fireChange();
													cont++;
	                								// return false;
												}
											}

											if(oCells[2].getValue() == cv.MEDIUM){
												if(cv.VALOR_TAG_COD != undefined){
													arrayValores.push({"PARAM": cv.PARAM, "PARAM_VALUE": cv.VALOR_TAG_COD});
													item3.fireChange();
												}else{
													arrayValores.push({"PARAM": cv.PARAM, "PARAM_VALUE": cv.PARAM_VALUE});
													item3.fireChange();
												}
											}
										});
	                					item3.setName(items[0]+'&&'+items[1]+'&&a&&'+undefined+'&&'+undefined+'&&'+undefined+'&&'+items[6]+'&&'+items[7]);
	                					// return false;
	                				// }
	            				}
	            				// else if(key3 == (celdasT-2)){
                	// 				item3.setValue(formatter.redondearDec(parseFloat(tot/cont), 3));
                	// 			}
	            			});

	            			// measurement = total/cabeFiltro.length;
						}

						$.each(arrayValores, function(tk, tv){
							formula = formula.replace(new RegExp(tv.PARAM.toLowerCase(), "gi"), tv.PARAM_VALUE);
						});
	            		
	            		try{
	            			formula = formula.toLowerCase();
							formula = formula.replace(new RegExp("math.pow", "gi"), "Math.pow");
							oCells[celdasT-2].setValue(formatter.redondearDec(parseFloat(eval(formula)), 3));
						}catch(err) {
			            	MessageBox.error("Error al ejecutar la Formula.");
			                sap.ui.core.BusyIndicator.hide();
			            }

	            		if(total != 0.00){
			            	oCells[3].setIcon("sap-icon://write-new-document");
	            		}else{
	            			total = oCells[celdasT-2].getValue();
	            			oCells[3].setIcon("sap-icon://documents");
	            		}

			            if(parseFloat(maxCapacity) !== 0){
							totalP = formatter.redondearDec(parseFloat(parseFloat(total)*100/parseFloat(maxCapacity)), 1);
						}

						// if(totalP == 0){
						// 	oCells[3].setIcon("sap-icon://documents");
						// }else{
						// 	oCells[3].setIcon("sap-icon://write-new-document");
						// }

						if(totalP < 21){
							color = "Critical";
						}else if(totalP > 20 && totalP < 80){
							color = "Good";
						}else if(totalP > 79 && totalP < 101){
							color = "Critical";
						}else if(totalP > 100){
							color = "Error";
						}
						oCells[celdasT-1].setTotal(parseFloat(maxCapacity));
						oCells[celdasT-1].destroyItems();
						oCells[celdasT-1].addItem(new HarveyBallMicroChartItem({color: color, fraction: parseInt(total), fractionLabel: totalP+"%", formattedLabel: false, fractionScale: ""}));
				        // });
					},
					error: function(jqXHR,textStatus,errorThrown) {
						sap.ui.core.BusyIndicator.hide();
						MessageBox.error(jqXHR.statusText);
					}
				});
			}catch(err) {
                MessageBox.error(err.message);
                sap.ui.core.BusyIndicator.hide();
            }
		},
		onSave: function(){
			try{
				sap.ui.core.BusyIndicator.show(0);
				var planta = this.getView().byId("cblCentro").getSelectedKey(),
					fecha = this.getView().byId("dpfechaActual").getValue(),
					turno = this.getView().byId("slTurno").getSelectedKey(),
					tipoMedio = this.getView().byId("slTipoMedio").getSelectedKey(),
					proceso = this.getView().byId("slProceso").getSelectedKey(),
					anio = fecha.substr(0, 4),
					mes = fecha.substr(4, 2),
					fechaActual = new Date(),
					hora = fechaActual.getHours()<10?('0'+fechaActual.getHours()):fechaActual.getHours(),
					minuto = fechaActual.getMinutes()<10?('0'+fechaActual.getMinutes()):fechaActual.getMinutes(),
					segundo = fechaActual.getSeconds()<10?('0'+fechaActual.getSeconds()):fechaActual.getSeconds();

				if(planta != undefined && planta != "" && planta &&
					fecha != undefined && fecha != "" && fecha &&
					turno != undefined && turno != "" && turno &&
					tipoMedio != undefined && tipoMedio != "" && tipoMedio &&
					proceso != undefined && proceso != "" && proceso){
					var tabla = thes.getView().byId("tblMedicionMedia").getItems();
					if(tabla.length > 0){
						//Obtener datos del Combo de Proceso
						var medicionDiaria = [];
						$.each(tabla, function(key, item){
			                var oCells = item.mAggregations.cells,
			                	celdasT = oCells.length;

			                if(parseFloat(oCells[celdasT-2].getValue()) > 0){
				                $.each(oCells, function(key3, item3){
				    				if(key3 > 5 && key3 < (celdasT-2)){
				    					var iniVal = 0;
				    					// $.each(valores, function(vk,vi){
				    					// 	if(oCells[0].getValue() == vi.PLANTID && oCells[1].getValue() == vi.MEDIUM_TYPE && oCells[2].getValue() == vi.MEDIUM && item3.getName().split("&&")[0] == vi.PARAM){
				    					// 		iniVal = vi.END_VAL;
				    					// 	}
				    					// });
				    					if(item3.getName().split('&&')[0] != ""){
			    							var detalleFormula = "";
				    						$.each(cabecera, function(kc, vc){
				    							if(item3.getName().split('&&')[1] == vc.FORMULA){
													detalleFormula = vc.DETAIL_FORM;
				    							}
				    						});
				    						var elemento = {
					    						'MATERIAL': oCells[4].getSelectedKey(),
						                    	'MEDIUM': oCells[2].getValue(),
							                    'PARAM': item3.getName().split('&&')[0],
							                    'INI_VAL': item3.getName().split('&&')[7],
							                    'END_VAL': item3.getValue(),
							                    'MEASUREMENT': oCells[celdasT-2].getValue(),
							                    'PLANTID': plants.PLANTID,
							                    'TURN': turno,
							                    'MEDIUM_TYPE': tipoMedio,
							                    'TYPE_MEASU': 'D',
							                    'PROCESS': proceso,
							                    'DATE_MED': fecha,
							                   	'HOUR_MED': hora + minuto + segundo,
							                    'YEAR_CON': anio,
							                    'MONTH_CON': mes,
							                    'FORMULA': item3.getName().split('&&')[1],
							                    'FORMU_DET': detalleFormula,
							                    'MEASURE': item3.getName().split('&&')[3]=="undefined"?"":item3.getName().split('&&')[3],
							                    'ITEM': item3.getName().split('&&')[4]=="undefined"?"":item3.getName().split('&&')[4],
							                    'RECORD': item3.getName().split('&&')[5]=="undefined"?"":item3.getName().split('&&')[5]
							                };
							                medicionDiaria.push(elemento);
				    					}
				    				}
				    			});
				            }
			            });
						$.ajax({
							url: urlGlobal + '/MEASUCS',
							type: 'POST',
							contentType: "application/json",
							dataType: 'json',
							data: JSON.stringify({"LINE": JSON.stringify(medicionDiaria)}),
				            headers : {
								"X-CSRF-TOKEN": csrf_token
							},
							async: false,
							success: function(data) {
								sap.ui.core.BusyIndicator.hide();
								var Dialogo = new sap.m.Dialog({title: "Mensajes",
									escapeHandler: function(e) {
			                            Dialogo.destroy();
										thes.onBuscar();
									}
								});
								$.each(JSON.parse(data.LINE), function(key, item){
	                                var text = item.msgtx;
	                                var type = item.msgty;
	                                if(type == "I"){
	                                    type = "Information";
	                                }else if(type == "W"){
	                                    type = "Warning";
	                                }else if(type == "S"){
	                                    type = "Success";
	                                }else{
	                                    type = "Error";
	                                }
	                                var messageStrip = new sap.m.MessageStrip({text: text, type: type, showIcon: true});
	                                var label = new sap.m.Label({text: ""});
	                                Dialogo.addContent(messageStrip);
	                                Dialogo.addContent(label);
	                            });
				                var ButtonCerrar = 
				                	Dialogo.addButton(new sap.m.Button({text: "Cerrar", type: "Reject", press: function(){
				                            thes.onBuscar();
				                            Dialogo.destroy();
				                		}
				                   	})
				             	);
				                Dialogo.open();
							},
							error: function(jqXHR,textStatus,errorThrown) {
								sap.ui.core.BusyIndicator.hide();
								MessageBox.error(jqXHR.statusText);
							}
						});
					}else{
						sap.ui.core.BusyIndicator.hide();
						var Dialogo = new sap.m.Dialog({title: "Mensajes"});
		                var messageStrip = new sap.m.MessageStrip({text: "No hay data para grabar.", type: "Error", showIcon: true});
		                var label = new sap.m.Label({text: ""});
		                Dialogo.addContent(messageStrip);
		                Dialogo.addContent(label);

		                var ButtonCerrar = 
		                	Dialogo.addButton(new sap.m.Button({text: "Cerrar", type: "Reject", press: function(){
		                            Dialogo.destroy();
		                		}
		                   	})
		             	);
		                Dialogo.open();
					}
				}else{
					sap.ui.core.BusyIndicator.hide();
					var Dialogo = new sap.m.Dialog({title: "Mensajes"});
	                var messageStrip = new sap.m.MessageStrip({text: "Debe ingresar todos los campos obligatorios.", type: "Error", showIcon: true});
	                var label = new sap.m.Label({text: ""});
	                Dialogo.addContent(messageStrip);
	                Dialogo.addContent(label);

	                var ButtonCerrar = 
	                	Dialogo.addButton(new sap.m.Button({text: "Cerrar", type: "Reject", press: function(){
	                            Dialogo.destroy();
	                		}
	                   	})
	             	);
	                Dialogo.open();
				}
			}catch(err) {
                MessageBox.error(err.message);
                sap.ui.core.BusyIndicator.hide();
            }
		},
		onBuscar: function(){
			try{
				sap.ui.core.BusyIndicator.show(0);
				var planta = this.getView().byId("cblCentro");
				var fecha = this.getView().byId("dpfechaActual");
				var turno = this.getView().byId("slTurno");
				var tipoMedio = this.getView().byId("slTipoMedio");
				var proceso = this.getView().byId("slProceso");

				if(planta.getSelectedKey() != undefined && planta.getSelectedKey() != "" && planta.getSelectedKey() &&
					fecha.getValue() != "" && fecha._bValid &&
					turno.getSelectedKey() != undefined && turno.getSelectedKey() != "" && turno.getSelectedKey() &&
					tipoMedio.getSelectedKey() != undefined && tipoMedio.getSelectedKey() != "" && tipoMedio.getSelectedKey() &&
					proceso.getSelectedKey() != undefined && proceso.getSelectedKey() != "" && proceso.getSelectedKey()){

					this.onGetProducto(plants.PLANTID, tipoMedio.getSelectedKey());
					// this.onGetProducto("0101", "T001");
					this.onGetCabecera(planta.getSelectedKey(), tipoMedio.getSelectedKey());
					// this.onGetCabecera("0101", "T001");

					var datos = [],
						medium = [],
						param = [],
						cabeceraT = [],
						cabe = [],
						datosFinales = [],
						matMedium = [],
						totalMeasurement = 0;

					// producto = [{"MANDT":"800","PLANTID":"0101","STORAGE":"","TYPE":"T001","MEDIUM":"M00001","MATERIAL":"000000000000200004","MEDIUM_TEXT":"PRUEBAS","UNIQUE_MATERIAL":"","TEXT_MATERIAL":"MINERAL YESO GRANULADO","MAX_CAPACITY":"12.500 ","MEASURE":"","ACTIVE":"","SPRAS":"S"},{"MANDT":"800","PLANTID":"0101","STORAGE":"","TYPE":"T001","MEDIUM":"M00001","MATERIAL":"000000000000200014","MEDIUM_TEXT":"PRUEBAS","UNIQUE_MATERIAL":"","TEXT_MATERIAL":"BOR_ESCORIA PANTANO","MAX_CAPACITY":"9.000 ","MEASURE":"KG","ACTIVE":"X","SPRAS":"S"},{"MANDT":"800","PLANTID":"0101","STORAGE":"","TYPE":"T001","MEDIUM":"M00001","MATERIAL":"000000000000200017","MEDIUM_TEXT":"PRUEBAS","UNIQUE_MATERIAL":"","TEXT_MATERIAL":"BOR_PIEDRA GRUESA","MAX_CAPACITY":"1000.500 ","MEASURE":"","ACTIVE":"X","SPRAS":"S"},{"MANDT":"800","PLANTID":"0101","STORAGE":"","TYPE":"T001","MEDIUM":"M00001","MATERIAL":"000000000000200024","MEDIUM_TEXT":"PRUEBAS","UNIQUE_MATERIAL":"","TEXT_MATERIAL":"BOR_PIEDRA OVER 5MM-10CM","MAX_CAPACITY":"120.000 ","MEASURE":"","ACTIVE":"X","SPRAS":"S"},{"MANDT":"800","PLANTID":"0101","STORAGE":"","TYPE":"T001","MEDIUM":"M00002","MATERIAL":"000000000000200024","MEDIUM_TEXT":"PRUEBAS","UNIQUE_MATERIAL":"","TEXT_MATERIAL":"BOR_PIEDRA OVER 5MM-10CM","MAX_CAPACITY":"120.000 ","MEASURE":"","ACTIVE":"X","SPRAS":"S"}];



					$.each(producto, function(k, i){
						if(medium.indexOf(i.MEDIUM) == -1){
							datos.push({"MANDT": i.MANDT, "PLANTID": i.PLANTID, "STORAGE": i.STORAGE, "TYPE": i.TYPE, "MEDIUM": i.MEDIUM, "MATERIAL": i.MATERIAL, "MEDIUM_TEXT": i.MEDIUM_TEXT,"UNIQUE_MATERIAL": i.UNIQUE_MATERIAL, "TEXT_MATERIAL": i.TEXT_MATERIAL, "MAX_CAPACITY": i.MAX_CAPACITY, "MEASURE": i.MEASURE, "ACTIVE": i.ACTIVE, "SPRAS": i.SPRAS, "MATNR": [{"key": i.MATERIAL, "text": i.TEXT_MATERIAL, "ACTIVE": i.ACTIVE}], "MEINS": "5"});
							medium.push(i.MEDIUM);
						}else{
							$.each(datos, function(k2, i2){
								if(i2.MEDIUM == i.MEDIUM){
									datos[k2].MATNR.push({"key": i.MATERIAL, "text": i.TEXT_MATERIAL, "ACTIVE": i.ACTIVE});
								}
							});
						}
					});

					$.each(cabecera, function(k, i){
						if(param.indexOf(i.PARAM) == -1){
							$.each(medium, function(kp, ip){
								if(ip == i.MEDIUM){
									cabeceraT.push({"MANDT": i.MANDT, "PLANTID": i.PLANTID, "STORAGE": i.STORAGE, "TYPE": i.TYPE, "MEDIUM": i.MEDIUM, "PARAM": i.PARAM, "PARAM_TEXT": i.PARAM_TEXT, "FORMULA": i.FORMULA, "TEXT_FORM": i.TEXT_FORM, "TYPE_FORM": i.TYPE_FORM, "DETAIL_FORM": i.DETAIL_FORM, "UNIQUE_MATERIAL": i.UNIQUE_MATERIAL, "VALOR_TAG_COD": i.VALOR_TAG_COD, "PARAM_TYPE": i.PARAM_TYPE});
									param.push(i.PARAM);
									cabe.push({"MEDIUM": i.MEDIUM, "PARAM": i.PARAM});
									return false;
								}
							});
						}

						if(matMedium.indexOf(i.MEDIUM) == -1){
							if(datosFinales.length == 0){
								datosFinales = datos.filter(function(item){
							    	return item.MEDIUM == i.MEDIUM;
								});
							}else{
								var dat = datos.filter(function(item){
								    	return item.MEDIUM == i.MEDIUM;
								});
								if(dat[0] != undefined){
									datosFinales.push(dat[0]);

								}
							}
							matMedium.push(i.MEDIUM);
						}
					});

					var Tabla = this.getView().byId("tblMedicionMedia");

					Tabla.removeAllItems();

					// var oTableItems = thes.getView().byId("columnList");
					$.each(datosFinales, function(k, i){
						var opcion = 0,
							opcionText = 0,
							total = 0.00,
							cabeFiltro = [],
							icono = 0,
							measurement = 0,
							arrayValores = [],
							formula = "";

						$.each(i.MATNR, function(k3, i3){
							if(i3.ACTIVE == "X"){
								opcion = i3.key;
								opcionText = i3.text;
								return false;
							}
						});

						if(opcion == 0){
							opcion = i.MATNR[0].key;
						}

						thes.onGetValores(plants.PLANTID, tipoMedio.getSelectedKey(), turno.getSelectedKey(), opcion, i.MEDIUM, fecha.getValue());
						// thes.onGetValores("0101", "T001", "TUR1", "000000000000200014");
						// }
						var oTableItems = new sap.m.ColumnListItem({
															type: sap.m.ListType.Navigation,
															cells: [],
															press:function(e){
																var vista = this;
						                                        sap.ui.controller("com.cementos.pacasmayo.cpgestionstock.controller.MedicionDiaria")._onRowPress(oTableItems);
				                                            }
														});
						//Invisible
						oTableItems.addCell(new sap.m.Input({value: plants.PLANTID, editable: false, visible: false}));
						oTableItems.addCell(new sap.m.Input({value: tipoMedio.getSelectedKey(), editable: false, visible: false}));
						oTableItems.addCell(new sap.m.Input({value: i.MEDIUM, editable: false, visible: false}));
						var columna = new sap.m.ComboBox({forceSelection:false, selectedKey: opcion, tooltip: opcionText, items: i.MATNR, placeholder: "Producto", editable: true, enabled: true, visible: true, width: "100%", valueState: "None", maxWidth: "100%", change: function(){
																thes.onSumTotalProducto();
															}
														});
						oTableItems.addCell(new sap.m.ObjectStatus({icon: "sap-icon://write-new-document", state: "None", width: "10%"}));
						oTableItems.addCell(columna);
						oTableItems.addCell(new sap.m.Text({text: i.MEDIUM_TEXT, width: "100%", tooltip: i.MEDIUM_TEXT, maxLines: 1, wrapping: false, textAlign: "Center", textDirection: sap.ui.core.TextDirection.Middle, verticalAlign: sap.ui.core.VerticalAlign.Middle, visible: true}));

						cabeFiltro = cabecera.filter(function(item){
						    return item.MEDIUM == i.MEDIUM;
						});

						var array = [];

						$.each(cabeceraT, function(k5, i5){
							$.each(valores, function(k4, i4){
								if(i5.PARAM == i4.PARAM){
									array.push(i4);
								}
							});
						});

						$.each(cabeceraT, function(k5, i5){
							var item = "",
								vi = "",
								variable = 0;
							
							$.each(cabeFiltro, function(k2, i2){
								if(i5.PARAM == i2.PARAM){
									item = i2;
								}
								if(i.MEDIUM == i2.MEDIUM){
									formula = i2.DETAIL_FORM;
								}
							});

							if(item != ""){
								var val = 0;
								if(valores.length > 0){
									$.each(array, function(vk,vi){
										if(item.MEDIUM == vi.MEDIUM && item.PLANTID == vi.PLANTID && item.TYPE == vi.MEDIUM_TYPE && item.PARAM == vi.PARAM){
											// if(item.PARAM_TYPE == "A"){
											// 	if(item.VALOR_TAG_COD != undefined){
											// 		val = item.VALOR_TAG_COD;
											// 		arrayValores.push({"PARAM": vi.PARAM, "PARAM_VALUE": item.VALOR_TAG_COD});
											// 	}else{
											// 		val = 0.000;
											// 		arrayValores.push({"PARAM": vi.PARAM, "PARAM_VALUE": 0.000});
											// 	}
											// }else{
												val = vi.END_VAL;
												arrayValores.push({"PARAM": vi.PARAM, "PARAM_VALUE": vi.END_VAL});
											// }
											if(item.PARAM_TYPE == "A" || item.PARAM_TYPE == "M"){
												oTableItems.addCell(new sap.m.Input({type: "Number", value: formatter.redondearDec(parseFloat(val), 3), editable: true, name: item.PARAM+'&&'+item.FORMULA+'&&a&&'+vi.MEASURE+'&&'+vi.ITEM+'&&'+vi.RECORD+'&&'+item.PARAM_TYPE+'&&'+val, change: function(){
														if(this.getValue() != ""){
															this.setValue(this.getValue().replace(new RegExp("-", "gi"), ""));
														}
														this.setValue(formatter.redondearDec(parseFloat(this.getValue()), 3));
									                	thes.onChange(this, oTableItems.getCells(), item.MEDIUM, cabeFiltro.length, arrayValores, color);
									            	}
								            	}));
												total += parseFloat(val);
												variable = 1;
												columna.setSelectedKey(vi.MATERIAL);
											}
										}
										measurement = vi.MEASUREMENT;
									});
									if(variable == 0){
										// if(item.PARAM_TYPE == "A"){
										// 	if(item.VALOR_TAG_COD != undefined){
										// 		val = item.VALOR_TAG_COD;
										// 		arrayValores.push({"PARAM": item.PARAM, "PARAM_VALUE": item.VALOR_TAG_COD});
										// 	}else{
										// 		val = 0.000;
										// 		arrayValores.push({"PARAM": item.PARAM, "PARAM_VALUE": 0.000});
										// 	}
										// }else{
											val = item.PARAM_VALUE;
											arrayValores.push({"PARAM": item.PARAM, "PARAM_VALUE": item.PARAM_VALUE});
										// }
										if(item.PARAM_TYPE == "A" || item.PARAM_TYPE == "M"){
											oTableItems.addCell(new sap.m.Input({type: "Number", value: formatter.redondearDec(parseFloat(val), 3), editable: true, name: item.PARAM+'&&'+item.FORMULA+'&&a&&'+item.MEASURE+'&&'+item.ITEM+'&&'+item.RECORD+'&&'+item.PARAM_TYPE+'&&'+val, change: function(){
													if(this.getValue() != ""){
														this.setValue(this.getValue().replace(new RegExp("-", "gi"), ""));
													}
													this.setValue(formatter.redondearDec(parseFloat(this.getValue()), 3));
								                	thes.onChange(this, oTableItems.getCells(), item.MEDIUM, cabeFiltro.length, arrayValores, color);
								            	}
							            	}));
							            	measurement = 0;
							            	total += parseFloat(val);
							            }
									}
								}else{
									if(item.PARAM_TYPE == "A"){
										if(item.VALOR_TAG_COD != undefined){
											val = item.VALOR_TAG_COD;
											arrayValores.push({"PARAM": item.PARAM, "PARAM_VALUE": item.VALOR_TAG_COD});
										}else{
											val = 0.000;
											arrayValores.push({"PARAM": item.PARAM, "PARAM_VALUE": 0.000});
										}
									}else{
										val = item.PARAM_VALUE;
										arrayValores.push({"PARAM": item.PARAM, "PARAM_VALUE": item.PARAM_VALUE});
									}
									if(item.PARAM_TYPE == "A" || item.PARAM_TYPE == "M"){
										oTableItems.addCell(new sap.m.Input({type: "Number", value: formatter.redondearDec(parseFloat(val), 3), editable: true, name: item.PARAM+'&&'+item.FORMULA+'&&a&&'+vi.MEASURE+'&&'+vi.ITEM+'&&'+vi.RECORD+'&&'+item.PARAM_TYPE+'&&'+val, change: function(){
												if(this.getValue() != ""){
													this.setValue(this.getValue().replace(new RegExp("-", "gi"), ""));
												}
												this.setValue(formatter.redondearDec(parseFloat(this.getValue()), 3));
							                	thes.onChange(this, oTableItems.getCells(), item.MEDIUM, cabeFiltro.length, arrayValores, color);
							            	}
						            	}));
						            	total += parseFloat(val);
						            }
								}
							}else{
								if(i5.PARAM_TYPE == "A" || i5.PARAM_TYPE == "M"){
									oTableItems.addCell(new sap.m.Input({type: "Number", value: 0, editable: false}));
								}
							}
						});

						if(measurement == "" || measurement == undefined || measurement == null){
							measurement = 0;
						}

						icono = measurement;

						var formu = formula;

						$.each(arrayValores, function(tk, tv){
							formu = formu.replace(new RegExp(tv.PARAM.toLowerCase(), "gi"), tv.PARAM_VALUE);
						});

//REVISAR AQUI
						try{
							formu = formu.toLowerCase();
							formu = formu.replace(new RegExp("math.pow", "gi"), "Math.pow");
							if(measurement == 0 && total != 0.00){
								if(parseFloat(eval(formu)) < 0){
									measurement = 0;
									oTableItems.addCell(new sap.m.Input({value: 0, editable: false}));
								}else{
									measurement = formatter.redondearDec(parseFloat(eval(formu)), 3);
									oTableItems.addCell(new sap.m.Input({value: formatter.redondearDec(parseFloat(eval(formu)), 3), editable: false}));
								}
							}else if(measurement != 0 && total != 0.00){
								oTableItems.addCell(new sap.m.Input({value: formatter.redondearDec(parseFloat(eval(formu)), 3), editable: false}));
							}else if(measurement != 0 && total == 0.00){
								//Se agrego esta validación para el caso cuando Alturas son 0 
								oTableItems.addCell(new sap.m.Input({value: formatter.redondearDec(parseFloat(eval(formu)), 3), editable: false}));
							}else{
								oTableItems.addCell(new sap.m.Input({value: 0, editable: false}));
							}

							totalMeasurement += parseFloat(measurement);

						}catch(err) {
			            	MessageBox.error("Error al ejecutar la Formula.");
			                sap.ui.core.BusyIndicator.hide();
			            }
						
						var color = "",
							totalP = 0;

						if(parseFloat(i.MAX_CAPACITY) !== 0){
							totalP = formatter.redondearDec(parseFloat(parseFloat(measurement)*100/parseFloat(i.MAX_CAPACITY)), 1);
						}

						if(icono == 0){
							oTableItems.getCells()[3].setIcon("sap-icon://documents");
						}
						if(totalP < 21){
							color = "Warning";
						}else if(totalP > 20 && totalP < 80){
							color = "Success";
						}else if(totalP > 79 && totalP < 101){
							color = "Warning";
						}else if(totalP > 100){
							color = "Error";
						}
						// oTableItems.addCell(new HarveyBallMicroChart({total: parseFloat(i.MAX_CAPACITY), formattedLabel: true, size: "S", width: "100%", totalLabel: "", totalScale: "", showTotal: false, showFractions: true}).addItem(new HarveyBallMicroChartItem({color: color, fraction: parseInt(measurement), fractionLabel: totalP+"%", formattedLabel: false, fractionScale: ""})));
						oTableItems.addCell(new sap.m.ProgressIndicator({percentValue: totalP, showValue: true, state: color, displayValue: totalP, tooltip: ("Capacidad " + i.MAX_CAPACITY), height: "1rem", width: "10%"}));

			            Tabla.addItem(oTableItems);
			        });

			        Tabla.destroyColumns();
			        //Inivisible
					Tabla.addColumn(new sap.m.Column({ header: new sap.m.Text({text: "Cantidad Total Tn", width: "100%", maxLines: 1, wrapping: false, textAlign: "Begin", textDirection: "Inherit", visible: false}), hAlign: "Center", vAlign: "Middle", minScreenWidth: "Tablet", demandPopin: true, popinDisplay: "Inline", mergeDuplicates: false }));
					Tabla.addColumn(new sap.m.Column({ header: new sap.m.Text({text: "Cantidad Total Tn", width: "100%", maxLines: 1, wrapping: false, textAlign: "Begin", textDirection: "Inherit", visible: false}), hAlign: "Center", vAlign: "Middle", minScreenWidth: "Tablet", demandPopin: true, popinDisplay: "Inline", mergeDuplicates: false }));
					Tabla.addColumn(new sap.m.Column({ header: new sap.m.Text({text: "Cantidad Total Tn", width: "100%", maxLines: 1, wrapping: false, textAlign: "Begin", textDirection: "Inherit", visible: false}), hAlign: "Center", vAlign: "Middle", minScreenWidth: "Tablet", demandPopin: true, popinDisplay: "Inline", mergeDuplicates: false }));

					Tabla.addColumn(new sap.m.Column({ header: new sap.m.Text({text: "", width: "100%", height: "1rem", maxLines: 1, wrapping: false, textAlign: "Begin", textDirection: "Inherit", visible: true}), width: "3%", hAlign:"Left", vAlign: "Top", minScreenWidth: "Tablet", demandPopin: true, popinDisplay: "Inline", mergeDuplicates: false }));
					Tabla.addColumn(new sap.m.Column({ header: new sap.m.Text({text: "Producto", width: "100%", maxLines: 1, wrapping: false, textAlign: "Begin", textDirection: "Inherit", visible: true}), width:"25%", hAlign:"Center", vAlign:"Middle", minScreenWidth: "Phone", demandPopin: true, popinDisplay: "Inline", mergeDuplicates: false }));
					Tabla.addColumn(new sap.m.Column({ header: new sap.m.Text({text: "Med.Almto.", width: "100%", maxLines: 1, wrapping: false, textAlign: "Begin", textDirection: "Inherit", visible: true}), width: "15%", hAlign: "Center", vAlign: "Middle", minScreenWidth: "Tablet", demandPopin: true, popinDisplay: "Inline", mergeDuplicates: false }));
					$.each(cabeceraT, function(k, i){
						if(i.PARAM_TYPE == "A" || i.PARAM_TYPE == "M"){
							Tabla.addColumn(new sap.m.Column({ header: new sap.m.Text({text: i.PARAM_TEXT, width: "100%", maxLines: 1, wrapping: false, textAlign: "Begin", textDirection: "Inherit", visible: true}), width: "15%", hAlign: "Center", vAlign: "Middle", minScreenWidth: "Tablet", demandPopin: true, popinDisplay: "Inline", mergeDuplicates: false }));
						}
					});
					Tabla.addColumn(new sap.m.Column({ header: new sap.m.Text({text: "Cantidad Total TM", width: "100%", maxLines: 1, wrapping: false, textAlign: "Begin", textDirection: "Inherit", visible: true}), width: "20%", hAlign: "Center", vAlign: "Middle", minScreenWidth: "Tablet", demandPopin: true, popinDisplay: "Inline", mergeDuplicates: false, footer: new sap.m.Text({text: "Total: " + formatter.monto(totalMeasurement, 3), width: "100%", maxLines: 2, wrapping: true, textAlign: "Begin", textDirection: "Inherit", visible: true}) }));
					Tabla.addColumn(new sap.m.Column({ header: new sap.m.Text({text: "% Uso", width: "100%", maxLines: 1, wrapping: false, textAlign: "Begin", textDirection: "Inherit", visible: true}), width: "10%", hAlign: "Center", vAlign: "Middle", minScreenWidth: "Tablet", demandPopin: true, popinDisplay: "Inline", mergeDuplicates: false }));

					setTimeout(function(){thes.onChangeNumber();}, 1000);

					thes.onSumTotalProducto();
					// thes.onChangeNumber();

					sap.ui.core.BusyIndicator.hide();
				}else{
					sap.ui.core.BusyIndicator.hide();
					var Dialogo = new sap.m.Dialog({title: "Mensajes"});
	                var messageStrip = new sap.m.MessageStrip({text: "Debe ingresar todos los campos obligatorios.", type: "Error", showIcon: true});
	                var label = new sap.m.Label({text: ""});
	                Dialogo.addContent(messageStrip);
	                Dialogo.addContent(label);

	                var ButtonCerrar = 
	                	Dialogo.addButton(new sap.m.Button({text: "Cerrar", type: "Reject", press: function(){
	                            Dialogo.destroy();
	                		}
	                   	})
	             	);
	                Dialogo.open();

	                if(planta.getSelectedKey() == undefined || planta.getSelectedKey() == "" || !planta.getSelectedKey()){
	                	planta.setValueState("Error");
	                	planta.setValueStateText("Debe ingresar datos correctos.");
	                }

	                if(turno.getSelectedKey() == undefined || turno.getSelectedKey() == "" || !turno.getSelectedKey()){
	                	turno.setValueState("Error");
	                	turno.setValueStateText("Debe ingresar datos correctos.");
	                }

	                if(tipoMedio.getSelectedKey() == undefined || tipoMedio.getSelectedKey() == "" || !tipoMedio.getSelectedKey()){
	                	tipoMedio.setValueState("Error");
	                	tipoMedio.setValueStateText("Debe ingresar datos correctos.");
	                }

	                if(proceso.getSelectedKey() == undefined || proceso.getSelectedKey() == "" || !proceso.getSelectedKey()){
	                	proceso.setValueState("Error");
	                	proceso.setValueStateText("Debe ingresar datos correctos.");
	                }

	                if(fecha.getValue() == undefined || fecha.getValue() == "" || !fecha.getValue()){
	                	fecha.setValueState("Error");
	                	fecha.setValueStateText("Debe ingresar datos correctos.");
	                }
				}
			}catch(err) {
                MessageBox.error(err.message);
                sap.ui.core.BusyIndicator.hide();
            }
		},
		onChange: function(thes, tabla, medium, tamanioCabe, arrayValores, color){
			var vista = thes,
        		celdas = tabla,
        		suma = 0,
        		totalPC = 0.00,
        		total = 0.00,
        		formu = "",
        		totalAnterior = tabla[tabla.length-2].getValue(),
        		tablaMediciones = this.getView().byId("tblMedicionMedia");

        	$.each(cabecera, function(ck, cv){
        		if(cv.MEDIUM == medium){
        			formu = cv.DETAIL_FORM.toLowerCase();
        			return false;
        		}
        	});

        	$.each(celdas, function(l, v){
        		if(l > 5 && l < (celdas.length-2)){
        			if(v.getValue() == ""){
        				v.setValue(0);
        			}
        			suma += parseFloat(v.getValue());
        		}
        	});

        	total = suma/tamanioCabe;
        	var tot = 0.000;

			$.each(arrayValores, function(tk, tv){
				if(tv.PARAM == vista.getName().split("&&")[0]){
					formu = formu.replace(new RegExp(tv.PARAM.toLowerCase(), "gi"), vista.getValue());
					arrayValores[tk].PARAM_VALUE = vista.getValue();
				}else{
					formu = formu.replace(new RegExp(tv.PARAM.toLowerCase(), "gi"), tv.PARAM_VALUE);
				}
			});

			if(parseFloat(celdas[celdas.length-1].getTooltip().split(" ")[1]) !== 0){
				try{
					formu = formu.toLowerCase();
					formu = formu.replace(new RegExp("math.pow", "gi"), "Math.pow");
					tot = formatter.redondearDec(parseFloat(eval(formu)), 3);
				}catch(err) {
	            	MessageBox.error("Error al ejecutar la Formula.");
	                sap.ui.core.BusyIndicator.hide();
	            }
        		
        		totalPC = formatter.redondearDec(parseFloat(tot*100/parseFloat(celdas[celdas.length-1].getTooltip().split(" ")[1])), 1);
			}

			if(totalPC < 21){
				color = "Error";
			}else if(totalPC > 20 && totalPC < 80){
				color = "Success";
			}else if(totalPC > 79 && totalPC < 101){
				color = "Warning";
			}else if(totalPC > 100){
				color = "Error";
			}
        	
        	try{
        		formu = formu.toLowerCase();
				formu = formu.replace(new RegExp("math.pow", "gi"), "Math.pow");
				if(parseFloat(eval(formu)) < 0){
					sap.ui.core.BusyIndicator.hide();
					var Dialogo = new sap.m.Dialog({title: "Mensajes"});
	                var messageStrip = new sap.m.MessageStrip({text: "La cantidad Total no puede ser menor a 0.", type: "Error", showIcon: true});
	                var label = new sap.m.Label({text: ""});
	                Dialogo.addContent(messageStrip);
	                Dialogo.addContent(label);

	                var ButtonCerrar = 
	                	Dialogo.addButton(new sap.m.Button({text: "Cerrar", type: "Reject", press: function(){
	                            Dialogo.destroy();
	                		}
	                   	})
	             	);
	                Dialogo.open();
					celdas[celdas.length-2].setValue(0);
					celdas[celdas.length-1].setPercentValue(0);
					celdas[celdas.length-1].setState(color);
					celdas[celdas.length-1].setDisplayValue(0);
					var totalGeneral = tablaMediciones.mAggregations.columns[celdas.length-2].getFooter().getText().split(" ")[1].replace(new RegExp(",", "gi"), "");;
					tablaMediciones.mAggregations.columns[celdas.length-2].getFooter().setText("Total: " + formatter.monto((parseFloat(totalGeneral)-parseFloat(totalAnterior)), 3))

        			$.each(celdas, function(l, v){
		        		if(l > 5 && l < (celdas.length-2)){
		        			celdas[l].setValueState("Error")
		        		}
		        	});
				}else{
					celdas[celdas.length-2].setValue(formatter.redondearDec(parseFloat(eval(formu)), 3));
					celdas[celdas.length-1].setPercentValue(totalPC);
					celdas[celdas.length-1].setState(color);
					celdas[celdas.length-1].setDisplayValue(totalPC);
					var totalGeneral = tablaMediciones.mAggregations.columns[celdas.length-2].getFooter().getText().split(" ")[1].replace(new RegExp(",", "gi"), "");;
					tablaMediciones.mAggregations.columns[celdas.length-2].getFooter().setText("Total: " + formatter.monto((parseFloat(totalGeneral)-parseFloat(totalAnterior)+parseFloat(eval(formu))), 3))

					$.each(celdas, function(l, v){
		        		if(l > 5 && l < (celdas.length-2)){
		        			celdas[l].setValueState("None")
		        		}
		        	});
				}

				this.onSumTotalProducto();
			}catch(err) {
            	MessageBox.error("Error al ejecutar la Formula.");
                sap.ui.core.BusyIndicator.hide();
            }
		},
		//Obtener los datos del historial.
		onGetHistorial: function(planta, tipoMedio, turn, material, medium, fecha){
			sap.ui.core.BusyIndicator.show(0);
			//Obtener datos del Combo de Proceso
			$.ajax({
				url: urlGlobal + '/MEASUS',
				type: 'GET',
				data : {
					"$format" : "json",
					"$count": true,
					"$filter" : "PLANTID eq '" + planta + "'" +
								// " and DATE_MED eq ''"  + 
								" and TURN eq '" + turn + "'" +
								" and MATERIAL eq '" + material + "'" +
								" and MEDIUM_TYPE eq '" + tipoMedio + "'" +
								" and MEDIUM eq '" + medium + "'" +
								" and XHIST eq 'X'" +
								" and XLASTR eq ''" +
								" and DATE_MED eq '" + fecha + "'" +
								" and TYPE_MEASU eq 'D'"
				},
				async: false,
				success: function(data, textStatus, request) {
					historial = data.value;

					if(historial.length == 0){
						//Si no encuentra datos, regresa a la pantalla anterior.
						sap.ui.core.BusyIndicator.hide();
						var Dialogo = new sap.m.Dialog({title: "Mensajes",
							escapeHandler: function(e) {
	                            Dialogo.destroy();
								sap.ui.core.BusyIndicator.hide();
							}
						});
		                var messageStrip = new sap.m.MessageStrip({text: "No existe registros en el historial.", type: "Error", showIcon: true});
		                var label = new sap.m.Label({text: ""});
		                Dialogo.addContent(messageStrip);
		                Dialogo.addContent(label);

		                var ButtonCerrar = 
		                	Dialogo.addButton(new sap.m.Button({text: "Cerrar", type: "Reject", press: function(){
		                            Dialogo.destroy();
		                            sap.ui.core.BusyIndicator.hide();
		                		}
		                   	})
		             	);
		                Dialogo.open();
					}
				},
				error: function(jqXHR,textStatus,errorThrown) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error(jqXHR.statusText);
				}
			});
		},
		onValidar: function(e){
			var data = e.getSource().data("data");

			if(data == 1 || data == null){
				if(e.getSource().getSelectedKey() != "" && e.getSource().getSelectedKey() != undefined && e.getSource().getSelectedKey()){
					thes.getView().byId(e.getParameters().id).setValueState("Success");
	            	thes.getView().byId(e.getParameters().id).setValueStateText("");
				}else{
					thes.getView().byId(e.getParameters().id).setValueState("Error");
	            	thes.getView().byId(e.getParameters().id).setValueStateText("Debe ingresar datos correctos.");
				}
			}else{
				if(e.getSource().getValue() != "" && e.getParameters().valid){
					thes.getView().byId(e.getParameters().id).setValueState("Success");
	            	thes.getView().byId(e.getParameters().id).setValueStateText("");
				}else{
					thes.getView().byId(e.getParameters().id).setValueState("Error");
	            	thes.getView().byId(e.getParameters().id).setValueStateText("Debe ingresar datos correctos.");
				}
			}
		},
		onChangeNumber: function(){
			$(':input[type=number]').on('mousewheel',function(e){ e.preventDefault(); });
		},
		onSumTotalProducto: function(){
			var tabla = thes.getView().byId("tblMedicionMedia").getItems(),
			productoSele = [],
			productoSeleFinal = [],
			datos = [],
			codigo = "",
			sum = 0;

			$.each(tabla, function(key, item){
				var oCells = item.mAggregations.cells,
            	celdasT = oCells.length;

            	if(oCells[4].getSelectedItem() != undefined){
					productoSele.push({"MATNR": oCells[4].getSelectedKey(), "MATERIAL": oCells[4].getSelectedItem().getText(), "TOTAL": parseFloat(oCells[celdasT-2].getValue()), "FLAG": ""});
            	}
			});

			$.each(productoSele, function(k, v){
				codigo = v.MATNR;
				sum = 0;
				$.each(productoSele, function(k2, v2){
					if(codigo == v2.MATNR){
	            		sum += v2.TOTAL;
	            	}
	            });
	            if(sum != 0){
					productoSeleFinal.push({"MATNR": v.MATNR, "MATERIAL": v.MATERIAL, "TOTAL": formatter.redondearDec(parseFloat(sum), 3), "FLAG": ""});
	            }
			});

			var prodsinrepetidos = thes.removeDuplicates(productoSeleFinal, "MATNR");
			var model = new JSONModel(prodsinrepetidos);

			thes.getView().byId("tblMedicionMediaTotal").setModel(model);
			thes.getView().byId("tblMedicionMediaTotal").getModel().refresh();
		},
		removeDuplicates: function(originalArray, prop) {
			var newArray = [];
			var lookupObject  = {};

			for(var i in originalArray) {
				lookupObject[originalArray[i][prop]] = originalArray[i];
			}

			for(i in lookupObject) {
				newArray.push(lookupObject[i]);
			}
			return newArray;
		}
	});
}, /* bExport= */ true);