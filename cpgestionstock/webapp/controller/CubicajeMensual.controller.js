sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	'sap/m/Button',
	'sap/m/Dialog',
	'sap/m/Label',
	'sap/m/MessageToast',
	'sap/m/Text',
	'sap/m/TextArea',
	"com/cementos/pacasmayo/cpgestionstock/util/Formatter",
	"jquery.sap.storage"
], function(BaseController, MessageBox, Utilities, History, JSONModel, Button, Dialog, Label, MessageToast, Text, TextArea, formatter) {
	"use strict";
	//var urlGlobal = 'https://cpcslfioridev.cpsaa.com.pe:44350/sap/opu/odata4/sap/zgfd0001/default/sap/ZS_FD_MNCP/0001',
	//var urlGlobal = '/sap/opu/odata4/sap/zgfd0001/default/sap/zs_fd_mncp/0001',
    var urlGlobal = './ERP/sap/opu/odata/sap/zgfd0001/default/sap/zs_fd_mncp/0001',
		urlGlobal2 = 'https://intappprod.cpsaa.com.pe:8443/pi-integracion/service/mediciones.wsdl',
		thes,
		ln,
		plants = "",
		auth,
		turno = "",
		proceso = "",
		centro = [],
		producto = [],
		material = [],
		medio = [],
		cabecera = [],
		valores = [],
		imagenesGet = [],
		fileUploadImagenes = [],
		fileUploadImagenesGeneral = [],
		idUploadImagenes = "",
		csrf_token,
		uname,
		oLStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local),
		totalXMediumFinal = [],
		arrayItem = [];
	return BaseController.extend("com.cementos.pacasmayo.cpgestionstock.controller.CubicajeMensual", {
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

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function(fnResolve) {

				this.doNavigate("GestionDeStock", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

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
				medioSelecKey,
				medioSelec,
				materialSelecKey = thes.getView().byId("slMaterial").getSelectedKey(),
				materialSelec = thes.getView().byId("slMaterial").getSelectedItem().getText(),
				fechaA = thes.getView().byId("cblAnio").getSelectedKey(),
				fechaM = thes.getView().byId("cblMes").getSelectedKey(),
				tipo = '',
				formula = [],
				array = [],
				items = [];

			$.each(datos, function(k, v){
				if(k == 3){
					medioSelecKey = v.getText();
				}

				if(k == 4){
					medioSelec = v.getText();
				}
	        });

	        tipo = producto.filter(function(item){
				if(item.MEDIUM == medioSelecKey){
		    		return item;
				}
			});

			tipo = tipo[0].TYPE;

	        array.push(plants.PLANTID);
			array.push(medioSelecKey);
			array.push(medioSelec);
			array.push(materialSelecKey);
			array.push(materialSelec);
			array.push(tipo);
			array.push(fechaA+fechaM);

			$.each(datos, function(k, v){
				if(k != 0 && k != 3 && k != 4 && k != (datos.length-1)){
					array.push(v.getValue());
				}

				if(k > 4 && k < (datos.length-3)){
					var detalleFormula = "";
				    					
					$.each(cabecera, function(kc, vc){
						if(v.getName().split('&&')[3] == vc.FORMULA){
							detalleFormula = vc.DETAIL_FORM;
						}
					});

					if(formula.indexOf(detalleFormula) == -1){
						formula.push(detalleFormula);
					}
					if(items.indexOf(v.getName().split("&&")[6]) == -1){
						items.push(v.getName().split("&&")[6]);
					}
				}
	        });
			
	        array.push(formula[0]);
	        array.push(items[0]);

	        if(items[0] != "undefined"){
				oLStorage.put("cubicaje", window.btoa(JSON.stringify(array)));
				oLStorage.put("cabecera", window.btoa(JSON.stringify(cabecera)));
				thes.getOwnerComponent().getRouter().navTo("DetalleDeCubicajeMensual");
	        }
		},
		_onRowPress1: function(oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function(fnResolve) {

				this.doNavigate("DetalleDeCubicajeMensual", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_onRowPress2: function(oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function(fnResolve) {

				this.doNavigate("DetalleDeCubicajeMensual", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_onRowPress3: function(oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function(fnResolve) {

				this.doNavigate("DetalleDeCubicajeMensual", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_onRowPress4: function(oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function(fnResolve) {

				this.doNavigate("DetalleDeCubicajeMensual", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_onButtonPress: function() {
			return new Promise(function(fnResolve) {
				sap.m.MessageBox.confirm("Desea guardar los cambios de Cubicaje Mensual", {
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
			this.oRouter.getTarget("CubicajeMensual").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			thes = this;
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("CubicajeMensual").attachMatched(function(oEvent) {
				var detalleCubi = oLStorage.get("detalleCubicaje");
				if(detalleCubi != 1){
					var tabla = thes.getView().byId("tblCubicajeMensual");
					tabla.destroyItems();

					thes.getView().byId("cblCentro").setSelectedKey("");
					thes.getView().byId("slMedioAlc").setSelectedKey("");
					thes.getView().byId("slMaterial").setSelectedKey("");

					oLStorage.put("cubicaje", "");
					oLStorage.put("cabecera", "");

					thes.getView().byId('cblAnio').setValueState("None");
                	thes.getView().byId("cblMes").setValueState("None");
                	thes.getView().byId("cblCentro").setValueState("None");
					thes.getView().byId("slMedioAlc").setValueState("None");
					thes.getView().byId('slMaterial').setValueState("None");
					//Setear fecha actual.
					var model = new JSONModel({
	            		"anioitems": formatter.anioIA(2019)
		            });

		            model.setSizeLimit(999999999);
		        	thes.getView().byId('cblAnio').setModel(model, "anio");

		        	var model = new JSONModel({
		            	"mesitems": formatter.meses()
		            });

		            model.setSizeLimit(999999999);
		        	thes.getView().byId('cblMes').setModel(model, "mes");


					if(thes.getView().byId("cblCentro").getSelectedKey() == ""){
						thes.onGetPlanta();
					}
				}
				setTimeout(function(){ thes.onGetAuth(); thes.onChangeNumber(); }, 1000);
			});
		},
		//Obtener los datos del Centro.
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
								}else if(auth[0].LOW === "01" && auth[1].LOW === "10" ){
									thes.getView().byId("btnSave").setEnabled(true);
								}else if (auth[0].LOW === "01"){
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
		//Obtener los medios de almacenamiento con sus respectivos materiales.
		onGetProducto: function(e){
			try{
				sap.ui.core.BusyIndicator.show(0);

				thes.onValidar(e);

				//Obtener datos del Combo de Proceso
				var centroId = thes.getView().byId("cblCentro").getSelectedKey();

				thes.getView().byId("tblCubicajeMensual").removeAllColumns();

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
						url: urlGlobal + '/SMNMTS',
						type: 'GET',
						data : {
							"$format" : "json",
							"$count": true,
							"$filter" : "PLANTID eq '" + plants.PLANTID + "'" +
										" and TYPE_MEASU eq 'M'"
						},
						async: false,
						success: function(data) {
							producto = data.value;
							var mat = [],
								med = [];

							material = [];
							medio = [];

							medio.push({"MEDIUM": "", "MEDIUM_TEXT": ""});
							//Obtener Materiales y Medios unicos sin repetidos.
							$.each(producto, function(k, i){
								// if(mat.indexOf(i.MATERIAL) == -1){
									// var matsin0 = formatter.borrar0izalfanumerico(i.MATERIAL);
									material.push({"MEDIUM": i.MEDIUM, "MATERIAL": i.MATERIAL, "TEXT_MATERIAL": i.TEXT_MATERIAL, "COD_EXT": i.COD_EXT});
									mat.push(i.MATERIAL);
								// }

								if(med.indexOf(i.MEDIUM) == -1){
									medio.push({"MEDIUM": i.MEDIUM, "MEDIUM_TEXT": i.MEDIUM_TEXT});
									med.push(i.MEDIUM);
								}
							});

							//Ordenando el array de material por su nombre.
							material.sort(function (a, b){
								if (a.TEXT_MATERIAL > b.TEXT_MATERIAL) {
									return 1;
								}
								if (a.TEXT_MATERIAL < b.TEXT_MATERIAL) {
									return -1;
								}
								// a must be equal to b
								return 0;
							});

							//Ordenando el array de medio por su nombre.
							medio.sort(function (a, b){
								if (a.MEDIUM_TEXT > b.MEDIUM_TEXT) {
									return 1;
								}
								if (a.MEDIUM_TEXT < b.MEDIUM_TEXT) {
									return -1;
								}
								// a must be equal to b
								return 0;
							});

							if(producto.length > 0){
								//Seteando los medios de almacenamiento a un combobox, y obteniendo material de acuerdo a lo escogido.
								var model = new JSONModel({
			                    	"slMedioAlcitems": medio
			                    });

			                    model.setSizeLimit(999999999);
			                	thes.getView().byId('slMedioAlc').setModel(model, "slMedioAlc");

			                	//Seleccionar la primera opcion.
			                	thes.getView().byId('slMedioAlc').setSelectedKey(medio[0].MEDIUM);
			                	thes.getView().byId('slMedioAlc').setEnabled(true);
			                	thes.onGetMaterial();
							}else{
								var model = new JSONModel({
			                    	"slMedioAlcitems": []
			                    });

			                    model.setSizeLimit(999999999);
			                	thes.getView().byId('slMedioAlc').setModel(model, "slMedioAlc");
			                	thes.getView().byId('slMedioAlc').setEnabled(true);

			                	var model = new JSONModel({
			                    	"slMaterialitems": []
			                    });

			                    model.setSizeLimit(999999999);
			                	thes.getView().byId('slMaterial').setModel(model, "slMaterial");
			                	thes.getView().byId('slMaterial').setEnabled(true);

			                	thes.getView().byId('slMaterial').setValueState("Error");
	            				thes.getView().byId('slMaterial').setValueStateText("Debe ingresar datos correctos.");
							}
			                sap.ui.core.BusyIndicator.hide();
						},
						error: function(jqXHR,textStatus,errorThrown) {
							sap.ui.core.BusyIndicator.hide();
							MessageBox.error(jqXHR.statusText);
						}
					});
				}else{
					var model = new JSONModel({
                    	"slMedioAlcitems": []
                    });

                    model.setSizeLimit(999999999);
                	thes.getView().byId('slMedioAlc').setModel(model, "slMedioAlc");
                	thes.getView().byId('slMedioAlc').setEnabled(false);

                	var model = new JSONModel({
                    	"slMaterialitems": []
                    });

                    model.setSizeLimit(999999999);
                	thes.getView().byId('slMaterial').setModel(model, "slMaterial");
                	thes.getView().byId('slMaterial').setEnabled(false);
                	sap.ui.core.BusyIndicator.hide();
				}
			}catch(err) {
                MessageBox.error(err.message);
                sap.ui.core.BusyIndicator.hide();
            }
		},
		//Obtener Material de acuerdo al medio de almacenamiento escogido.
		onGetMaterial: function(){
        	var medioAlm = thes.getView().byId('slMedioAlc').getSelectedKey(),
        		matSeleccionado = [],
        		medio = [];

			//Filtrando material por medio de almacenamiento seleccionado.
        	if(medioAlm == ""){
        		$.each(material, function(i, v){
        			if(medio.indexOf(v.MATERIAL) == -1){
						matSeleccionado.push(v);
						medio.push(v.MATERIAL);
					}
        		});
        	}else{
        		matSeleccionado = material.filter(function(item){
					if(item.MEDIUM.indexOf(medioAlm) > -1){
			    		return item;
					}
				});
        	}

			//Setear material filtrado al combobox.
			var model = new JSONModel({
            	"slMaterialitems": matSeleccionado
            });

            model.setSizeLimit(999999999);
        	thes.getView().byId('slMaterial').setModel(model, "slMaterial");

        	if(matSeleccionado.length > 0){
        		//Seleccionar la primera opcion.
        		thes.getView().byId('slMaterial').setSelectedKey(matSeleccionado[0].MATERIAL);
        		thes.getView().byId('slMaterial').setEnabled(true);

        		thes.getView().byId('slMaterial').setValueState("Success");
	           	thes.getView().byId('slMaterial').setValueStateText("");
        	}else{
        		thes.getView().byId('slMaterial').setValueState("Error");
	            thes.getView().byId('slMaterial').setValueStateText("Debe ingresar datos correctos.");
        	}
		},
		//Obtener los parametros (Cabecera de la tabla) dinamicos con su formula.
		onGetCabecera: function(medioAlc, mate, fecha){
			try{
				sap.ui.core.BusyIndicator.show(0);
				//Obtener datos de la cabecera
				if(medioAlc != ""){
					$.ajax({
						url: urlGlobal + '/FORMS',
						type: 'GET',
						data : {
							"$format" : "json",
							"$count": true,
							"$filter" : "PLANTID eq '" + plants.PLANTID + "'" +
										" and MEDIUM eq '" + medioAlc + "'" +
										" and TYPE_FORM eq 'C'" + 
										" and MATERIAL eq '" + mate + "'"
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
				}else{
					$.ajax({
						url: urlGlobal + '/FORMS',
						type: 'GET',
						data : {
							"$format" : "json",
							"$count": true,
							"$filter" : "PLANTID eq '" + plants.PLANTID + "'" +
										" and TYPE_FORM eq 'C'" + 
										" and MATERIAL eq '" + mate + "'"
						},
						async: false,
						success: function(data) {
							// cabecera = data.value;

							cabecera = data.value;

							thes.onGetWSDL();
						},
						error: function(jqXHR,textStatus,errorThrown) {
							sap.ui.core.BusyIndicator.hide();
							MessageBox.error(jqXHR.statusText);
						}
					});
				}
			}catch(err) {
                MessageBox.error(err.message);
                sap.ui.core.BusyIndicator.hide();
            }
		},
		//Covertir XML a JSON.
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
		//Obtener los valores de los parametros mediante un servicio WSDL.
		onGetWSDL: function(){
			try{
				sap.ui.core.BusyIndicator.show(0);
				//Obtener valores del Servicio Web WSDL
				var fecha = new Date(),
					anio = fecha.getFullYear(),
					mes = (parseInt(fecha.getMonth()+1)<10?('0'+parseInt(fecha.getMonth()+1)):parseInt(fecha.getMonth()+1)).toString(),
					dia = fecha.getDate()<10?('0'+fecha.getDate()):fecha.getDate(),
					hora = fecha.getHours()<10?('0'+fecha.getHours()):fecha.getHours(),
					minuto = fecha.getMinutes()<10?('0'+fecha.getMinutes()):fecha.getMinutes(),
					segundo = fecha.getSeconds()<10?('0'+fecha.getSeconds()):fecha.getSeconds();

				var fechaFinal = anio + '-' + mes + '-' + dia;
				var horaFinal = hora + ':' + minuto + ':' + segundo;
				var mensaje = '';

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
							var wsdl = log["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ns2:ObtenerMedicionesResponse"]["ns2:MedicionesSilos"]
							if(wsdl["ns2:medicion"] != undefined){
								$.each(cabecera, function(k, v){
									if(wsdl["ns2:medicion"].length > 1){
										$.each(wsdl["ns2:medicion"], function(kw, vw){
											cabecera[k].VALOR_TAG_COD = 0;
											if(vw["ns2:tag"]["#text"].toLowerCase() == v.TAG_COD.toLowerCase()){
												cabecera[k].VALOR_TAG_COD = vw["ns2:valor"]["#text"];
											}
										});
									}else{
										cabecera[k].VALOR_TAG_COD = 0;
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
		//Obtener los valores guardados de los parametros.
		onGetValores: function(planta, medioAlc, material, fecha){
			try{
				sap.ui.core.BusyIndicator.show(0);
				//Obtener datos del Combo de Proceso
				csrf_token = "";
				if(medioAlc != ""){
					$.ajax({
						url: urlGlobal + '/MEASUS',
						type: 'GET',
						data : {
							"$format" : "json",
							"$count": true,
							"$filter" : "PLANTID eq '" + planta + "'" +
										// " and DATE_MED eq ''"  + 
										" and TURN eq ''" +
										" and MEDIUM eq '" + medioAlc + "'" +
										" and MATERIAL eq '" + material + "'" +
										" and MONTH_MED eq '" + fecha + "'" +
										" and XHIST eq 'X'" +
										" and XLASTR eq 'X'" +
										" and TYPE_MEASU eq 'M'"
						},
						async: false,
						headers : {
									"X-CSRF-TOKEN": "FETCH"	//Generar Token para despues poder guardar los cambios de los valores.
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
				}else{
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
										" and MONTH_MED eq '" + fecha + "'" +
										" and XHIST eq 'X'" +
										" and XLASTR eq 'X'" +
										" and TYPE_MEASU eq 'M'"
						},
						async: false,
						headers : {
									"X-CSRF-TOKEN": "FETCH"	//Generar Token para despues poder guardar los cambios de los valores.
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
				}
			}catch(err) {
                MessageBox.error(err.message);
                sap.ui.core.BusyIndicator.hide();
            }
		},
		//Metodo para invocar los parametros y los valores y pintarlos en la tabla.
		onBuscar: function(){
			try{
				sap.ui.core.BusyIndicator.show(0);
				setTimeout(function(){
					var planta = thes.getView().byId("cblCentro"),
						fechaA = thes.getView().byId("cblAnio"),
						fechaM = thes.getView().byId("cblMes"),
						medioAlc = thes.getView().byId("slMedioAlc"),
						mate = thes.getView().byId("slMaterial");

						fileUploadImagenesGeneral = [];

					if(planta.getSelectedKey() != undefined && planta.getSelectedKey() != "" && planta.getSelectedKey() &&
						fechaA.getSelectedKey() != undefined && fechaA.getSelectedKey() != "" && fechaA.getSelectedKey() &&
						fechaM.getSelectedKey() != undefined && fechaM.getSelectedKey() != "" && fechaM.getSelectedKey() &&
						mate.getSelectedKey() != undefined && mate.getSelectedKey() != "" && mate.getSelectedKey()){

						thes.onGetCabecera(medioAlc.getSelectedKey(), mate.getSelectedKey(), fechaA.getSelectedKey()+fechaM.getSelectedKey());
						// thes.onGetCabecera("0101", "T001");
						thes.onGetValores(plants.PLANTID, medioAlc.getSelectedKey(), mate.getSelectedKey(), fechaA.getSelectedKey()+fechaM.getSelectedKey());

						var datos = [],
							medium = [],
							material = [],
							param = [],
							totalCantidad = 0.000,
							unidad = '',
							totalXMediumFinal = [],
							formula = '',
							resultado = 0.000,
							cabeValores = [],
							cabeMedium = [],
							cabeceraTotal = [],
							cabeceraT = [],
							cabeceraVa = [],
							detailFormula = '',
							tipo = '';

						var Tabla = thes.getView().byId("tblCubicajeMensual");

						Tabla.removeAllItems();

						$.each(cabecera, function(k, i){
							if(cabeMedium.indexOf(i.MEDIUM) == -1){
								cabecera[k].MEDIUM_TEXT = medio.filter(function(item){
									if(i.MEDIUM == item.MEDIUM){
							    		return item.MEDIUM_TEXT;
									}
								});
								cabeValores.push({"COMPONENT": i.COMPONENT, "DETAIL_FORM": i.DETAIL_FORM, "FORMULA": i.FORMULA, "MANDT": i.MANDT, "MATERIAL": i.MATERIAL, "MEDIUM": i.MEDIUM, "MEDIUM_TEXT": i.MEDIUM_TEXT[0].MEDIUM_TEXT, "PARAM": i.PARAM, "PARAM_TEXT": i.PARAM_TEXT, "PARAM_TYPE": i.PARAM_TYPE, "PARAM_VALUE": i.PARAM_VALUE, "PLANTID": i.PLANTID, "PROCESS": i.PROCESS, "STORAGE": i.STORAGE, "TAG_COD": i.TAG_COD, "TEXT_FORM": i.TEXT_FORM, "TYPE": i.TYPE, "TYPE1": i.TYPE1, "TYPE2": i.TYPE2, "TYPE_FORM": i.TYPE_FORM, "UNIQUE_MATERIAL": i.UNIQUE_MATERIAL, "VALOR_TAG_COD": i.VALOR_TAG_COD, "XCOMPONENT": i.XCOMPONENT, "PARAMARRAY": [{"MEDIUM": i.MEDIUM, "PARAM": i.PARAM, "PARAM_TEXT": i.PARAM_TEXT, "PARAM_TYPE": i.PARAM_TYPE, "VALOR_TAG_COD": i.VALOR_TAG_COD, "PARAM_VALUE": i.PARAM_VALUE}]});
								cabeMedium.push(i.MEDIUM);
							}else{
								$.each(cabeValores, function(k2, i2){
									if(i2.MEDIUM == i.MEDIUM){
										cabeValores[k2].PARAMARRAY.push({"MEDIUM": i.MEDIUM, "PARAM": i.PARAM, "PARAM_TEXT": i.PARAM_TEXT, "PARAM_TYPE": i.PARAM_TYPE, "VALOR_TAG_COD": i.VALOR_TAG_COD, "PARAM_VALUE": i.PARAM_VALUE});
									}
								});
							}

							// if(i.PARAM_TYPE == "M" || i.PARAM_TYPE == "A"){
							// 	cabeceraTotal.push(i);
							// }

							if(param.indexOf(i.PARAM_TEXT) == -1){
								cabeceraT.push(i);
								param.push(i.PARAM_TEXT);
							}
						});

						// $.each(cabeceraTotal, function(kt, it){
						// 	if(param.indexOf(it.PARAM_TEXT) == -1){
						// 		cabeceraT.push(it);
						// 		param.push(it.PARAM_TEXT);
						// 	}
						// });

						$.each(cabeValores, function(ck, ci){
							$.each(cabeceraT, function(ctk, cti){
								var veri = false;
								$.each(ci.PARAMARRAY, function(pk, pi){
									if(pi.MEDIUM == ci.MEDIUM){
										// if(pi.PARAM_TYPE == "A" || pi.PARAM_TYPE == "M"){
										// 	veri = false;
											if(pi.PARAM_TEXT == cti.PARAM_TEXT){
												// cabeceraVa.push({"MANDT": ci.MANDT, "PLANTID": ci.PLANTID, "STORAGE": ci.STORAGE, "TYPE": ci.TYPE, "MEDIUM": ci.MEDIUM, "PARAM": pi.PARAM, "PARAM_TEXT": pi.PARAM_TEXT, "FORMULA": ci.FORMULA, "TEXT_FORM": ci.TEXT_FORM, "TYPE_FORM": ci.TYPE_FORM, "DETAIL_FORM": ci.DETAIL_FORM, "UNIQUE_MATERIAL": ci.UNIQUE_MATERIAL, "VALOR_TAG_COD": ci.VALOR_TAG_COD, "PARAM_TYPE": ci.PARAM_TYPE, "ACTIVO": true});
												cabeceraVa.push({"COMPONENT": ci.COMPONENT, "DETAIL_FORM": ci.DETAIL_FORM, "FORMULA": ci.FORMULA, "MANDT": ci.MANDT, "MATERIAL": ci.MATERIAL, "MEDIUM": ci.MEDIUM, "MEDIUM_TEXT": ci.MEDIUM_TEXT, "PARAM": pi.PARAM, "PARAM_TEXT": pi.PARAM_TEXT, "PARAM_TYPE": pi.PARAM_TYPE, "PARAM_VALUE": pi.PARAM_VALUE, "PLANTID": ci.PLANTID, "PROCESS": ci.PROCESS, "STORAGE": ci.STORAGE, "TAG_COD": ci.TAG_COD, "TEXT_FORM": ci.TEXT_FORM, "TYPE": ci.TYPE, "TYPE1": ci.TYPE1, "TYPE2": ci.TYPE2, "TYPE_FORM": ci.TYPE_FORM, "UNIQUE_MATERIAL": ci.UNIQUE_MATERIAL, "VALOR_TAG_COD": ci.VALOR_TAG_COD, "XCOMPONENT": ci.XCOMPONENT, "ACTIVO": true});
												veri = true;
												return false;
											}
										// }
									}
								});
								if(!veri){
									// cabeceraVa.push({"MANDT": ci.MANDT, "PLANTID": ci.PLANTID, "STORAGE": ci.STORAGE, "TYPE": ci.TYPE, "MEDIUM": ci.MEDIUM, "PARAM": cti.PARAM, "PARAM_TEXT": cti.PARAM_TEXT, "FORMULA": ci.FORMULA, "TEXT_FORM": ci.TEXT_FORM, "TYPE_FORM": ci.TYPE_FORM, "DETAIL_FORM": ci.DETAIL_FORM, "UNIQUE_MATERIAL": ci.UNIQUE_MATERIAL, "VALOR_TAG_COD": ci.VALOR_TAG_COD, "PARAM_TYPE": cti.PARAM_TYPE, "ACTIVO": false});
									cabeceraVa.push({"COMPONENT": ci.COMPONENT, "DETAIL_FORM": ci.DETAIL_FORM, "FORMULA": ci.FORMULA, "MANDT": ci.MANDT, "MATERIAL": ci.MATERIAL, "MEDIUM": ci.MEDIUM, "MEDIUM_TEXT": ci.MEDIUM_TEXT, "PARAM": cti.PARAM, "PARAM_TEXT": cti.PARAM_TEXT, "PARAM_TYPE": cti.PARAM_TYPE, "PARAM_VALUE": ci.PARAM_VALUE, "PLANTID": ci.PLANTID, "PROCESS": ci.PROCESS, "STORAGE": ci.STORAGE, "TAG_COD": ci.TAG_COD, "TEXT_FORM": ci.TEXT_FORM, "TYPE": ci.TYPE, "TYPE1": ci.TYPE1, "TYPE2": ci.TYPE2, "TYPE_FORM": ci.TYPE_FORM, "UNIQUE_MATERIAL": ci.UNIQUE_MATERIAL, "VALOR_TAG_COD": ci.VALOR_TAG_COD, "XCOMPONENT": ci.XCOMPONENT, "ACTIVO": false});
								}
							});
						});
						
						$.each(cabeValores, function(cvk, cvv){
							formula = cvv.FORMULA;
							detailFormula = cvv.DETAIL_FORM.toLowerCase();

							if(valores.length > 0){
								var val = 0.000;
								var oTableItems = new sap.m.ColumnListItem({
									type: sap.m.ListType.Navigation,
									cells: [],
									press:function(e){
										var vista = this;
		                                sap.ui.controller("com.cementos.pacasmayo.cpgestionstock.controller.CubicajeMensual")._onRowPress(oTableItems);
		                            }
								});
								oTableItems.addCell(new sap.m.ObjectStatus({icon: "sap-icon://documents", state: "None", width: "10%"}));
								var validarF = true;
								$.each(valores, function(k, i){
									if(i.PARAM == cvv.PARAM && cvv.MEDIUM == i.MEDIUM){
										if(thes.getView().byId("tblCubicajeMensual").getItems().length == 0){
											oTableItems.addCell(new sap.m.DatePicker({value: i.DATE_MED, displayFormat: "dd/MM/yyyy", valueFormat: "yyyyMMdd", editable: true, visible: true, change: function(e){
													thes.onChangeDateHourFijo(e, 1);
												}
											}));
											oTableItems.addCell(new sap.m.TimePicker({value: i.HOUR_MED, displayFormat: "HH:mm", valueFormat: "HHmmss", support2400: true, placeholder: "Ingrese Hora", editable: true, visible: true, change: function(e){
													thes.onChangeDateHourFijo(e, 2);
												}
											}));
											validarF = false;
											return false;
										}else{
											oTableItems.addCell(new sap.m.DatePicker({value: i.DATE_MED, displayFormat: "dd/MM/yyyy", valueFormat: "yyyyMMdd", editable: true, visible: true}));
											oTableItems.addCell(new sap.m.TimePicker({value: i.HOUR_MED, displayFormat: "HH:mm", valueFormat: "HHmmss", support2400: true, placeholder: "Ingrese Hora", editable: true, visible: true}));
											validarF = false;
											return false;
										}
									}
								});
								if(validarF){
									if(thes.getView().byId("tblCubicajeMensual").getItems().length == 0){
										oTableItems.addCell(new sap.m.DatePicker({displayFormat: "dd/MM/yyyy", valueFormat: "yyyyMMdd", editable: true, visible: true, change: function(e){
												thes.onChangeDateHourFijo(e, 1);
											}
										}));
										oTableItems.addCell(new sap.m.TimePicker({displayFormat: "HH:mm", valueFormat: "HHmmss", support2400: true, placeholder: "Ingrese Hora", editable: true, visible: true, change: function(e){
												thes.onChangeDateHourFijo(e, 2);
											}
										}));
									}else{
										oTableItems.addCell(new sap.m.DatePicker({displayFormat: "dd/MM/yyyy", valueFormat: "yyyyMMdd", editable: true, visible: true}));
										oTableItems.addCell(new sap.m.TimePicker({displayFormat: "HH:mm", valueFormat: "HHmmss", support2400: true, placeholder: "Ingrese Hora", editable: true, visible: true}));
									}
								}
								// oTableItems.addCell(new sap.m.DatePicker({displayFormat: "yyyy/MM/dd", valueFormat: "yyyyMMdd", editable: true, visible: true}));
								// oTableItems.addCell(new sap.m.TimePicker({displayFormat: "HH:mm:ss", valueFormat: "HHmmss", support2400: true, placeholder: "Ingrese Hora", editable: true, visible: true}));
								oTableItems.addCell(new sap.m.Text({text: cvv.MEDIUM, width: "0%", maxLines: 1, wrapping: false, textDirection: sap.ui.core.TextDirection.Middle, verticalAlign: sap.ui.core.VerticalAlign.Middle, visible: false}));
								oTableItems.addCell(new sap.m.Text({text: cvv.MEDIUM_TEXT, width: "100%", tooltip: cvv.MEDIUM_TEXT, maxLines: 1, wrapping: false, textDirection: sap.ui.core.TextDirection.Middle, verticalAlign: sap.ui.core.VerticalAlign.Middle, visible: true}));
								$.each(cabeceraVa, function(ck, cv){
									if(cv.MEDIUM == cvv.MEDIUM){
										var validar = true;
										$.each(valores, function(k, i){
											if(i.PARAM == cv.PARAM && cv.MEDIUM == i.MEDIUM){
												validar = false;
												// if(cv.PARAM_TYPE == "A" || cv.PARAM_TYPE == "M"){
													// if(cv.PARAM_TYPE == "A"){
													// 	val = cv.VALOR_TAG_COD;
													// }else{
														val = i.END_VAL;
													// }
													if(cv.PARAM_TYPE == "F"){
														var tamanioTabla = thes.getView().byId("tblCubicajeMensual").getItems().length;
														var tamanioCelda = oTableItems.getCells().length;
													}
													oTableItems.addCell(new sap.m.Input({type: "Number", value: parseFloat(val), editable: cv.ACTIVO, visible: true, name: cv.PARAM + "&&" + val + "&&" + cv.TYPE + "&&" + cv.FORMULA + "&&" + cv.PROCESS + "&&" + i.MEASURE + "&&" + i.ITEM + "&&" + i.RECORD, change: function(e){
										                	var vista = this,
																celdas = oTableItems.getCells(),
																suma = 0,
																totalPC = 0.00,
																total = 0.00,
																formulaDetalle = cv.DETAIL_FORM;

															if(tamanioTabla == 0){
																thes.onChangeDateHourFijo(e, 3, tamanioCelda);
															}

															vista.setValue(vista.getValue().replace(new RegExp("-", "gi"), ""));

															$.each(celdas, function(tk, tv){
																if(tk > 4 && tk < celdas.length-3){
																	if(tv.getEditable()){
																		if(tv.getValue() != ''){
																			tv.setValue(formatter.redondearDec(parseFloat(tv.getValue()), 3));
																			formulaDetalle = formulaDetalle.replace(new RegExp(tv.getName().split("&&")[0].toLowerCase(), "gi"), tv.getValue());
																		}else{
												                			tv.setValue(0);
																			formulaDetalle = formulaDetalle.replace(new RegExp(tv.getName().split("&&")[0].toLowerCase(), "gi"), '0.000');
																		}
																	}
																}
															});

															$.each(cvv.PARAMARRAY, function(cvvpk, cvvpv){
																if(cvvpv.PARAM_TYPE == "F"){
																	formulaDetalle = formulaDetalle.replace(new RegExp(cvvpv.PARAM.toLowerCase(), "gi"), cvvpv.PARAM_VALUE);
																}
															});

															try{
																formulaDetalle = formulaDetalle.toLowerCase();
																formulaDetalle = formulaDetalle.replace(new RegExp("math.pow", "gi"), "Math.pow");
																resultado = eval(formulaDetalle);
															}catch(err) {
												            	MessageBox.error("Error al ejecutar la Formula.");
												                sap.ui.core.BusyIndicator.hide();
												            }

															celdas[celdas.length-3].setValue(formatter.redondearDec(parseFloat(resultado), 3));

															var tabla = thes.getView().byId("tblCubicajeMensual").getItems();
															totalCantidad = 0.000;
															$.each(tabla, function(tk, tv){
																var oCells = tv.mAggregations.cells;
																totalCantidad += parseFloat(oCells[oCells.length-3].getValue());
															});

															thes.getView().byId("total").setHtmlText("<strong>Total: " + formatter.redondearDec(parseFloat(totalCantidad), 3) + " " + unidad + "</strong>");
										            	}
									            	}));
												// }
											}
										});
										// if(cv.PARAM_TYPE != "F"){
											if(validar){
												if(cv.PARAM_TYPE != "F"){
													val = 0.000;
												}else{
													val = cv.PARAM_VALUE;
												}
												if(cv.PARAM_TYPE == "F"){
													var tamanioTabla = thes.getView().byId("tblCubicajeMensual").getItems().length;
													var tamanioCelda = oTableItems.getCells().length;
												}
												oTableItems.addCell(new sap.m.Input({type: "Number", value: parseFloat(val), editable: cv.ACTIVO, visible: true, name: cv.PARAM + "&&" + val + "&&" + cv.TYPE + "&&" + cv.FORMULA + "&&" + cv.PROCESS + "&&" + undefined + "&&" + undefined + "&&" + undefined, change: function(e){
									                	var vista = this,
															celdas = oTableItems.getCells(),
															suma = 0,
															totalPC = 0.00,
															total = 0.00,
															formulaDetalle = cv.DETAIL_FORM;

														if(tamanioTabla == 0){
															thes.onChangeDateHourFijo(e, 3, tamanioCelda);
														}

														vista.setValue(vista.getValue().replace(new RegExp("-", "gi"), ""));

														$.each(celdas, function(tk, tv){
															if(tk > 4 && tk < celdas.length-3){
																if(tv.getEditable()){
																	if(tv.getValue() != ''){
																		tv.setValue(formatter.redondearDec(parseFloat(tv.getValue()), 3));
																		formulaDetalle = formulaDetalle.replace(new RegExp(tv.getName().split("&&")[0].toLowerCase(), "gi"), tv.getValue());
																	}else{
											                			tv.setValue(0);
																		formulaDetalle = formulaDetalle.replace(new RegExp(tv.getName().split("&&")[0].toLowerCase(), "gi"), '0.000');
																	}
																}
															}
														});

														$.each(cvv.PARAMARRAY, function(cvvpk, cvvpv){
															if(cvvpv.PARAM_TYPE == "F"){
																formulaDetalle = formulaDetalle.replace(new RegExp(cvvpv.PARAM.toLowerCase(), "gi"), cvvpv.PARAM_VALUE);
															}
														});

														try{
															formulaDetalle = formulaDetalle.toLowerCase();
															formulaDetalle = formulaDetalle.replace(new RegExp("math.pow", "gi"), "Math.pow");

															if(parseFloat(eval(formulaDetalle)) < 0){
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
																celdas[celdas.length-3].setValue(0);
																// celdas[celdas.length-1].destroyItems();
																// celdas[celdas.length-1].addItem(new HarveyBallMicroChartItem({color: color, fraction: 0, fractionLabel: 0+"%", formattedLabel: false, fractionScale: ""}));
															}else{
																resultado = eval(formulaDetalle);

																celdas[celdas.length-3].setValue(formatter.redondearDec(parseFloat(eval(resultado)), 3));
																// celdas[celdas.length-1].destroyItems();
																// celdas[celdas.length-1].addItem(new HarveyBallMicroChartItem({color: color, fraction: parseInt(tot), fractionLabel: totalPC+"%", formattedLabel: false, fractionScale: ""}));
															}

														}catch(err) {
											            	MessageBox.error("Error al ejecutar la Formula.");
											                sap.ui.core.BusyIndicator.hide();
											            }

														// celdas[celdas.length-3].setValue(formatter.redondearDec(parseFloat(resultado), 3));

														var tabla = thes.getView().byId("tblCubicajeMensual").getItems();
														totalCantidad = 0.000;
														$.each(tabla, function(tk, tv){
															var oCells = tv.mAggregations.cells;
															totalCantidad += parseFloat(oCells[oCells.length-3].getValue());
														});

														thes.getView().byId("total").setHtmlText("<strong>Total: " + formatter.redondearDec(parseFloat(totalCantidad), 3) + " " + unidad + "</strong>");
									            	}
								            	}));
											}
										// }
									}
								});
								var validarO = true;
								$.each(valores, function(k, i){
									if(i.PARAM == cvv.PARAM && cvv.MEDIUM == i.MEDIUM){
										validarO = false;
										oTableItems.addCell(new sap.m.Input({value: i.MEASUREMENT, editable: false, visible: true}));
										oTableItems.addCell(new sap.m.MultiInput({value: i.OBSERVATIONS, placeholder: "Comentario...", editable: true, visible: true, valueHelpRequest: function(){
												var vista = this;
												var dialog = new Dialog({
													title: 'Comentario',
													type: 'Message',
													content: [
														new Label({ text: 'Ingrese su Comentario', labelFor: 'submitDialogTextarea'}),
														new TextArea('submitDialogTextarea', {
															liveChange: function(oEvent) {
																var sText = oEvent.getParameter('value');
																var parent = oEvent.getSource().getParent();

																parent.getBeginButton().setEnabled(sText.length > 0);
															},
															width: '100%',
															placeholder: 'Comentario...',
															rows: 5,
															cols: 20,
															value: vista.getValue()
														})
													],
													beginButton: new Button({
														text: 'Aceptar',
														enabled: false,
														press: function () {
															var sText = sap.ui.getCore().byId('submitDialogTextarea').getValue();
															vista.setValue(sText);
															dialog.close();
														}
													}),
													endButton: new Button({
														text: 'Cancelar',
														press: function () {
															dialog.close();
														}
													}),
													afterClose: function() {
														dialog.destroy();
													}
												});

												dialog.open();
							            	}
						            	}));
						            	oTableItems.addCell(new sap.m.Link({text: "Imagenes", press: function () {
											thes.openDialogImages(cvk);
										}}));
						            	return false;
									}
								});

								if(validarO){
									oTableItems.addCell(new sap.m.Input({value: "0.000", editable: false, visible: true}));
									oTableItems.addCell(new sap.m.MultiInput({value: "", placeholder: "Comentario...", editable: true, visible: true, valueHelpRequest: function(){
											var vista = this;
											var dialog = new Dialog({
												title: 'Comentario',
												type: 'Message',
												content: [
													new Label({ text: 'Ingrese su Comentario', labelFor: 'submitDialogTextarea'}),
													new TextArea('submitDialogTextarea', {
														liveChange: function(oEvent) {
															var sText = oEvent.getParameter('value');
															var parent = oEvent.getSource().getParent();

															parent.getBeginButton().setEnabled(sText.length > 0);
														},
														width: '100%',
														placeholder: 'Comentario...',
														rows: 5,
														cols: 20,
														value: vista.getValue()
													})
												],
												beginButton: new Button({
													text: 'Aceptar',
													enabled: false,
													press: function () {
														var sText = sap.ui.getCore().byId('submitDialogTextarea').getValue();
														vista.setValue(sText);
														dialog.close();
													}
												}),
												endButton: new Button({
													text: 'Cancelar',
													press: function () {
														dialog.close();
													}
												}),
												afterClose: function() {
													dialog.destroy();
												}
											});

											dialog.open();
						            	}
					            	}));
					            	oTableItems.addCell(new sap.m.Link({text: "Imagenes", press: function () {
										thes.openDialogImages(cvk);
									}}));
								}
								
					            Tabla.addItem(oTableItems);
							}else{
								var oTableItems = new sap.m.ColumnListItem({
									type: sap.m.ListType.Navigation,
									cells: [],
									press:function(e){
										var vista = this;
		                                sap.ui.controller("com.cementos.pacasmayo.cpgestionstock.controller.CubicajeMensual")._onRowPress(oTableItems);
		                            }
								});
								oTableItems.addCell(new sap.m.ObjectStatus({icon: "sap-icon://documents", state: "None", width: "10%"}));
								if(thes.getView().byId("tblCubicajeMensual").getItems().length == 0){
									oTableItems.addCell(new sap.m.DatePicker({displayFormat: "dd/MM/yyyy", valueFormat: "yyyyMMdd", editable: true, visible: true, change: function(e){
											thes.onChangeDateHourFijo(e, 1);
										}
									}));
									oTableItems.addCell(new sap.m.TimePicker({displayFormat: "HH:mm", valueFormat: "HHmmss", support2400: true, placeholder: "Ingrese Hora", editable: true, visible: true, change: function(e){
											thes.onChangeDateHourFijo(e, 2);
										}
									}));
								}else{
									oTableItems.addCell(new sap.m.DatePicker({displayFormat: "dd/MM/yyyy", valueFormat: "yyyyMMdd", editable: true, visible: true}));
									oTableItems.addCell(new sap.m.TimePicker({displayFormat: "HH:mm", valueFormat: "HHmmss", support2400: true, placeholder: "Ingrese Hora", editable: true, visible: true}));
								}
								oTableItems.addCell(new sap.m.Text({text: cvv.MEDIUM, width: "0%", maxLines: 1, wrapping: false, textDirection: sap.ui.core.TextDirection.Middle, verticalAlign: sap.ui.core.VerticalAlign.Middle, visible: false}));
								oTableItems.addCell(new sap.m.Text({text: cvv.MEDIUM_TEXT, width: "100%", tooltip: cvv.MEDIUM_TEXT, maxLines: 1, wrapping: false, textDirection: sap.ui.core.TextDirection.Middle, verticalAlign: sap.ui.core.VerticalAlign.Middle, visible: true}));
								$.each(cabeceraVa, function(ck, cv){
									if(cv.MEDIUM == cvv.MEDIUM){
										if(cv.PARAM_TYPE == "F"){
											var val = cv.PARAM_VALUE;
										}else if(cv.PARAM_TYPE == "A"){
											var val = cv.VALOR_TAG_COD;
										}else{
											var val = 0;
										}
										// if(cv.PARAM_TYPE == "A" || cv.PARAM_TYPE == "M"){
											if(cv.PARAM_TYPE == "F"){
												var tamanioTabla = thes.getView().byId("tblCubicajeMensual").getItems().length;
												var tamanioCelda = oTableItems.getCells().length;
											}
											oTableItems.addCell(new sap.m.Input({type: "Number", value: parseFloat(val), editable: cv.ACTIVO, visible: true, name: cv.PARAM + "&&" + val + "&&" + cv.TYPE + "&&" + cv.FORMULA + "&&" + cv.PROCESS + "&&" + undefined + "&&" + undefined + "&&" + undefined, change: function(e){
								                	var vista = this,
														celdas = oTableItems.getCells(),
														suma = 0,
														totalPC = 0.00,
														total = 0.00,
														formulaDetalle = cv.DETAIL_FORM;

													if(tamanioTabla == 0){
														thes.onChangeDateHourFijo(e, 3, tamanioCelda);
													}

													vista.setValue(vista.getValue().replace(new RegExp("-", "gi"), ""));

													$.each(celdas, function(tk, tv){
														if(tk > 4 && tk < celdas.length-3){
															if(tv.getEditable()){
																if(tv.getValue() != ''){
																	tv.setValue(formatter.redondearDec(parseFloat(tv.getValue()), 3));
																	formulaDetalle = formulaDetalle.replace(new RegExp(tv.getName().split("&&")[0].toLowerCase(), "gi"), tv.getValue());
																}else{
										                			tv.setValue(0);
																	formulaDetalle = formulaDetalle.replace(new RegExp(tv.getName().split("&&")[0].toLowerCase(), "gi"), '0.000');
																}
															}
														}
													});

													$.each(cvv.PARAMARRAY, function(cvvpk, cvvpv){
														// if(cvvpv.PARAM_TYPE == "F"){
															formulaDetalle = formulaDetalle.replace(new RegExp(cvvpv.PARAM.toLowerCase(), "gi"), cvvpv.PARAM_VALUE);
														// }
													});

													try{
														formulaDetalle = formulaDetalle.toLowerCase();
														formulaDetalle = formulaDetalle.replace(new RegExp("math.pow", "gi"), "Math.pow");

														if(parseFloat(eval(formulaDetalle)) < 0){
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
															celdas[celdas.length-3].setValue(0);
															// celdas[celdas.length-1].destroyItems();
															// celdas[celdas.length-1].addItem(new HarveyBallMicroChartItem({color: color, fraction: 0, fractionLabel: 0+"%", formattedLabel: false, fractionScale: ""}));
														}else{
															resultado = eval(formulaDetalle);

															celdas[celdas.length-3].setValue(formatter.redondearDec(parseFloat(eval(resultado)), 3));
															// celdas[celdas.length-1].destroyItems();
															// celdas[celdas.length-1].addItem(new HarveyBallMicroChartItem({color: color, fraction: parseInt(tot), fractionLabel: totalPC+"%", formattedLabel: false, fractionScale: ""}));
														}
													}catch(err) {
										            	MessageBox.error("Error al ejecutar la Formula.");
										                sap.ui.core.BusyIndicator.hide();
										            }

													// celdas[celdas.length-3].setValue(formatter.redondearDec(parseFloat(resultado), 3));

													var tabla = thes.getView().byId("tblCubicajeMensual").getItems();
													totalCantidad = 0.000;
													$.each(tabla, function(tk, tv){
														var oCells = tv.mAggregations.cells;
														totalCantidad += parseFloat(oCells[oCells.length-3].getValue());
													});

													thes.getView().byId("total").setHtmlText("<strong>Total: " + formatter.redondearDec(parseFloat(totalCantidad), 3) + " " + unidad + "</strong>");
								            	}
							            	}));
										// }
									}
								});
								oTableItems.addCell(new sap.m.Input({value: "0.000", editable: false, visible: true}));
								oTableItems.addCell(new sap.m.MultiInput({placeholder: "Comentario...", editable: true, visible: true, valueHelpRequest: function(){
										var vista = this;
										var dialog = new Dialog({
											title: 'Comentario',
											type: 'Message',
											content: [
												new Label({ text: 'Ingrese su Comentario', labelFor: 'submitDialogTextarea'}),
												new TextArea('submitDialogTextarea', {
													liveChange: function(oEvent) {
														var sText = oEvent.getParameter('value');
														var parent = oEvent.getSource().getParent();

														parent.getBeginButton().setEnabled(sText.length > 0);
													},
													width: '100%',
													placeholder: 'Comentario...',
													rows: 5,
													cols: 20,
													value: vista.getValue()
												})
											],
											beginButton: new Button({
												text: 'Aceptar',
												enabled: false,
												press: function () {
													var sText = sap.ui.getCore().byId('submitDialogTextarea').getValue();
													vista.setValue(sText);
													dialog.close();
												}
											}),
											endButton: new Button({
												text: 'Cancelar',
												press: function () {
													dialog.close();
												}
											}),
											afterClose: function() {
												dialog.destroy();
											}
										});

										dialog.open();
					            	}
				            	}));
				            	oTableItems.addCell(new sap.m.Link({text: "Imagenes", press: function () {
									thes.openDialogImages(cvk);
								}}));
					            Tabla.addItem(oTableItems);
							}

					        Tabla.destroyColumns();

							Tabla.addColumn(new sap.m.Column({ header: new sap.m.Text({text: "", width: "100%", maxLines: 3, wrapping: true, textAlign: "Center", textDirection: "Inherit", visible: true}), width: "3%", hAlign:"Left", vAlign: "Top", minScreenWidth: "Tablet", demandPopin: true, popinDisplay: "Inline", mergeDuplicates: false }));
							Tabla.addColumn(new sap.m.Column({ header: new sap.m.Text({text: "Fecha", width: "100%", maxLines: 3, wrapping: true, textAlign: "Center", textDirection: "Inherit", visible: true}), width:"18%", hAlign:"Center", vAlign:"Middle", minScreenWidth: "Phone", demandPopin: true, popinDisplay: "Inline", mergeDuplicates: false }));
							Tabla.addColumn(new sap.m.Column({ header: new sap.m.Text({text: "Hora", width: "100%", maxLines: 3, wrapping: true, textAlign: "Center", textDirection: "Inherit", visible: true}), width:"15%", hAlign:"Center", vAlign:"Middle", minScreenWidth: "Phone", demandPopin: true, popinDisplay: "Inline", mergeDuplicates: false }));
							Tabla.addColumn(new sap.m.Column({ header: new sap.m.Text({text: "Medio", width: "0%", maxLines: 3, wrapping: true, textAlign: "Center", textDirection: "Inherit", visible: false}), width:"0%", hAlign:"Left", vAlign:"Middle", minScreenWidth: "Phone", demandPopin: true, popinDisplay: "Inline", mergeDuplicates: false }));
							Tabla.addColumn(new sap.m.Column({ header: new sap.m.Text({text: "Med.Alm.", width: "100%", maxLines: 3, wrapping: true, textAlign: "Center", textDirection: "Inherit", visible: true}), width:"10%", hAlign:"Left", vAlign:"Middle", minScreenWidth: "Phone", demandPopin: true, popinDisplay: "Inline", mergeDuplicates: false }));
							$.each(cabeceraT, function(k, i){
								// if(i.PARAM_TYPE == "A" || i.PARAM_TYPE == "M"){
									Tabla.addColumn(new sap.m.Column({ header: new sap.m.Text({text: i.PARAM_TEXT, width: "100%", maxLines: 3, wrapping: true, tooltip: i.PARAM_TEXT, textAlign: "Center", textDirection: "Inherit", visible: true}), width: "13%", hAlign: "Center", vAlign: "Middle", minScreenWidth: "Tablet", demandPopin: true, popinDisplay: "Inline", mergeDuplicates: false }));
								// }
							});
							Tabla.addColumn(new sap.m.Column({ header: new sap.m.Text({text: "Cant. Total", width: "100%", maxLines: 3, tooltip: "Cantidad Total Tn", wrapping: true, textAlign: "Center", textDirection: "Inherit", visible: true}), width: "15%", hAlign: "Center", vAlign: "Middle", minScreenWidth: "Tablet", demandPopin: true, popinDisplay: "Inline", mergeDuplicates: false}));
							Tabla.addColumn(new sap.m.Column({ header: new sap.m.Text({text: "Observacion", width: "100%", maxLines: 3, wrapping: true, textAlign: "Center", textDirection: "Inherit", visible: true}), width:"48%", hAlign:"Center", vAlign:"Middle", minScreenWidth: "Phone", demandPopin: true, popinDisplay: "Inline", mergeDuplicates: false }));
							Tabla.addColumn(new sap.m.Column({ header: new sap.m.Text({text: "Imagenes", width: "100%", maxLines: 3, wrapping: true, textAlign: "Center", textDirection: "Inherit", visible: true}), width:"20%", hAlign:"Center", vAlign:"Middle", minScreenWidth: "Phone", demandPopin: true, popinDisplay: "Inline", mergeDuplicates: false }));

							var tabla = thes.getView().byId("tblCubicajeMensual").getItems();
							totalCantidad = 0.000;
							$.each(tabla, function(tk, tv){
								var oCells = tv.mAggregations.cells;
								totalCantidad += parseFloat(oCells[oCells.length-3].getValue());
							});
							thes.getView().byId("total").setHtmlText("<strong>Total: " + formatter.redondearDec(parseFloat(totalCantidad), 3)  + " " + unidad + "</strong>");

							setTimeout(function(){thes.onChangeNumber();}, 1000);

							sap.ui.core.BusyIndicator.hide();
						});

						thes.onGetImages(plants.PLANTID, medioAlc.getSelectedKey(), mate.getSelectedKey(), fechaA.getSelectedKey(), fechaM.getSelectedKey());
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

		                if(mate.getSelectedKey() == undefined || mate.getSelectedKey() == "" || !mate.getSelectedKey()){
		                	mate.setValueState("Error");
		                	mate.setValueStateText("Debe ingresar datos correctos.");
		                }

		                if(fechaA.getSelectedKey() == undefined || fechaA.getSelectedKey() == "" || !fechaA.getSelectedKey()){
		                	fechaA.setValueState("Error");
		                	fechaA.setValueStateText("Debe ingresar datos correctos.");
		                }

		                if(fechaM.getSelectedKey() == undefined || fechaM.getSelectedKey() == "" || !fechaM.getSelectedKey()){
		                	fechaM.setValueState("Error");
		                	fechaM.setValueStateText("Debe ingresar datos correctos.");
		                }
					}
				}, 1000);
			}catch(err) {
                MessageBox.error(err.message);
                sap.ui.core.BusyIndicator.hide();
            }
		},
		onSave: function(){
			try{
				sap.ui.core.BusyIndicator.show(0);
				var planta = this.getView().byId("cblCentro"),
					fechaA = this.getView().byId("cblAnio"),
					fechaM = this.getView().byId("cblMes"),
					medioAlm = this.getView().byId("slMedioAlc"),
					materialSelec = this.getView().byId("slMaterial"),
					fechaActual = new Date();

				if(planta.getSelectedKey() != undefined && planta.getSelectedKey() != "" && planta.getSelectedKey() &&
					fechaA.getSelectedKey() != undefined && fechaA.getSelectedKey() != "" && fechaA.getSelectedKey() &&
					fechaM.getSelectedKey() != undefined && fechaM.getSelectedKey() != "" && fechaM.getSelectedKey() &&
					materialSelec.getSelectedKey() != undefined && materialSelec.getSelectedKey() != "" && materialSelec.getSelectedKey()){

					var tabla = thes.getView().byId("tblCubicajeMensual").getItems();
					arrayItem = [];
					if(tabla.length > 0){
						var mensaje = "";
						$.each(valores, function(k, v){
							if(arrayItem.indexOf(v.ITEM) == -1){
								arrayItem.push(v.ITEM);
							}
						});
						//Obtener datos del Combo de Proceso
						var cubicajeMensual = [],
							validarVolDen = true,
							vol = 0,
							den = 0;

						$.each(tabla, function(key, item){
							var oCells = item.mAggregations.cells,
			                	celdasT = oCells.length,
			                	contador = true,
			                	it = '';
							$.each(oCells, function(ock, ocv){
		    					if(ock > 4 && ock < (celdasT-3)){
			    					$.each(cabecera, function(cabek, cabev){
			    						if(ocv.getName().split('&&')[0] == cabev.PARAM){
			    							if(cabev.PARAM_TEXT == "VOLUMEN"){
			    								vol = parseFloat(ocv.getValue());
			    							}

			    							if(cabev.PARAM_TEXT == "DENSIDAD"){
			    								den = parseFloat(ocv.getValue());
			    							}
			    						}
			    					});
			    				}
		    				});
		    				if(vol > 0 && den <= 0){
		    					validarVolDen = false;
		    					return false;
		    				}
		    			});

		    			if(!validarVolDen){
	    					sap.ui.core.BusyIndicator.hide();
							var Dialogo = new sap.m.Dialog({title: "Mensajes"});
			                var messageStrip = new sap.m.MessageStrip({text: "Debe ingresar la densidad.", type: "Error", showIcon: true});
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
				    	}else{
							$.each(tabla, function(key, item){
				                var oCells = item.mAggregations.cells,
				                	celdasT = oCells.length,
				                	contador = true,
				                	it = '',
				                	vol = 0,
									den = 0;
				    			
				    			// if(parseFloat(oCells[celdasT-3].getValue()) > 0){
				    				

				    				
					                $.each(oCells, function(key3, item3){
					    				if(key3 > 4 && key3 < (celdasT-3)){
					    					if(oCells[1].getValue() != "" && oCells[2].getValue() != ""){

					    						if(contador){
						    						it = item3.getName().split('&&')[6]=="undefined"?"":item3.getName().split('&&')[6];
						    						if(it == ""){
						    							if(arrayItem.length > 0){
						    								it = Math.max.apply(null, arrayItem);
						    								it++;
						    							}else{
						    								it = 1;
						    							}

														if(it == ""){
															it = 1;
														}
														arrayItem.push(it);
						    						}
						    						contador = false;
						    					}

						    					var detalleFormula = "";

						    					$.each(cabecera, function(kc, vc){
					    							if(item3.getName().split('&&')[3] == vc.FORMULA){
														detalleFormula = vc.DETAIL_FORM;
					    							}
					    						});

					    						var archi1 = "",
					    							archi2 = "",
					    							archi3 = "",
					    							archi4 = "";

					    						if(fileUploadImagenesGeneral[key] != undefined){
													archi1 = fileUploadImagenesGeneral[key][0]==undefined?"":JSON.stringify({"PLANTID": plants.PLANTID, "MEDIUM": oCells[3].getText(), "YEAR_CON": fechaA.getSelectedKey(), "MONTH_CON": fechaM.getSelectedKey(), "MATERIAL": materialSelec.getSelectedKey(), "NAME1": fileUploadImagenesGeneral[key][0].name, "TYPE1": fileUploadImagenesGeneral[key][0].type, "IMAGE1": fileUploadImagenesGeneral[key][0].image}),
								                    archi2 = fileUploadImagenesGeneral[key][1]==undefined?"":JSON.stringify({"PLANTID": plants.PLANTID, "MEDIUM": oCells[3].getText(), "YEAR_CON": fechaA.getSelectedKey(), "MONTH_CON": fechaM.getSelectedKey(), "MATERIAL": materialSelec.getSelectedKey(), "NAME2": fileUploadImagenesGeneral[key][1].name, "TYPE2": fileUploadImagenesGeneral[key][1].type, "IMAGE2": fileUploadImagenesGeneral[key][1].image}),
								                    archi3 = fileUploadImagenesGeneral[key][2]==undefined?"":JSON.stringify({"PLANTID": plants.PLANTID, "MEDIUM": oCells[3].getText(), "YEAR_CON": fechaA.getSelectedKey(), "MONTH_CON": fechaM.getSelectedKey(), "MATERIAL": materialSelec.getSelectedKey(), "NAME3": fileUploadImagenesGeneral[key][2].name, "TYPE3": fileUploadImagenesGeneral[key][2].type, "IMAGE3": fileUploadImagenesGeneral[key][2].image}),
								                    archi4 = fileUploadImagenesGeneral[key][3]==undefined?"":JSON.stringify({"PLANTID": plants.PLANTID, "MEDIUM": oCells[3].getText(), "YEAR_CON": fechaA.getSelectedKey(), "MONTH_CON": fechaM.getSelectedKey(), "MATERIAL": materialSelec.getSelectedKey(), "NAME4": fileUploadImagenesGeneral[key][3].name, "TYPE4": fileUploadImagenesGeneral[key][3].type, "IMAGE4": fileUploadImagenesGeneral[key][3].image})
					    						}

									            var elemento = {
						    						'MATERIAL': materialSelec.getSelectedKey(),
							                    	'MEDIUM': oCells[3].getText(),
								                    'PARAM': item3.getName().split('&&')[0],
								                    'INI_VAL': item3.getName().split('&&')[1],
								                    'END_VAL': item3.getValue(),
								                    'MEASUREMENT': oCells[celdasT-3].getValue(),
								                    'PLANTID': plants.PLANTID,
								                    'TURN': '',
								                    'MEDIUM_TYPE': item3.getName().split('&&')[2],
								                    'TYPE_MEASU': 'M',
								                    'PROCESS': item3.getName().split('&&')[4],
								                    'DATE_MED': oCells[1].getValue(),
								                    'HOUR_MED': oCells[2].getValue(),
								                    'YEAR_CON': fechaA.getSelectedKey(),
								                    'MONTH_CON': fechaM.getSelectedKey(),
								                    'FORMULA': item3.getName().split('&&')[3],
								                    'FORMU_DET': detalleFormula,
								                    'OBSERVATIONS': oCells[celdasT-2].getValue(),
								                    'MEASURE': item3.getName().split('&&')[5]=="undefined"?"":item3.getName().split('&&')[5],
								                    'ITEM': it.toString(),
								                    'RECORD': item3.getName().split('&&')[7]=="undefined"?"":item3.getName().split('&&')[7],
													'IMAGE1': archi1,
													'IMAGE2': archi2,
													'IMAGE3': archi3,
													'IMAGE4': archi4
								                };

								                cubicajeMensual.push(elemento);
					    					}else{
					    						mensaje = "Debe llenar la fecha y la hora para poder grabar.";
						    					return false;
					    					}
					    				}
					    			});
					      //       }else{
		    					// 	mensaje = "El monto total no puede ser 0.";
						    	// 	return false;
		    					// }
				            });
				            if(cubicajeMensual.length > 0 && validarVolDen){
				            	$.ajax({
									url: urlGlobal + '/MEASUCS',
									type: 'POST',
									contentType: "application/json",
									dataType: 'json',
									data: JSON.stringify({"LINE": JSON.stringify(cubicajeMensual)}),
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
				                var messageStrip = new sap.m.MessageStrip({text: mensaje, type: "Error", showIcon: true});
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
		onClean: function(){
			var tabla = thes.getView().byId("tblCubicajeMensual");
			tabla.destroyItems();

			thes.getView().byId("total").setHtmlText("<strong>Total: 0.000 </strong>");
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

			thes.onClean();
		},
		onChangeNumber: function(){
			$(':input[type=number]').on('mousewheel',function(e){ e.preventDefault(); });
		},
		onChangeDateHourFijo: function(e, flag, celda){
			var tabla = thes.getView().byId("tblCubicajeMensual").getItems();
			$.each(tabla, function(tk, tv){
				var oCells = tv.mAggregations.cells;
				if(flag == 1){
					oCells[1].setValue(e.getSource().getValue());
				}else if(flag == 2){
					oCells[2].setValue(e.getSource().getValue());
				}else if(flag == 3){
					if(tk != 0){
						oCells[celda].setValue(e.getSource().getValue());
						oCells[celda].fireChange();
					}
				}
			});
		},
		onChangeImages : function(oEvent) {
			var parametros = parseInt(oEvent.getSource().data("data"));
			if(oEvent.getParameter("files") != undefined && oEvent.getParameter("files")[0] != undefined){
				thes.convertFiletoBase64(oEvent.getParameter("files") && oEvent.getParameter("files")[0], parametros);
			}else{
				fileUploadImagenes.splice(parametros, 1);
			}
        },
        openDialogImages: function(oEvent){
        	if(!thes._oDialog){
	        	thes._oDialog = sap.ui.xmlfragment("com.cementos.pacasmayo.cpgestionstock.fragment.Imagenes", thes);
	        	thes.getView().addDependent(thes._oDialog);
        	}
        	idUploadImagenes = oEvent;
        	thes._oDialog.open();
        	fileUploadImagenes = [];
        	sap.ui.getCore().byId("link0").setText("");
        	sap.ui.getCore().byId("link1").setText("");
        	sap.ui.getCore().byId("link2").setText("");
        	sap.ui.getCore().byId("link3").setText("");

        	sap.ui.getCore().byId("fileUpload1").setValue("");
        	sap.ui.getCore().byId("fileUpload2").setValue("");
        	sap.ui.getCore().byId("fileUpload3").setValue("");
        	sap.ui.getCore().byId("fileUpload4").setValue("");

        	$.each(fileUploadImagenesGeneral[oEvent], function(k, v){
        		if(v != undefined){
        			sap.ui.getCore().byId("link"+k).setText(k+1 + " - " + v.name);
        		}
        	});
        },
        removeFile: function(oEvent){
        	var parametros = oEvent.getSource().data("data");
        	fileUploadImagenes.splice(parametros, 1);
        	fileUploadImagenesGeneral[idUploadImagenes].splice(parametros, 1);
        	sap.ui.getCore().byId("fileUpload"+(parseInt(parametros)+1)).setValue("");
        	sap.ui.getCore().byId("link"+parseInt(parametros)).setText("");
        },
        closeImagenes: function(){
        	thes._oDialog.close();
        	if(fileUploadImagenes.length > 0){
        		if(fileUploadImagenes[0] != undefined){
        			fileUploadImagenesGeneral[idUploadImagenes][0] = fileUploadImagenes[0];
        		}
        		if(fileUploadImagenes[1] != undefined){
        			fileUploadImagenesGeneral[idUploadImagenes][1] = fileUploadImagenes[1];
        		}
        		if(fileUploadImagenes[2] != undefined){
        			fileUploadImagenesGeneral[idUploadImagenes][2] = fileUploadImagenes[2];
        		}
        		if(fileUploadImagenes[3] != undefined){
        			fileUploadImagenesGeneral[idUploadImagenes][3] = fileUploadImagenes[3];
        		}
        	}
        },
        //Descargar archivo Imagen
        descargarImagen: function(evt){
            sap.ui.core.BusyIndicator.show(0); // mostrando la barra de Busy
            var posicion = parseInt(evt.getSource().getText().split(" - "))-1;
            
            thes.download(fileUploadImagenesGeneral[idUploadImagenes][posicion].image, fileUploadImagenesGeneral[idUploadImagenes][posicion].name, fileUploadImagenesGeneral[idUploadImagenes][posicion].type);
            sap.ui.core.BusyIndicator.hide();
        },
  //       hexToBase64: function(hexstring) {
		//     return btoa(hexstring.match(/\w{2}/g).map(function(a) {
		//         return String.fromCharCode(parseInt(a, 16));
		//     }).join(""));
		// },
		download: function(base64, codigo,type) {
            var element = document.createElement('a');
            var typefinal = type.split("/")[1];

            if(typefinal == undefined){
            	typefinal = type;
            }

			// var url = `data:${mediatype};base64,${hex}`;
			var blob = thes.b64toBlob(base64, type, 512);
			var blobUrl = URL.createObjectURL(blob);
			element.href = blobUrl;
			// element.href = url;
			element.download = codigo + "." + typefinal;
			// document.body.append(element);
			element.click();
			element.remove();

            // element.setAttribute('href', 'data:' + type +';base64,' + base64);
            // element.setAttribute('download', codigo);

            // element.style.display = 'none';
            // document.body.appendChild(element);

            // element.click();

            // document.body.removeChild(element);
        },
        convertFiletoBase64: function(file, parametros){
            sap.ui.core.BusyIndicator.show(0);
            var reader = new FileReader();
            if(file && window.FileReader){
                var data;
                var roa;
                reader.onload = function(e) {
                    var result = {};
                    data = e.target.result;
                }
                reader.readAsBinaryString(file);
                setTimeout(function(){
                    console.log(reader);
					var elemento = {"name": file.name.split(".")[0], "type": file.type, "image": window.btoa(reader.result)};
                    fileUploadImagenes[parametros] = elemento;
                    sap.ui.core.BusyIndicator.hide();
                }, 5000);

            }else{
                sap.ui.core.BusyIndicator.hide();
            }
        },
        b64toBlob: function (b64Data, contentType, sliceSize) {
			contentType = contentType || '';
			sliceSize = sliceSize || 512;

			var byteCharacters = atob(b64Data);
			var byteArrays = [];

			for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
				var slice = byteCharacters.slice(offset, offset + sliceSize);

				var byteNumbers = new Array(slice.length);
				for (var i = 0; i < slice.length; i++) {
					byteNumbers[i] = slice.charCodeAt(i);
				}

				var byteArray = new Uint8Array(byteNumbers);

				byteArrays.push(byteArray);
			}

			var blob = new Blob(byteArrays, {
				type: contentType
			});
			return blob;
		},
        //Obtener los valores guardados de los parametros.
		onGetImages: function(planta, medioAlc, material, fechaA, fechaM){
			try{
				sap.ui.core.BusyIndicator.show(0);
				//Obtener datos de las imagenes
				if(medioAlc != ""){
					$.ajax({
						url: urlGlobal + '/IMAGESS',
						type: 'GET',
						data : {
							"$format" : "json",
							"$count": true,
							"$filter" : "PLANTID eq '" + planta + "'" +
										" and MEDIUM eq '" + medioAlc + "'" +
										" and MATERIAL eq '" + material + "'" +
										" and YEAR_CON eq '" + fechaA + "'" +
										" and MONTH_CON eq '" + fechaM + "'"
						},
						async: false,
						success: function(data, textStatus, request) {
							imagenesGet = data.value;
							var tabla = thes.getView().byId("tblCubicajeMensual").getItems();
							$.each(tabla, function(kt, vt){
								var celda = vt.getCells();
								$.each(imagenesGet, function(ki, vi){
									if(celda[3].getText() == vi.MEDIUM){
										if(vi.IMAGE1 != ""){
											fileUploadImagenes[0] = {"name": vi.NAME1, "type": vi.TYPE1, "image": vi.IMAGE1};
										}
										if(vi.IMAGE2 != ""){
											fileUploadImagenes[1] = {"name": vi.NAME2, "type": vi.TYPE2, "image": vi.IMAGE2};
										}
										if(vi.IMAGE3 != ""){
											fileUploadImagenes[2] = {"name": vi.NAME3, "type": vi.TYPE3, "image": vi.IMAGE3};
										}
										if(vi.IMAGE4 != ""){
											fileUploadImagenes[3] = {"name": vi.NAME4, "type": vi.TYPE4, "image": vi.IMAGE4};
										}
										fileUploadImagenesGeneral[kt] = fileUploadImagenes;
										fileUploadImagenes = [];
									}
								});
							});
							sap.ui.core.BusyIndicator.hide();
						},
						error: function(jqXHR,textStatus,errorThrown) {
							sap.ui.core.BusyIndicator.hide();
							MessageBox.error(jqXHR.statusText);
						}
					});
				}else{
					$.ajax({
						url: urlGlobal + '/IMAGESS',
						type: 'GET',
						data : {
							"$format" : "json",
							"$count": true,
							"$filter" : "PLANTID eq '" + planta + "'" +
										" and MATERIAL eq '" + material + "'" +
										" and YEAR_CON eq '" + fechaA + "'" +
										" and MONTH_CON eq '" + fechaM + "'"
						},
						async: false,
						success: function(data, textStatus, request) {
							imagenesGet = data.value;

							var tabla = thes.getView().byId("tblCubicajeMensual").getItems();
							$.each(tabla, function(kt, vt){
								var celda = vt.getCells();
								$.each(imagenesGet, function(ki, vi){
									if(celda[3].getText() == vi.MEDIUM){
										if(vi.IMAGE1 != ""){
											fileUploadImagenes[0] = {"name": vi.NAME1, "type": vi.TYPE1, "image": vi.IMAGE1};
										}
										if(vi.IMAGE2 != ""){
											fileUploadImagenes[1] = {"name": vi.NAME2, "type": vi.TYPE2, "image": vi.IMAGE2};
										}
										if(vi.IMAGE3 != ""){
											fileUploadImagenes[2] = {"name": vi.NAME3, "type": vi.TYPE3, "image": vi.IMAGE3};
										}
										if(vi.IMAGE4 != ""){
											fileUploadImagenes[3] = {"name": vi.NAME4, "type": vi.TYPE4, "image": vi.IMAGE4};
										}
										fileUploadImagenesGeneral[kt] = fileUploadImagenes;
										fileUploadImagenes = [];
									}
								});
							});
							sap.ui.core.BusyIndicator.hide();
						},
						error: function(jqXHR,textStatus,errorThrown) {
							sap.ui.core.BusyIndicator.hide();
							MessageBox.error(jqXHR.statusText);
						}
					});
				}
			}catch(err) {
                MessageBox.error(err.message);
                sap.ui.core.BusyIndicator.hide();
            }
		}
	});
}, /* bExport= */ true);