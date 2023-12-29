sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"../util/modules"
], function (Controller, JSONModel, modules) {
	"use strict";

	let SharedModel;


	return Controller.extend("project1.controller.Airlift", {

		onInit: function () {
			const myRoute = this.getOwnerComponent().getRouter().getRoute("SpecInfo");
			myRoute.attachPatternMatched(this.onMyRoutePatternMatched, this);
		},
		onMyRoutePatternMatched: function () {
			let jsonData1 = new JSONModel('../model/Airlift.json');
			this.getView().setModel(jsonData1, "airliftModel");

			let jsonData2 = new JSONModel('../model/PackingType.json');
			this.getView().setModel(jsonData2, "packingTypeModel");

			SharedModel = this.getOwnerComponent().getModel('sharedModel').getData();
			let oData1 = [
				{
					"MATNR": "21810-25020",
					"size": "Q 자재크기-소물",
					"packagingType": "S 중포장",
					"packagingHow": "",
					"packagingDetail": "",
					"stuffingQty": 10,
					"packagingQty": "",
					"gongsu": "",
					"formula": "",
					"visible": true
				},
				{
					"MATNR": "21810-25020",
					"size": "Q 자재크기-소물",
					"packagingType": "S 중포장",
					"packagingHow": "",
					"packagingDetail": "",
					"stuffingQty": 10,
					"packagingQty": "",
					"gongsu": "",
					"formula": "",
					"visible": true
				}
			]
			for (let i = 0; i < oData1.length; i++) {
				SharedModel.airliftInfoData.push(oData1[i]);
			}
			let oData2 = {
				"packagingType": "S 중포장",
				"packagingHow": "S37 C/BOX內 소포장 적입 / 보호캡 적용(1)",
				"packagingDetail": "S3701 소BOX에 개별 포장 후 중BOX 포장(1)",
				"packagingCode": "SG",
				"packagingCodeName": "방청유",
				"time": "0.0",
				"gongsu": "345.00",
				"formula": "(SA+(SB+SE)*EA+SH)*CA"
			}
			SharedModel.airliftPackagingData.push(oData2);
		},
		/////////////////////////////////////////////////////////// 수정 위 테이블 요소 접근해서 indices로 선택된 로우 가져와서 값 입력

		onPackingTypeSelect: function (oEvent) {
			let aSelect = this.byId('airliftTable').getSelectedIndices();
			let packingTypeModel = this.getView().getModel('packingTypeModel');
			let airliftModel = this.getView().getModel('airliftModel');
			let sPath = oEvent.getParameters().rowIndex;
			let gongsu = packingTypeModel.getData()[sPath].gongsu
			let formula = packingTypeModel.getData()[sPath].formula

			for (let i = 0; i < aSelect.length; i++) {
				let index = aSelect[i];
				airliftModel.setProperty('/' + index + '/gongsu', gongsu);
				airliftModel.setProperty('/' + index + '/formula', formula);
			}

			airliftModel.refresh();

			oEvent.getSource().setSelectedIndex(-1);
		},
		onSave: function () {
			let airliftModel = this.getView().getModel('airliftModel');
			let aSelect = this.byId('airliftTable').getSelectedIndices();

			if (aSelect.length === 0) {
				modules.messageBox('alert', '입력할 데이터를 선택해주세요', '선택데이터없음');
			}

			for (let i = 0; i < aSelect.length; i++) {

				if (airliftModel.getData()[aSelect[i]].packagingQty <= 0 || airliftModel.getData()[aSelect[i]].packagingQty === '') {
					modules.messageBox('alert', '중포장수를 입력해주세요');
					return;
				}
				if (airliftModel.getData()[aSelect[i]].gongsu === '' || !airliftModel.getData()[aSelect[i]].gongsu) {
					modules.messageBox('alert', '포장스펙을 선택해주세요');
				}
				airliftModel.getData()[i]

				const url = "/packing/AirliftInfo"
				console.log('SaveUrl', url);
				console.log('oTemp', airliftModel.getData()[i]);
			}
		},
		onEdit: function () {
			let airliftModel = this.getView().getModel('airliftModel');
			let aSelect = this.byId('airliftTable').getSelectedIndices();

			if (aSelect.length === 0) {
				modules.messageBox('alert', '입력할 데이터를 선택해주세요', '선택데이터없음');
			}

			for (let i = 0; i < aSelect.length; i++) {

				if (airliftModel.getData()[aSelect[i]].packagingQty <= 0 || airliftModel.getData()[aSelect[i]].packagingQty === '') {
					modules.messageBox('alert', '중포장수를 입력해주세요');
					return;
				}
				if (airliftModel.getData()[aSelect[i]].gongsu === '' || !airliftModel.getData()[aSelect[i]].gongsu) {
					modules.messageBox('alert', '포장스펙을 선택해주세요');
				}

				airliftModel.getData()[i]

				const url = "/packing/AirliftInfo"
				console.log('EditUrl', url);
				console.log('oTemp', airliftModel.getData()[i]);
			}
		},
	})
})