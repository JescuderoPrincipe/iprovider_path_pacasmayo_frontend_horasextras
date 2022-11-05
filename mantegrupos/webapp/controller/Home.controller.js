sap.ui.define([
	"ManteGrupos/mantegrupos/controller/BaseController",
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
	"sap/ui/core/ListItem"
], function (BaseController, Controller, Table, Label, Input, Button, Column, Row, TextView, JSONModel, ListBase, Filter, FilterOperator,
	FilterGroupItem,
	FilterBar, MessageBox, ComboBox, Item, CheckBox, ListItem) {
	"use strict";
	var oTable = new Table();
	var tabla = "ZTPT_GRP_WF";
	return BaseController.extend("ManteGrupos.mantegrupos.controller.Home", {
		onInit: function () {
			var oRouter = this.getRouter();
			oRouter.getRoute("Home").attachMatched(this._attachMatched, this);
		},

		_attachMatched: function () {
			
			var fecha = new Date();

			if (localStorage.fecha4) {
				var diferencia = new Date() - new Date(localStorage.fecha4);
				diferencia = diferencia / 1000;

				if (diferencia > 3) {
					location.reload();
					localStorage.removeItem("fecha4");
				}

			} else {
				localStorage.setItem("fecha4", fecha);
			}
			
			var thes = this;
			sap.this = this;
			var ofilters = [];
			var filter = new Filter({
				path: "Tabname",
				operator: FilterOperator.EQ,
				value1: tabla
			});
			ofilters.push(filter);

			var oModel2 = new sap.ui.model.odata.v2.ODataModel("./ERP/sap/opu/odata/sap/ZPT_PY_MANTTO_SRV/");
			sap.ui.core.BusyIndicator.show();
			oModel2.read("/parametersSet", {
				filters: ofilters,
				success: function (result) {
					var oModel = new sap.ui.model.json.JSONModel(result.results);
					//thes.createFilter(result.results);
					thes.createTable(result.results);
					oTable.setModel(oModel);
					thes.onSearch();
					sap.ui.core.BusyIndicator.hide();
				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error("Error al iniciar la aplicación");
				}
			});

			//this.onMatchCode("T001", "BUKRS", "BUTXT", "bsBUKRS");
			//this.onMatchCode("T500P", "PERSA", "NAME1", "bsPERSA");
		},

		onMatchCode: function (Tabla, Campo1, Campo2, Id) {

			var oModel = new sap.ui.model.odata.v2.ODataModel("./ERP/sap/opu/odata/sap/ZPT_PY_MATCHCODES_SRV/");

			var ofilters = [];
			var filter = new Filter({
				path: "i_tabname",
				operator: FilterOperator.EQ,
				value1: Tabla
			});
			ofilters.push(filter);

			var filter = new Filter({
				path: "i_fieldname",
				operator: FilterOperator.EQ,
				value1: Campo1
			});
			ofilters.push(filter);

			var filter = new Filter({
				path: "i_fieldnametxt",
				operator: FilterOperator.EQ,
				value1: Campo2
			});
			ofilters.push(filter);
			
			var filter = new Filter({
				path: "i_mante",
				operator: FilterOperator.EQ,
				value1: true
			});
			ofilters.push(filter);

			sap.ui.core.BusyIndicator.show();
			oModel.read("/singleMatchCodeSet", {
				filters: ofilters,
				success: function (result) {
					var data = JSON.parse(result.results[0].et_data);
					var oModel2 = new JSONModel(data);
					oModel2.setSizeLimit(data.length);
					sap.this.getView().setModel(oModel2, Id);
					sap.ui.core.BusyIndicator.hide();
				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error("Error en ayuda de busqueda");
				}
			});
		},

		onBusquedaSensitiva: function (valor, filter1, filter2, objeto, modelo, path1, input2) {

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
				value1: true
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
							text: JSON.parse(result.results[0].et_data)[j].VALUE,
							additionalText: JSON.parse(result.results[0].et_data)[j].TEXTO
						}));
					}
					modelo.refresh();
					sap.ui.core.BusyIndicator.hide();
				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
					//MessageBox.error("Error en busqueda sensitiva");
				}
			});

		},

		onSearch: function () {
			var oModel2 = new sap.ui.model.odata.v2.ODataModel("./ERP/sap/opu/odata/sap/ZPT_PY_MANTTO_SRV/");

			var ofilters = [];
			var filter = new Filter({
				path: "i_tabname",
				operator: FilterOperator.EQ,
				value1: tabla
			});
			ofilters.push(filter);

			var filter = new Filter({
				path: "it_filters",
				operator: FilterOperator.EQ,
				value1: ""
			});
			ofilters.push(filter);

			oModel2.read("/listSet", {
				filters: ofilters,
				success: function (result) {

					var data = JSON.parse(result.results[0].et_listData);

					for (var i = 0; i < data.length; i++) {
						data[i].ID = String(data[i].ID);
					}

					var oModel = new sap.ui.model.json.JSONModel(data);
					oTable.setModel(oModel);
					//MessageBox.success("Se actualizó con éxito!");
				},
				error: function (err) {
					MessageBox.error("Error al actualizar");
				}
			});

		},

		createFilter: function (result) {

			var filterBar = new FilterBar({
				search: this.onSearch
			});

			for (var i = 0; i < result.length; i++) {
				var filterGroupItem = new FilterGroupItem({
					groupName: "__$INTERNAL$",
					name: i,
					label: result[i][Object.keys(result[i])[4]],
					visibleInFilterBar: true
				});

				var comboBox = new sap.m.ComboBox();
				//comboBox.bindItems("/");

				//var oItemTemplate = new sap.ui.core.Item({
				//	text: "{" + result[i][Object.keys(result[i])[2]] + ">NAME}"
				//});

				//var item = result[i][Object.keys(result[i])[2]] + ">/";

				//comboBox.bindItems(item, oItemTemplate);

				filterGroupItem.setControl(comboBox);
				filterBar.addFilterGroupItem(filterGroupItem);

			}
			this.byId("page").addContent(filterBar);
		},

		createTable: function (result) {

			var button = new sap.m.Button({
				icon: "sap-icon://add",
				press: this.onCreate
			});
			var button2 = new sap.m.Button({
				icon: "sap-icon://delete",
				press: this.onDelete
			});
			var button3 = new sap.m.Button({
				icon: "sap-icon://save",
				press: this.onSave
			});
			var button4 = new sap.m.Button({
				icon: "sap-icon://refresh",
				press: this.onSearch
			});
			var button5 = new sap.m.Button({
				icon: "sap-icon://complete",
				press: this.onChange
			});

			var toolbarSpacer = new sap.m.ToolbarSpacer();

			var overflowToolbar = new sap.m.OverflowToolbar();

			overflowToolbar.addContent(toolbarSpacer);
			overflowToolbar.addContent(button);
			overflowToolbar.addContent(button2);
			overflowToolbar.addContent(button3);
			overflowToolbar.addContent(button4);
			overflowToolbar.addContent(button5);

			oTable.addExtension(overflowToolbar);

			for (var i = 0; i < result.length; i++) {

				if (result[i].Fieldname === "UZEIT" || result[i].Fieldname === "DATUM" || result[i].Fieldname === "ACCION" ) {

				} else {
					oTable.addColumn(new Column({
						filterProperty: result[i][Object.keys(result[i])[2]],
						sortProperty: result[i][Object.keys(result[i])[2]],
						autoResizable: true,
						resizable: true,
						label: new Label({
							text: result[i][Object.keys(result[i])[4]]
						}),
						template: this.onTemplate(result, i)
					}));
				}

			}

			oTable.bindRows("/");

			this.getView().addDependent(oTable);
			this.byId("page").addContent(oTable);

		},

		onTemplate: function (result, i) {
			switch (result[i].Fieldname) {
			case "BUKRS":
			case "PERSA":

				var input = new Input({
					width: "100%",
					value: "{" + result[i][Object.keys(result[i])[2]] + "}",
					type: sap.m.InputType.Text,
					showSuggestion: true,
					liveChange: this.onLiveChange,
					maxSuggestionWidth: "100%",
					suggestionItemSelected: this.suggestionItemSelected,
					//suggestionItems: "{bs" + result[i][Object.keys(result[i])[2]] + ">/}",
					editable: "{= ${ACCION} === 'N' || " + result[i][Object.keys(result[i])[3]] + " === false || ${" + result[i][Object.keys(result[i])[2]] + "} === '' || ${" + result[i][Object.keys(result[i])[
						2]] + "} === " + 0 + " ? true : false }"
				});

				var oDataTemplate = new sap.ui.core.CustomData({
					key: "campo",
					value: result[i][Object.keys(result[i])[2]]
				});

				input.addCustomData(oDataTemplate);

				return input;
			case "GRP_KEY":
				return new Input({
					width: "100%",
					value: "{" + result[i][Object.keys(result[i])[2]] + "}",
					type: sap.m.InputType.Text,
					maxLength: 10,
					editable: "{= ${ACCION} === 'N' || ${" + result[i][Object.keys(result[i])[2]] + "} === '' || ${" + result[i][Object.keys(result[i])[
						2]] + "} === " + 0 + " ? true : false }",
					liveChange: this.onLiveChange2
				});
			case "GRP_TXT":
				return new Input({
					width: "100%",
					value: "{" + result[i][Object.keys(result[i])[2]] + "}",
					type: sap.m.InputType.Text,
					editable: true,
					maxLength: 40,
					liveChange: this.onLiveChange2
				});
			case "STATUS":
				var checkBox = new CheckBox({
					selected: "{= ${" + result[i][Object.keys(result[i])[2]] + "} === 'X'  ? true : false }",
					select: this.onSelectStatus
				});
				return checkBox;
			default:
				return new Input({
					width: "100%",
					value: "{" + result[i][Object.keys(result[i])[2]] + "}",
					type: sap.m.InputType.Text,
					editable: false,
					liveChange: this.onLiveChange2
				});
			}
		},

		suggestionItemSelected: function (oEvent) {
			var path = oEvent.getSource().getBindingContext().getPath();
			var campo = oEvent.getSource().data("campo");
			var reg = oEvent.getSource().getModel().getProperty(path);

			switch (oEvent.getSource().data("campo")) {
			case "BUKRS":
				oEvent.getSource().getModel().getProperty(path).BUTXT = oEvent.getParameter('selectedItem').getAdditionalText();
				oEvent.getSource().getModel().refresh();
				break;
			case "PERSA":
				oEvent.getSource().getModel().getProperty(path).NAME1 = oEvent.getParameter('selectedItem').getAdditionalText();
				oEvent.getSource().getModel().refresh();
				break;
			case "BNAME":
				oEvent.getSource().getModel().getProperty(path).NAME_TEXT = oEvent.getParameter('selectedItem').getAdditionalText();
				oEvent.getSource().getModel().refresh();
				break;
			case "GRP_KEY":
				oEvent.getSource().getModel().getProperty(path).GRP_TXT = oEvent.getParameter('selectedItem').getAdditionalText();
				oEvent.getSource().getModel().refresh();
				break;
			case "PERNR":
				oEvent.getSource().getModel().getProperty(path).VORNA = oEvent.getParameter('selectedItem').getAdditionalText();
				oEvent.getSource().getModel().refresh();
				break;
			}

		},
		
		onLiveChange2: function (oEvent) {
			var path = oEvent.getSource().getBindingContext().getPath();
			if(oEvent.getSource().getBindingContext().getProperty(path).ACCION !== "N"){
				oEvent.getSource().getBindingContext().getProperty(path).ACCION = "M";
			}
		},

		onLiveChange: function (oEvent) {
			/*	var path = oEvent.getSource().getBindingContext().getPath();
				var campo = oEvent.getSource().data("campo");
				var valor = oEvent.getParameters().selectedItem.getKey();
				//oEvent.getSource().getModel().getProperty(path)[campo];
				oEvent.getSource().getModel().setProperty(path + "/" + campo, valor);
				this.getModel().setProperty(path + "/bssBUKRS", oBukrs.getData())*/

			var campo = oEvent.getSource().data("campo");
			var path = oEvent.getSource().getBindingContext().getPath();
			var valor = oEvent.getSource().getValue();
			
			if(oEvent.getSource().getBindingContext().getProperty(path).ACCION !== "N"){
				oEvent.getSource().getBindingContext().getProperty(path).ACCION = "M";
			}
			
			switch (campo) {
			case "BUKRS":
				sap.this.onBusquedaSensitiva(valor, "", "", "BUKRS_GH", this.getModel(), path, this);
				break;
			case "PERSA":
				sap.this.onBusquedaSensitiva(valor, oEvent.getSource().getModel().getProperty(path).BUKRS, "", "PERSA_GH", this.getModel(), path, this);
				break;
			case "BNAME":
				sap.this.onBusquedaSensitiva(valor, "", "", campo, this.getModel(), path, this);
				break;
			case "GRP_KEY":
				sap.this.onBusquedaSensitiva(valor, "", "", campo, this.getModel(), path, this);
				break;
			case "PERNR":
				sap.this.onBusquedaSensitiva(valor, "", "", campo, this.getModel(), path, this);
				break;
			}

		},

		onSelectionChange: function (oEvent) {
			/*	var path = oEvent.getSource().getBindingContext().getPath();
				var campo = oEvent.getSource().data("campo");
				var valor = oEvent.getParameters().selectedItem.getKey();
				//oEvent.getSource().getModel().getProperty(path)[campo];
				oEvent.getSource().getModel().setProperty(path + "/" + campo, valor);
				this.getModel().setProperty(path + "/bssBUKRS", oBukrs.getData());*/
		},

		onSelectStatus: function (oEvent) {
			var path = oEvent.getSource().getBindingContext().getPath();
			var check = oEvent.getSource().getSelected();
			oEvent.getSource().getModel().getProperty(path).STATUS = check;
			
			if(oEvent.getSource().getModel().getProperty(path).ACCION !== "N"){
				oEvent.getSource().getModel().getProperty(path).ACCION = "M";
			}
			
		},

		onChange: function () {
			var indices = oTable.getSelectedIndices();

			if (indices.length === 0) {
				MessageBox.warning(
					"Seleccione un registro"
				);
				return;
			}

			for (var i = 0; i < indices.length; i++) {
				var index = Number(oTable.getContextByIndex(indices[i]).getPath().substr(1));
				if (oTable.getModel().getData()[index].STATUS == "X") {
					oTable.getModel().getData()[index].STATUS = "";
				} else {
					oTable.getModel().getData()[index].STATUS = "X";
				}
			}
			oTable.getModel().refresh();
			oTable.clearSelection();
		},

		onSave: function () {
			var thes = this;
			var oModel2 = new sap.ui.model.odata.v2.ODataModel("./ERP/sap/opu/odata/sap/ZPT_PY_MANTTO_SRV/");

			var oData = {};

			oData.i_tabname = tabla;
			oData.it_data = JSON.stringify(oTable.getModel().getData());
			sap.ui.core.BusyIndicator.show();
			oModel2.create("/dataEditSet", oData, {
				success: function (result) {

					MessageBox.success("Se guardó con éxito!");
					sap.this.onSearch();
					sap.ui.core.BusyIndicator.hide();

				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error(JSON.parse(err.responseText).error.message.value);
				}
			});

		},

		onCreate: function () {
			var data = oTable.getModel().getData();
			var oro = Object.keys(data[0]).length;

			var reg = {};
			for (var i = 0; i < oro; i++) {

				reg[Object.keys(data[0])[i]] = '';

				if (Object.keys(data[0])[i] == "STATUS") {
					reg[Object.keys(data[0])[i]] = 'X';
				}

			}

			reg.NEW = true;
			reg.ACCION = "N";

			data.push(reg);
			/*	{
						'1' : '',
						'2' : '',
						'3' : '',
						'4' : '',
						'5' : ''
					};*/

			oTable.getModel().refresh();

		},
		onDelete: function (oEvent) {

			var indices = oTable.getSelectedIndices();

			if (indices.length == 0) {
				MessageBox.warning(
					"Seleccione un registro"
				);
				return;
			}

			var regDel = [];
			var thes = this;

			for (var i = 0; i < indices.length; i++) {
				var index = Number(oTable.getContextByIndex(indices[i]).getPath().substr(1));
				regDel.push(oTable.getModel().getData()[index]);
			}

			oTable.getModel().refresh();
			oTable.clearSelection();

			var oModel2 = new sap.ui.model.odata.v2.ODataModel("./ERP/sap/opu/odata/sap/ZPT_PY_MANTTO_SRV/");

			var ofilters = [];
			var filter = new Filter({
				path: "i_tabname",
				operator: FilterOperator.EQ,
				value1: tabla
			});
			ofilters.push(filter);

			var filter = new Filter({
				path: "it_data",
				operator: FilterOperator.EQ,
				value1: JSON.stringify(regDel)
			});
			ofilters.push(filter);

			sap.ui.core.BusyIndicator.show();
			oModel2.read("/dataEditSet", {
				filters: ofilters,
				success: function (result) {
					MessageBox.success("Se eliminó con Éxito!");
					sap.ui.core.BusyIndicator.hide();
					sap.this.onSearch();
				},
				error: function (err) {
					sap.this.onSearch();
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error(JSON.parse(err.responseText).error.message.value);
				}
			});
		}
	});
});