sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/ListItem"
], function (Controller, MessageBox, Fragment, Filter, FilterOperator, ListItem) {
	"use strict";

	return Controller.extend("repo.Horas.Extras.controller.Home", {
		onInit: function () {
			var oModel2 = new sap.ui.model.odata.v2.ODataModel("./ERP/sap/opu/odata/sap/ZREPORTEHORASEXTRAS_CDS/");

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

			this.byId("app").setModel(oModel2);
			sap.this = this;
		},
		
		onInitialized: function () {
			var smartFilterBar = sap.this.getView().byId("smartFilterBar"); // get the filter bar instance
			smartFilterBar._getFilterItemByName("$Parameter.p_pernr").setMandatory(false);
			smartFilterBar._getFilterItemByName("$Parameter.p_pernr").setVisibleInFilterBar(false);
			smartFilterBar._getFilterItemByName("$Parameter.p_pernr").setVisibleInAdvancedArea(false);
			smartFilterBar._getFilterItemByName("$Parameter.p_pernr").setVisible(false);
			//var field = smartFilterBar.getControlByKey("apr_gest");
			//field.setValue(sap.this.user.employee_number);
			//field.setEditable(false);
		},

		onBeforeRebindTable: function (oEvent) {
			/*var oParameters = oEvent.getParameter("bindingParams");
			oParameters.filters.push(new sap.ui.model.Filter({
				path: "apr_gest",
				operator: FilterOperator.EQ,
				value1: sap.this.user.employee_number
			}));*/

			var oSmartTable = oEvent.getSource();
			//var oSmartFilterBar = this.byId(oSmartTable.getSmartFilterId());
			//var path = oSmartFilterBar.getParameterBindingPath();
			//oSmartTable.setTableBindingPath(path);
			//oSmartTable.setTableBindingPath("/zreporteHorasExtras(p_pernr='" + "01012677" + "')/Set");
			oSmartTable.setTableBindingPath("/zreporteHorasExtras(p_pernr='" + sap.this.user.employee_number + "')/Set");

		},

		onReinicializar: function () {
			var oTable = this.byId("LineItemsSmartTable").getTable();
			var indices = oTable.getSelectedIndices();

			//this.byId("LineItemsSmartTable").getTable().getModel().getProperty()
			
			if(indices.length === 0){
				MessageBox.error("Seleccionar Solicitudes");
					return;
			}

			var oData = [];
			for (var i = 0; i < indices.length; i++) {
				var path = oTable.getContextByIndex(indices[i]).getPath();
				var reg = oTable.getModel().getProperty(path);
				oData.push(reg);

				if (reg.estado !== 'FINALIZADO') {
					MessageBox.error("Seleccionar Solicitudes en estado FINALIZADO");
					return;
				}

			}

			var data = {};

			data.ET_DATA = JSON.stringify(oData);
			oTable.clearSelection();

			var oModel2 = new sap.ui.model.odata.v2.ODataModel("./ERP/sap/opu/odata/sap/ZPT_PY_SOLICITUDES_SRV/");

			sap.ui.core.BusyIndicator.show();
			oModel2.create("/reinicializationSet", data, {
				success: function (result) {
					sap.ui.core.BusyIndicator.hide();
					sap.this.byId("app").getModel().refresh();
					MessageBox.success("Se Reinició con exito!");
				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error("Error al Reiniciar");
				}
			});

		},

		onPopTransferir: function (oEvent) {

			var selectedPath = sap.this.byId("LineItemsSmartTable").getTable().getSelectedIndices();

			if (selectedPath.length === 0) {
				MessageBox.error("Seleccione mínimo un registro");
				return;
			}

			for (var i = 0; i < selectedPath.length; i++) {
				var reg = sap.this.byId("LineItemsSmartTable").getTable().getContextByIndex(selectedPath[i]).getProperty();

				if (reg.estado !== "EN APROBACIÓN") {
					MessageBox.error("Seleccionar Solicitudes en estado EN APROBACIÓN");
					return;
				}
			}

			var oView = this.getView();

			// create dialog lazily
			if (!this.byId("idTransferencia")) {
				// load asynchronous XML fragment
				Fragment.load({
					id: oView.getId(),
					name: "repo.Horas.Extras.view.Transferencia",
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

			var selectedPath = sap.this.byId("LineItemsSmartTable").getTable().getSelectedIndices();
			var regis = [];
			for (var i = 0; i < selectedPath.length; i++) {
				var reg = sap.this.byId("LineItemsSmartTable").getTable().getContextByIndex(selectedPath[i]).getProperty();

				/*if (reg.estado !== "EN APROBACIÓN") {
					MessageBox.error("Seleccionar Solicitudes en estado EN APROBACIÓN");
					return;
				}*/

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
					sap.this.byId("app").getModel().refresh();
					MessageBox.success("Se transfirió con éxito!");
				},
				error: function (err) {
					var mensaje = JSON.parse(err.responseText);
					sap.ui.core.BusyIndicator.hide();
					if (mensaje.error.message.value) {
						MessageBox.error(mensaje.error.message.value);
					} else {
						MessageBox.error("Error al transferir");
					}

				}
			});

		},

		onCerrar: function () {
			this.byId("idTransferencia").close();
			this.byId("idTransferencia").destroy();
		},

		onLiveChange: function (oEvent) {

			var campo = oEvent.getSource().data("campo");
			var valor = oEvent.getSource().getValue();
			var input2 = oEvent.getSource();

			switch (campo) {
			case "PERNR":
				sap.this.onBusquedaSensitiva(valor, "", "", campo, input2);
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

		}

	});
});