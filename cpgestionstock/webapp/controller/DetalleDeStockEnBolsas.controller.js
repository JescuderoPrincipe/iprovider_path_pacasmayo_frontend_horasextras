sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	'sap/ui/model/Filter',
	"jquery.sap.storage",
	"sap/ui/model/json/JSONModel",
	"com/cementos/pacasmayo/cpgestionstock/util/Formatter"
], function(BaseController, MessageBox, Utilities, History, Filte, storage, JSONModel, formatter) {
	"use strict";
	var datos,
		datosTM,
		tipoMedio,
		producto = [],
		cabecera = [],
		thes,
		valores = [],
		//urlGlobal = 'https://cpcslfioridev.cpsaa.com.pe:44350/sap/opu/odata4/sap/zgfd0001/default/sap/ZS_FD_MNCP/0001',
		//urlGlobal = '/sap/opu/odata4/sap/zgfd0001/default/sap/zs_fd_mncp/0001',
        urlGlobal = './ERP/sap/opu/odata/sap/zgfd0001/default/sap/zs_fd_mncp/0001',
		oLStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
	return BaseController.extend("com.cementos.pacasmayo.cpgestionstock.controller.DetalleDeStockEnBolsas", {
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

				this.doNavigate("StockEnBolsas", oBindingContext, fnResolve, "");
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

				this.doNavigate("StockEnBolsas", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// this.oRouter.getTarget("DetalleDeStockEnBolsas").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			thes = this;
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("DetalleDeStockEnBolsas").attachMatched(function(oEvent) {
				//Obteniendo los datos de la pantalla anterior.
				datos = JSON.parse(window.atob(oLStorage.get("bolsas")));
				datosTM = JSON.parse(window.atob(oLStorage.get("tipoMD")));
				tipoMedio = JSON.parse(window.atob(oLStorage.get("tipoMedio")));
				producto = JSON.parse(window.atob(oLStorage.get("producto")));
				cabecera = JSON.parse(window.atob(oLStorage.get("cabecera")));
				thes.onGetHistorial(datos[0], datos[3]);
			});
		},
		//Obtener los datos del historial.
		onGetHistorial: function(planta, material){
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
								" and TURN eq ''" +
								" and MATERIAL eq '" + material + "'" +
								" and MEDIUM_TYPE1 eq '" + tipoMedio[0].TYPE + "'" +
								" and MEDIUM_TYPE2 eq '" + tipoMedio[1].TYPE + "'" +
								" and XHIST eq 'X'" +
								" and XLASTR eq ''" +
								" and TYPE_MEASU eq 'S'"
				},
				async: false,
				success: function(data, textStatus, request) {
					valores = data.value;

					if(valores.length > 0){
						if(datosTM.length == 1){
							thes.getView().byId("cabecera").setObjectTitle(datosTM[0].NAME_TYPE);
						}else{
							thes.getView().byId("cabecera").setObjectTitle(datosTM[0].NAME_TYPE + "/" + datosTM[1].NAME_TYPE);
						}

						$.each(valores, function(kv, vv){
							var meas = producto.filter(function(item){
								if(item.MEDIUM == vv.MEDIUM){
									return item;
								}
							});
							valores[kv].MEDIUM_TEXT = meas[0].MEDIUM_TEXT;
						});
						valores.sort(thes.by("DATE_MED", thes.by("RECORD")));
						// thes.onCrearLista();
						var model = new JSONModel(valores);
						model.setSizeLimit(999999999);
						thes.getView().byId("tblStockEnBolsas").setModel(model);
						sap.ui.core.BusyIndicator.hide();
					}else{
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
				if(measure.indexOf(i.MEASURE) == -1){
					datos.push(i);
					measure.push(i.MEASURE);
				}
			});

			$.each(datos, function(k, v){
				var fecha = v.DATE_MED,
					hora = v.HOUR_MED,
					valorFinal = 0.000;

				var item = new sap.m.ObjectListItem({
					// intro: fecha.substr(6, 2) + "/" + fecha.substr(4, 2) + "/" + fecha.substr(0, 4) + " " + hora.substr(0, 2) + ":" + hora.substr(2, 2) + ":" + hora.substr(4, 2),
					title: v.MEASURE,
					icon: "sap-icon://measurement-document",
					// number: 0.000,
					// numberUnit: v.UM_MEASUREMENT,
					numberState: "None",
					type: "Active",
					selected: true,
					showMarkers: false
				});


				valores.sort(thes.by("STATUS", thes.by("HOUR_MED")));

				$.each(valores, function(kv, vv){
					var fecha = vv.DATE_MED,
						hora = vv.HOUR_MED,
						estado = vv.STATUS=='G'?'Generado':'Editado';

					if(v.MEASURE == vv.MEASURE){
						var form = vv.FORMU_DET;
						var meas = producto.filter(function(item){
							if(item.MEDIUM == vv.MEDIUM){
								return item;
							}
						});
						$.each(cabecera, function(ck, cv){
							form = form.replace(new RegExp(cv.PARAM, "gi"), cv.PARAM_TEXT);
						});
						valores[kv].FORM_CAB = form;
						valores[kv].MEDIUM_TEXT = meas[0].MEDIUM_TEXT;
						var attribute = new sap.m.ObjectAttribute({
							text: meas[0].MEDIUM_TEXT + " - <" + form + "> = " + formatter.redondearDec(parseFloat(vv.MEASUREMENT), 3) + ' - ' + fecha.substr(6, 2) + "/" + fecha.substr(4, 2) + "/" + fecha.substr(0, 4) + " " + hora.substr(0, 2) + ":" + hora.substr(2, 2) + ":" + hora.substr(4, 2) + ' / ' + estado,
							active: false,
							visible: true
						});

						item.addAttribute(attribute);

						var status = new sap.m.ObjectStatus({
							text: vv.STATUS=='G'?'Generado':'Editado',
							state: "None",
							visible: true
						});

						valorFinal = parseFloat(vv.MEASUREMENT);

						// item.setFirstStatus(status);
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
					if(item.FORM_CAB.toUpperCase().indexOf(sQuery.toUpperCase()) > -1 || item.MEDIUM_TEXT.toUpperCase().indexOf(sQuery.toUpperCase()) > -1 || item.MEASURE.toUpperCase().indexOf(sQuery.toUpperCase()) > -1 || item.MEDIUM.toUpperCase().indexOf(sQuery.toUpperCase()) > -1 || item.FORMU_DET.toUpperCase().indexOf(sQuery.toUpperCase()) > -1 || item.DATE_MED.toUpperCase().indexOf(sQuery.toUpperCase()) > -1 || item.HOUR_MED.toUpperCase().indexOf(sQuery.toUpperCase()) > -1 || item.STATUS.toUpperCase().indexOf(sQuery.toUpperCase()) > -1 || item.MEASUREMENT.toUpperCase().indexOf(sQuery.toUpperCase()) > -1){
			    		return item;
					}
				});

				var master = this.getView().byId("idLista"),
					datos = [],
					measure = [];

				master.destroyItems();

				$.each(datosFinales, function(k, i){
					if(measure.indexOf(i.MEASURE) == -1){
						datos.push(i);
						measure.push(i.MEASURE);
					}
				});

				$.each(datos, function(k, v){
					var fecha = v.DATE_MED,
						hora = v.HOUR_MED,
						valorFinal = 0.000;

					var item = new sap.m.ObjectListItem({
						// intro: fecha.substr(6, 2) + "/" + fecha.substr(4, 2) + "/" + fecha.substr(0, 4) + " " + hora.substr(0, 2) + ":" + hora.substr(2, 2) + ":" + hora.substr(4, 2),
						title: v.MEASURE,
						icon: "sap-icon://measurement-document",
						// number: 0.000,
						// numberUnit: v.UM_MEASUREMENT,
						numberState: "None",
						type: "Active",
						selected: true,
						showMarkers: false
					});

					valores.sort(thes.by("STATUS", thes.by("HOUR_MED")));

					$.each(valores, function(kv, vv){
						var fecha = vv.DATE_MED,
							hora = vv.HOUR_MED,
							estado = vv.STATUS=='G'?'Generado':'Editado';
						if(v.MEASURE == vv.MEASURE){
							var form = vv.FORMU_DET;
							var meas = producto.filter(function(item){
								if(item.MEDIUM == vv.MEDIUM){
									return item;
								}
							});
							$.each(cabecera, function(ck, cv){
								form = form.replace(new RegExp(cv.PARAM, "gi"), cv.PARAM_TEXT);
							});
							valores[kv].FORM_CAB = form;
							valores[kv].MEDIUM_TEXT = meas[0].MEDIUM_TEXT;
							var attribute = new sap.m.ObjectAttribute({
								text: meas[0].MEDIUM_TEXT + " - <" + form + "> = " + formatter.redondearDec(parseFloat(vv.MEASUREMENT), 3) + ' - ' + fecha.substr(6, 2) + "/" + fecha.substr(4, 2) + "/" + fecha.substr(0, 4) + " " + hora.substr(0, 2) + ":" + hora.substr(2, 2) + ":" + hora.substr(4, 2) + ' / ' + estado,
								active: false,
								visible: true
							});

							item.addAttribute(attribute);

							var status = new sap.m.ObjectStatus({
								text: vv.STATUS=='G'?'Generado':'Editado',
								state: "None",
								visible: true
							});

							valorFinal = parseFloat(vv.END_VAL);

							// item.setFirstStatus(status);
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
