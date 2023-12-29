sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/export/Spreadsheet",
	"sap/m/PDFViewer",
	"sap/m/MessageBox",
	"sap/base/security/URLWhitelist",
	"../util/modules"
], function (Controller, JSONModel, Filter, FilterOperator, Spreadsheet, PDFViewer, MessageBox, URLWhitelist, modules) {
	"use strict";

	let _this;
	let VendorId;
	let bExecute;
	let bDetail;
	let onSearch;

	return Controller.extend("project1.controller.SupplierNew", {

		onInit: function () {
			_this = this;
			const myRoute = this.getOwnerComponent().getRouter().getRoute("SupplierNew");
			myRoute.attachPatternMatched(this.onMyRoutePatternMatched, this);
		},

		onMyRoutePatternMatched: function () {
			bExecute = false;
			bDetail = false;

			this.getView().setModel(new JSONModel({ text: false }), 'textModel')
			this.getView().setModel(new JSONModel({ visible: true }), 'visibleModel')

			let jsonData = new JSONModel('../model/Supplier.json');
			this.getView().setModel(jsonData, "supplierModel");			

			let oData = [
				{
					Vendor: "HCYU",
					Plant: "HK11",
					Material: "93480D2500",
					Gate: "gate1"
				},
				{
					Vendor: "HB07",
					Plant: "HVJ7",
					Material: "86350-I7010SCR",
					Gate: "gate2"
				}
			]
			this.getView().setModel(new JSONModel(oData), 'executeConditionModel');
			this.getView().setModel(new JSONModel([]), 'materialInfoModel');
			this.getView().setModel(new JSONModel([]), 'deliveryInfoModel');
			this.getView().setModel(new JSONModel([]), 'boxLabelInfoModel');
			this.getView().setModel(new JSONModel([]), 'excelUploadModel');
			this.getView().setModel(new JSONModel({}), 'textValueModel');

			this.onRefresh();
		},

		onExecute: function () {

			this.refreshOnlyInfo();
			onSearch = false;		

			let bCheck = modules.globalCheck("Required", this);
			// let sContent = this.byId("contentForCreate").getValue();

			if (!bCheck) {
				modules.messageBox('warning', '값을 모두 선택해주세요')
				return;
			}			

			onSearch = true;
			this.getView().getModel('materialInfoModel').setData([]);
			this.getView().getModel('deliveryInfoModel').setData([]);
			this.getView().getModel('boxLabelInfoModel').setData([]);


			let deliveryType = this.byId('DeliveryType').getSelectedButton().getText();
			let vendor = this.byId('ExecuteVendor').getValue();
			let plant = this.byId('ExecutePlant').getValue();
			let material = this.byId('ExecuteMaterial').getValue();
			let supplierModel = this.getView().getModel('supplierModel');

			let filterData = supplierModel.getData().filter(oItem => oItem.DeliveryType == deliveryType && oItem.Vendor == vendor && oItem.Plant == plant && oItem.Material == material);

			let materialInfoModel = this.getView().getModel('materialInfoModel');
			if (filterData.length !== 0) {
				for (let i = 0; i < filterData.length; i++) {
					materialInfoModel.getData().push(filterData[i])
				}
			} else {
				materialInfoModel.setData([]);
			}
			materialInfoModel.refresh();

			if (deliveryType === 'Delivery Schedule') {
				this.getView().getModel('visibleModel').setProperty('/visible', true)
				this.getView().getModel('visibleModel').refresh();
			} else if (deliveryType === 'JIT Call') {
				this.getView().getModel('visibleModel').setProperty('/visible', false)
				this.getView().getModel('visibleModel').refresh();
			}


		},

		onVendor: async function (oEvent) {
			oEvent.getSource().getId().includes("General");
			// this.vendorId = oEvent.getSource().getId().includes("Execute");
			VendorId = oEvent.getSource().getId().includes("Execute");

			await modules.openDialog(_this, "project1.view.fragment.vendor", "VendorDialog");
		},

		onVendorSearch: function () {
			let sSearchText = this.byId("VendorSearch").getValue();
			let oFilters = new Filter({
				filters: [
					new Filter("Vendor", FilterOperator.Contains, sSearchText),
				],
				and: false,
			});
			this.byId("VendorTable").getBinding("items").filter(oFilters);
		},

		onVendorCancel: function () {
			modules.closeDialog(this, "VendorDialog");
		},

		onVendorSave: function () {

			if (this.byId("VendorTable").getSelectedItem() === null) {
				modules.messageBox('alert', '값을 선택해주세요');
				return;
			}
			this.byId('ExecuteVendor').setValueState('None');
			this.byId('GeneralVendor').setValueState('None');

			let oItem = this.byId('VendorTable').getSelectedItem();
			let selectedText = oItem.mAggregations.cells[0].getText();

			modules.closeDialog(this, "VendorDialog");

			if (VendorId) {
				this.byId('ExecuteVendor').setValue(selectedText);
			} else {
				this.byId('GeneralVendor').setValue(selectedText);
			}
		},

		onPlant: async function () {
			await modules.openDialog(_this, "project1.view.fragment.plant", "PlantDialog");
		},

		onPlantSearch: function () {
			let sSearchText = this.byId("PlantSearch").getValue();
			let oFilters = new Filter({
				filters: [
					new Filter("Plant", FilterOperator.Contains, sSearchText),
				],
				and: false,
			});
			this.byId("PlantTable").getBinding("items").filter(oFilters);
		},

		onPlantCancel: function () {
			modules.closeDialog(this, "PlantDialog");
		},

		onPlantSave: function () {
			if (this.byId("PlantTable").getSelectedItem() === null) {
				modules.messageBox('alert', '값을 선택해주세요');
				return;
			}
			this.byId('ExecutePlant').setValueState('None');

			let oItem = this.byId('PlantTable').getSelectedItem();
			let selectedText = oItem.mAggregations.cells[0].getText();

			modules.closeDialog(this, "PlantDialog");

			this.byId('ExecutePlant').setValue(selectedText);
		},

		onMaterial: async function () {
			await modules.openDialog(_this, "project1.view.fragment.material", "MaterialDialog");
		},

		onMaterialSearch: function () {
			let sSearchText = this.byId("MaterialSearch").getValue();
			let oFilters = new Filter({
				filters: [
					new Filter("Material", FilterOperator.Contains, sSearchText),
				],
				and: false,
			});
			this.byId("MaterialTable").getBinding("items").filter(oFilters);
		},

		onMaterialCancel: function () {
			modules.closeDialog(this, "MaterialDialog");
		},

		onMaterialSave: function () {
			if (this.byId("MaterialTable").getSelectedItem() === null) {
				modules.messageBox('alert', '값을 선택해주세요');
				return;
			}
			this.byId('ExecuteMaterial').setValueState('None');

			let oItem = this.byId('MaterialTable').getSelectedItem();
			let selectedText = oItem.mAggregations.cells[0].getText();

			modules.closeDialog(this, "MaterialDialog");

			this.byId('ExecuteMaterial').setValue(selectedText);
		},

		onGate: async function () {
			await modules.openDialog(_this, "project1.view.fragment.gate", "GateDialog");
		},

		onGateSearch: function () {
			let sSearchText = this.byId("GateSearch").getValue();
			let oFilters = new Filter({
				filters: [
					new Filter("Gate", FilterOperator.Contains, sSearchText),
				],
				and: false,
			});
			this.byId("GateTable").getBinding("items").filter(oFilters);
		},

		onGateCancel: function () {
			modules.closeDialog(this, "GateDialog");
		},

		onGateSave: function () {
			if (this.byId("GateTable").getSelectedItem() === null) {
				modules.messageBox('alert', '값을 선택해주세요');
				return;
			}
			this.byId('GeneralGate').setValueState('None');

			let oItem = this.byId('GateTable').getSelectedItem();
			let selectedText = oItem.mAggregations.cells[0].getText();
			modules.closeDialog(this, "GateDialog");

			this.byId('GeneralGate').setValue(selectedText);
		},

		onDetail: function (oEvent) {

			bDetail = true;
			if (onSearch && bDetail) {
				this.byId('FileUploaderId').setEnabled(true);
			}
			this.getView().getModel('deliveryInfoModel').setData([]);
			this.getView().getModel('boxLabelInfoModel').setData([]);

			let materialInfoModel = this.getView().getModel('materialInfoModel');
			let deliveryInfoModel = this.getView().getModel('deliveryInfoModel');
			let boxLabelInfoModel = this.getView().getModel('boxLabelInfoModel');

			let sPath = oEvent.getSource().getParent().oBindingContexts.materialInfoModel.sPath;

			let detailInfo = materialInfoModel.getProperty(sPath).Detail;
			let labelInfo = materialInfoModel.getProperty(sPath).Label;

			for (let i = 0; i < detailInfo.length; i++) {
				deliveryInfoModel.getData().push(detailInfo[i]);
				deliveryInfoModel.refresh();
			}
			for (let i = 0; i < labelInfo.length; i++) {
				boxLabelInfoModel.getData().push(labelInfo[i]);
				boxLabelInfoModel.refresh();
			}
		},

		onRefresh: function () {			

			this.getView().getModel('visibleModel').setProperty('/visible', true);
			this.getView().getModel('materialInfoModel').setData([]);
			this.getView().getModel('deliveryInfoModel').setData([]);
			this.getView().getModel('boxLabelInfoModel').setData([]);
			this.byId('DeliveryType').setSelectedButton(this.byId('delivery'));
			this.getView().getModel('textModel').setProperty('/text', false)
			this.getView().getModel('textValueModel').setData({});
			onSearch = false;
			bDetail = false;
			this.byId('FileUploaderId').setEnabled(false);
			this.byId('PDF').setEnabled(false);
			this.byId('EndDate').setMinDate(null);
			this.byId('StartDate').setMaxDate(null);			
			this.byId('DriverPhone').setValue(null);
			this.byId('DTL').setValue(null);

			modules.globalClear('Required', this);
			modules.globalClear('Required2', this);			
						
		},

		refreshOnlyInfo: function () {

			this.getView().getModel('visibleModel').setProperty('/visible', true);
			this.getView().getModel('materialInfoModel').setData([]);
			this.getView().getModel('deliveryInfoModel').setData([]);
			this.getView().getModel('boxLabelInfoModel').setData([]);			
			this.getView().getModel('textModel').setProperty('/text', false)
			this.getView().getModel('textValueModel').setData({});
			onSearch = false;
			bDetail = false;
			this.byId('FileUploaderId').setEnabled(false);
			this.byId('PDF').setEnabled(false);
			this.byId('EndDate').setMinDate(null);
			this.byId('StartDate').setMaxDate(null);
			this.byId('DriverPhone').setValue(null);
			this.byId('DTL').setValue(null);
			
			modules.globalClear('Required2', this);			
						
		},

		// onAddLabel: async function () {
		// 	let boxLabelInfoModel = this.getView().getModel("boxLabelInfoModel");

		// 	boxLabelInfoModel.getData().push({
		// 		Label: ""
		// 	});
		// 	boxLabelInfoModel.refresh();
		// },

		// onLessLabel: async function () {

		// 	let oTable = this.byId("labelTable");
		// 	let oModel = oTable.getModel("boxLabelInfoModel");
		// 	let aData = oModel.getProperty("/");

		// 	let dataLength = aData.length;
		// 	aData.splice(dataLength - 1, 1);

		// 	oModel.refresh();
		// },

		onUploadFormat: async function () {
			let aCols = [
				{
					label: 'Material',
					property: 'Material'
				},
				{
					label: 'Delivery Qty',
					property: 'DeliveryQty'
				},
				{
					label: 'Box Qty',
					property: 'BoxQty'
				},
				{
					label: 'Box label',
					property: 'Label'
				},
			]
			let oSettings = {
				workbook: { columns: aCols },
				fileName: "Material_Format" + ".xlsx",
				dataSource: [{}]
			};

			let oSheet = await new Spreadsheet(oSettings);
			oSheet.build().finally(function () {
				oSheet.destroy();
			});
		},

		onExcelUpload: function (oEvent) {

			let materialInfoModel = this.getView().getModel('materialInfoModel');
			let boxLabelInfoModel = this.getView().getModel('boxLabelInfoModel');
			let excelUploadModel = this.getView().getModel('excelUploadModel');
			let bCheck = false;

			excelUploadModel.setData([]);
			let file = oEvent.getParameter('files')[0];
			let currentLabel = [];


			for (let i = 0; i < boxLabelInfoModel.getData().length; i++) {
				currentLabel.push(boxLabelInfoModel.getData()[i].Label);
			}


			if (file && window.FileReader) {
				let reader = new FileReader();
				reader.onload = function () {
					let data = reader.result;
					let workbook = XLSX.read(data, { type: 'binary' });
					workbook.SheetNames.forEach(function (sheetName) {
						let rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
						for (let i = 0; i < rows.length; i++) {

							let oData = {
								'Material': rows[i]['Material'],
								'DeliveryQty': rows[i]['Delivery Qty'],
								'BoxQty': rows[i]['Box Qty'],
								'Label': rows[i]['Box label']
							}

							excelUploadModel.getData().push(oData);
						}
						let filterData = excelUploadModel.getData().filter(oItem => oItem.Material == materialInfoModel.getData()[0].Material);

						for (let i = 0; i < filterData.length; i++) {
							if (currentLabel.includes(filterData[i].Label)) {
								modules.messageBox('warning', 'Label이 중복됩니다');
								bCheck = false;
								return;
							} else {
								bCheck = true;
							}
						}

						if (bCheck) {
							for (let i = 0; i < filterData.length; i++) {
								materialInfoModel.getData()[0].DeliveryQty += filterData[i].DeliveryQty;
								materialInfoModel.getData()[0].BoxQty += filterData[i].BoxQty;
								boxLabelInfoModel.getData().push({ "Label": filterData[i].Label });

								materialInfoModel.refresh();
								boxLabelInfoModel.refresh();
							}
						}
						materialInfoModel.getData()[0].ReqQty = materialInfoModel.getData()[0].DeliveryQty + materialInfoModel.getData()[0].BoxQty;
						materialInfoModel.refresh();
					})

				}
				reader.readAsBinaryString(file);
			}

		},

		onSave: function () {

			let bCheck = modules.globalCheck("Required2", this);

			if (!bCheck) {
				modules.messageBox('warning', '값을 모두 입력해주세요')
				return;
			}

			let vendor = this.byId('GeneralVendor').getValue();
			let gate = this.byId('GeneralGate').getValue();
			let departureDate = this.byId('StartDate').getValue();
			let departureTime = this.byId('StartTime').getValue();
			let arrivalDate = this.byId('EndDate').getValue();
			let arrivalTime = this.byId('EndTime').getValue();
			let invoiceNo = this.byId('InvoiceNo').getValue();
			let carNo = this.byId('CarNo').getValue();
			let driverName = this.byId('DriverName').getValue();
			let driverPhone = this.byId('DriverPhone').getValue();
			let dtl = parseInt(this.byId('DTL').getSelectedKey());

			if (dtl === 0) {
				dtl = 'Location1'
			} else if (dtl === 1) {
				dtl = 'Location2'
			} else if (dtl === 2) {
				dtl = 'Location3'
			}

			let oTemp = {
				"Vendor": vendor,
				"Gate": gate,
				"DepartureDate": departureDate,
				"DepartureTime": departureTime,
				"ArrivalDate": arrivalDate,
				"ArrivalTime": arrivalTime,
				"InvoiceNo": invoiceNo,
				"CarNo": carNo,
				"DriverName": driverName,
				"DriverPhone": driverPhone,
				"DTL": dtl

			}

			this.getView().getModel('textValueModel').setData(oTemp);
			this.getView().getModel('textValueModel').refresh();

			const SupplierUrl = "/hyundai/Supplier"
			console.log("URL :: ", SupplierUrl);
			console.log("oTemp :: ", oTemp);

			let asnNo1 = Math.floor(Math.random() * (999999999 - 100000000 + 1) + 100000000).toString();
			let asnNo2 = Math.floor(Math.random() * (999999999 - 100000000 + 1) + 100000000).toString();
			let asnNo = asnNo1 + asnNo2;
			this.byId('AsnNoText').setText(asnNo);

			let asnNoText = this.byId('AsnNoText').getText();
			if (asnNoText) {
				this.getView().getModel('textModel').setProperty('/text', true)
			}

		},

		onStartDate: function () {
			let minDate = this.byId('StartDate').getValue();
			this.byId('EndDate').setMinDate(new Date(minDate));
			this.byId('StartDate').setValueState('None');
			// this.byId('StartTime').setEnabled(true);

		},

		onStartTime: function () {

			if (this.byId('EndTime').getValue()) {
				if (this.byId('StartDate').getValue() == this.byId('EndDate').getValue()) {
					if (this.byId('StartTime').getValue() > this.byId('EndTime').getValue()) {
						modules.messageBox('alert', '시작시간은 종료시간보다 앞이어야 합니다');
						this.byId('StartTime').setValue(null);
						return;
					}
				}
			}
			this.byId('StartTime').setValueState('None');
		},

		onEndDate: function () {
			let maxDate = this.byId('EndDate').getValue();
			this.byId('StartDate').setMaxDate(new Date(maxDate));
			this.byId('EndDate').setValueState('None');
		},

		onEndTime: function () {
			if (this.byId('StartTime').getValue()) {
				if (this.byId('StartDate').getValue() == this.byId('EndDate').getValue()) {
					if (this.byId('EndTime').getValue() < this.byId('StartTime').getValue()) {
						modules.messageBox('alert', '종료시간은 시작시간보다 뒤어야 합니다');
						this.byId('EndTime').setValue(null);
						return;
					}
				}
			}
			this.byId('EndTime').setValueState('None');
		},

		base64FromArrayBuffer: function (arrayBuffer) {
			let binary = '';
			let bytes = new Uint8Array(arrayBuffer);
			let len = bytes.byteLength;
			for (let i = 0; i < len; i++) {
				binary += String.fromCharCode(bytes[i]);
			}
			return btoa(binary);
		},

		onPdf: async function () {

			this.getView().setModel(new JSONModel([]), 'PDFModel');
			let infoData = this.getView().getModel('textValueModel').getData();
			let materialInfoData = this.getView().getModel('materialInfoModel').getData();
			let boxLabelInfoData = this.getView().getModel('boxLabelInfoModel').getData();
			let deliveryType = this.byId('DeliveryType').getSelectedButton().getText();
			let selectIndex;			
			let printd =
				"<?xml version='1.0' encoding='UTF-8'?>" +
				"<form1>" +
				"<CodabarBarCode1>" + "<![CDATA[" + this.byId('AsnNoText').getText() + "]]>" + "</CodabarBarCode1>" +
				"<Table3>" +
				"<HeaderRow/>" +
				"<Row1>" +
				"<Cell1>" + "<![CDATA[" + this.byId('ExecuteVendor').getValue() + "]]>" + "</Cell1>" +
				"<Cell2>" + "<![CDATA[" + infoData.Vendor + "]]>" + "</Cell2>" +
				"<Cell3>" + "<![CDATA[" + infoData.CarNo + "]]>" + "</Cell3>" +
				"<Cell4>" + "<![CDATA[" + infoData.DTL + "]]>" + "</Cell4>" +
				"<Cell5>" + "<![CDATA[" + this.byId('StartDate').getValue() + ' / ' + this.byId('StartTime').getValue() + "]]>" + "</Cell5>" +
				"<Cell6>" + "<![CDATA[" + this.byId('EndDate').getValue() + ' / ' + this.byId('EndTime').getValue() + "]]>" + "</Cell6>" +
				"</Row1>" +
				"</Table3>" +
				"<Table4>" +
				"<HeaderRow/>"
			
			if(deliveryType === 'Delivery Schedule') {
				selectIndex = this.byId('materialInfoTable').getSelectedIndices();
			}else if(deliveryType === 'JIT Call') {
				selectIndex = this.byId('materialInfoTableJIT').getSelectedIndices();
			}
			if(selectIndex.length === 0) {
				modules.messageBox('warning', 'PDF 출력할 데이터를 선택해주세요')
				return;
			}
			for (let i = 1; i <= selectIndex.length; i++) {
				let odata = materialInfoData[selectIndex[i - 1]];
				//this.getView().getModel('PDFModel').getData().push(odata);

				printd +=
					"<Row" + i + ">" +
					"<Cell1>" + "<![CDATA[" + i + "]]>" + "</Cell1>" +
					"<Cell2>" + "<![CDATA[" + odata.Material + "]]>" + "</Cell2>" +
					"<Cell3>" + "<![CDATA[" + odata.Discription + "]]>" + "</Cell3>" +
					"<Cell4>" + "<![CDATA[" + odata.BoxQty + "]]>" + "</Cell4>" +
					"<Cell5>" + "<![CDATA[" + odata.DeliveryQty + "]]>" + "</Cell5>" +
					"<Cell6>" + "<![CDATA[" + odata.ReqQty + "]]>" + "</Cell6>" +
					"<Cell7>" + "<![CDATA[" + infoData.Gate + "]]>" + "</Cell7>" +
					"<Cell8>" + "<![CDATA[]]>" + "</Cell8>" +
					"</Row" + i + ">"
			}

			printd +=
				"</Table4>" +
				"<Code128BarCode1>" + "<![CDATA[" + this.byId('AsnNoText').getText() + "]]>" + "</Code128BarCode1>" +
				"</form1>"

			let encoder = new TextEncoder();
			let data = encoder.encode(printd);
			let printdb64 = this.base64FromArrayBuffer(data);

			var pdfcontent = {
				"embedFont": 0,
				"formLocale": "en_US",
				"formType": "print",
				"taggedPdf": 1,
				"xdpTemplate": "ybForm/supplierForm_yb",
				"xmlData": printdb64
			}

			$.ajax({
				url: jQuery.sap.getModulePath("project1", "/v1/adsRender/pdf?templateSource=storageName&TraceLevel=0"),
				type: "POST",
				data: JSON.stringify(pdfcontent),
				contentType: "application/json",
				async: false,
				success: function (data) {
					const deccont = atob(data.fileContent);
					const byteNumbers = new Array(deccont.length);

					for (let i = 0; i < deccont.length; i++) {
						byteNumbers[i] = deccont.charCodeAt(i);
					}

					const byteArray = new Uint8Array(byteNumbers);
					const blob = new Blob([byteArray], { type: "application/pdf" });
					let pdfDocumentURL = URL.createObjectURL(blob);
					if (!this._pdfViewer) {
						this._pdfViewer = new PDFViewer();
						this._pdfViewer.attachError(event => ErrorHandlerSingleton.getInstance().onError(event));
						URLWhitelist.add("blob");
					}
					this._pdfViewer.setSource(pdfDocumentURL);
					this._pdfViewer.open();
				},
				error: function (err) {
					MessageBox.information(JSON.stringify(err));
				}
			})

		},

		onInvoice: function () {
			this.byId('InvoiceNo').setValueState('None');
		},

		onCarNo: function () {
			this.byId('CarNo').setValueState('None');
		},

		onDriverName: function () {
			this.byId('DriverName').setValueState('None');
		},

		onDriverPhone: function () {
			this.byId('DriverPhone').setValueState('None');
		},

		onDTL: function () {
			this.byId('DTL').setValueState('None');
		},


	})
})