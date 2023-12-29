sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"../util/modules"
], function (Controller, JSONModel, modules) {
	"use strict";

	let _this, WriteNo, AvatarId, PartImgContent, VanningPartContent, VanningPartId, PartImageId, SharedModel, PartImgBase64, VanningPartBase64;


	return Controller.extend("project1.controller.VanningMaterial", {

		onInit: function () {			
			const myRoute = this.getOwnerComponent().getRouter().getRoute("SpecInfo");
			myRoute.attachPatternMatched(this.onMyRoutePatternMatched, this);
		},
		onMyRoutePatternMatched: async function (oEvent) {
			_this = this;
			SharedModel = this.getOwnerComponent().getModel('sharedModel').getData();
			WriteNo = oEvent.getParameter("arguments").objectId;
			let jsonData = new JSONModel('../model/Vanning.json');
			this.getView().setModel(jsonData, "vanningModel");
			this.getView().setModel(new JSONModel(), 'vanningInputModel');
			this.byId("partImg").setSrc(null);
			this.byId("vanningPart").setSrc(null);
			PartImageId = null;
			VanningPartId = null;
			let oData = {
				"MATNR": "21810-25020",
				"material": "BRKT ASSY-ENGINE NTG",
				"Usage": 0,
				"stuffingQty": 10,
				"stuffingRate": 100,
				"surface": false,
				"color": true,
				"texture": "ST",
				"width": 10.00,
				"length": 10.00,
				"height": 10.00,
				"thickness": 10.00,
				"weight": 10.00,
				"size": "Q",
				"ZNPERNR": "우찬웅",
				"phone": "010-1111-1111",
				"createDate": "2023-04-19",
				"editDate": "2023-04-19"
			}
			SharedModel.vanningMaterialData.push(oData);
			await $.ajax({
				"method": "GET",
				"url": '/browser/982c591b-7390-42db-a8b5-4f28e73dabb9/root/',				
				beforeSend: function (xhr) {
				},
				success: function (data) {
					for (let i = 0; i < data.objects.length; i++) {
						if (data.objects[i].object.properties['cmis:name'].value == WriteNo + 'PI') {
							PartImageId = data.objects[i].object.properties['cmis:objectId'].value
						}
						if (data.objects[i].object.properties['cmis:name'].value == WriteNo + 'VP') {
							VanningPartId = data.objects[i].object.properties['cmis:objectId'].value
						}
					}
				},
				error: function (err) {
					console.log(err);
				},
				complete: function () {
				},
			});
			if (PartImageId) {
				await $.ajax({
					type: "GET",
					url: '/browser/982c591b-7390-42db-a8b5-4f28e73dabb9/root/',
					data: { objectId: PartImageId, cmisSelector: "content", filename: WriteNo + 'PI' },
					xhrFields: {
						responseType: 'blob'
					},					
					beforeSend: function (xhr) {
					},
					success: function (data) {
						let oReader = new FileReader();
						oReader.readAsDataURL(data);
						oReader.onloadend = function (e) {
							let oBase64data = e.target.result;
							_this.getView().getModel('vanningModel').setProperty('/0/partImg', oBase64data);
							SharedModel.partImgSrc = oBase64data;
							_this.byId("partImg").data('objectId', PartImageId);
						}
					},
					error: function () {

					},
					complete: function () {
					},
				});
			}
			if (VanningPartId) {
				await $.ajax({
					type: "GET",
					url: '/browser/982c591b-7390-42db-a8b5-4f28e73dabb9/root/',
					data: { objectId: VanningPartId, cmisSelector: "content", filename: WriteNo + 'VP' },
					xhrFields: {
						responseType: 'blob'
					},					
					beforeSend: function (xhr) {
					},
					success: function (data) {
						let oReader = new FileReader();
						oReader.readAsDataURL(data);
						oReader.onloadend = function (e) {
							let oBase64data = e.target.result;
							_this.getView().getModel('vanningModel').setProperty('/0/vanningPart', oBase64data);
							SharedModel.vanningPartSrc = oBase64data;
							_this.byId("vanningPart").data('objectId', VanningPartId);
						}
					},
					error: function () {

					},
					complete: function () {
					},
				});
			}
		},

		onExcelDownload: async function () {
			let oData = this.getView().getModel('vanningModel').getData();

			const workbook = new ExcelJS.Workbook();
			const sheet = workbook.addWorksheet('sheet1');
			sheet.mergeCells('A1:S1');
			sheet.mergeCells('A2:S2');
			sheet.mergeCells('A3:S3');
			sheet.mergeCells('A4:S4');
			sheet.mergeCells('A5:S5');

			sheet.getCell('A1').value = {
				richText: [{
					text: '적입부품 LIST',
					font: { size: 20, bold: true }
				}]
			};
			sheet.getCell('A1').alignment = { horizontal: 'center' }
			sheet.getCell('A2').value = '공장 : HK11 울산 CKD 공장';
			sheet.getCell('A3').value = '작성의뢰번호 : D005T20230300002';
			sheet.getCell('A4').value = '자재번호 : 217A0GI000';
			sheet.getCell('A5').value = '적용사양번호 : ';

			sheet.getRow(6).values = [
				'No', '자재번호', '자재명', 'Usage', '적입률', '표면처리', '칼라', '재질', '가로', '세로', '높이', '두께',
				'부품중량', '자재크기', '담당자', '전화번호', '생성일', '변경일'
			];
			sheet.getRow(6).alignment = { horizontal: 'center' }

			sheet.getColumn(1).width = 5;
			sheet.getColumn(2).width = 15;
			sheet.getColumn(3).width = 25;
			sheet.getColumn(4).width = 10;
			sheet.getColumn(5).width = 10;
			sheet.getColumn(6).width = 10;
			sheet.getColumn(7).width = 10;
			sheet.getColumn(8).width = 10;
			sheet.getColumn(9).width = 10;
			sheet.getColumn(10).width = 10;
			sheet.getColumn(11).width = 10;
			sheet.getColumn(12).width = 10;
			sheet.getColumn(13).width = 10;
			sheet.getColumn(14).width = 10;
			sheet.getColumn(15).width = 10;
			sheet.getColumn(16).width = 15;
			sheet.getColumn(17).width = 15;
			sheet.getColumn(18).width = 15;

			// sheet.getCell('A6').width = 30;

			for (let i = 0; i < oData.length; i++) {
				sheet.getRow(i + 7).values = [
					i + 1, oData[i].MATNR, oData[i].material, oData[i].Usage, oData[i].stuffingRate, oData[i].surface, oData[i].color, oData[i].texture, oData[i].width, oData[i].length, oData[i].height, oData[i].thickness,
					oData[i].weight, oData[i].size, oData[i].ZNPERNR, oData[i].phone, oData[i].createDate, oData[i].editDate
				]
			}
			sheet.getRow(6).fill = {
				type: "pattern",
				pattern: "solid",
				fgColor: { argb: 'FF87CEEB' }
			};
			const buffer = await workbook.xlsx.writeBuffer();
			const blob = new Blob([buffer], {
				type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
			});
			const url = window.URL.createObjectURL(blob); // blob으로 객체 URL 생성
			const anchor = document.createElement('a');
			anchor.href = url;
			anchor.download = 'VanningTest.xlsx';
			anchor.click(); // anchor를 다운로드 링크로 만들고 강제로 클릭 이벤트 발생
			window.URL.revokeObjectURL(url); // 메모리에서 해제
		},
		onAvatarPress: function (oEvent) {
			let sId = oEvent.getSource().getId();
			let bCheck = sId.includes('partImg');
			if (bCheck) {
				AvatarId = 'partImg';
			} else {
				AvatarId = 'vanningPart';
			}
			modules.messageBoxConfirm('warning', '이미지를 변경하시겠습니까?', '이미지 변경').then((check) => {
				if (check) {
					this.byId("UploadSet")._oList.mEventRegistry.selectionChange[0].oListener._oUploadButton.firePress();
				}
			})
		},
		onBeforeItemAdded: async function (oEvent) {
			let item = oEvent.getParameter("item");

			this.oFileUploadComponent = item.getFileObject();
			if (this.oFileUploadComponent) {
				this._handleRawFile(this.oFileUploadComponent, this);
			}
		},
		_handleRawFile: function (oFile, oController) {
			var oFileRaw = {
				name: oFile.name,
				mimetype: oFile.type,
				size: oFile.size,
				data: []
			};
			var reader = new FileReader();
			reader.onload = function (e) {
				oFileRaw.data = e.target.result; //set buffer data
				oController.uploadFileRaw = `oFileRaw`;
				var arrayBufferView = new Uint8Array(oFileRaw.data);
				const charArr = arrayBufferView.reduce((data, byte) => (data + String.fromCharCode(byte)), '');
				const img = "data:image/jpeg;base64," + window.btoa(charArr);
				let content = _this.base64toFile(img);
				// setSrc를 위해 필요한 코드
				let reader = new FileReader();
				reader.readAsDataURL(content);
				reader.onloadend = function () {
					let base64data = reader.result;
					if (AvatarId === 'partImg') {
						_this.byId("partImg").setSrc(base64data);
						PartImgBase64 = base64data;
						PartImgContent = content;
					} else if (AvatarId === 'vanningPart') {
						_this.byId("vanningPart").setSrc(base64data);
						VanningPartBase64 = base64data;
						VanningPartContent = content;
					}
					const byteArray = new Uint8Array(base64data);
					const blob = new Blob([byteArray], { type: "image/jpeg" });
					var pdfDocumentURL = window.URL.createObjectURL(blob);
				}
			}.bind(oController);
			reader.readAsArrayBuffer(oFile);
		},
		base64toFile: function (dataurl) {
			var arr = dataurl.split(','),
				mime = arr[0].match(/:(.*?);/)[1],
				bstr = atob(arr[1]),
				n = bstr.length,
				u8arr = new Uint8Array(n);
			while (n--) {
				u8arr[n] = bstr.charCodeAt(n);
			}
			return new File([u8arr], { type: mime });
		},
		onSave: async function () {
			let bPI = false;
			let bVP = false;

			await $.ajax({
				type: "GET",
				url: '/browser/982c591b-7390-42db-a8b5-4f28e73dabb9/root/',
				beforeSend: function (xhr) {
				},
				success: function (data) {
					for (let i = 0; i < data.objects.length; i++) {
						let saveImg = data.objects[i].object.properties['cmis:name'].value;
						if (saveImg === WriteNo + 'PI') {
							bPI = true;
						}
						if (saveImg === WriteNo + 'VP') {
							bVP = true;
						}
					}
					if (bPI && bVP) {
						modules.messageBox('alert', '이미지가 이미 등록되어 있습니다', '이미지 중복');
						return;
					}
				},
				error: function () {
					new sap.m.MessageToast.show("Error while calling the Data");
				},
				complete: function () {
				},
			});

			let partImgSrc = null;
			let vanningPartSrc = null;

			if (!bPI) {
				partImgSrc = this.byId('partImg').getSrc();
			}
			if (!bVP) {
				vanningPartSrc = this.byId('vanningPart').getSrc();
			}

			let aImage = [];
			if (partImgSrc) {
				aImage.push(partImgSrc);
			}
			if (vanningPartSrc) {
				aImage.push(vanningPartSrc);
			}
			for (let i = 0; i < aImage.length; i++) {
				if (partImgSrc && i === 0) {

					var form = new FormData();
					form.append("cmisaction", "createDocument");
					form.append("propertyId[0]", "cmis:name");
					form.append("propertyValue[0]", WriteNo + 'PI'); // 생성파일이름 = 작성의뢰번호로?
					form.append("propertyId[1]", "cmis:objectTypeId");
					form.append("propertyValue[1]", "cmis:document");
					form.append("succinct", "true");
					form.append("filename", PartImgContent);
					form.append("media", "binary");

					var settings = {
						"url": "/browser/982c591b-7390-42db-a8b5-4f28e73dabb9/root/",
						"method": "POST",
						"timeout": 0,
						"processData": false,
						"mimeType": "multipart/form-data",
						"contentType": false,
						"data": form
					};
					$.ajax(settings).done(async function (response) {
						modules.messageBox('alert', '입력이 완료되었습니다', '입력 완료');
					}).fail(async function (xhr) {
					});
				} else if (vanningPartSrc) {

					var form = new FormData();
					form.append("cmisaction", "createDocument");
					form.append("propertyId[0]", "cmis:name");
					form.append("propertyValue[0]", WriteNo + 'VP'); // 생성파일이름 = 작성의뢰번호로?
					form.append("propertyId[1]", "cmis:objectTypeId");
					form.append("propertyValue[1]", "cmis:document");
					form.append("succinct", "true");
					form.append("filename", VanningPartContent);
					form.append("media", "binary");

					var settings = {
						"url": "/browser/982c591b-7390-42db-a8b5-4f28e73dabb9/root/",
						"method": "POST",
						"timeout": 0,
						"processData": false,
						"mimeType": "multipart/form-data",
						"contentType": false,
						"data": form
					};
					$.ajax(settings).done(async function (response) {
						modules.messageBox('alert', '입력이 완료되었습니다', '입력 완료');
					}).fail(async function (xhr) {
					});
				}
			}
		},
		onEdit: async function () {			

			await $.ajax({
				"method": "GET",
				"url": '/browser/982c591b-7390-42db-a8b5-4f28e73dabb9/root/',				
				beforeSend: function (xhr) {
				},
				success: function (data) {
					for (let i = 0; i < data.objects.length; i++) {
						if (data.objects[i].object.properties['cmis:name'].value == WriteNo + 'PI') {
							PartImageId = data.objects[i].object.properties['cmis:objectId'].value
						}
						if (data.objects[i].object.properties['cmis:name'].value == WriteNo + 'VP') {
							VanningPartId = data.objects[i].object.properties['cmis:objectId'].value
						}
					}
				},
				error: function () {
					new sap.m.MessageToast.show(TextModel['datafailed']);
				},
				complete: function () {
				},
			});

			let partImg = this.byId("partImg").getSrc();
			let vanningPart = this.byId("vanningPart").getSrc();

			if (!partImg && !vanningPart) {
				modules.messageBox('alert', '수정할 데이터가 없습니다', '수정 불가');
				return;
			}

			if (!PartImageId) {
				if (partImg) {
					var form = new FormData();
					form.append("cmisaction", "createDocument");
					form.append("propertyId[0]", "cmis:name");
					form.append("propertyValue[0]", WriteNo + 'PI'); // 생성파일이름 = 작성의뢰번호로?
					form.append("propertyId[1]", "cmis:objectTypeId");
					form.append("propertyValue[1]", "cmis:document");
					form.append("succinct", "true");
					form.append("filename", PartImgContent);
					form.append("media", "binary");

					var settings = {
						"url": "/browser/982c591b-7390-42db-a8b5-4f28e73dabb9/root/",
						"method": "POST",
						"timeout": 0,
						"processData": false,
						"mimeType": "multipart/form-data",
						"contentType": false,
						"data": form
					};
					$.ajax(settings).done(async function (response) {
						modules.messageBox('alert', '수정이 완료되었습니다11', '수정 완료');
					}).fail(async function (xhr) {
					});
				} else if (!partImg) {
					modules.messageBox('alert', '수정할 부품사진이 없습니다', '이미지 없음');
				}
			} else if (PartImageId) { // 삭제로직
				if (PartImgContent) {
					let oForm = new FormData();
					oForm.append("propertyId[0]", "cmis:isImmutable");
					oForm.append("propertyValue[0]", false);
					let oSettings = {
						"url": "/browser/982c591b-7390-42db-a8b5-4f28e73dabb9/root/?cmisaction=delete&objectId=" + PartImageId,
						"method": "POST",
						"timeout": 0,
						"processData": false,
						"mimeType": "multipart/form-data",
						"contentType": false,						
						"data": oForm
					};
					$.ajax(oSettings).done(async function (response) {
						var form = new FormData();
						form.append("cmisaction", "createDocument");
						form.append("propertyId[0]", "cmis:name");
						form.append("propertyValue[0]", WriteNo + 'PI'); // 생성파일이름 = 작성의뢰번호로?
						form.append("propertyId[1]", "cmis:objectTypeId");
						form.append("propertyValue[1]", "cmis:document");
						form.append("succinct", "true");
						form.append("filename", PartImgContent);
						form.append("media", "binary");
						var settings = {
							"url": "/browser/982c591b-7390-42db-a8b5-4f28e73dabb9/root/",
							"method": "POST",
							"timeout": 0,
							"processData": false,
							"mimeType": "multipart/form-data",
							"contentType": false,
							"data": form
						};
						$.ajax(settings).done(async function (response) {
							modules.messageBox('alert', '수정이 완료되었습니다12', '수정 완료');
							SharedModel.partImgSrc = PartImgBase64;
						}).fail(async function (xhr) {
						});
					}).fail(async function (xhr) {
						console.log(xhr)
					});
				}
			}
			if (!VanningPartId) {
				if (vanningPart) {
					var form = new FormData();
					form.append("cmisaction", "createDocument");
					form.append("propertyId[0]", "cmis:name");
					form.append("propertyValue[0]", WriteNo + 'VP'); // 생성파일이름 = 작성의뢰번호로?
					form.append("propertyId[1]", "cmis:objectTypeId");
					form.append("propertyValue[1]", "cmis:document");
					form.append("succinct", "true");
					form.append("filename", VanningPartContent);
					form.append("media", "binary");

					var settings = {
						"url": "/browser/982c591b-7390-42db-a8b5-4f28e73dabb9/root/",
						"method": "POST",
						"timeout": 0,
						"processData": false,
						"mimeType": "multipart/form-data",
						"contentType": false,
						"data": form
					};
					$.ajax(settings).done(async function (response) {
						modules.messageBox('alert', '수정이 완료되었습니다21', '수정 완료');
					}).fail(async function (xhr) {
					});
				}
			} else if (VanningPartId) { // 삭제로직
				if (VanningPartContent) {
					let oForm = new FormData();
					oForm.append("propertyId[0]", "cmis:isImmutable");
					oForm.append("propertyValue[0]", false);
					let oSettings = {
						"url": "/browser/982c591b-7390-42db-a8b5-4f28e73dabb9/root/?cmisaction=delete&objectId=" + VanningPartId,
						"method": "POST",
						"timeout": 0,
						"processData": false,
						"mimeType": "multipart/form-data",
						"contentType": false,						
						"data": oForm
					};

					$.ajax(oSettings).done(async function (response) {
						var form = new FormData();
						form.append("cmisaction", "createDocument");
						form.append("propertyId[0]", "cmis:name");
						form.append("propertyValue[0]", WriteNo + 'VP'); // 생성파일이름 = 작성의뢰번호로?
						form.append("propertyId[1]", "cmis:objectTypeId");
						form.append("propertyValue[1]", "cmis:document");
						form.append("succinct", "true");
						form.append("filename", VanningPartContent);
						form.append("media", "binary");
						var settings = {
							"url": "/browser/982c591b-7390-42db-a8b5-4f28e73dabb9/root/",
							"method": "POST",
							"timeout": 0,
							"processData": false,
							"mimeType": "multipart/form-data",
							"contentType": false,
							"data": form
						};
						$.ajax(settings).done(async function (response) {
							modules.messageBox('alert', '수정이 완료되었습니다22', '수정 완료');
							SharedModel.vanningPartSrc = VanningPartBase64;
						}).fail(async function (xhr) {
						});
					}).fail(async function (xhr) {
						console.log(xhr)
					});
				}
			}
		},
		onVanningPartListSelect: function (oEvent) {
			let iCheck = oEvent.getSource().mProperties.selectedIndex;
			let vanningInputModel = this.getView().getModel('vanningInputModel');
			let vanningModel = this.getView().getModel('vanningModel');

			if (iCheck !== -1) {
				let oData = vanningModel.getData()[iCheck];

				// if (!oData.surface) {
				// 	_this.byId('surface').setSelected(false);
				// } else if (oData.surface) {
				// 	_this.byId('surface').setSelected(true);
				// }

				// if (!oData.color) {
				// 	_this.byId('color').setSelected(false);
				// } else if (oData.color) {
				// 	_this.byId('color').setSelected(true);
				// }
				vanningInputModel.setData(oData);
				vanningInputModel.refresh();
			} else if (iCheck === -1) {
				vanningInputModel.setData({});
				// _this.byId('surface').setSelected(false);
				// _this.byId('color').setSelected(false);

				vanningInputModel.refresh();
			}
		},
	})
})