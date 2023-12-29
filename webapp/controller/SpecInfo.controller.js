sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/PDFViewer",
	"sap/base/security/URLWhitelist",
], function (Controller, JSONModel, PDFViewer, URLWhitelist) {
	"use strict";

	let _this;

	return Controller.extend("project1.controller.SpecInfo", {

		onInit: function () {			
			const myRoute = this.getOwnerComponent().getRouter().getRoute("SpecInfo");
			myRoute.attachPatternMatched(this.onMyRoutePatternMatched, this);
		},
		onMyRoutePatternMatched: function () {
			_this = this;
			let jsonData = new JSONModel('../model/PackingSpec.json');
			this.getView().setModel(jsonData, "packingModel");
			this.byId('iconTabBar').setSelectedKey('vanning');
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
		onPDF: async function () {

			let oData = this.getOwnerComponent().getModel('sharedModel').getData();
			let partImgSrc;
			let vanningPartSrc;
			if (oData.partImgSrc) {
				partImgSrc = oData.partImgSrc.split('base64,')[1];
			}
			if (oData.vanningPartSrc) {
				vanningPartSrc = oData.vanningPartSrc.split('base64,')[1];
			}
			let printd =
				"<?xml version='1.0' encoding='UTF-8'?>" +
				"<form1>" +
				"<ProductNo>" + "<![CDATA[" + "]]>" + "</ProductNo>" +
				"<Supplier>" + "<![CDATA[" + oData.packing[0].ZCLIFNR3 + "]]>" + "</Supplier>" +
				"<SpecNo>" + "<![CDATA[" + "]]>" + "</SpecNo>" +
				"<PackagingCost>" + "<![CDATA[" + 'N' + "]]>" + "</PackagingCost>" +
				"<CarType>" + "<![CDATA[" + oData.packing[0].ZCKDCAR + "]]>" + "</CarType>" +
				"<PackagingSpec>" + "<![CDATA[" + oData.packing[0].ZCPISP + "]]>" + "</PackagingSpec>" +
				"<Werks>" + "<![CDATA[" + oData.packing[0].WERKS + "]]>" + "</Werks>" +
				"<ApplySpecNo>" + "<![CDATA[" + oData.packing[0].ZCSPNO + "]]>" + "</ApplySpecNo>" +
				"<WriteNo>" + "<![CDATA[" + oData.packing[0].ZCCRNO + "]]>" + "</WriteNo>" +
				"<PartImage1>" + "<![CDATA[" + partImgSrc + "]]>" + "</PartImage1>" +
				"<PartImage2>" + "<![CDATA[" + vanningPartSrc + "]]>" + "</PartImage2>" +
				"<Remark>" + "<![CDATA[" + "]]>" + "</Remark>" +
				"<PackagingInfo1>" + "<![CDATA[" + "]]>" + "</PackagingInfo1>" +
				"<PackagingInfo2>" + "<![CDATA[" + oData.vanningMaterialData[0].material + "]]>" + "</PackagingInfo2>" +
				"<PackagingInfo3>" + "<![CDATA[" + "]]>" + "</PackagingInfo3>" +
				"<PackagingInfo4>" + "<![CDATA[" + oData.vanningMaterialData[0].weight + "]]>" + "</PackagingInfo4>" +
				"<PackagingInfo5>" + "<![CDATA[" + parseInt(oData.vanningMaterialData[0].weight) * parseInt(oData.vanningMaterialData[0].stuffingQty) + "]]>" + "</PackagingInfo5>" +
				"<PackagingInfo6>" + "<![CDATA[" + parseInt(oData.vanningMaterialData[0].width) * parseInt(oData.vanningMaterialData[0].length) * parseInt(oData.vanningMaterialData[0].height) + "]]>" + "</PackagingInfo6>" +
				"<PackagingInfo7>" + "<![CDATA[" + oData.vanningMaterialData[0].stuffingQty + "]]>" + "</PackagingInfo7>" +
				"<PackagingInfo8>" + "<![CDATA[" + oData.vanningMaterialData[0].width + "]]>" + "</PackagingInfo8>" +
				"<PackagingInfo9>" + "<![CDATA[" + oData.vanningMaterialData[0].length + "]]>" + "</PackagingInfo9>" +
				"<PackagingInfo10>" + "<![CDATA[" + oData.vanningMaterialData[0].height + "]]>" + "</PackagingInfo10>" +
				"<VanningHow>" + "<![CDATA[" + "]]>" + "</VanningHow>" +
				"<VanningPartTable>" +
				"<HeaderRow />"

			let vanningLength = oData.vanningMaterialData.length;
			for (let i = 1; i <= vanningLength; i++) {
				printd +=
					"<Row" + i + ">" +
					"<Cell1>" + "<![CDATA[" + oData.vanningMaterialData[i - 1].MATNR + "]]>" + "</Cell1>" +
					"<Cell2>" + "<![CDATA[" + oData.vanningMaterialData[i - 1].material + "]]>" + "</Cell2>" +
					"<Cell3>" + "<![CDATA[" + oData.vanningMaterialData[i - 1].Usage + "]]>" + "</Cell3>" +
					"<Cell4>" + "<![CDATA[" + oData.vanningMaterialData[i - 1].stuffingQty + "]]>" + "</Cell4>" +
					"<Cell5>" + "<![CDATA[" + oData.vanningMaterialData[i - 1].surface + "]]>" + "</Cell5>" +
					"<Cell6>" + "<![CDATA[" + oData.vanningMaterialData[i - 1].texture + "]]>" + "</Cell6>" +
					"<Cell7>" + "<![CDATA[" + oData.vanningMaterialData[i - 1].color + "]]>" + "</Cell7>" +
					"<Cell8>" + "<![CDATA[" + oData.vanningMaterialData[i - 1].width + "]]>" + "</Cell8>" +
					"<Cell9>" + "<![CDATA[" + oData.vanningMaterialData[i - 1].length + "]]>" + "</Cell9>" +
					"<Cell10>" + "<![CDATA[" + oData.vanningMaterialData[i - 1].height + "]]>" + "</Cell10>" +
					"<Cell11>" + "<![CDATA[" + oData.vanningMaterialData[i - 1].thickness + "]]>" + "</Cell11>" +
					"<Cell12>" + "<![CDATA[" + oData.vanningMaterialData[i - 1].weight + "]]>" + "</Cell12>" +
					"<Cell13>" + "<![CDATA[" + oData.vanningMaterialData[i - 1].stuffingRate + "]]>" + "</Cell13>" +
					"<Cell14>" + "<![CDATA[" + oData.vanningMaterialData[i - 1].ZNPERNR + "]]>" + "</Cell14>" +
					"<Cell15>" + "<![CDATA[" + oData.vanningMaterialData[i - 1].phone + "]]>" + "</Cell15>" +
					"</Row" + i + ">"
			}
			printd +=
				"</VanningPartTable>" +
				"<PackingMaterialTable>" +
				"<HeaderRow />"

			let airliftInfoLength = oData.airliftInfoData.length;
			for (let i = 1; i <= airliftInfoLength; i++) {
				printd +=
					"<Row" + i + ">" +
					"<Cell1>" + "<![CDATA[" + i + "]]>" + "</Cell1>" +
					"<Cell2>" + "<![CDATA[" + oData.airliftInfoData[i - 1].packagingType + "]]>" + "</Cell2>" +
					"<Cell3>" + "<![CDATA[" + "]]>" + "</Cell3>" +
					"<Cell4>" + "<![CDATA[" + "]]>" + "</Cell4>" +
					"<Cell5>" + "<![CDATA[" + "]]>" + "</Cell5>" +
					"<Cell6>" + "<![CDATA[" + "]]>" + "</Cell6>" +
					"<Cell7>" + "<![CDATA[" + "]]>" + "</Cell7>" +
					"<Cell8>" + "<![CDATA[" + "]]>" + "</Cell8>" +
					"<Cell9>" + "<![CDATA[" + "]]>" + "</Cell9>" +
					"<Cell10>" + "<![CDATA[" + "]]>" + "</Cell10>" +
					"<Cell11>" + "<![CDATA[" + "]]>" + "</Cell11>" +
					"<Cell12>" + "<![CDATA[" + "]]>" + "</Cell12>" +
					"<Cell13>" + "<![CDATA[" + "]]>" + "</Cell13>" +
					"<Cell14>" + "<![CDATA[" + "]]>" + "</Cell14>" +
					"</Row" + i + ">"
			}
			printd +=
				"</PackingMaterialTable>" +
				"<AirliftInfoTable>" +
				"<HeaderRow />"


			for (let i = 1; i <= airliftInfoLength; i++) {
				printd +=
					"<Row" + i + ">" +
					"<Cell1>" + "<![CDATA[" + i + "]]>" + "</Cell1>" +
					"<Cell2>" + "<![CDATA[" + oData.airliftInfoData[i - 1].packagingType + "]]>" + "</Cell2>" +
					"<Cell3>" + "<![CDATA[" + oData.airliftInfoData[i - 1].MATNR + "]]>" + "</Cell3>" +
					"<Cell4>" + "<![CDATA[" + oData.airliftInfoData[i - 1].packagingHow + "]]>" + "</Cell4>" +
					"<Cell5>" + "<![CDATA[" + oData.airliftInfoData[i - 1].packagingDetail + "]]>" + "</Cell5>" +
					"<Cell6>" + "<![CDATA[" + oData.airliftInfoData[i - 1].stuffingQty + "]]>" + "</Cell6>" +
					"<Cell7>" + "<![CDATA[" + oData.airliftInfoData[i - 1].packagingQty + "]]>" + "</Cell7>" +
					"<Cell8>" + "<![CDATA[" + oData.airliftInfoData[i - 1].gongsu + "]]>" + "</Cell8>" +
					"</Row" + i + ">"
			}
			printd +=
				"</AirliftInfoTable>" +
				"<SamePackingSpecPartTable>" +
				"<HeaderRow />" +
				"<Row" + 1 + ">" +
				"<Cell1>" + "<![CDATA[" + 1 + "]]>" + "</Cell1>" +
				"<Cell2>" + "<![CDATA[" + "]]>" + "</Cell2>" +
				"<Cell3>" + "<![CDATA[" + "]]>" + "</Cell3>" +
				"</Row" + 1 + ">" +
				"</SamePackingSpecPartTable>" +
				"</form1>"

			let encoder = new TextEncoder();
			let data = encoder.encode(printd);
			let printdb64 = this.base64FromArrayBuffer(data);

			var pdfcontent = {
				"embedFont": 0,
				"formLocale": "en_US",
				"formType": "print",
				"taggedPdf": 1,
				"xdpTemplate": "ybForm/packingForm_yb",
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
					console.log('pdf err', err);
				}
			})
		},
		onNavToHome: function () {
			this.getOwnerComponent().getRouter().navTo("Packing");
		},
	})
})