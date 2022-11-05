sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	"com/cementos/pacasmayo/cpgestionstock/util/Formatter",
	"jquery.sap.storage",
	"sap/ui/model/json/JSONModel"
], function(BaseController, MessageBox, Utilities, History, formatter , storage, JSONModel) {
	"use strict";
	//var urlGlobal = 'https://cpcslfioridev.cpsaa.com.pe:44350/sap/opu/odata4/sap/zgfd0001/default/sap/ZS_FD_MNCP/0001',
	//var urlGlobal = '/sap/opu/odata4/sap/zgfd0001/default/sap/zs_fd_mncp/0001',
    var urlGlobal = './ERP/sap/opu/odata/sap/zgfd0001/default/sap/zs_fd_mncp/0001',
		urlGlobal2 = 'https://intappprod.cpsaa.com.pe:8443/pi-integracion/service/mediciones.wsdl',
		thes,
		ln,
		plants = "",
		auth,
		centro = [],
		turn = [],
		tipoMedio = [],
		producto = [],
		cabecera = [],
		valores = [],
		csrf_token,
		uname,
		oLStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local),
		totalXMediumFinal = [];
	return BaseController.extend("com.cementos.pacasmayo.cpgestionstock.controller.StockEnBolsas", {
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

			// thes.onBuscar();
			var tabla = thes.getView().byId("tblStockBolsas");
			tabla.destroyItems();

			thes.getView().byId("cblCentro").setSelectedKey("");

			// var oBindingContext = oEvent.getSource().getBindingContext();

			// return new Promise(function(fnResolve) {

			// 	this.doNavigate("GestionDeStock", oBindingContext, fnResolve, "");
			// }.bind(this)).catch(function(err) {
			// 	if (err !== undefined) {
			// 		MessageBox.error(err.message);
			// 	}
			// });

			thes.getOwnerComponent().getRouter().navTo("GestionDeStock");

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
			var datos = oEvent.getCells(),
				array = [],
				tipoM = [],
				tipoMD = [];

			$.each(datos, function(k, v){
				if(k != 3){
					if(k == 4){
						array.push(v.getSelectedKey());
					}else{
						array.push(v.getValue());
					}
				}

				if(k > 5 && k < (datos.length-1)){
					if(tipoM.indexOf(v.getName().split("&&")[9]) == -1){
						tipoM.push(v.getName().split("&&")[9]);
					}
				}
	        });

	        $.each(tipoM, function(kt, vt){
	        	$.each(tipoMedio, function(ktp, vtp){
					if(vt != vtp.TYPE){
						tipoMD.push({"TYPE": vt, "NAME_TYPE": vtp.NAME_TYPE});
					}
				});
	        });

			oLStorage.put("bolsas", window.btoa(JSON.stringify(array)));
			oLStorage.put("tipoMD", window.btoa(JSON.stringify(tipoMD)));
			oLStorage.put("tipoMedio", window.btoa(JSON.stringify(tipoMedio)));
			oLStorage.put("producto", window.btoa(JSON.stringify(producto)));
			oLStorage.put("cabecera", window.btoa(JSON.stringify(cabecera)));

			thes.getOwnerComponent().getRouter().navTo("DetalleDeStockEnBolsas");
		},
		_onRowPress1: function(oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function(fnResolve) {

				this.doNavigate("DetalleDeStockEnBolsas", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_onRowPress2: function(oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function(fnResolve) {

				this.doNavigate("DetalleDeStockEnBolsas", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_onButtonPress: function() {
			return new Promise(function(fnResolve) {
				sap.m.MessageBox.confirm("Desea guardar los cambios de Stock en Bolsas", {
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
			this.oRouter.getTarget("StockEnBolsas").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			thes = this;
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("StockEnBolsas").attachMatched(function(oEvent) {
				uname = "FIORI";
				ln = window.navigator.language||navigator.browserLanguage;

				if(ln.substr(0,2) == "es"){
					ln = 'S';
				}else if(ln.substr(0,2) == "en"){
					ln = 'E';
				}else if(ln.substr(0,2) == "de"){
					ln = 'D';
				}

				thes.getView().byId("dpfechaActual").setDateValue(new Date());

				
				if(thes.getView().byId("cblCentro").getSelectedKey() == ""){
					thes.onGetPlanta();
				}
				thes.onGetTurno();
				setTimeout(function(){ thes.onGetAuth(); thes.onChangeNumber(); }, 1000);
				// thes.onGetTipoMedio();
				// thes.onBuscar();
			});
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
								}else if(auth[0].LOW == "01"){
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

				thes.onValidar(e);

				//Obtener datos del Combo de Tipo Medio
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

							tipoMedio = data.value;

							if(tipoMedio.length > 0){
								thes.onBuscar();
							}else{
								thes.getView().byId("tblStockBolsas").removeAllColumns();
							}
						},
						error: function(jqXHR,textStatus,errorThrown) {
							sap.ui.core.BusyIndicator.hide();
							MessageBox.error(jqXHR.statusText);
						}
					});
				}else{
					tipoMedio = [];
					thes.getView().byId("tblStockBolsas").removeAllColumns();
                	sap.ui.core.BusyIndicator.hide();
				}
			}catch(err) {
                MessageBox.error(err.message);
                sap.ui.core.BusyIndicator.hide();
            }
		},
		onGetProducto: function(){
			try{
				sap.ui.core.BusyIndicator.show(0);
				//Obtener datos del Combo de Proceso
				$.ajax({
					url: urlGlobal + '/SMNMTS',
					type: 'GET',
					data : {
						"$format" : "json",
						"$count": true,
						"$filter" : "PLANTID eq '" + plants.PLANTID + "'" +
									" and TYPE1 ge '" + tipoMedio[0].TYPE + "'" +
									" and TYPE2 le '" + tipoMedio[1].TYPE + "'" +
									" and TYPE_MEASU eq 'S'"
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
		onGetCabecera: function(){
			try{
				sap.ui.core.BusyIndicator.show(0);
				//Obtener datos del Combo de Proceso
				$.ajax({
					url: urlGlobal + '/FORMS',
					type: 'GET',
					data : {
						"$format" : "json",
						"$count": true,
						"$filter" : "PLANTID eq '" + plants.PLANTID + "'" +
									" and TYPE1 eq '" + tipoMedio[0].TYPE + "'" +
									" and TYPE2 eq '" + tipoMedio[1].TYPE + "'" +
									" and TYPE_FORM eq 'S'"
					},
					async: false,
					success: function(data) {
						cabecera = data.value;
						// thes.onGetWSDL();
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
		onGetValores: function(planta, material, fecha){
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
						"$filter" : "PLANTID eq '" + planta + "'" +
									// " and DATE_MED eq ''"  + 
									" and TURN eq ''" +
									" and MATERIAL eq '" + material + "'" +
									// " and MEDIUM_TYPE eq '" + tipoMedio[0].TYPE + "'" +
									" and MEDIUM_TYPE1 eq '" + tipoMedio[0].TYPE + "'" +
									" and MEDIUM_TYPE2 eq '" + tipoMedio[1].TYPE + "'" +
									" and DATE_MED eq '" + fecha + "'" +
									" and XHIST eq 'X'" +
									" and XLASTR eq 'X'" +
									" and TYPE_MEASU eq 'S'"
					},
					async: false,
					headers : {
								"X-CSRF-TOKEN": "FETCH"	
					},
					success: function(data, textStatus, request) {
						valores = data.value;
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
				var hora = turn[0].END_HOUR;
				var fechaFinal = fecha.substr(0, 4) + '-' + fecha.substr(4, 2) + '-' + fecha.substr(6, 2);
				var mensaje = '';

		        var horaFinal = hora.substr(0, 2) + ":" + hora.substr(2, 2) + ":" + hora.substr(4, 2);
				
				$.each(cabecera, function(k, v){
					if(v.TAG_COD != undefined && v.TAG_COD != null && v.TAG_COD != ''){
						mensaje += '<med:tag>'+v.TAG_COD+'</med:tag>';
					}
		        });

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
						var wsdl = log["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ns2:ObtenerMedicionesResponse"]["ns2:MedicionesSilos"]
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
			}catch(err) {
                MessageBox.error(err.message);
                sap.ui.core.BusyIndicator.hide();
            }
		},
		onBuscar: function(){
			try{
				sap.ui.core.BusyIndicator.show(0);
				var planta = this.getView().byId("cblCentro");

				if(planta.getSelectedKey() != undefined && planta.getSelectedKey() != "" && planta.getSelectedKey()){
					var fecha = this.getView().byId("dpfechaActual").getValue();
					this.onGetProducto();
					// this.onGetProducto("0101", "T001");
					this.onGetCabecera();
					// this.onGetCabecera("0101", "T001");

					var datos = [],
						medium = [],
						datosMedium = [],
						material = [],
						param = [],
						totalCantidad = 0.000,
						unidad = '',
						totalXMediumFinal = [],
						cabe = [],
						cabeMedium = [];
					// producto = [{"MANDT":"800","PLANTID":"0101","STORAGE":"","TYPE":"T001","MEDIUM":"M00001","MATERIAL":"000000000000200004","MEDIUM_TEXT":"PRUEBAS","UNIQUE_MATERIAL":"","TEXT_MATERIAL":"MINERAL YESO GRANULADO","MAX_CAPACITY":"12.500 ","MEASURE":"","ACTIVE":"","SPRAS":"S"},{"MANDT":"800","PLANTID":"0101","STORAGE":"","TYPE":"T001","MEDIUM":"M00001","MATERIAL":"000000000000200014","MEDIUM_TEXT":"PRUEBAS","UNIQUE_MATERIAL":"","TEXT_MATERIAL":"BOR_ESCORIA PANTANO","MAX_CAPACITY":"9.000 ","MEASURE":"KG","ACTIVE":"X","SPRAS":"S"},{"MANDT":"800","PLANTID":"0101","STORAGE":"","TYPE":"T001","MEDIUM":"M00001","MATERIAL":"000000000000200017","MEDIUM_TEXT":"PRUEBAS","UNIQUE_MATERIAL":"","TEXT_MATERIAL":"BOR_PIEDRA GRUESA","MAX_CAPACITY":"1000.500 ","MEASURE":"","ACTIVE":"X","SPRAS":"S"},{"MANDT":"800","PLANTID":"0101","STORAGE":"","TYPE":"T001","MEDIUM":"M00001","MATERIAL":"000000000000200024","MEDIUM_TEXT":"PRUEBAS","UNIQUE_MATERIAL":"","TEXT_MATERIAL":"BOR_PIEDRA OVER 5MM-10CM","MAX_CAPACITY":"120.000 ","MEASURE":"","ACTIVE":"X","SPRAS":"S"},{"MANDT":"800","PLANTID":"0101","STORAGE":"","TYPE":"T001","MEDIUM":"M00002","MATERIAL":"000000000000200024","MEDIUM_TEXT":"PRUEBAS","UNIQUE_MATERIAL":"","TEXT_MATERIAL":"BOR_PIEDRA OVER 5MM-10CM","MAX_CAPACITY":"120.000 ","MEASURE":"","ACTIVE":"X","SPRAS":"S"}];

					$.each(producto, function(k, i){
						if(material.indexOf(i.MATERIAL) == -1){
							datos.push({"MANDT": i.MANDT, "PLANTID": i.PLANTID, "STORAGE": i.STORAGE, "TYPE": i.TYPE, "MEDIUM": i.MEDIUM, "MATERIAL": i.MATERIAL, "MEDIUM_TEXT": i.MEDIUM_TEXT,"UNIQUE_MATERIAL": i.UNIQUE_MATERIAL, "TEXT_MATERIAL": i.TEXT_MATERIAL, "MAX_CAPACITY": i.MAX_CAPACITY, "MEASURE": i.MEASURE, "ACTIVE": i.ACTIVE, "SPRAS": i.SPRAS, "MATNR": [{"key": i.MATERIAL, "text": i.TEXT_MATERIAL, "ACTIVE": i.ACTIVE}], "CABMEDIUM": [{"key": i.MEDIUM, "text": i.MEDIUM_TEXT, "TYPE": i.TYPE}], "MEINS": "5"});
							material.push(i.MATERIAL);
						}else{
							$.each(datos, function(k2, i2){
								if(i2.MATERIAL == i.MATERIAL){
									datos[k2].CABMEDIUM.push({"key": i.MEDIUM, "text": i.MEDIUM_TEXT, "TYPE": i.TYPE});
								}
							});
						}
						if(medium.indexOf(i.MEDIUM) == -1){
							datosMedium.push({"MEDIUM": i.MEDIUM, "MEDIUM_TEXT": i.MEDIUM_TEXT});
							medium.push(i.MEDIUM);
						}
					});

					var Tabla = this.getView().byId("tblStockBolsas");

					Tabla.removeAllItems();
					
					// var oTableItems = thes.getView().byId("columnList");
					$.each(datos, function(k, i){
						var opcion = 0,
							total = 0.000,
							cabeFiltro = [],
							icono = 0,
							measurement = 0,
							totalXMedium = [],
							variable = 0;

						thes.onGetValores(plants.PLANTID, i.MATNR[0].key, fecha);

						var oTableItems = new sap.m.ColumnListItem({
															type: sap.m.ListType.Navigation,
															cells: [],
															press:function(e){
																var vista = this;
						                                        sap.ui.controller("com.cementos.pacasmayo.cpgestionstock.controller.StockEnBolsas")._onRowPress(oTableItems);
				                                            }
														});
						//Invisible
						oTableItems.addCell(new sap.m.Input({value: plants.PLANTID, maxLines: 2, wrapping: true, textAlign: "Begin", textDirection: "Inherit", visible: false}));
						oTableItems.addCell(new sap.m.Input({value: i.TYPE, maxLines: 2, wrapping: true, textAlign: "Begin", textDirection: "Inherit", visible: false}));
						oTableItems.addCell(new sap.m.Input({value: i.MEDIUM, maxLines: 2, wrapping: true, textAlign: "Begin", textDirection: "Inherit", visible: false}));

						oTableItems.addCell(new sap.m.ObjectStatus({icon: "sap-icon://documents", state: "None", width: "3%"}));
						oTableItems.addCell(new sap.m.Input({value: i.MATNR[0].key, maxLines: 2, wrapping: true, textAlign: "Begin", textDirection: "Inherit", visible: true, editable: false, enabled: false}));
						oTableItems.addCell(new sap.m.ComboBox({heigth: "50%", forceSelection:false, selectedKey: i.MATNR[0].key, items: i.MATNR, placeholder: "Producto", editable: false, enabled: false, visible: true, width: "100%", valueState: "None", maxWidth: "100%"}));

						var array = [],
							validador = false;

						$.each(medium, function(k5, i5){
							$.each(valores, function(k4, i4){
								if(i5 == i4.MEDIUM){
									array.push(i4);
								}
							});
						});

						$.each(cabecera, function(ck, cv){
							$.each(datosMedium, function(k2, i2){
								if(cv.MEDIUM == i2.MEDIUM){
									validador = true;
									// return false;
									if(cabe.indexOf(i2.MEDIUM) == -1){
										cabeMedium.push({"MEDIUM": i2.MEDIUM, "MEDIUM_TEXT": i2.MEDIUM_TEXT});
										cabe.push(i2.MEDIUM);
									}
								}
							});
						});

						if(validador){
							$.each(cabe, function(km, im){
								var val = 0,
									valorFijo = [],
									valorVariable = [],
									formula = '',
									item = "",
									vi = "",
									variable = 0,
									typeM = '';

								$.each(i.CABMEDIUM, function(k2, i2){
									if(im == i2.key){
										item = i;
										typeM = i2.TYPE;
									}

									// if(im == i2.key){
									// 	if(cabe.indexOf(i2.key) == -1){
									// 		datosMedium.push({"MEDIUM": i2.key, "MEDIUM_TEXT": i2.text});
									// 		cabe.push(i2.key);
									// 	}
									// }
								});
								if(item != ""){
									if(valores.length > 0){
										$.each(array, function(vk,vi){
											if(im == vi.MEDIUM){
												unidad = vi.UM_MEASUREMENT;
												oTableItems.getCells()[3].setIcon("sap-icon://write-new-document");
												$.each(cabecera, function(ck, cv){
													if(im == cv.MEDIUM){
														if(cv.PARAM_TYPE == 'F'){
															valorFijo.push({"PARAM": cv.PARAM, "PARAM_VALUE": cv.PARAM_VALUE});
														}else{
															formula = cv.DETAIL_FORM;
															if(cv.PARAM_TYPE == "A"){
																if(cv.VALOR_TAG_COD != undefined){
																	valorVariable.push({"PARAM": cv.PARAM, "PARAM_VALUE": cv.VALOR_TAG_COD});
																	val = cv.VALOR_TAG_COD;
																	param = cv.PARAM;
																}else{
																	valorVariable.push({"PARAM": cv.PARAM, "PARAM_VALUE": 0.000});
																	val = 0.000;
																	param = cv.PARAM;
																}
															}else{
																valorVariable.push({"PARAM": cv.PARAM, "PARAM_VALUE": vi.END_VAL});
																val = vi.END_VAL;
															}
															oTableItems.addCell(new sap.m.Input({type: "Number", value: formatter.redondearDec(parseFloat(val), 3), editable: true, name: cv.PARAM+'&&'+cv.FORMULA+'&&'+cv.DETAIL_FORM+'&&'+vi.MEASURE+'&&'+vi.ITEM+'&&'+vi.RECORD+'&&'+cv.PARAM_TYPE+'&&'+val+'&&'+im+'&&'+typeM, change: function(){
												                	var vista = this,
												                		name = vista.getName().split("&&")[8],
												                		total = 0.000,
												                		formula = '',
												                		celdas = oTableItems.getCells();
												                		if(vista.getValue() == ""){
													                		vista.setValue(0);
												                		}
																		vista.setValue(vista.getValue().replace(new RegExp("-", "gi"), ""));
												                		vista.setValue(parseInt(vista.getValue()));
												                	$.each(totalXMedium, function(tk, tv){
																		if(tv.MEDIUM == name){
																			if(vista.getValue() != ''){
																				formula = tv.DETAIL_FORM.replace(new RegExp(tv.PARAM.toLowerCase(), "gi"), parseFloat(vista.getValue()));
																			}else{
																				formula = tv.DETAIL_FORM.replace(new RegExp(tv.PARAM.toLowerCase(), "gi"), '0.000');
																			}
																			try{
																				formula = formula.toLowerCase();
																				formula = formula.replace(new RegExp("math.pow", "gi"), "Math.pow");
																				totalXMedium[tk].PARAM_VALUE = parseFloat(eval(formula));
																			}catch(err) {
																            	MessageBox.error("Error al ejecutar la Formula.");
																                sap.ui.core.BusyIndicator.hide();
																            }
																		}
																	});

																	$.each(totalXMediumFinal, function(tk, tv){
																		if(tv.MEDIUM == name && tv.MATERIAL == i.MATNR[0].key){
																			if(vista.getValue() != ''){
																				formula = tv.DETAIL_FORM.replace(new RegExp(tv.PARAM.toLowerCase(), "gi"), parseFloat(vista.getValue()));
																			}else{
																				formula = tv.DETAIL_FORM.replace(new RegExp(tv.PARAM.toLowerCase(), "gi"), '0.000');
																			}
																			try{
																				formula = formula.toLowerCase();
																				formula = formula.replace(new RegExp("math.pow", "gi"), "Math.pow");
																				totalXMediumFinal[tk].PARAM_VALUE = parseFloat(eval(formula));
																			}catch(err) {
																            	MessageBox.error("Error al ejecutar la Formula.");
																                sap.ui.core.BusyIndicator.hide();
																            }
																		}
																	});

																	$.each(totalXMedium, function(tk, tv){
																		total += parseFloat(tv.PARAM_VALUE);
																	});

												                	celdas[celdas.length-1].setValue(formatter.redondearDec(parseFloat(total), 3));

																	var tabla = thes.getView().byId("tblStockBolsas").getItems();
																	totalCantidad = 0.000;
																	$.each(tabla, function(tk, tv){
																		var oCells = tv.mAggregations.cells;
																		totalCantidad += parseFloat(oCells[oCells.length-1].getValue());
																	});

																	thes.getView().byId("total").setHtmlText("<strong>Total: " + formatter.redondearDec(parseFloat(totalCantidad), 3) + " " + unidad + "</strong>");
												            	}
											            	}));
														}
													}
												});
												// oTableItems.addCell(new sap.m.Input({type: "Number", value: formatter.redondearDec(parseFloat(val), 3), editable: true, name: item.PARAM+'&&'+item.FORMULA+'&&'+item.DETAIL_FORM+'&&'+vi.MEASURE+'&&'+vi.ITEM+'&&'+vi.RECORD+'&&'+item.PARAM_TYPE+'&&'+val, change: function(){
												
												variable = 1;
											}
										});
										if(variable == 0){
											oTableItems.getCells()[3].setIcon("sap-icon://documents");
											$.each(cabecera, function(ck, cv){
												if(im== cv.MEDIUM){
													if(cv.PARAM_TYPE == 'F'){
														valorFijo.push({"PARAM": cv.PARAM, "PARAM_VALUE": cv.PARAM_VALUE});
													}else{
														formula = cv.DETAIL_FORM;
														if(cv.PARAM_TYPE == "A"){
															if(cv.VALOR_TAG_COD != undefined){
																valorVariable.push({"PARAM": cv.PARAM, "PARAM_VALUE": cv.VALOR_TAG_COD});
																val = cv.VALOR_TAG_COD;
															}else{
																valorVariable.push({"PARAM": cv.PARAM, "PARAM_VALUE": 0.000});
																val = 0.000;
															}
														}else{
															valorVariable.push({"PARAM": cv.PARAM, "PARAM_VALUE": vi.END_VAL});
															val = vi.END_VAL;
														}

														oTableItems.addCell(new sap.m.Input({type: "Number", value: formatter.redondearDec(parseFloat(val), 3), editable: true, name: cv.PARAM+'&&'+cv.FORMULA+'&&'+cv.DETAIL_FORM+'&&'+vi.MEASURE+'&&'+vi.ITEM+'&&'+vi.RECORD+'&&'+cv.PARAM_TYPE+'&&'+val+'&&'+im+'&&'+typeM, change: function(){
											                	var vista = this,
											                		name = vista.getName().split("&&")[8],
											                		total = 0.000,
											                		formula = '',
											                		celdas = oTableItems.getCells();
											                		if(vista.getValue() == ""){
												                		vista.setValue(0);
											                		}
											                		vista.setValue(vista.getValue().replace(new RegExp("-", "gi"), ""));
											                		vista.setValue(parseInt(vista.getValue()));
											                	$.each(totalXMedium, function(tk, tv){
																	if(tv.MEDIUM == name){
																		if(vista.getValue() != ''){
																			formula = tv.DETAIL_FORM.replace(new RegExp(tv.PARAM.toLowerCase(), "gi"), parseFloat(vista.getValue()));
																		}else{
																			formula = tv.DETAIL_FORM.replace(new RegExp(tv.PARAM.toLowerCase(), "gi"), '0.000');
																		}
																		try{
																			formula = formula.toLowerCase();
																			formula = formula.replace(new RegExp("math.pow", "gi"), "Math.pow");
																			totalXMedium[tk].PARAM_VALUE = parseFloat(eval(formula));
																		}catch(err) {
															            	MessageBox.error("Error al ejecutar la Formula.");
															                sap.ui.core.BusyIndicator.hide();
															            }
																	}
																});

																$.each(totalXMediumFinal, function(tk, tv){
																	if(tv.MEDIUM == name && tv.MATERIAL == i.MATNR[0].key){
																		if(vista.getValue() != ''){
																			formula = tv.DETAIL_FORM.replace(new RegExp(tv.PARAM.toLowerCase(), "gi"), parseFloat(vista.getValue()));
																		}else{
																			formula = tv.DETAIL_FORM.replace(new RegExp(tv.PARAM.toLowerCase(), "gi"), '0.000');
																		}
																		try{
																			formula = formula.toLowerCase();
																			formula = formula.replace(new RegExp("math.pow", "gi"), "Math.pow");
																			totalXMediumFinal[tk].PARAM_VALUE = parseFloat(eval(formula));
																		}catch(err) {
															            	MessageBox.error("Error al ejecutar la Formula.");
															                sap.ui.core.BusyIndicator.hide();
															            }
																	}
																});

																$.each(totalXMedium, function(tk, tv){
																	total += parseFloat(tv.PARAM_VALUE);
																});

											                	celdas[celdas.length-1].setValue(formatter.redondearDec(parseFloat(total), 3));

																var tabla = thes.getView().byId("tblStockBolsas").getItems();
																totalCantidad = 0.000;
																$.each(tabla, function(tk, tv){
																	var oCells = tv.mAggregations.cells;
																	totalCantidad += parseFloat(oCells[oCells.length-1].getValue());
																});

																thes.getView().byId("total").setHtmlText("<strong>Total: " + formatter.redondearDec(parseFloat(totalCantidad), 3) + " " + unidad + "</strong>");
											            	}
										            	}));
													}
												}
											});
										}
									}else{
					            		oTableItems.getCells()[3].setIcon("sap-icon://documents");
										$.each(cabecera, function(ck, cv){
											if(im == cv.MEDIUM){
												formula = cv.DETAIL_FORM.toLowerCase();
												if(cv.PARAM_TYPE == 'F'){
													valorFijo.push({"PARAM": cv.PARAM, "PARAM_VALUE": cv.PARAM_VALUE});
												}else{
													if(cv.PARAM_TYPE == "A"){
														if(cv.VALOR_TAG_COD != undefined){
															valorVariable.push({"PARAM": cv.PARAM, "PARAM_VALUE": cv.VALOR_TAG_COD});
															val = cv.VALOR_TAG_COD;
														}else{
															valorVariable.push({"PARAM": cv.PARAM, "PARAM_VALUE": 0.000});
															val = 0.000;
														}
													}else{
														valorVariable.push({"PARAM": cv.PARAM, "PARAM_VALUE": cv.PARAM_VALUE});
														val = cv.PARAM_VALUE;
													}
													oTableItems.addCell(new sap.m.Input({type: "Number", value: formatter.redondearDec(parseFloat(val), 3), editable: true, name: cv.PARAM+'&&'+cv.FORMULA+'&&'+cv.DETAIL_FORM+'&&'+vi.MEASURE+'&&'+vi.ITEM+'&&'+vi.RECORD+'&&'+cv.PARAM_TYPE+'&&'+0.000+'&&'+im+'&&'+typeM, change: function(){
										                	var vista = this,
										                		name = vista.getName().split("&&")[8],
										                		total = 0.000,
										                		formula = '',
										                		celdas = oTableItems.getCells();
										                		if(vista.getValue() == ""){
											                		vista.setValue(0);
										                		}
										                		vista.setValue(vista.getValue().replace(new RegExp("-", "gi"), ""));
										                		vista.setValue(parseInt(vista.getValue()));
										                	$.each(totalXMedium, function(tk, tv){
																if(tv.MEDIUM == name){
																	if(vista.getValue() != ''){
																		formula = tv.DETAIL_FORM.replace(new RegExp(tv.PARAM.toLowerCase(), "gi"), parseFloat(vista.getValue()));
																	}else{
																		formula = tv.DETAIL_FORM.replace(new RegExp(tv.PARAM.toLowerCase(), "gi"), '0.000');
																	}
																	try{
																		formula = formula.toLowerCase();
																		formula = formula.replace(new RegExp("math.pow", "gi"), "Math.pow");
																		totalXMedium[tk].PARAM_VALUE = parseFloat(eval(formula));
																	}catch(err) {
														            	MessageBox.error("Error al ejecutar la Formula.");
														                sap.ui.core.BusyIndicator.hide();
														            }
																}
															});

															$.each(totalXMediumFinal, function(tk, tv){
																if(tv.MEDIUM == name && tv.MATERIAL == i.MATNR[0].key){
																	if(vista.getValue() != ''){
																		formula = tv.DETAIL_FORM.replace(new RegExp(tv.PARAM.toLowerCase(), "gi"), parseFloat(vista.getValue()));
																	}else{
																		formula = tv.DETAIL_FORM.replace(new RegExp(tv.PARAM.toLowerCase(), "gi"), '0.000');
																	}
																	try{
																		formula = formula.toLowerCase();
																		formula = formula.replace(new RegExp("math.pow", "gi"), "Math.pow");
																		totalXMediumFinal[tk].PARAM_VALUE = parseFloat(eval(formula));
																	}catch(err) {
														            	MessageBox.error("Error al ejecutar la Formula.");
														                sap.ui.core.BusyIndicator.hide();
														            }
																}
															});

															$.each(totalXMedium, function(tk, tv){
																total += parseFloat(tv.PARAM_VALUE);
															});

										                	celdas[celdas.length-1].setValue(formatter.redondearDec(parseFloat(total), 3));

															var tabla = thes.getView().byId("tblStockBolsas").getItems();
															totalCantidad = 0.000;
															$.each(tabla, function(tk, tv){
																var oCells = tv.mAggregations.cells;
																totalCantidad += parseFloat(oCells[oCells.length-1].getValue());
															});

															thes.getView().byId("total").setHtmlText("<strong>Total: " + formatter.redondearDec(parseFloat(totalCantidad), 3) + " " + unidad + "</strong>");
										            	}
									            	}));
												}
											}
										});
									}

									var resultado = 0.000,
										formulaVariable = formula;

									$.each(valorFijo, function(fik, fiv){
										formula = formula.replace(new RegExp(fiv.PARAM.toLowerCase(), "gi"), fiv.PARAM_VALUE);
										formulaVariable = formulaVariable.replace(new RegExp(fiv.PARAM.toLowerCase(), "gi"), fiv.PARAM_VALUE);
									});

									$.each(valorVariable, function(fvk, fvv){
										formula = formula.replace(new RegExp(fvv.PARAM.toLowerCase(), "gi"), fvv.PARAM_VALUE);
									});
									
									try{
										formula = formula.toLowerCase();
										formula = formula.replace(new RegExp("math.pow", "gi"), "Math.pow");
										resultado = eval(formula);
									}catch(err) {
						            	MessageBox.error("Error al ejecutar la Formula.");
						                sap.ui.core.BusyIndicator.hide();
						            }

						            if(valorVariable.length == 0){
										totalXMediumFinal.push({"MEDIUM": im, "MATERIAL": i.MATNR[0].key,"PARAM": "", "PARAM_VALUE": 0, "DETAIL_FORM": formulaVariable.toLowerCase()});
										totalXMedium.push({"MEDIUM": im, "PARAM": "", "PARAM_VALUE": 0, "DETAIL_FORM": formulaVariable.toLowerCase()});
						            }else{
						            	totalXMediumFinal.push({"MEDIUM": im, "MATERIAL": i.MATNR[0].key,"PARAM": valorVariable[0].PARAM, "PARAM_VALUE": resultado, "DETAIL_FORM": formulaVariable.toLowerCase()});
										totalXMedium.push({"MEDIUM": im, "PARAM": valorVariable[0].PARAM, "PARAM_VALUE": resultado, "DETAIL_FORM": formulaVariable.toLowerCase()});
						            }
								}else{
									oTableItems.addCell(new sap.m.Input({type: "Number", value: 0.000, editable: false}));
								}
							});
							
							$.each(totalXMedium, function(tk, tv){
								total += parseFloat(tv.PARAM_VALUE);
								totalCantidad += parseFloat(tv.PARAM_VALUE);
							});

							if(total < 0){
								oTableItems.addCell(new sap.m.Input({value: 0, editable: false}));
								total = 0;
								totalCantidad = 0;
							}else{
								oTableItems.addCell(new sap.m.Input({value: formatter.redondearDec(parseFloat(total), 3), editable: false}));
							}

				            Tabla.addItem(oTableItems);
						}
			        });

			        Tabla.destroyColumns();
			        //Inivisible
					Tabla.addColumn(new sap.m.Column({ header: new sap.m.Text({text: "Cantidad Total Tn", width: "auto", maxLines: 1, wrapping: false, textAlign: "Begin", textDirection: "Inherit", visible: false}), width: "auto", hAlign: "Left", vAlign: "Top", minScreenWidth: "Tablet", demandPopin: true, popinDisplay: "Inline", mergeDuplicates: false, visible: false }));
					Tabla.addColumn(new sap.m.Column({ header: new sap.m.Text({text: "Cantidad Total Tn", width: "auto", maxLines: 1, wrapping: false, textAlign: "Begin", textDirection: "Inherit", visible: false}), width: "auto", hAlign: "Left", vAlign: "Top", minScreenWidth: "Tablet", demandPopin: true, popinDisplay: "Inline", mergeDuplicates: false, visible: false }));
					Tabla.addColumn(new sap.m.Column({ header: new sap.m.Text({text: "Cantidad Total Tn", width: "auto", maxLines: 1, wrapping: false, textAlign: "Begin", textDirection: "Inherit", visible: false}), width: "auto", hAlign: "Left", vAlign: "Top", minScreenWidth: "Tablet", demandPopin: true, popinDisplay: "Inline", mergeDuplicates: false, visible: false }));

					Tabla.addColumn(new sap.m.Column({ header: new sap.m.Text({text: "", width: "100%", maxLines: 2, wrapping: true, textAlign: "Begin", textDirection: "Inherit", visible: true}), width: "5%", hAlign:"Left", vAlign: "Top", minScreenWidth: "Tablet", demandPopin: true, popinDisplay: "Inline", mergeDuplicates: false }));
					Tabla.addColumn(new sap.m.Column({ header: new sap.m.Text({text: "Codigo SAP", width: "100%", maxLines: 2, wrapping: true, textAlign: "Begin", textDirection: "Inherit", visible: true}), width:"15%", hAlign:"Center", vAlign:"Middle", minScreenWidth: "Phone", demandPopin: true, popinDisplay: "Inline", mergeDuplicates: false }));
					Tabla.addColumn(new sap.m.Column({ header: new sap.m.Text({text: "Producto", width: "100%", maxLines: 2, wrapping: true, textAlign: "Begin", textDirection: "Inherit", visible: true}), width:"30%", hAlign:"Center", vAlign:"Middle", minScreenWidth: "Phone", demandPopin: true, popinDisplay: "Inline", mergeDuplicates: false }));
					$.each(cabeMedium, function(k, i){
						Tabla.addColumn(new sap.m.Column({ header: new sap.m.Text({text: i.MEDIUM_TEXT, width: "100%", maxLines: 2, wrapping: true, textAlign: "Begin", textDirection: "Inherit", visible: true}), width: "10%", hAlign: "Center", vAlign: "Middle", minScreenWidth: "Tablet", demandPopin: true, popinDisplay: "Inline", mergeDuplicates: false }));
					});
					Tabla.addColumn(new sap.m.Column({ header: new sap.m.Text({text: "Cantidad Total TM", width: "100%", maxLines: 2, wrapping: true, textAlign: "Begin", textDirection: "Inherit", visible: true}), width: "10%", hAlign: "Center", vAlign: "Middle", minScreenWidth: "Tablet", demandPopin: true, popinDisplay: "Inline", mergeDuplicates: false}));
					// thes.getView().byId("total").setText("Total: " + totalCantidad + " " + unidad);
					thes.getView().byId("total").setHtmlText("<strong>Total: " + formatter.redondearDec(parseFloat(totalCantidad), 3) + " " + unidad + "</strong>");
					
					setTimeout(function(){thes.onChangeNumber();}, 1000);
					
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
				}
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
					anio = fecha.substr(0, 4),
					mes = fecha.substr(4, 2),
					fechaActual = new Date(),
					hora = fechaActual.getHours()<10?('0'+fechaActual.getHours()):fechaActual.getHours(),
					minuto = fechaActual.getMinutes()<10?('0'+fechaActual.getMinutes()):fechaActual.getMinutes(),
					segundo = fechaActual.getSeconds()<10?('0'+fechaActual.getSeconds()):fechaActual.getSeconds();

				if(planta != undefined && planta != "" && planta &&
					fecha != undefined && fecha != "" && fecha){

					var tabla = thes.getView().byId("tblStockBolsas").getItems();
					if(tabla.length > 0){
						//Obtener datos del Combo de Proceso
						var stockBolsas = [];
						$.each(tabla, function(key, item){
			                var oCells = item.mAggregations.cells,
			                	celdasT = oCells.length;

			                if(parseFloat(oCells[celdasT-1].getValue()) > 0){
				                $.each(oCells, function(key3, item3){
				    				if(key3 > 4 && key3 < (celdasT-1)){
				    					var measurement = 0.000;
				    					// $.each(valores, function(vk,vi){
				    					// 	if(oCells[0].getValue() == vi.PLANTID && item3.getName().split("&&")[9] == vi.MEDIUM_TYPE && item3.getName().split("&&")[8] == vi.MEDIUM && item3.getName().split("&&")[0] == vi.PARAM){
				    					// 		iniVal = vi.END_VAL;
				    					// 	}
				    					// });

				    					// $.each(totalXMediumFinal, function(vk,vi){
				    					// 	if(vi.MEDIUM == item3.getName().split("&&")[8] && vi.MATERIAL == oCells[4].getSelectedKey()){
				    					// 		measurement = vi.PARAM_VALUE;
				    					// 	}
				    					// });

				    					if(item3.getName().split('&&')[0] != ""){
				    						var elemento = {
					    						'MATERIAL': oCells[4].getSelectedKey(),
						                    	'MEDIUM': item3.getName().split('&&')[8],
							                    'PARAM': item3.getName().split('&&')[0],
							                    'INI_VAL': item3.getName().split('&&')[7],
							                    'END_VAL': item3.getValue(),
							                    'MEASUREMENT': oCells[celdasT-1].getValue(),
							                    'PLANTID': plants.PLANTID,
							                    'TURN': '',
							                    'MEDIUM_TYPE': item3.getName().split('&&')[9],
							                    'TYPE_MEASU': 'S',
							                    'PROCESS': '',
							                    'DATE_MED': fecha,
							                    'HOUR_MED': hora + minuto + segundo,
							                    'YEAR_CON': anio,
							                    'MONTH_CON': mes,
							                    'FORMULA': item3.getName().split('&&')[1],
							                    'FORMU_DET': item3.getName().split('&&')[2],
							                    'MEASURE': item3.getName().split('&&')[3]=="undefined"?"":item3.getName().split('&&')[3],
							                    'ITEM': item3.getName().split('&&')[4]=="undefined"?"":item3.getName().split('&&')[4],
							                    'RECORD': item3.getName().split('&&')[5]=="undefined"?"":item3.getName().split('&&')[5]
							                };
							                stockBolsas.push(elemento);
				    					}
				    				}
				    			});
				            }
			            });
			            if(stockBolsas.length > 0){
			            	$.ajax({
								url: urlGlobal + '/MEASUCS',
								type: 'POST',
								contentType: "application/json",
								dataType: 'json',
								data: JSON.stringify({"LINE": JSON.stringify(stockBolsas)}),
					            headers : {
									"X-CSRF-TOKEN": csrf_token
								},
								async: false,
								success: function(data) {
									sap.ui.core.BusyIndicator.hide();
									var Dialogo = new sap.m.Dialog({title: "Mensajes"});
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
		onValidar: function(e){
			if(e.getSource().getSelectedKey() != "" && e.getSource().getSelectedKey() != undefined && e.getSource().getSelectedKey()){
				thes.getView().byId(e.getParameters().id).setValueState("Success");
            	thes.getView().byId(e.getParameters().id).setValueStateText("");
			}else{
				thes.getView().byId(e.getParameters().id).setValueState("Error");
            	thes.getView().byId(e.getParameters().id).setValueStateText("Debe ingresar datos correctos.");
			}
		},
		onChangeNumber: function(){
			$(':input[type=number]').on('mousewheel',function(e){ e.preventDefault(); });
		}
	});
}, /* bExport= */ true);