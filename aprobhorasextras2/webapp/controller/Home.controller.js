sap.ui.define([
	"Aprob/Horas/Extras/aprobhorasextras2/controller/BaseController",
	"sap/m/TablePersoController",
	"./DemoPersoService",
	"sap/ui/core/mvc/Controller",
	"sap/ui/table/Table",
	"sap/ui/commons/Label",
	"sap/m/Input",
	"sap/m/Button",
	"sap/ui/table/Column",
	"sap/ui/table/Row",
	"sap/ui/commons/TextView",
	"sap/ui/model/json/JSONModel",
	"sap/m/ListBase",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/comp/filterbar/FilterGroupItem",
	"sap/ui/comp/filterbar/FilterBar",
	"sap/m/MessageBox",
	"sap/m/ComboBox",
	"sap/ui/core/Item",
	"sap/m/CheckBox",
	"sap/ui/core/ListItem",
	"sap/m/SuggestionItem",
	"sap/ui/core/Fragment"
], function (BaseController, TablePersoController, DemoPersoService, Controller, Table, Label, Input, Button, Column, Row, TextView,
	JSONModel, ListBase, Filter, FilterOperator,
	FilterGroupItem, FilterBar, MessageBox, ComboBox, Item, CheckBox, ListItem, SuggestionItem, Fragment) {
	"use strict";

	return BaseController.extend("Aprob.Horas.Extras.aprobhorasextras2.controller.Home", {

		onExit: function () {
			this._oTPC.destroy();
		},

		onChange3: function (oEvent) {
			var path = oEvent.getSource().getBindingContext().getPath();
			var reg = oEvent.getSource().getModel().getProperty(path);

			if (oEvent.getSource().getSelectedItem()) {
				reg.ID_MOTIVO = oEvent.getSource().getSelectedItem().getKey();
				reg.MOTIVO = oEvent.getSource().getSelectedItem().getText();
				reg.COMENT_AUX = true;
			} else {
				reg.ID_MOTIVO = "";
				reg.MOTIVO = "";
				reg.COMENT = "";
				reg.COMENT_AUX = false;
			}

			oEvent.getSource().getModel().refresh();
		},

		onLoadItems: function (oEvent) {
			var path = oEvent.getSource().getBindingContext().getPath();
			var reg = oEvent.getSource().getModel().getProperty(path);
			var combo = oEvent.getSource();
			sap.this.onComboBox(reg.BUKRS, reg.PERSA, "ID", combo);
		},

		onComboBox: function (filter1, filter2, objeto, combo) {

			var oModel = new sap.ui.model.odata.v2.ODataModel("./ERP/sap/opu/odata/sap/ZPT_PY_MATCHCODES_SRV/");

			var ofilters = [];

			if (filter1 !== "") {
				var filter = new Filter({
					path: "i_filter",
					operator: FilterOperator.EQ,
					value1: filter1
				});
				ofilters.push(filter);
			}

			if (filter2 !== "") {
				var filter = new Filter({
					path: "i_filter_2",
					operator: FilterOperator.EQ,
					value1: filter2
				});
				ofilters.push(filter);
			}

			var filter = new Filter({
				path: "i_object",
				operator: FilterOperator.EQ,
				value1: objeto
			});
			ofilters.push(filter);
			
			var filter = new Filter({
				path: "i_mante",
				operator: FilterOperator.EQ,
				value1: false
			});
			ofilters.push(filter);

			sap.combo = combo;

			sap.ui.core.BusyIndicator.show();
			oModel.read("/singleMatchCodeSet", {
				filters: ofilters,
				success: function (result) {
					sap.combo.destroyItems();
					for (var j = 0; j < JSON.parse(result.results[0].et_data).length; j++) {
						sap.combo.addItem(new ListItem({
							key: JSON.parse(result.results[0].et_data)[j].VALUE,
							text: JSON.parse(result.results[0].et_data)[j].TEXTO,
							additionalText: JSON.parse(result.results[0].et_data)[j].VALUE
						}));
					}
					sap.ui.core.BusyIndicator.hide();
				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});

		},

		onInit: function (oEvent) {
			sap.this = this;

			$.ajax({
				//url: "/services/userapi/attributes",
                url: "./IPROVIDER_BACKEND/api/" + "current-session/logged-user",
				async: false,
				success: function (data, status, xhr) {
					sap.this.user = data;
				},
				error: function (status, xhr) {}
			});

			this._oTPC = new TablePersoController({
				table: this.byId("table"),
				//specify the first part of persistence ids e.g. 'demoApp-productsTable-dimensionsCol'
				componentName: "demoApp",
				persoService: DemoPersoService
			}).activate();

			//this.onSearch();
		},

		onSend: function (oEvent) {
			var oTable = this.byId("table");
			//var oRegs = this.byId("table").getModel().getData();
			var Paths = oTable.getSelectedContextPaths();
			var oData = [];

			if (Paths.length === 0) {
				MessageBox.error(
					"Seleccione mínimo un registro."
				);
				return;
			}

			for (var i = 0; i < Paths.length; i++) {
				var reg = oTable.getModel().getProperty(Paths[i]);

				if (reg.ESTADO === "0" || reg.ESTADO === "2") {

				} else {
					var CNTHE_S = Number((Number(reg.HPPAG) + Number(reg.HPCOM) + Number(reg.HNAUT)).toFixed(2));

					if (CNTHE_S !== reg.CNTHE) {
						MessageBox.error(
							"La solicitud de " + reg.APNOM + " de la fecha " + reg.FECHE + " no ha sido distribuida correctamente."
						);
						return;
					}
				}

				oData.push(reg);
			}

			var data = {};
			data.IV_ESTADO = "0";
			data.ET_DATA = JSON.stringify(oData);
			data.IV_PERNR_AP = sap.this.user.employee_number;
			var oModel2 = new sap.ui.model.odata.v2.ODataModel("./ERP/sap/opu/odata/sap/ZPT_PY_SOLICITUDES_SRV/");

			sap.ui.core.BusyIndicator.show();
			oModel2.create("/sendDistributionSet", data, {
				success: function (result) {
					setTimeout(function(){ sap.ui.core.BusyIndicator.hide(); sap.this.onSearch(); MessageBox.success("Se envió con éxito!");}, 3000);
				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error("Error al grabar");
				}
			});

		},

		onSave: function (oEvent) {
			var oTable = this.byId("table");
			var oRegs = this.byId("table").getModel().getData();
			var oData = [];

			for (var i = 0; i < oRegs.length; i++) {
				var reg = oTable.getModel().getProperty("/" + i);

				if (reg.MOTIVO === "") {
					reg.ID_MOTIVO = 0;
				}

				if (reg.KTEXT_AP === "") {
					reg.KOSTL_AP = "";
				}

				var CNTHE_S = Number((Number(reg.HPPAG) + Number(reg.HPCOM) + Number(reg.HNAUT)).toFixed(2));

				if (CNTHE_S !== reg.CNTHE && reg.ACCION === "M") {
					MessageBox.error(
						"La solicitud de " + reg.APNOM + " de la fecha " + reg.FECHE + " no ha sido distribuida correctamente."
					);
					return;
				}

				oData.push(reg);

			}

			var data = {};
			data.ET_DATA = JSON.stringify(oData);

			var oModel2 = new sap.ui.model.odata.v2.ODataModel("./ERP/sap/opu/odata/sap/ZPT_PY_SOLICITUDES_SRV/");

			sap.ui.core.BusyIndicator.show();
			oModel2.create("/saveDistributionSet", data, {
				success: function (result) {
					sap.ui.core.BusyIndicator.hide();
					//sap.this.onSearch();
					MessageBox.success("Se grabo con éxito!");
				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error("Error al grabar");
				}
			});
		},

		onClear: function (oEvent) {
			sap.this.byId("filterBukrs").setValue();
			sap.this.byId("filterBukrs").removeAllTokens();
			sap.this.byId("filterPersa").setValue();
			sap.this.byId("filterPersa").removeAllTokens();
			sap.this.byId("filterPernr").setValue();
			sap.this.byId("filterPernr").removeAllTokens();
			sap.this.byId("filterOrgeh").setValue();
			sap.this.byId("filterOrgeh").removeAllTokens();
			sap.this.byId("filterKostl").setValue();
			sap.this.byId("filterKostl").removeAllTokens();
			sap.this.byId("filterCantDesde").setValue();
			sap.this.byId("filterCantHasta").setValue();
			sap.this.byId("filterRangoFecha").setValue();
		},

		onChange: function (oEvent) {
			var path = oEvent.getSource().getBindingContext().getPath();
			var reg = oEvent.getSource().getModel().getProperty(path);

			var dia = oEvent.getParameters().value.substr(6, 2);
			var mes = oEvent.getParameters().value.substr(4, 2) - 1;
			var anio = oEvent.getParameters().value.substr(0, 4);

			var dia2 = reg.FECHE.substr(8, 2);
			var mes2 = reg.FECHE.substr(5, 2) - 1;
			var anio2 = reg.FECHE.substr(0, 4);

			var fecha1 = new Date(anio, mes, dia);
			var fecha2 = new Date(anio2, mes2, dia2);
			var resta = fecha1 - fecha2;
			var dias = resta / (60 * 60 * 24 * 1000);

			if (dias < 0 || dias > 30) {
				MessageBox.error("Ingrese una fecha mayor a la solicitud y que no exceda los 30 dias");
				reg.FCOMP = "";
				oEvent.getSource().setValue();
				sap.this.byId("table").getModel().refresh();
				return;
			}
			//var datePicker = oEvent.getSource();

			//datePicker.setDateValue(new Date(anio,mes,dia));
			reg.FCOMP = oEvent.getSource().getValue();
			sap.this.byId("table").getModel().refresh();

		},

		onSearch: function (oEvent) {
			var burks = sap.this.tokensToString(this.byId("filterBukrs").getTokens());
			var persa = sap.this.tokensToString(this.byId("filterPersa").getTokens());
			var pernr = sap.this.tokensToString(this.byId("filterPernr").getTokens());
			var orgeh = sap.this.tokensToString(this.byId("filterOrgeh").getTokens());
			var kostl = sap.this.tokensToString(this.byId("filterKostl").getTokens());
			var cantDesde = this.byId("filterCantDesde").getValue();
			var cantHasta = this.byId("filterCantHasta").getValue();
			var fechaDesde = this.byId("filterRangoFecha").getDateValue();
			var fechaHasta = this.byId("filterRangoFecha").getSecondDateValue();

			var oModel2 = new sap.ui.model.odata.v2.ODataModel("./ERP/sap/opu/odata/sap/ZPT_PY_SOLICITUDES_SRV/");

			var ofilters = [];

			var filter = new Filter({
				path: "IR_PERNR_USERSCP",
				operator: FilterOperator.EQ,
				value1: sap.this.user.employee_number
			});
			ofilters.push(filter);
			
			if (burks === "" && persa === "") {
				if(fechaDesde === "" || fechaDesde === null){
					var oModeltemp = new sap.ui.model.json.JSONModel([]);
					sap.this.byId("table").setModel(oModeltemp);
					oModeltemp.refresh();
					MessageBox.warning("Sociedad ó División de personal ó Rango de fecha es un campo obligatorio.");
					return;	
				}
			}
			
			if (burks !== "") {
				var filter = new Filter({
					path: "IR_BUKRS",
					operator: FilterOperator.EQ,
					value1: burks
				});
				ofilters.push(filter);
			}

			if (persa !== "") {
				var filter = new Filter({
					path: "IR_PERSA",
					operator: FilterOperator.EQ,
					value1: persa
				});
				ofilters.push(filter);
			}

			if (pernr !== "") {
				var filter = new Filter({
					path: "IR_PERNR",
					operator: FilterOperator.EQ,
					value1: pernr
				});
				ofilters.push(filter);
			}

			if (orgeh !== "") {
				var filter = new Filter({
					path: "IR_ORGEH",
					operator: FilterOperator.EQ,
					value1: orgeh
				});
				ofilters.push(filter);
			}

			if (fechaDesde === "" || fechaDesde === null) {

			} else {
				fechaDesde = this.fechaSAP(fechaDesde);
				fechaHasta = this.fechaSAP(fechaHasta);
				var filter = new Filter({
					path: "IR_DATUM",
					operator: FilterOperator.BT,
					value1: fechaDesde,
					value2: fechaHasta
				});
				ofilters.push(filter);
			}

			if (kostl !== "") {
				var filter = new Filter({
					path: "IR_KOSTL",
					operator: FilterOperator.EQ,
					value1: kostl
				});
				ofilters.push(filter);
			}

			if (cantDesde !== "" && cantHasta !== "") {
				var filter = new Filter({
					path: "IR_ANZHL",
					operator: FilterOperator.BT,
					value1: cantDesde,
					value2: cantHasta
				});
				ofilters.push(filter);
			} else {
				if (cantDesde === "" && cantHasta !== "") {
					MessageBox.error("Ingrese Cantidad Hasta");
					return;
				}
				if (cantDesde !== "" && cantHasta === "") {
					MessageBox.error("Ingrese Cantidad Desde");
					return;
				}
			}
			
			var filter = new Filter({
				path: "IR_ESTADO",
				operator: FilterOperator.EQ,
				value1: "0"
			});
			ofilters.push(filter);

			sap.ui.core.BusyIndicator.show();
			oModel2.read("/listSolSet", {
				filters: ofilters,
				async: false,
				success: function (result) {
					var data = JSON.parse(result.results[0].ET_DATA);

					for (var i = 0; i < data.length; i++) {

						data[i].ORGTX_AUX = false;

						if (data[i].HNAUT === "" || data[i].HNAUT === "0" || data[i].HNAUT === 0 || data[i].HNAUT === 0.00 || data[i].HNAUT ===
							"0.00") {
							data[i].COMENT_HNA_AUX = false;
						} else {
							data[i].COMENT_HNA_AUX = true;
						}

						if (data[i].MOTIVO === "") {
							data[i].COMENT_AUX = false;
						} else {
							data[i].COMENT_AUX = true;
						}
						if (data[i].HPCOM === "" || data[i].HPCOM === "0" || data[i].HPCOM === 0 || data[i].HPCOM === 0.00 || data[i].HPCOM ===
							"0.00") {
							data[i].FCOMP_AUX = false;
						} else {
							data[i].FCOMP_AUX = true;
						}

						var CNTHE_S = Number((Number(data[i].HPPAG) + Number(data[i].HPCOM) + Number(data[i].HNAUT)).toFixed(2));
						if (CNTHE_S !== data[i].CNTHE) {
							data[i].HPPAG = "";
							data[i].HPCOM = "";
							data[i].HNAUT = "";
						}

						if (data[i].ESTADO === "0" || data[i].ESTADO === "2") {
							data[i].CNTHE_AUX = false;
							data[i].HPCOM_AUX2 = false;
							data[i].FCOMP_AUX = false;
							data[i].HNAUT_AUX2 = false;
							data[i].MOTIVO_AUX = false;
							data[i].COMENT_AUX = false;
							data[i].ORGTX_AUX = false;
							data[i].KTEXT_AP_AUX = false;
						} else {
							data[i].CNTHE_AUX = true;
							data[i].HPCOM_AUX2 = true;
							data[i].FCOMP_AUX = true;
							data[i].HNAUT_AUX2 = true;
							data[i].MOTIVO_AUX = true;
							data[i].COMENT_AUX = true;
							data[i].ORGTX_AUX = false;
							data[i].KTEXT_AP_AUX = true;
						}

						if (data[i].MOTIVO === "") {
							data[i].COMENT_AUX = false;
							data[i].COMENT = "";
						} else {
							data[i].COMENT_AUX = true;
							data[i].COMENT = "";
						}

					}

					var oModel = new sap.ui.model.json.JSONModel(data);
					oModel.setSizeLimit(1500);
					if(data.length > 1500){
						MessageBox.information("Solo es posible mostrar 1500 resultados como máximo.");
					}
					sap.this.byId("table").setModel(oModel);
					oModel.refresh();
					sap.ui.core.BusyIndicator.hide();
				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});

		},

		onPopTransferir: function (oEvent) {

			var selectedPath = sap.this.byId("table").getSelectedContextPaths();

			if (selectedPath.length === 0) {
				MessageBox.error("Seleccione mínimo un registro");
				return;
			}

			var oView = this.getView();

			// create dialog lazily
			if (!this.byId("idTransferencia")) {
				// load asynchronous XML fragment
				Fragment.load({
					id: oView.getId(),
					name: "Aprob.Horas.Extras.aprobhorasextras2.view.Transferencia",
					controller: this
				}).then(function (oDialog) {
					// connect dialog to the root view of this component (models, lifecycle)
					oView.addDependent(oDialog);
					oDialog.open();
				});
			} else {
				this.byId("idTransferencia").open();
			}

		},

		onTransferir: function (oEvent) {

			var selectedPath = sap.this.byId("table").getSelectedContextPaths();
			var regis = [];
			for (var i = 0; i < selectedPath.length; i++) {
				var reg = sap.this.byId("table").getModel().getProperty(selectedPath[i]);
				regis.push(reg);
			}

			var data = {};

			data.it_data = JSON.stringify(regis);
			data.i_pernr_trans = this.byId("iptNumeroPersonal").getSelectedKey();

			var oModel2 = new sap.ui.model.odata.v2.ODataModel("./ERP/sap/opu/odata/sap/ZPT_PY_TRANFERENCIA_SRV/");

			this.byId("idTransferencia").close();
			this.byId("idTransferencia").destroy();
			sap.ui.core.BusyIndicator.show();
			oModel2.create("/transferSet", data, {
				success: function (result) {
					sap.ui.core.BusyIndicator.hide();
					sap.this.onSearch();
					MessageBox.success("Se transfirió con éxito!");
				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error("Error al transferir");
				}
			});

		},

		onCerrar: function () {
			this.byId("idTransferencia").close();
			this.byId("idTransferencia").destroy();
		},

		tokensToString: function (tokens) {
			var valor = "";
			for (var i = 0; i < tokens.length; i++) {
				if (valor === "") {
					valor = tokens[i].getKey();
				} else {
					valor = valor + "," + tokens[i].getKey();
				}
			}
			return valor;
		},

		onAfterRendering: function (oEvent) {
			document.getElementById("__bar0-btnGo-BDI-content").innerHTML = "Buscar";
		},

		onLiveChange: function (oEvent) {

			var campo = oEvent.getSource().data("campo");
			var valor = oEvent.getSource().getValue();
			var input2 = oEvent.getSource();

			switch (campo) {
			case "BUKRS_SOL":
				sap.this.onBusquedaSensitiva(valor, "", "", campo, input2);
				break;
			case "PERSA_SOL":
				var bukrs = sap.this.tokensToString(this.byId("filterBukrs").getTokens());
				if (bukrs === "") {
					sap.this.byId("filterPersa").setValue();
					MessageBox.error("Seleccione una sociedad");
					return;
				}
				sap.this.onBusquedaSensitiva(valor, bukrs, "", campo, input2);
				break;
			case "PERNR_SOL":
				sap.this.onBusquedaSensitiva(valor, "", "", campo, input2);
				break;
			case "PERNR":
				sap.this.onBusquedaSensitiva(valor, "", "", campo, input2);
				break;
			case "ORGEH_SOL":
				sap.this.onBusquedaSensitiva(valor, "", "", campo, input2);
				break;
			case "KOSTL_AUFNR_SOL_FILTRO":
				var bukrs = sap.this.tokensToString(this.byId("filterBukrs").getTokens());
				if (bukrs === "") {
					sap.this.byId("filterKostl").setValue();
					MessageBox.error("Seleccione una sociedad");
					return;
				}
				sap.this.onBusquedaSensitiva(valor, bukrs, "", campo, input2);
				break;
			case "ID":
				var regSelect = sap.this.byId("table").get;
				var reg = oEvent.getSource().getModel().getProperty(path);
				sap.this.onBusquedaSensitiva(valor, "", "", campo, input2);
				break;
			}

		},

		onSuggestionItemSelected2: function (oEvent) {
			var campo = oEvent.getSource().data("campo");
			var selectedItem = oEvent.getParameter('selectedItem');
			if (selectedItem === null) {
				return;
			}
			var text = selectedItem.getText();
			var additionalText = selectedItem.getAdditionalText();
			var selectedPath = sap.this.byId("table").getSelectedContextPaths();

			if (selectedPath.length === 0) {
				MessageBox.error("Seleccione mínimo un registro");
				return;
			}

			for (var i = 0; i < selectedPath.length; i++) {
				var reg = oEvent.getSource().getModel().getProperty(selectedPath[i]);
				reg.MOTIVO = text;
				reg.ID_MOTIVO = additionalText;
				reg.COMENT_AUX = true;
			}

			sap.this.byId("table").getModel().refresh();
			sap.this.byId("table").removeSelections();

		},

		onSuggestionItemSelected: function (oEvent) {
			var campo = oEvent.getSource().data("campo");
			var selectedItem = oEvent.getParameter('selectedItem');
			if (selectedItem === null) {
				return;
			}
			var text = selectedItem.getText();
			var additionalText = selectedItem.getAdditionalText();

			switch (campo) {
			case "ID2":
				var path = oEvent.getSource().getBindingContext().getPath();
				var reg = oEvent.getSource().getModel().getProperty(path);
				reg.MOTIVO = text;
				reg.ID_MOTIVO = additionalText;
				reg.COMENT_AUX = true;
				oEvent.getSource().getModel().refresh();
				break;
			case "KOSTL_SOL_FILTRO":
				var path = oEvent.getSource().getBindingContext().getPath();
				var reg = oEvent.getSource().getModel().getProperty(path);
				reg.KTEXT_AP = text;
				reg.KOSTL_AP = additionalText;
				oEvent.getSource().getModel().refresh();
			}

		},

		onChange2: function (oEvent) {
			var campo = oEvent.getSource().data("campo");
			var path = oEvent.getSource().getBindingContext().getPath();
			var valor = oEvent.getSource().getValue();
			var input2 = oEvent.getSource();
			var reg = oEvent.getSource().getModel().getProperty(path);

			switch (campo) {
			case "H_TEO":
				if (valor === "") {
					reg.HPPAG = Number(reg.CNTHE);
					reg.HPCOM_AUX = 0;
					reg.HNAUT_AUX = 0;
					reg.COMENT_HNA_AUX = false;
					reg.COMENT_HNA = "";
					reg.FCOMP = "";
					reg.HPCOM = "";
					reg.HNAUT = 0;
					reg.FCOMP_AUX = false;
					reg.ACCION = "M";
					oEvent.getSource().getModel().refresh();
					return;
				} else {
					if (Number(valor) < 0) {
						reg.H_TEO = "";
						input2.setValue();
						oEvent.getSource().getModel().refresh();
						MessageBox.error("No se permiten valores negativos");
						return;
					}
					if (Number(reg.CNTHE) < Number(valor)) {
						reg.H_TEO = "";
						input2.setValue();
						oEvent.getSource().getModel().refresh();
						MessageBox.error("Distribución mayor a la Cant. HE");
						return;
					}
					if (isNaN(valor) === true) {
						reg.H_TEO = "";
						input2.setValue();
						oEvent.getSource().getModel().refresh();
						MessageBox.error("Ingrese un valor válido");
						return;
					}

					if (Number(valor) === Number(reg.CNTHE)) {
						reg.HNAUT = 0;
						reg.HPCOM = 0;
						reg.FCOMP = "";
						reg.FCOMP_AUX = false;
						reg.COMENT_HNA_AUX = false;
						reg.COMENT_HNA = "";
						reg.ACCION = "M";
						oEvent.getSource().getModel().refresh();
						return;
					}

					reg.HPCOM_AUX = Number(reg.CNTHE) - Number(valor);
					reg.HPCOM_AUX = Number(reg.HPCOM_AUX.toFixed(2));
					reg.HNAUT = "";
					reg.HPCOM = "";
					reg.HNAUT_AUX = 0;
					reg.COMENT_HNA_AUX = false;
					reg.COMENT_HNA = "";

					if (Number.isInteger(Number(reg.HPCOM_AUX))) {
						reg.HNAUT_AUX = 0;
						reg.COMENT_HNA_AUX = false;
						reg.COMENT_HNA = "";
					} else {
						reg.HPCOM_AUX = Number(reg.HPCOM_AUX);
					}

				}
				break;
			case "HPCOM":
				if (valor === "") {
					reg.HPCOM = Number(reg.HPCOM_AUX);
					reg.HNAUT = 0;
					reg.HNAUT_AUX = 0;
					reg.COMENT_HNA_AUX = false;
					reg.COMENT_HNA = "";
					if (Number(reg.HPCOM_AUX) !== 0) {
						reg.FCOMP_AUX = true;
					}
					reg.ACCION = "M";
					oEvent.getSource().getModel().refresh();
					return;
				} else {
					if (Number(valor) < 0) {
						reg.H_TEO = "";
						input2.setValue();
						oEvent.getSource().getModel().refresh();
						MessageBox.error("No se permiten valores negativos");
						return;
					}
					if (Number(reg.CNTHE) < (Number(reg.HPPAG) + Number(valor)).toFixed(2)) {
						reg.HPCOM = "";
						input2.setValue();
						oEvent.getSource().getModel().refresh();
						MessageBox.error("Distribución mayor a la Cant. HE");
						return;
					}
					if (isNaN(valor) === true) {
						reg.H_TEO = "";
						input2.setValue();
						oEvent.getSource().getModel().refresh();
						MessageBox.error("Ingrese un valor válido");
						return;
					}
					if (Number(valor) === 0) {
						reg.FCOMP_AUX = false;
						reg.FCOMP = "";
					} else {
						reg.FCOMP_AUX = true;
					}

					reg.HNAUT = "";
					reg.HNAUT_AUX = (Number(reg.CNTHE) - Number(reg.HPPAG)) - Number(valor);
					reg.HNAUT_AUX = Math.abs(reg.HNAUT_AUX.toFixed(2));

					if (reg.HNAUT_AUX === 0) {
						reg.COMENT_HNA_AUX = false;
						reg.COMENT_HNA = "";
					} else {
						reg.COMENT_HNA_AUX = true;
						reg.COMENT_HNA = "";
					}

					reg.HPCOM = Number(valor);
					input2.setValue(reg.HPCOM);
					oEvent.getSource().getModel().refresh();
					return;
				}
				break;
			case "HNAUT":
				if (valor === "") {
					reg.HNAUT = Number(reg.HNAUT_AUX);

					if (valor === "0") {
						reg.COMENT_HNA_AUX = false;
						reg.COMENT_HNA = "";
					} else {
						reg.COMENT_HNA_AUX = true;
						reg.COMENT_HNA = "";
					}

					reg.ACCION = "M";
					oEvent.getSource().getModel().refresh();
				} else {
					if (Number(valor) < 0) {
						reg.H_TEO = "";
						input2.setValue();
						oEvent.getSource().getModel().refresh();
						MessageBox.error("No se permiten valores negativos");
						return;
					}
					if (Number(reg.CNTHE) < Number((Number(reg.HPCOM) + Number(reg.HPPAG) + Number(valor)).toFixed(2))) {
						reg.HNAUT = "";
						input2.setValue();
						oEvent.getSource().getModel().refresh();
						MessageBox.error("Distribución mayor a la Cant. HE");
						return;
					}
					if (isNaN(valor) === true) {
						reg.H_TEO = "";
						input2.setValue();
						oEvent.getSource().getModel().refresh();
						MessageBox.error("Ingrese un valor válido");
						return;
					}

					if (valor === "0") {
						reg.COMENT_HNA_AUX = false;
						reg.COMENT_HNA = "";
					} else {
						reg.COMENT_HNA_AUX = true;
						reg.COMENT_HNA = "";
					}

					reg.HNAUT = Number(valor);
					input2.setValue(Number(valor));
				}
				break;
			}

			reg.ACCION = "M";
			oEvent.getSource().getModel().refresh();
		},

		onPagarTodo: function (oEvent) {
			var selectedPath = sap.this.byId("table").getSelectedContextPaths();

			if (selectedPath.length === 0) {
				MessageBox.error("Seleccione mínimo un registro");
				return;
			}

			for (var i = 0; i < selectedPath.length; i++) {
				var reg = sap.this.byId("table").getModel().getProperty(selectedPath[i]);

				reg.HPPAG = reg.CNTHE;

			}

			sap.this.byId("table").getModel().refresh();
			sap.this.byId("table").removeSelections();
		},

		onLiveChange2: function (oEvent) {
			var campo = oEvent.getSource().data("campo");
			var valor = oEvent.getSource().getValue();
			var input2 = oEvent.getSource();

			switch (campo) {
			case "KOSTL_SOL_FILTRO":
				var path = oEvent.getSource().getBindingContext().getPath();
				var reg = oEvent.getSource().getModel().getProperty(path);
				sap.this.onBusquedaSensitiva(valor, reg.BUKRS, "", campo, input2);
				break;
			case "ID2":
				var path = oEvent.getSource().getBindingContext().getPath();
				var reg = oEvent.getSource().getModel().getProperty(path);
				sap.this.onBusquedaSensitiva(valor, reg.BUKRS, reg.PERSA, "ID", input2);
				break;
			case "ID":

				var selectedPath = sap.this.byId("table").getSelectedContextPaths();

				if (selectedPath.length === 0) {
					MessageBox.error("Seleccione mínimo un registro");
					return;
				} else {
					var reg1 = oEvent.getSource().getModel().getProperty(selectedPath[0]);
					for (var i = 0; i < selectedPath.length; i++) {
						var reg2 = oEvent.getSource().getModel().getProperty(selectedPath[i]);

						if (reg1.BUKRS !== reg2.BUKRS) {
							MessageBox.error("Seleccione registros de una misma sociedad");
							return;
						}

						if (reg1.PERSA !== reg2.PERSA) {
							MessageBox.error("Seleccione registros de una misma división");
							return;
						}

					}
				}
				sap.this.onBusquedaSensitiva(valor, reg1.BUKRS, reg1.PERSA, campo, input2);
				break;
			}

		},

		onBusquedaSensitiva: function (valor, filter1, filter2, objeto, input2) {

			var oModel = new sap.ui.model.odata.v2.ODataModel("./ERP/sap/opu/odata/sap/ZPT_PY_MATCHCODES_SRV/");

			var ofilters = [];
			var filter = new Filter({
				path: "i_value",
				operator: FilterOperator.EQ,
				value1: valor
			});
			ofilters.push(filter);

			if (filter1 !== "") {
				var filter = new Filter({
					path: "i_filter",
					operator: FilterOperator.EQ,
					value1: filter1
				});
				ofilters.push(filter);
			}

			if (filter2 !== "") {
				var filter = new Filter({
					path: "i_filter_2",
					operator: FilterOperator.EQ,
					value1: filter2
				});
				ofilters.push(filter);
			}

			var filter = new Filter({
				path: "i_object",
				operator: FilterOperator.EQ,
				value1: objeto
			});
			ofilters.push(filter);
			
			var filter = new Filter({
				path: "i_mante",
				operator: FilterOperator.EQ,
				value1: false
			});
			ofilters.push(filter);

			sap.input2 = input2;

			sap.ui.core.BusyIndicator.show();
			oModel.read("/singleMatchCodeSet", {
				filters: ofilters,
				success: function (result) {
					sap.input2.destroySuggestionItems();
					for (var j = 0; j < JSON.parse(result.results[0].et_data).length; j++) {
						sap.input2.addSuggestionItem(new ListItem({
							key: JSON.parse(result.results[0].et_data)[j].VALUE,
							text: JSON.parse(result.results[0].et_data)[j].TEXTO,
							additionalText: JSON.parse(result.results[0].et_data)[j].VALUE
						}));
					}
					sap.ui.core.BusyIndicator.hide();
				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});

		},

		onPersoButtonPressed: function (oEvent) {
			this._oTPC.openDialog();
		},

		onItemPress: function (oEvent) {
			var sPath = oEvent.getParameter("listItem").getBindingContext().getPath();
			var reg = oEvent.getParameter("listItem").getBindingContext().getProperty();

			this.getRouter().navTo("detalle", {
				servicio: reg.DNI
			});
		}
	});
});