sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"sap/chart/Chart",
	"sap/chart/data/Dimension",
	"sap/chart/data/Measure"
], function(BaseController, MessageBox, Utilities, History, JSONModel, Chart, Dimension, Measure) {
	"use strict";
	//var urlGlobal = 'https://cpcslfioridev.cpsaa.com.pe:44350/sap/opu/odata4/sap/zgfd0001/default/sap/ZS_FD_MNCP/0001',
	//var urlGlobal = '/sap/opu/odata4/sap/zgfd0001/default/sap/zs_fd_mncp/0001',
    var urlGlobal = './ERP/sap/opu/odata/sap/zgfd0001/default/sap/zs_fd_mncp/0001',
		thes,
		centro = [],
		producto = [],
		material = [],
		medio = [],
		turn = [],
		plants = "",
		csrf_token;
	return BaseController.extend("com.cementos.pacasmayo.cpgestionstock.controller.ReporteEvolucionStock", {
		handleRouteMatched: function(oEvent) {
			var sAppId = "App5cf684747920850113de51ad";

			var oParams = {};

			if (oEvent.mParameters.data.context) {
				this.sContext = oEvent.mParameters.data.context;
				//thes.onGetAuth();

			} else {
				if (this.getOwnerComponent().getComponentData()) {
					var patternConvert = function(oParam) {
						if (Object.keys(oParam).length !== 0) {
							for (var prop in oParam) {
								if (prop !== "sourcePrototype" && prop.includes("Set")) {
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
		applyFiltersAndSorters: function(sControlId, sAggregationName, chartBindingInfo) {
			if (chartBindingInfo) {
				var oBindingInfo = chartBindingInfo;
			} else {
				var oBindingInfo = this.getView().byId(sControlId).getBindingInfo(sAggregationName);
			}
			var oBindingOptions = this.updateBindingOptions(sControlId);
			this.getView().byId(sControlId).bindAggregation(sAggregationName, {
				model: oBindingInfo.model,
				path: oBindingInfo.path,
				parameters: oBindingInfo.parameters,
				template: oBindingInfo.template,
				templateShareable: true,
				sorter: oBindingOptions.sorters,
				filters: oBindingOptions.filters
			});

		},
		updateBindingOptions: function(sCollectionId, oBindingData, sSourceId) {
			this.mBindingOptions = this.mBindingOptions || {};
			this.mBindingOptions[sCollectionId] = this.mBindingOptions[sCollectionId] || {};

			var aSorters = this.mBindingOptions[sCollectionId].sorters;
			var aGroupby = this.mBindingOptions[sCollectionId].groupby;

			// If there is no oBindingData parameter, we just need the processed filters and sorters from this function
			if (oBindingData) {
				if (oBindingData.sorters) {
					aSorters = oBindingData.sorters;
				}
				if (oBindingData.groupby || oBindingData.groupby === null) {
					aGroupby = oBindingData.groupby;
				}
				// 1) Update the filters map for the given collection and source
				this.mBindingOptions[sCollectionId].sorters = aSorters;
				this.mBindingOptions[sCollectionId].groupby = aGroupby;
				this.mBindingOptions[sCollectionId].filters = this.mBindingOptions[sCollectionId].filters || {};
				this.mBindingOptions[sCollectionId].filters[sSourceId] = oBindingData.filters || [];
			}

			// 2) Reapply all the filters and sorters
			var aFilters = [];
			for (var key in this.mBindingOptions[sCollectionId].filters) {
				aFilters = aFilters.concat(this.mBindingOptions[sCollectionId].filters[key]);
			}

			// Add the groupby first in the sorters array
			if (aGroupby) {
				aSorters = aSorters ? aGroupby.concat(aSorters) : aGroupby;
			}

			var aFinalFilters = aFilters.length > 0 ? [new sap.ui.model.Filter(aFilters, true)] : undefined;
			return {
				filters: aFinalFilters,
				sorters: aSorters
			};

		},
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("ReporteEvolucionStock").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			thes = this;

			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("ReporteEvolucionStock").attachMatched(function(oEvent) {
				thes.getView().byId('idDpDateBegin').setValue("");
				thes.getView().byId('idDpDateEnd').setValue("");
				thes.getView().byId('slProceso').setSelectedKey("");
				thes.getView().byId('slMaterial').setSelectedKey("");
				thes.getView().byId('slMedioAlc').setSelectedKeys([]);

				var model = new JSONModel({
                	"procesoitems": []
                });

                model.setSizeLimit(999999999);
            	thes.getView().byId('slProceso').setModel(model, "proceso");

				var model = new JSONModel({
	            	"slMaterialitems": []
	            });

	            model.setSizeLimit(999999999);
	        	thes.getView().byId('slMaterial').setModel(model, "slMaterial");

				var model = new JSONModel({
                	"slMedioAlcitems": []
                });

                model.setSizeLimit(999999999);
            	thes.getView().byId('slMedioAlc').setModel(model, "slMedioAlc");
				thes.onGetPlanta();
				thes.onGetTurno();
				thes.onCleanGraf();
			});
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
		aonAfterRendering: function() {

			var oChart,
				self = this,
				oBindingParameters = this.oBindingParameters,
				oView = this.getView();

			oChart = oView.byId("idChart");
			oChart.bindData(oBindingParameters['idChart']);

			// oChart = oView.byId("idChart2");
			// oChart.bindData(oBindingParameters['idChart2']);
			sap.ui.core.BusyIndicator.hide();
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
		//Obtener los medios de almacenamiento con sus respectivos materiales.
		onGetProducto: function(e){
			try{
				sap.ui.core.BusyIndicator.show(0);

				// thes.onValidar(e);

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

							// material.push({"MEDIUM": "", "MATERIAL": "", "TEXT_MATERIAL": "", "COD_EXT": ""});

							//Obtener Materiales y Medios unicos sin repetidos.
							$.each(producto, function(k, i){
								if(mat.indexOf(i.MATERIAL) == -1){
									// var matsin0 = formatter.borrar0izalfanumerico(i.MATERIAL);
									material.push({"MEDIUM": i.MEDIUM, "MATERIAL": i.MATERIAL, "TEXT_MATERIAL": i.TEXT_MATERIAL, "COD_EXT": i.COD_EXT});
									mat.push(i.MATERIAL);
								}

								// if(med.indexOf(i.MEDIUM) == -1){
									medio.push({"MEDIUM": i.MEDIUM, "MEDIUM_TEXT": i.MEDIUM_TEXT, "MATERIAL": i.MATERIAL});
									med.push(i.MEDIUM);
								// }
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
								//Setear material filtrado al combobox.
								var model = new JSONModel({
					            	"slMaterialitems": material
					            });

					            model.setSizeLimit(999999999);
					        	thes.getView().byId('slMaterial').setModel(model, "slMaterial");

					    		//Seleccionar la primera opcion.
								// thes.getView().byId('slMaterial').setSelectedKey(material[0].MATERIAL);
								thes.getView().byId('slMaterial').setEnabled(true);
			                	// thes.onGetMedio();
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
		//Obtener Medio de almacenamiento de acuerdo al Material escogido.
		onGetMedio: function(){
        	var materialSele = thes.getView().byId('slMaterial').getSelectedKey(),
        		medSeleccionado = [],
        		mate = [];

			//Filtrando medio de almacenamiento por material seleccionado.
			if(materialSele == ""){
				// $.each(medio, function(i, v){
				// 	if(mate.indexOf(v.MEDIUM) == -1){
				// 		medSeleccionado.push(v);
				// 		mate.push(v.MEDIUM);
				// 	}
				// });

				medSeleccionado = [];
			}else{
				medSeleccionado = medio.filter(function(item){
					if(item.MATERIAL.indexOf(materialSele) > -1){
						return item;
					}
				});
			}

			//Seteando los medios de almacenamiento a un combobox, y obteniendo material de acuerdo a lo escogido.
			var model = new JSONModel({
            	"slMedioAlcitems": medSeleccionado
            });

            model.setSizeLimit(999999999);
        	thes.getView().byId('slMedioAlc').setModel(model, "slMedioAlc");
        	thes.getView().byId('slMedioAlc').setEnabled(true);
		},
		onGetProceso: function(){
			try{
				sap.ui.core.BusyIndicator.show(0);

				//Obtener datos del Combo de Proceso
				var centroId = thes.getView().byId("cblCentro").getSelectedKey();

				// thes.getView().byId("tblCubicajeMensual").removeAllColumns();

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

				//Obtener datos del Combo de Proceso
				$.ajax({
					url: urlGlobal + '/PROCESS',
					type: 'GET',
					data : {
						"$format" : "json",
						"$count": true,
						"$filter" : "PLANTID eq '" + plants.PLANTID + "'" +
									" and TYPE_PROCESS eq 'R'"
					},

					async: false,
					headers : {
						"X-CSRF-TOKEN": "FETCH"	
					},
					success: function(data, textStatus, request) {
						sap.ui.core.BusyIndicator.hide();
						csrf_token = request.getResponseHeader("X-CSRF-TOKEN");
						if(data.value.length > 0){
							var model = new JSONModel({
		                    	"procesoitems": data.value
		                    });

		                    model.setSizeLimit(999999999);
		                	thes.getView().byId('slProceso').setModel(model, "proceso");
		                	thes.getView().byId('slProceso').setEnabled(true);
						}

						thes.onGetProducto();
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
		onSearch: function(){
			try{
				sap.ui.core.BusyIndicator.show(0);
				var mat = thes.getView().byId('slMaterial').getSelectedKey(),
				med = thes.getView().byId('slMedioAlc').getSelectedKeys(),
				proceso = thes.getView().byId('slProceso').getSelectedKey(),
				dateIni = thes.getView().byId('idDpDateBegin').getValue(),
				dateFin = thes.getView().byId('idDpDateEnd').getValue(),
				turno = thes.getView().byId('slTurno').getSelectedKey(),
				medArray = [];

				if(plants.PLANTID != undefined && plants.PLANTID != "" && plants.PLANTID &&
					proceso != undefined && proceso != "" && proceso &&
					dateIni != undefined && dateIni != "" && dateIni){

					$.each(med, function(k, v){
						medArray.push({"MEDIUM": v});
					});

					var Data = {
						"PLANTID": plants.PLANTID,
						"MATERIAL": mat,
						"DATE_INI": dateIni,
						"DATE_FIN": dateFin,
						"MEDIUM": JSON.stringify(medArray),
						"PROCESS": proceso,
						"TURN": turno
					}

					//Obtener datos de los stocks
					$.ajax({
						url: urlGlobal + '/EVO_STOCKS',
						type: 'POST',
						contentType: "application/json",
						dataType: 'json',
						data : JSON.stringify(Data),
						headers : {
							"X-CSRF-TOKEN": csrf_token
						},
						async: false,
						success: function(data) {
							thes.getView().byId("idChart").setVisible(true);
							var result = JSON.parse(data.RETURN),
								mediosSel = thes.getView().byId("slMedioAlc").getModel("slMedioAlc").getData().slMedioAlcitems;

							// if(result.length > 0){
								if(mat != undefined && mat != "" && mat &&
									med.length > 0){
									var imagen = thes.getView().byId("idChart");
										imagen.unbindData();
										imagen.destroyData();
										imagen.destroyDimensions();
										imagen.destroyMeasures();
										imagen.setWidth("100%");
										imagen.setHeight("450px");
										imagen.setVisibleDimensions("dateMed, __id");
										imagen.setVisibleMeasures("measurement");
										imagen.setChartType("column");
										imagen.setEnablePagination(true);
										imagen.setEnableScalingFactor(false);
										imagen.setSelectionMode(sap.chart.SelectionMode.Single);
										imagen.addDimension(new Dimension({name: "dateMed", label: "Dias", role: "category"}));
										imagen.addDimension(new Dimension({name: "__id", label: "Silos", role: "category", textProperty: "medium_text"}));
										imagen.addMeasure(new Measure({name: "measurement", label: "Stock", role: "axis2"}));

								}else{
									var imagen = thes.getView().byId("idChart");
										imagen.unbindData();
										imagen.destroyData();
										imagen.destroyDimensions();
										imagen.destroyMeasures();
										imagen.setWidth("100%");
										imagen.setHeight("450px");
										imagen.setVisibleDimensions("__id");
										imagen.setVisibleMeasures("measurement");
										imagen.setChartType("column");
										imagen.setEnablePagination(true);
										imagen.setEnableScalingFactor(false);
										imagen.setSelectionMode(sap.chart.SelectionMode.Single);
										imagen.addDimension(new Dimension({name: "__id", label: "Dias", role: "category", textProperty: "dateMed"}));
										imagen.addMeasure(new Measure({name: "measurement", label: "Stock", role: "axis2"}));
								}
								
								$.each(result, function(k, v){
									v.__id = k;
									$.each(mediosSel, function(km, vm){
										if(v.medium == vm.MEDIUM){
											v.medium_text = vm.MEDIUM_TEXT;
											return false;
										}
									});
								});

								var oView = thes.getView(),
									oData = {},
									self = thes;
								var oModel = new sap.ui.model.json.JSONModel();
								oView.setModel(oModel, "staticDataModel");
								self.oBindingParameters = {};

								oData["idChart"] = {};

								oData["idChart"]["data"] = result;

								self.oBindingParameters['idChart'] = {
									"path": "/idChart/data",
									"model": "staticDataModel",
									"parameters": {}
								};

								

								oData["idChart"]["vizProperties"] = {
									"plotArea": {
										//colorPalette: ['red'],  //añadimos color al grafico
										"dataLabel": {
											
											"visible": true,
											"hideWhenOverlap": true,
											
										}
										
									}
									
								};

								oView.getModel("staticDataModel").setData(oData, true);

								function dateDimensionFormatter(oDimensionValue, sTextValue) {
									var oValueToFormat = sTextValue !== undefined ? sTextValue : oDimensionValue;
									if (oValueToFormat instanceof Date) {
										var oFormat = sap.ui.core.format.DateFormat.getDateInstance({
											style: "short"
										});
										return oFormat.format(oValueToFormat);
									}
									return oValueToFormat;
								}

								var aDimensions = oView.byId("idChart").getDimensions();
								aDimensions.forEach(function(oDimension) {
									oDimension.setTextFormatter(dateDimensionFormatter);
								});

								thes.aonAfterRendering();
							// }

							sap.ui.core.BusyIndicator.hide();
						},
						error: function(jqXHR,textStatus,errorThrown) {
							sap.ui.core.BusyIndicator.hide();
							MessageBox.error(jqXHR.statusText);
						}
					});
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
		onCleanGraf: function(){
			thes.getView().byId("idChart").setVisible(false);
		}
	});
}, /* bExport= */ true);
