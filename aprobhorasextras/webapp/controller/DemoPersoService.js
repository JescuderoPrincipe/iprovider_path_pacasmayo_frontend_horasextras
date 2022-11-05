sap.ui.define(['jquery.sap.global'],
	function (jQuery) {
		"use strict";

		// Very simple page-context personalization
		// persistence service, not for productive use!
		var DemoPersoService = {

			oData: {
				_persoSchemaVersion: "1.0",
				aColumns: [{
					id: "demoApp-table-APNOM",
					order: 0,
					visible: true
				}, {
					id: "demoApp-table-FECHE",
					order: 1,
					visible: true
				}, {
					id: "demoApp-table-CNTHE",
					order: 2,
					visible: true
				}, {
					id: "demoApp-table-HPPAG",
					order: 3,
					visible: true
				}, {
					id: "demoApp-table-HPCOM",
					order: 4,
					visible: true
				}, {
					id: "demoApp-table-FCOM",
					order: 5,
					visible: true
				}, {
					id: "demoApp-table-HNAUT",
					order: 6,
					visible: true
				}, {
					id: "demoApp-table-MOTIVO",
					order: 7,
					visible: true
				}, {
					id: "demoApp-table-NAME1",
					order: 8,
					visible: true
				}, {
					id: "demoApp-table-ORGTX",
					order: 9,
					visible: true
				}, {
					id: "demoApp-table-H_TEO",
					order: 10,
					visible: true
				}, {
					id: "demoApp-table-H_REA",
					order: 11,
					visible: true
				}, {
					id: "demoApp-table-KTEXT",
					order: 12,
					visible: true
				}, {
					id: "demoApp-table-KTEXT_AP",
					order: 13,
					visible: true
				}]
			},

			getPersData: function () {
				var oDeferred = new jQuery.Deferred();
				if (!this._oBundle) {
					this._oBundle = this.oData;
				}
				var oBundle = this._oBundle;
				oDeferred.resolve(oBundle);
				return oDeferred.promise();
			},

			setPersData: function (oBundle) {
				var oDeferred = new jQuery.Deferred();
				this._oBundle = oBundle;
				oDeferred.resolve();
				return oDeferred.promise();
			},

			resetPersData: function () {
				var oDeferred = new jQuery.Deferred();
				var oInitialData = {
					_persoSchemaVersion: "1.0",
					aColumns: [{
					id: "demoApp-table-APNOM",
					order: 0,
					visible: true
				}, {
					id: "demoApp-table-FECHE",
					order: 1,
					visible: true
				}, {
					id: "demoApp-table-CNTHE",
					order: 2,
					visible: true
				}, {
					id: "demoApp-table-HPPAG",
					order: 3,
					visible: true
				}, {
					id: "demoApp-table-HPCOM",
					order: 4,
					visible: true
				}, {
					id: "demoApp-table-FCOM",
					order: 5,
					visible: true
				}, {
					id: "demoApp-table-HNAUT",
					order: 6,
					visible: true
				}, {
					id: "demoApp-table-MOTIVO",
					order: 7,
					visible: true
				}, {
					id: "demoApp-table-NAME1",
					order: 8,
					visible: true
				}, {
					id: "demoApp-table-ORGTX",
					order: 9,
					visible: true
				}, {
					id: "demoApp-table-H_TEO",
					order: 10,
					visible: true
				}, {
					id: "demoApp-table-H_REA",
					order: 11,
					visible: true
				}, {
					id: "demoApp-table-KTEXT",
					order: 12,
					visible: true
				}, {
					id: "demoApp-table-KTEXT_AP",
					order: 13,
					visible: true
				}]
				};

				//set personalization
				this._oBundle = oInitialData;

				//reset personalization, i.e. display table as defined
				//		this._oBundle = null;

				oDeferred.resolve();
				return oDeferred.promise();
			},

			//this caption callback will modify the TablePersoDialog' entry for the 'Weight' column
			//to 'Weight (Important!)', but will leave all other column names as they are.
			getCaption: function (oColumn) {
				if (oColumn.getHeader() && oColumn.getHeader().getText) {
					if (oColumn.getHeader().getText() === "Weight") {
						return "Weight (Important!)";
					}
				}
				return null;
			},

			getGroup: function (oColumn) {
				if (oColumn.getId().indexOf('productCol') != -1 ||
					oColumn.getId().indexOf('supplierCol') != -1) {
					return "Primary Group";
				}
				return "Secondary Group";
			}
		};

		return DemoPersoService;

	}, /* bExport= */ true);