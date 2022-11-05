sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/ListItem"
], function (Controller, JSONModel, MessageBox, Fragment, Filter, FilterOperator, ListItem) {
	"use strict";

	var oModel2 = new sap.ui.model.odata.v2.ODataModel("./ERP/sap/opu/odata/sap/ZRPT_HE_COLAB_CDS/");

	return Controller.extend("ReporteTrabjador.reportetrabajador.controller.Home", {
		onInit: function () {
			sap.this = this;

			var oSmartTable = this.getView().byId("LineItemsSmartTable");
			oSmartTable.applyVariant({
				sort: {
					sortItems: [{
						columnKey: "feche",
						operation: "Ascending"
					}, {
						columnKey: "solhe",
						operation: "Ascending"
					}]
				}
			});

			/*$.ajax({
				url: "/services/userapi/attributes",
				async: false,
				success: function (data, status, xhr) {
					//var oViewModel = new JSONModel(data);
					//sap.this.getView().setModel(oViewModel,"view");

					var smartFilterBar = sap.this.getView().byId("smartFilterBar"); // get the filter bar instance
					var field = smartFilterBar.getControlByKey("pernr");
					field.setValue(data.employee_number);

				},
				error: function (status, xhr) {}
			});*/
			this.byId("app").setModel(oModel2);
		},

		ondataReceived2: function () {

			var lengthData = sap.this.byId("LineItemsSmartTable").getTable()._iBindingLength;
			var data = [];
			for (var i = 0; i < lengthData; i++) {
				var path = sap.this.byId("LineItemsSmartTable").getTable().getContextByIndex(i).getPath();
				var reg = sap.this.byId("LineItemsSmartTable").getTable().getModel().getProperty(path);

				delete reg.__metadata;
				data.push(reg);
			}

		},

		ondataReceived: function (oEvent) {
			var oModel = new sap.ui.model.odata.v2.ODataModel("./ERP/sap/opu/odata/sap/ZPT_PY_SOLICITUD_COLABORADOR_SRV/");
			var oFilters = [];

			var filter = new Filter({
				path: 'pernr',
				operator: FilterOperator.EQ,
				value1: sap.this.employee_number
			})
			oFilters.push(filter);

			var filter = new Filter({
				path: 'visualizado',
				operator: FilterOperator.EQ,
				value1: 'X'
			})
			oFilters.push(filter);

			var lengthData = sap.this.byId("LineItemsSmartTable").getTable()._iBindingLength;
			var data = [];
			for (var i = 0; i < lengthData; i++) {
				var path = sap.this.byId("LineItemsSmartTable").getTable().getContextByIndex(i).getPath();
				var reg = sap.this.byId("LineItemsSmartTable").getTable().getModel().getProperty(path);

				delete reg.__metadata;
				data.push(reg);
			}

			var filter = new Filter({
				path: 'listado',
				operator: FilterOperator.EQ,
				value1: JSON.stringify(data)
			});
			oFilters.push(filter);

			oModel.read("/visualizacionSet", {
				filters: oFilters,
				success: function (result) {

				},
				error: function (err) {

				}
			});
		},

		onSearch2: function (oEvent) {

			var oFilters2 = [];
			var filter = new Filter({
				path: 'pernr',
				operator: FilterOperator.EQ,
				value1: sap.this.employee_number
			});
			oFilters2.push(filter);

			oModel2.read("/ZRPT_HE_COLAB", {
				filters: oFilters2,
				success: function (result) {

					var oModel = new sap.ui.model.odata.v2.ODataModel("./ERP/sap/opu/odata/sap/ZPT_PY_SOLICITUD_COLABORADOR_SRV/");
					var oFilters = [];

					var filter = new Filter({
						path: 'pernr',
						operator: FilterOperator.EQ,
						value1: sap.this.employee_number
					})
					oFilters.push(filter);

					var filter = new Filter({
						path: 'visualizado',
						operator: FilterOperator.EQ,
						value1: 'X'
					})
					oFilters.push(filter);

					var lengthData = sap.this.byId("LineItemsSmartTable").getTable()._iBindingLength;
					var data = [];
					for (var i = 0; i < result.results.length; i++) {
						var reg = result.results[i];
						delete reg.__metadata;
						data.push(reg);
					}

					var filter = new Filter({
						path: 'listado',
						operator: FilterOperator.EQ,
						value1: JSON.stringify(data)
					});
					oFilters.push(filter);

					oModel.read("/visualizacionSet", {
						filters: oFilters,
						success: function (result) {

						},
						error: function (err) {

						}
					});

				},
				error: function (err) {

				}
			});

		},

		onInitialized: function () {

			$.ajax({
				//url: "/services/userapi/attributes",
                url: "./IPROVIDER_BACKEND/api/" + "current-session/logged-user",
				async: false,
				success: function (data, status, xhr) {
					//var oViewModel = new JSONModel(data);
					//sap.this.getView().setModel(oViewModel,"view");
					//sap.this.employee_number = data.employee_number;
					sap.this.employee_number = Number("01012679");
					var smartFilterBar = sap.this.getView().byId("smartFilterBar"); // get the filter bar instance
					var field = smartFilterBar.getControlByKey("pernr");
					field.setValue(data.employee_number);
					field.setEditable(false);

					//sap.this.onSearch2();

				},
				error: function (status, xhr) {}
			});
		},

		onPopTransferir: function (oEvent) {

			var selectedPath = sap.this.byId("LineItemsSmartTable").getSelectedContextPaths();

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
					name: "Aprob.Horas.Extras.AprobHorasExtras.view.Transferencia",
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

			var selectedPath = sap.this.byId("LineItemsSmartTable").getSelectedContextPaths();
			var regis = [];
			for (var i = 0; i < selectedPath.length; i++) {
				var reg = sap.this.byId("LineItemsSmartTable").getModel().getProperty(selectedPath[i]);
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
		}

	});
});