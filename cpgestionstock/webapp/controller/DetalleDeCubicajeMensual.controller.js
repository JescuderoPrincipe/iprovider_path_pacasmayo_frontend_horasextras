sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	"com/cementos/pacasmayo/cpgestionstock/util/Formatter",
	'sap/ui/model/Filter',
	"sap/ui/model/json/JSONModel",
	"jquery.sap.storage"
], function(BaseController, MessageBox, Utilities, History, formatter, Filter, JSONModel) {
	"use strict";
	var datos = [], 
		thes,
		valores = [],
		cabecera = [],
		// urlGlobal = 'https://cpcslfioridev.cpsaa.com.pe:44350/sap/opu/odata4/sap/zgfd0001/default/sap/ZS_FD_MNCP/0001',
		//urlGlobal = '/sap/opu/odata4/sap/zgfd0001/default/sap/zs_fd_mncp/0001',
        urlGlobal = './ERP/sap/opu/odata/sap/zgfd0001/default/sap/zs_fd_mncp/0001',
		oLStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
	return BaseController.extend("com.cementos.pacasmayo.cpgestionstock.controller.DetalleDeCubicajeMensual", {
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
		_onButtonPress: function(oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function(fnResolve) {
				oLStorage.put("detalleCubicaje", 1);
				this.doNavigate("CubicajeMensual", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

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
		_onButtonPress1: function(oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function(fnResolve) {

				this.doNavigate("CubicajeMensual", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// this.oRouter.getTarget("DetalleDeCubicajeMensual").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			thes = this;
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("DetalleDeCubicajeMensual").attachMatched(function(oEvent) {
				//Obteniendo los datos de la pantalla anterior.
				datos = JSON.parse(window.atob(oLStorage.get("cubicaje")));
				cabecera = JSON.parse(window.atob(oLStorage.get("cabecera")));
				thes.onGetHistorial(datos[0], datos[5], datos[3], datos[1], datos[datos.length-1], datos[6]);
			});
		},
		//Obtener los datos del historial.
		onGetHistorial: function(planta, tipoMedio, material, medium, item, periodo){
			sap.ui.core.BusyIndicator.show(0);
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
								" and MEDIUM_TYPE eq '" + tipoMedio + "'" +
								" and MEDIUM eq '" + medium + "'" +
								// " and ITEM eq '" + item + "'" +
								" and MONTH_MED eq '" + periodo + "'" +
								" and XHIST eq 'X'" +
								" and XLASTR eq ''" +
								" and TYPE_MEASU eq 'M'"
				},
				async: false,
				success: function(data, textStatus, request) {
					var form = datos[datos.length-2];
					valores = data.value;

					//Setear datos de la cabecera.
					if(valores.length > 0){
						thes.getView().byId("cabecera").setObjectTitle(datos[2]);
						thes.getView().byId("cabecera").setObjectSubtitle(datos[4]);
			
						$.each(cabecera, function(ck, cv){
							form = form.replace(new RegExp(cv.PARAM, "gi"), cv.PARAM_TEXT);
						});

						thes.getView().byId("formula").setText("Formula: " + form);
						// thes.onCrearLista();
						$.each(valores, function(kv, vv){
							var meas = cabecera.filter(function(item){
								if(item.PARAM == vv.PARAM){
									return item;
								}
							});
							valores[kv].PARAM_TEXT = meas[0].PARAM_TEXT;
						});
						valores.sort(thes.by("DATE_MED", thes.by("RECORD")));
						// thes.onCrearLista();
						var model = new JSONModel(valores);
						model.setSizeLimit(999999999);
						thes.getView().byId("tblCubicaje").setModel(model);
						sap.ui.core.BusyIndicator.hide();
						//comentario
					}else{
						//Si no encuentra datos, regresa a la pantalla anterior.
						sap.ui.core.BusyIndicator.hide();
		                thes.getView().byId("idVolver").firePress();
					}
				},
				error: function(jqXHR,textStatus,errorThrown) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error(jqXHR.statusText);
				}
			});
		},
		//Metodo para ordenar un array
		by: function (attr, menor){
		    return function (o, p){
		        var a, b
		 
		        if (typeof o === "object" && typeof p === "object" && o && p ){
		 
		            a = o[attr];
		            b = p[attr];
		 
		            if (a === b ){
		                return typeof menor === 'function' ? menor(o, p) : 0;
		            }
		 
		            if (typeof a === typeof b){
		                return a > b ? -1 : 1;
		            }
		 
		            return typeof a > typeof b ? -1 : 1;
		 
		        }else{
		 
		            throw{
		                name : "Error",
		                message : "Esto no es un objeto, al menos no tiene la propiedad " + attr
		            }
		        }
		    }
		},
		//Crear el componente List con los datos obtenidos del historial.
		onCrearLista: function(){
			var master = this.getView().byId("idLista"),
				datos = [],
				measure = [];

			master.destroyItems();

			$.each(valores, function(k, i){
				if(measure.indexOf(i.RECORD) == -1){
					datos.push(i);
					measure.push(i.RECORD);
				}
				cabecera.filter(function(item){
					if(item.PARAM == i.PARAM){
						valores[k].PARAM_TEXT = item.PARAM_TEXT;
					}
				});
			});

			datos.sort(function (a, b) {
				if (a.RECORD > b.RECORD) {
					return 1;
				}
				if (a.RECORD < b.RECORD) {
					return -1;
				}
				// a must be equal to b
				return 0;
			});

			$.each(datos, function(k, v){
				var fecha = v.DATE_MED,
					hora = v.HOUR_REG,
					valorFinal = 0.000;

				var item = new sap.m.ObjectListItem({
					intro: fecha.substr(6, 2) + "/" + fecha.substr(4, 2) + "/" + fecha.substr(0, 4) + " " + hora.substr(0, 2) + ":" + hora.substr(2, 2) + ":" + hora.substr(4, 2),
					title: v.RECORD,
					icon: "sap-icon://measurement-document",
					number: v.MEASUREMENT,
					numberUnit: v.UM_MEASUREMENT,
					numberState: "None",
					type: "Active",
					selected: true,
					showMarkers: false
				});

				$.each(valores, function(kv, vv){
					if(v.RECORD == vv.RECORD){
						var cabe = cabecera.filter(function(item){
							if(item.PARAM == vv.PARAM){
								return item;
							}
						});
						var attribute = new sap.m.ObjectAttribute({
							text: cabe[0].PARAM_TEXT + " = " + formatter.redondearDec(parseFloat(vv.END_VAL), 3),
							active: false,
							visible: true
						});

						item.addAttribute(attribute);

						var status = new sap.m.ObjectStatus({
							text: vv.STATUS=='G'?'Generado':'Editado',
							state: "None",
							visible: true
						});

						valorFinal += parseFloat(vv.END_VAL);

						item.setFirstStatus(status);
					}
				});

				// item.setNumber(formatter.redondearDec(parseFloat(valorFinal), 3));

				master.addItem(item);
			});
		},

		//Buscador filtro de la lista creada anteriormente.
		onSearch : function (oEvt) {

			// add filter for search
			var aFilters = [];
			var sQuery = oEvt.getSource().getValue();


			if(sQuery != ""){
				// update list binding

				var datosFinales = valores.filter(function(item){
					if(item.MEASURE.toUpperCase().indexOf(sQuery.toUpperCase()) > -1 || item.PARAM.toUpperCase().indexOf(sQuery.toUpperCase()) > -1 || item.DATE_MED.toUpperCase().indexOf(sQuery.toUpperCase()) > -1 || item.HOUR_MED.toUpperCase().indexOf(sQuery.toUpperCase()) > -1 || item.STATUS.toUpperCase().indexOf(sQuery.toUpperCase()) > -1 || item.MEASUREMENT.toUpperCase().indexOf(sQuery.toUpperCase()) > -1 || item.PARAM_TEXT.toUpperCase().indexOf(sQuery.toUpperCase()) > -1){
			    		return item;
					}
				});

				var master = this.getView().byId("idLista"),
					datos = [],
					measure = [];

				master.destroyItems();

				$.each(datosFinales, function(k, i){
					if(measure.indexOf(i.RECORD) == -1){
						datos.push(i);
						measure.push(i.RECORD);
					}
				});

				$.each(datos, function(k, v){
					var fecha = v.DATE_MED,
						hora = v.HOUR_MED,
						valorFinal = 0.000;

					var item = new sap.m.ObjectListItem({
						intro: fecha.substr(6, 2) + "/" + fecha.substr(4, 2) + "/" + fecha.substr(0, 4) + " " + hora.substr(0, 2) + ":" + hora.substr(2, 2) + ":" + hora.substr(4, 2),
						title: v.RECORD,
						icon: "sap-icon://measurement-document",
						number: v.MEASUREMENT,
						numberUnit: v.UM_MEASUREMENT,
						numberState: "None",
						type: "Active",
						selected: true,
						showMarkers: false
					});

					$.each(valores, function(kv, vv){
						if(v.RECORD == vv.RECORD){
							var cabe = cabecera.filter(function(item){
								if(item.PARAM == vv.PARAM){
									return item;
								}
							});
							var attribute = new sap.m.ObjectAttribute({
								text: cabe[0].PARAM_TEXT + " = " + formatter.redondearDec(parseFloat(vv.END_VAL), 3),
								active: false,
								visible: true
							});

							item.addAttribute(attribute);

							var status = new sap.m.ObjectStatus({
								text: vv.STATUS=='G'?'Generado':'Editado',
								state: "None",
								visible: true
							});

							valorFinal += parseFloat(vv.END_VAL);

							item.setFirstStatus(status);
						}
					});

					// item.setNumber(formatter.redondearDec(parseFloat(valorFinal), 3));

					master.addItem(item);
				});
			}else{
				this.onCrearLista();
			}
		}
	});
}, /* bExport= */ true);
