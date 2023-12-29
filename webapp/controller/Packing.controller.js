sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"../util/modules"
], function (Controller, JSONModel, modules) {
	"use strict";

	let objectId, SharedModel;

	return Controller.extend("project1.controller.Packing", {

		onInit: function () {
			const myRoute = this.getOwnerComponent().getRouter().getRoute("Packing");
			myRoute.attachPatternMatched(this.onMyRoutePatternMatched, this);
		},

		onMyRoutePatternMatched: function () {

			this.getOwnerComponent().getModel("sharedModel").setData({
				packing: [],
				packingInfoData: [],
				vanningMaterialData: [],
				airliftInfoData: [],
				airliftPackagingData: [],
				partImgSrc: null,
				vanningPartSrc: null
			});			

			let jsonData = new JSONModel('../model/PackingSpec.json');
			this.getView().setModel(jsonData, "packingModel");
			this.getView().setModel(new JSONModel([]), "packingTableModel");
			SharedModel = this.getOwnerComponent().getModel('sharedModel').getData();			

			modules.globalClear('refresh', this);
		},
		onSearch: function () {		
				console.log('outterThis', this);
				add(this);

				function add(_this) {
					console.log('innerThis',_this);
				}
 
			return;
			let bCheck = modules.globalCheck("Required", this);
			if (!bCheck) {
				modules.messageBox('warning', "필수값을 입력해주세요");
				return;
			}
			let packingTableModel = this.getView().getModel('packingTableModel');
			let werks = this.byId('WERKS').getSelectedKey();
			let zclifnr3 = this.byId('ZCLIFNR3').getValue().toLowerCase();
			let zcfunc = this.byId('ZCFUNC').getSelectedKey();
			let matnr = this.byId('MATNR').getValue();

			let oData = this.getView().getModel('packingModel').getData().filter(oItem => oItem.WERKS.includes(werks) && oItem.ZCLIFNR3.toLowerCase().includes(zclifnr3) && oItem.ZCFUNC.includes(zcfunc) && oItem.MATNR.includes(matnr));
			packingTableModel.setData(oData);

			for (let i = 0; i < packingTableModel.getData().length; i++) {
				let matnr = packingTableModel.getData()[i].MATNR
				let newMatnr = matnr.substr(0, 5) + '-' + matnr.substr(5);
				packingTableModel.setProperty('/' + i + '/MATNR2', newMatnr);

				switch (packingTableModel.getData()[i].ZCFUNC) {
					case 'B':
						packingTableModel.setProperty('/' + i + '/ZCFUNC2', '작성의뢰');
						break;
				}
				SharedModel.packing.push(packingTableModel.getData()[i]);
			}
			if (oData.length !== 0) {
				objectId = packingTableModel.getData()[0].ZCCRNO;
			}
		},
		onLink: function () {
			this.getOwnerComponent().getRouter().navTo("SpecInfo", {
				objectId: objectId,
			})
		},
		onRequiredCheck: function (oEvent) {
			modules.fieldCheck(oEvent.getSource());

		},
	})
})