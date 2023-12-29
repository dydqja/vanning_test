sap.ui.define(
    [
        "sap/ui/core/Fragment",
        "sap/m/MessageBox",
        'sap/ui/model/json/JSONModel',
        "sap/ui/export/Spreadsheet",
        "sap/m/MessageToast",
    ],
    function (
        Fragment,
        MessageBox,
        JSONModel,
        Spreadsheet,
        MessageToast
    ) {
        "use strict";
        var oTextModel;

        return {

            // =================================================================================================================
            // ============================================ 사용 가능한 함수들 ==================================================
            // =================================================================================================================

            /**
           * ajax "get"
           * 
           * (Example)
           * modules.get(url).then((data) => {
           *    console.log(data.value);
           * })
           **/
            get: function (url) {
                let settings = {
                    type: "get",
                    async: true,
                    url: url,
                };
                return new Promise((resolve) => {
                    $.ajax(settings)
                        .done((result, textStatus, request) => {
                            resolve(result);
                        })
                        .fail(function (xhr) {
                            MessageBox.error("Data Read Failed");
                            console.log(xhr);
                        })
                });
            },
            /**
           * Create Table Seq
           * 
           * (Example)
           * let newSeq = await modules.getSeq('AT');
           **/
            getSeq: function (table) {
                let url = "/basicinfo/Create_seq(tablecode='" + table + "')/Set"
                let settings = {
                    type: "get",
                    async: false,
                    url: url,
                };
                return new Promise((resolve) => {
                    $.ajax(settings)
                        .done((result, textStatus, request) => {
                            let new_seq = result.value[0].new_seq;
                            resolve(new_seq);
                        })
                        .fail(function (xhr) {
                            MessageBox.error("SEQ Request Failed");
                            console.log(xhr);
                        })
                });

            },

            /**
           * get Tree Data
           * 
           * (Example)
           * modules.getTree(url).then((data) => {
           *    console.log(data);
           *       data = [data.length,[{data...}]]
           * })
           **/
            getTree: function (url) {
                let settings = {
                    type: "get",
                    async: false,
                    url: url,
                };
                return new Promise((resolve) => {
                    $.ajax(settings)
                        .done((result, textStatus, request) => {
                            let data = result.value;
                            var flat = {};
                            var send_data = [];
                            send_data.push(data.length);
                            for (let i = 0; i < data.length; i++) {
                                let key = data[i].seq;
                                flat[key] = data[i];
                                flat[key].__metadata = '';
                            }

                            // child container array to each node
                            for (let i in flat) {
                                flat[i].children = []; // add children container
                            }

                            // populate the child container arrays
                            for (let i in flat) {
                                let parentkey = flat[i].parent_seq;
                                if (flat[parentkey]) {
                                    flat[parentkey].children.push(flat[i]);
                                }
                            }

                            // find the root nodes (no parent found) and create the hierarchy tree from them
                            let root = [];
                            for (let i in flat) {
                                let parentkey = flat[i].parent_seq;
                                if (!flat[parentkey]) {
                                    root.push(flat[i]);
                                }
                            }

                            // var oJsonModel = new sap.ui.model.json.JSONModel();
                            // oJsonModel.setData(root);
                            send_data.push(root);
                            //[0] = data.length
                            //[1] = tree table data
                            resolve(send_data);
                        })
                        .fail(function (xhr) {
                            MessageBox.error("Tree Data Request Failed")
                            console.log(xhr);
                        })
                });

            },

            /**
           * ajax "post"
           **/
            post: function (url, data) {
                return new Promise((resolve) => {
                    $.ajax({
                        url: url,
                        type: "GET",
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('X-CSRF-Token', "Fetch");
                        },
                    })
                        .done((result, textStatus, xhr) => {
                            let token = xhr.getResponseHeader("X-CSRF-Token");
                            $.ajax({
                                type: 'post',
                                async: false,
                                data: JSON.stringify(data),
                                url: url,
                                beforeSend: function (xhr) {
                                    xhr.setRequestHeader('X-CSRF-Token', token);
                                    xhr.setRequestHeader('Content-type', 'application/json');
                                }
                            })
                                .done(function (status) {
                                    resolve(status);
                                })
                                .fail(function (xhr) {
                                    resolve(xhr);
                                    MessageBox.error("Post Request Failed");
                                    console.log(xhr);
                                })
                        })
                        .fail(function (xhr) {
                            MessageBox.error("Token Request Failed");
                            console.log(xhr);
                        })
                });
            },

            /**
           * ajax "patch"
           **/
            patch: function (url, data, previousETag) {
                let split = url.split("(");
                let tokenUrl = split[0];

                return new Promise((resolve) => {
                    $.ajax({
                        url: tokenUrl,
                        type: "GET",
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('X-CSRF-Token', "Fetch");
                        },
                    })
                        .done((result, textStatus, xhr) => {
                            let token = xhr.getResponseHeader("X-CSRF-Token");
                            $.ajax({
                                type: 'PATCH',
                                async: false,
                                headers: {
                                    'If-Match': previousETag // 이전 ETag 값을 설정
                                },
                                data: JSON.stringify(data),
                                url: url,
                                beforeSend: function (xhr) {
                                    xhr.setRequestHeader('X-CSRF-Token', token);
                                    xhr.setRequestHeader('Content-type', 'application/json');
                                },
                            })
                                .done(function (status) {
                                    // resolve(status);
                                    resolve({ error: 'success' });
                                })
                                .fail(function (xhr) {
                                    // resolve(xhr);
                                    if (xhr.status == '412') {
                                        MessageBox.error("It's already been modified");
                                        resolve({ error: '412' });
                                    } else {
                                        MessageBox.error("Patch Request Failed");
                                        resolve({ error: 'patch failed' });
                                    }
                                    console.log(xhr);
                                })
                        })
                        .fail(function (xhr) {
                            MessageBox.error("Token Request Failed");
                            console.log(xhr);
                        });
                })
            },


            /**
           * ajax "delete"
           **/
            delete: function (url, previousETag) {
                let split = url.split("(");
                let tokenUrl = split[0];
                return new Promise((resolve) => {
                    $.ajax({
                        url: tokenUrl,
                        type: "GET",
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('X-CSRF-Token', "Fetch");
                        },
                    })
                        .done((result, textStatus, xhr) => {
                            let token = xhr.getResponseHeader("X-CSRF-Token");
                            $.ajax({
                                type: 'delete',
                                async: false,
                                headers: {
                                    'If-Match': previousETag // 이전 ETag 값을 설정
                                },
                                url: url,
                                beforeSend: function (xhr) {
                                    xhr.setRequestHeader('X-CSRF-Token', token);
                                },
                            })
                                .done(function (status) {
                                    resolve(status);
                                })
                                .fail(function (xhr) {
                                    if (xhr.status == '412') {
                                        MessageBox.error("It's already been modified")
                                    } else {
                                        MessageBox.error("Delete Request Failed")
                                    }
                                    console.log(xhr);
                                })
                        })
                        .fail(function (xhr) {
                            MessageBox.error("Token Request Failed");
                            console.log(xhr);
                        })
                });
            },

            downloadImageFile: function (url) {
                let settings = {
                    url: url,
                    method: "GET",
                    xhrFields: {
                        responseType: "blob"
                    }
                };

                return new Promise((resolve) => {
                    $.ajax(settings)
                        .done((result, textStatus, request) => {
                            resolve(result);
                        })
                        .fail(function (xhr) {
                            reject(new Error('Download failed'));
                            console.log(xhr);
                        })
                });
            },

            downloadTextFile: function (url) {
                let settings = {
                    url: url,
                    method: "GET",
                    xhrFields: {
                        responseType: "blob"
                    }
                };

                return new Promise((resolve, reject) => {
                    $.ajax(settings)
                        .done((result, textStatus, request) => {
                            let reader = new FileReader();
                            reader.onload = function () {
                                resolve(reader.result);
                            };
                            reader.readAsText(result);
                        })
                        .fail((jqXHR, textStatus, errorThrown) => {
                            reject(new Error('Download failed'));
                        });
                });
            },

            /**
           * @ param status (confirm, alert, error, information, warning, success)
           * @ param message  (text of MessageBox)
           * @ param title(optional) (title of MessageBox)
           * 
           * (Example)
           * MessageBox("error", "Error Text");
           * 
           * MessageBoxConfirm("confirm", "message", "title").then((check) => {
           *    console.log(check);  // true or false
           * });
           **/
            messageBox: function (status, message, title) {
                MessageBox[status](message, {
                    title: title,
                })
            },

            messageBoxConfirm: function (status, message, title) {
                return new Promise((resolve) => {
                    MessageBox[status](message, {
                        title: title,
                        actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                        emphasizedAction: MessageBox.Action.OK,
                        onClose: function (oAction) {
                            if (oAction === "OK") {
                                resolve(true);
                            } else {
                                resolve(false);
                            }
                        }
                    })
                });
            },

            /**
             * Open Dialog (Fragment)
             * @ param _this
             * @ param path (fragment path)
             * @ param id (fragment id)
             **/
            openDialog: async function (_this, path, id) {
                let that = _this;

                // busyDialog = that.byId(id)
                if (!that.byId(id)) {
                    await Fragment.load({
                        id: that.getView().getId(),
                        name: path,
                        controller: that,
                    }).then(
                        async function (oDialog) {
                            that.getView().addDependent(oDialog);
                            oDialog.open(oDialog);
                            if (that.byId("UploadSet")) {
                                that.byId("UploadSet").mAggregations._illustratedMessage.setIllustrationSize("Base");
                            }
                            if (that.byId("UploadSet2")) {
                                that.byId("UploadSet2").mAggregations._illustratedMessage.setIllustrationSize("Base");
                            }
                        }.bind(that)
                    );
                } else {
                    that.byId(id).open(id);
                    if (that.byId("UploadSet")) {
                        that.byId("UploadSet").mAggregations._illustratedMessage.setIllustrationSize("Base");
                    }
                    if (that.byId("UploadSet2")) {
                        that.byId("UploadSet2").mAggregations._illustratedMessage.setIllustrationSize("Base");
                    }
                }
            },

            DialogSet: function (_this, path, id) {
                let that = _this;

                return new Promise(function (resolve) {
                    if (!that.byId(id)) {
                        Fragment.load({
                            id: that.getView().getId(),
                            name: path,
                            controller: that,
                        }).then(function (oDialog) {
                            that.getView().addDependent(oDialog);
                            oDialog.open(oDialog);
                            resolve(oDialog); // Resolve the promise with oDialog
                        });
                    } else {
                        let dialog = that.byId(id);
                        dialog.open(id);
                        resolve(dialog); // Resolve the promise with dialog
                    }
                });
            },


            /**
             * Close Dialog
             * @ param _this
             * @ param id (fragment id)
             **/
            closeDialog: function (_this, fragment_id) {
                let that = _this;

                if (
                    that.byId(fragment_id) != undefined ||
                    that.byId(fragment_id) != null
                ) {
                    try {
                        that.byId(fragment_id).close();
                        that.byId(fragment_id).destroy();
                    } catch (error) {
                        that.byId(fragment_id).destroy();
                    }
                }
            },

            /**
             * Create Popover
             * @ param _this
             * @ param path (fragment path)
             * @ param Source (버튼 oEvent.getSource())
             **/
            openPopover: async function (_this, sPath, sId, oSource) {
                let that = _this;

                if (!that.byId(sId)) {
                    await Fragment.load({
                        id: that.getView().getId(),
                        name: sPath,
                        controller: that
                    }).then(function (oPopover) {
                        that.getView().addDependent(oPopover);
                        oPopover.openBy(oSource);
                    })
                } else {
                    that.byId(sId).openBy(oSource);
                }
            },

            setBusy: async function (flag) {
                if (flag) {
                    sap.ui.controller('jelink.gilro.home.controller.App').BusyIndicatorshow();
                } else {
                    sap.ui.controller('jelink.gilro.home.controller.App').BusyIndicatorhide();
                }
            },

            // Excel Download Button Pressed  m.table 용
            onExcelDownload: async function (table, data, noDataText, excel_name) {
                if (data.length == 0) {
                    MessageBox.alert(noDataText);
                    return;
                }

                let aProducts = [];
                let tableColumn = table.mBindingInfos.items.template.getCells();
                for (let i = 0; i < data.length; i++) {
                    let product = new Object();

                    for (let j = 0; j < tableColumn.length; j++) {
                        if (tableColumn[j].mBindingInfos.text !== undefined) {
                            let path = tableColumn[j].mBindingInfos.text.parts[0].path;

                            if (data[i][path] == true) {
                                product[path] = 'Y';
                            } else if (data[i][path] == false) {
                                product[path] = 'N';
                            } else {
                                product[path] = data[i][path];
                            }
                        } else if (tableColumn[j].mBindingInfos.state !== undefined) {
                            let path = tableColumn[j].mBindingInfos.state.parts[0].path;
                            product[path] = (data[i][path]) ? "On" : "Off";
                        } else if (tableColumn[j].mAggregations.items.length !== 0) {
                            if (tableColumn[j].mAggregations.items[1].mBindingInfos.visible !== undefined) {
                                let path = tableColumn[j].mAggregations.items[1].mBindingInfos.visible.parts[tableColumn[j].mAggregations.items[1].mBindingInfos.visible.parts.length - 1].path;
                                if (data[i][path]) {
                                    product['notice'] = '통보 완료';
                                } else {
                                    product['notice'] = null;
                                }
                            } else {
                                let path = tableColumn[j].mAggregations.items[1].mBindingInfos.text.parts[tableColumn[j].mAggregations.items[1].mBindingInfos.text.parts.length - 1].path;
                                product[path] = data[i][path];
                            }
                        } else {
                            continue;
                        }
                    }

                    aProducts.push(product);
                }
                let aCols = this.createColumnConfig(table);
                let oSettings = {
                    workbook: { columns: aCols },
                    fileName: excel_name + ".xlsx",
                    dataSource: aProducts
                };

                let oSheet = await new Spreadsheet(oSettings);
                oSheet.build().finally(function () {
                    oSheet.destroy();
                });
            },

            // Create Excel Column
            createColumnConfig: function (table) {
                let aCols = [];

                for (let i = 0; i < table.mBindingInfos.items.template.getCells().length; i++) {
                    let property;
                    if (table.mBindingInfos.items.template.getCells()[i].mBindingInfos.text !== undefined) {
                        property = table.mBindingInfos.items.template.getCells()[i].mBindingInfos.text.parts[0].path
                    } else if (table.mBindingInfos.items.template.getCells()[i].mBindingInfos.state !== undefined) {
                        property = table.mBindingInfos.items.template.getCells()[i].mBindingInfos.state.parts[0].path
                    } else if (table.mBindingInfos.items.template.getCells()[i].mAggregations.items.length !== 0) {
                        if (table.mBindingInfos.items.template.getCells()[i].mAggregations.items[1].mBindingInfos.visible !== undefined) {
                            property = 'notice';
                        } else {
                            property = table.mBindingInfos.items.template.getCells()[i].mAggregations.items[1].mBindingInfos.text.parts[table.mBindingInfos.items.template.getCells()[i].mAggregations.items[1].mBindingInfos.text.parts.length - 1].path;
                        }
                    } else {
                        continue;
                    }

                    let object = {
                        label: table.getColumns()[i].getHeader().getText(),
                        property: property,
                    }
                    aCols.push(object);
                }

                return aCols;
            },

            // Excel 버튼 클릭시 호출 함수 ui.table 용
            onUiExcelDownload: async function (table, data, noDataText, excel_name) {
                if (data.length == 0) {
                    MessageBox.alert(noDataText);
                    return;
                }

                let aProducts = [];
                for (let i = 0; i < data.length; i++) {
                    let product = new Object();

                    let tableColumn = table.getColumns();
                    for (let j = 0; j < tableColumn.length; j++) {
                        if (tableColumn[j].mAggregations.template.mBindingInfos.text !== undefined) {
                            let path = tableColumn[j].mAggregations.template.mBindingInfos.text.parts[0].path;
                            product[path] = data[i][path];
                        } else if (tableColumn[j].mAggregations.template.mBindingInfos.state !== undefined) {
                            let path = tableColumn[j].mAggregations.template.mBindingInfos.state.parts[0].path;
                            product[path] = (data[i][path]) ? "On" : "Off";
                        } else if (tableColumn[j].mAggregations.template.mBindingInfos.value !== undefined) {
                            let path = tableColumn[j].mAggregations.template.mBindingInfos.value.parts[0].path;
                            product[path] = data[i][path];
                        }
                    }

                    aProducts.push(product);
                }

                let aCols = this.createUiColumnConfig(table);
                let oSettings = {
                    workbook: { columns: aCols },
                    fileName: excel_name + ".xlsx",
                    dataSource: aProducts
                };

                let oSheet = await new Spreadsheet(oSettings);
                oSheet.build().finally(function () {
                    oSheet.destroy();
                });
            },

            createUiColumnConfig: function (table) { // Create Excel Column
                let aCols = [];
                for (let i = 0; i < table.getColumns().length; i++) {
                    let property;
                    if (table.getColumns()[i].mAggregations.template.mBindingInfos.text !== undefined) {
                        property = table.getColumns()[i].mAggregations.template.mBindingInfos.text.parts[0].path
                    } else if (table.getColumns()[i].mAggregations.template.mBindingInfos.state !== undefined) {
                        property = table.getColumns()[i].mAggregations.template.mBindingInfos.state.parts[0].path
                    } else if (table.getColumns()[i].mAggregations.template.mBindingInfos.value !== undefined) {
                        property = table.getColumns()[i].mAggregations.template.mBindingInfos.value.parts[0].path
                    }
                    let object = {
                        label: table.getColumns()[i].mAggregations.label.mProperties.text,
                        property: property,
                    }
                    aCols.push(object);
                }
                return aCols;
            },

            // fieldGroupId를 기반으로 유효성 검사
            globalCheck: function (fieldGroupId, _this) {
                let that = this;
                let checkList = [];
                let grouparray = fieldGroupId.split(",");
                for (let i = 0; i < grouparray.length; i++) {
                    _this.getView().getControlsByFieldGroupId(grouparray[i]).forEach(function (object) {
                        checkList.push(that.fieldCheck(object));
                    })
                }

                for (let i = 0; i < checkList.length; i++) {
                    if (!checkList[i]) {
                        return false;
                    }
                }
                return true;
            },

            // 각 필드의 유효성 검사
            fieldCheck: function (object) {
                let check = false;

                if (object.isA("sap.m.MultiInput")) {
                    if (!object.getTokens().length) {
                        check = this.requiredcheck(object);
                    } else {
                        object.setValueState("None");
                        check = true;
                    }
                }else if (object.isA("sap.m.TextArea")) {
                    if (!object.getValue().length) {
                        check = this.requiredcheck(object);
                    } else {
                        object.setValueState("None");
                        check = true;
                    }
                } else if (object.isA(["sap.m.Input"])) {
                    if (object.getValue().length == 0) {
                        check = this.requiredcheck(object);
                    } else if (object.getFieldGroupIds().includes("Title")) {
                        if (object.getValue().length < 2) {
                            object.setValueState("Error");
                            object.setValueStateText("Enter a value with at least 2 characters.");
                        } else if (object.getValue().length > 50) {
                            object.setValueState("Error");
                            object.setValueStateText("Enter a value with no more than 50 characters.");
                        } else {
                            object.setValueState("None");
                            check = true;
                        }
                    } else if (object.getFieldGroupIds().includes("Quantity")) {
                        if (object.getValue() == 0) {
                            object.setValueState("Error");
                            object.setValueStateText("Please enter an integer greater than 0.");
                        } else {
                            object.setValueState("None");
                            check = true;
                        }
                    } else if (object.getFieldGroupIds().includes("Email")) {
                        let emailExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
                        if (object.getValue().match(emailExp) == null) {
                            object.setValueState("Error");
                            object.setValueStateText("Invalid email format.");
                        } else {
                            object.setValueState("None");
                            check = true;
                        }
                    } else {
                        object.setValueState("None");
                        check = true;
                    }
                } else if (object.isA("sap.m.ComboBox")) {
                    if (object.getValue().length == 0) {
                        check = this.requiredcheck(object);
                    } else {
                        object.setValueState("None");
                        check = true;
                    }
                } else if (object.isA("sap.m.DatePicker")) {
                    let dataValid = object.isValidValue();
                    if (object.getValue().length == 0) {
                        check = this.requiredcheck(object);
                    } else if (!dataValid) {
                        object.setValueState("Error");
                    } else {
                        object.setValueState("None");
                        check = true;
                    }
                } else if (object.isA("sap.m.TimePicker")) {
                    if (object.getValue().length == 0) {
                        check = this.requiredcheck(object);
                    } else {
                        object.setValueState("None");
                        check = true;
                    }
                } else if (object.isA("sap.m.Select")) {
                    if (object.getSelectedItem() == null) {
                        check = this.requiredcheck(object);
                    } else {
                        object.setValueState("None");
                        check = true;
                    }
                } else if (object.isA("sap.ui.richtexteditor.RichTextEditor")) {
                    if (!!object.getValue().length) {
                        check = true;
                    }
                } else {
                    check = true;
                }

                return check;
            },

            // fieldGroupId에 Required가 포함되어 있는지 체크
            requiredcheck: function (object) {
                if (object.getFieldGroupIds().includes("Required")) {
                    object.setValueState("Error");
                    return false;
                } else if (object.getFieldGroupIds().includes("Required2")) {
                    object.setValueState("Error");
                    return false;
                } else {
                    object.setValueState("None");
                    return true;
                }
            },

            // fieldGroupId를 기반으로 필드 초기화
            globalClear: function (fieldGroupId, _this) {
                let that = this;
                let grouparray = fieldGroupId.split(",");
                for (let i = 0; i < grouparray.length; i++) {
                    _this.getView().getControlsByFieldGroupId(grouparray[i]).forEach(function (object) {
                        that.fieldClear(object);
                    })
                }
            },

            // 각 필드의 초기화
            fieldClear: function (object) {
                if (object.isA("sap.m.MultiInput")) {
                    object.removeAllTokens();
                    object.setValueState("None");
                } else if (object.isA(["sap.m.Input", "sap.m.DatePicker", "sap.m.TimePicker","sap.m.TextArea"])) {
                    object.setValue(null);
                    object.setValueState("None");
                } else if (object.isA("sap.m.Select")) {
                    object.setSelectedKey(null);
                    object.setValueState("None");
                    // object.removeAllItems();
                } else if (object.isA("sap.ui.richtexteditor.RichTextEditor")) {
                    object.setValue(null);
                } else if (object.isA("sap.m.upload.UploadSet")) {
                    object.removeAllItems();
                    object.setUploadEnabled(true);
                } else if (object.isA("sap.m.CheckBox")) {
                    object.setSelected(false);
                } else if (object.isA("sap.m.ComboBox")) {
                    object.setValue(null);
                    object.setValueState("None");
                    object.setSelectedKey(null);
                }
            },

            // 파일 확장자 제거
            removeFileExtension: function (fileName) {
                if (fileName !== null) {
                    let split = fileName.split(".");
                    let text = "";
                    for (let i = 0; i < split.length - 1; i++) {
                        text += split[i];
                    }

                    return text;
                } else {
                    return;
                }
            },

            //각 화면 별 CUD 권한 세팅
            accesscheck: function () {
                let menu_seq = sap.ui.core.Component.get('container-hma').getRouter()._oMatchedRoute._oConfig.name;
                let path = "/user/UseruseMenu(user_id='')/Set?$filter=seq eq '" + menu_seq + "'";
                return new Promise((resolve) => {
                    $.ajax({
                        type: "get",
                        async: false,
                        url: path,
                    })
                        .done(function (data) {
                            let final_data = {
                                read: data.value[0].isRead,
                                create: data.value[0].isCreate,
                                delete: data.value[0].isDelete,
                                update: data.value[0].isUpdate
                            }
                            resolve(final_data);
                        })
                        .fail(function (xhr) {
                            MessageBox.error(xhr);
                            console.log(xhr);
                        })

                });
            },

            //m.table paging footer create
            //function(테이블 footer 영역 byId(),paging 버튼 총 개수,pageNum, 컨트롤러 this)
            createfooter: function (tablefooter, footerlength, pageNum, that) {
                tablefooter.destroyContent(); //영역 초기화
                tablefooter.addContent(new sap.m.ToolbarSpacer()); //가운데 정렬하기위한 앞에 공간 확보

                if (footerlength > 0) {       //데이터가 있을때만 footer 생성 
                    //처음으로 및 이전 버튼 생성
                    var firstbutton = new sap.m.Button({
                        press: that.selectPage,
                        icon: 'sap-icon://close-command-field',
                        tooltip: 'First'
                    });
                    firstbutton.data('buttonseq', 'first');
                    var previousbutton = new sap.m.Button({
                        press: that.selectPage,
                        icon: 'sap-icon://nav-back',
                        tooltip: 'Back'
                    });
                    previousbutton.data('buttonseq', 'previous');
                    tablefooter.addContent(firstbutton)
                    tablefooter.addContent(previousbutton)

                    //버튼 세팅
                    if (pageNum / 3 > 1) {
                        var etcbutton = new sap.m.Button({
                            press: that.selectPage,
                            text: '...',
                            tooltip: 'Previous Page'
                        });
                        etcbutton.data('buttonseq', 'pre_etc');
                        tablefooter.addContent(etcbutton)
                    }
                    if (pageNum / 3 < Math.floor(footerlength / 3) && footerlength > 3) {
                        for (let i = pageNum; i < pageNum + 3; i++) {
                            var pagebutton = new sap.m.Button({
                                text: i,
                                press: that.selectPage,
                            });
                            pagebutton.data('buttonseq', 'page');
                            tablefooter.addContent(pagebutton)


                        }
                        if (pageNum + 3 <= footerlength) {
                            var etcbutton = new sap.m.Button({
                                press: that.selectPage,
                                text: '...',
                                tooltip: 'Next Page'
                            });
                            etcbutton.data('buttonseq', 'next_etc');
                            tablefooter.addContent(etcbutton)
                        }
                    } else {
                        for (let i = pageNum; i <= footerlength; i++) {
                            var pagebutton = new sap.m.Button({
                                text: i,
                                press: that.selectPage,
                            });
                            pagebutton.data('buttonseq', 'page');
                            tablefooter.addContent(pagebutton)


                        }
                    }
                    //다음, 마지막으로 버튼 세팅
                    var nextbutton = new sap.m.Button({
                        press: that.selectPage,
                        icon: 'sap-icon://navigation-right-arrow',
                        tooltip: 'Next'
                    });
                    nextbutton.data('buttonseq', 'next');
                    var finalbutton = new sap.m.Button({
                        press: that.selectPage,
                        icon: 'sap-icon://open-command-field',
                        tooltip: 'Last'
                    });
                    finalbutton.data('buttonseq', 'final');
                    tablefooter.addContent(nextbutton)
                    tablefooter.addContent(finalbutton)
                    tablefooter.addContent(new sap.m.ToolbarSpacer()); //가운데 정렬을 위한 뒷 공간 확보
                }
            },

            //pagin button click
            pagingbutton: async function (oEvent, tablefooter, footerlength, pageNum, that) {
                //초기 첫 라우팅시 첫 페이징 데이터 띄워주기 위함
                if (!oEvent) {
                    pageNum = 1;
                }
                //버튼을 실제로 눌렸을 때 작동 함수
                else {
                    var buttonseq = oEvent.getSource().data('buttonseq'); //버튼이 가지고 있는 customdata
                    //처음으로 버튼 클릭 시
                    if (buttonseq == 'first') {
                        pageNum = 1;
                        this.createfooter(tablefooter, footerlength, pageNum, that);
                    }
                    //이전으로 버튼 클릭시
                    else if (buttonseq == 'previous') {
                        if (pageNum == 1) {
                            return pageNum;
                        }
                        else if (pageNum % 3 === 1) {
                            pageNum = pageNum - 3;
                            await this.createfooter(tablefooter, footerlength, pageNum, that);
                            pageNum = pageNum + 2;

                        } else {
                            pageNum = pageNum - 1;
                        }
                    }
                    //다음으로 버튼 클릭 시
                    else if (buttonseq == 'next') {
                        if (pageNum == footerlength) {
                            return pageNum;
                        }
                        else if (pageNum % 3 === 0) {
                            pageNum = pageNum + 1;
                            this.createfooter(tablefooter, footerlength, pageNum, that);

                        } else {
                            pageNum = pageNum + 1;
                        }
                    }
                    //마지막으로 버튼 클릭 시
                    else if (buttonseq == 'final') {
                        //로직 수정 필요해보이는데?
                        if (footerlength == 0) {
                            pageNum = 1
                        }
                        else if (footerlength <= 3) {
                            pageNum = footerlength;
                        }
                        else {
                            pageNum = footerlength;
                            if (pageNum % 3 == 2) {
                                pageNum = pageNum - 1;
                                await this.createfooter(tablefooter, footerlength, pageNum, that);
                                pageNum = pageNum + 1;
                            } else if (pageNum % 3 == 0) {
                                pageNum = pageNum - 2;
                                await this.createfooter(tablefooter, footerlength, pageNum, that);
                                pageNum = pageNum + 2;
                            } else {
                                this.createfooter(tablefooter, footerlength, pageNum, that);
                            }
                        }

                    }
                    //이전 '...' 버튼 클릭 시
                    else if (buttonseq == 'pre_etc') {
                        if (pageNum % 3 == 1) {
                            pageNum = pageNum - 3;
                            await this.createfooter(tablefooter, footerlength, pageNum, that);
                            pageNum = pageNum + 2;
                        } else if (pageNum % 3 == 2) {
                            pageNum = pageNum - 4;
                            await this.createfooter(tablefooter, footerlength, pageNum, that);
                            pageNum = pageNum + 2;
                        } else {
                            pageNum = pageNum - 5;
                            await this.createfooter(tablefooter, footerlength, pageNum, that);
                            pageNum = pageNum + 2;
                        }
                    }
                    //다음으로 '...' 버튼 클릭 시
                    else if (buttonseq == 'next_etc') {
                        if (pageNum % 3 == 1) {
                            pageNum = pageNum + 3;
                        } else if (pageNum % 3 == 2) {
                            pageNum = pageNum + 2;
                        } else {
                            pageNum = pageNum + 1;
                        }
                        this.createfooter(tablefooter, footerlength, pageNum, that);
                    }
                    //숫자 클릭 시
                    else {
                        pageNum = Number(oEvent.getSource().getText());
                    }
                }
                return pageNum;
            },

            //pagebutton 현재 페이지 강조 
            pagingbuttonEmphasized: function (tablefooter, pageNum) {
                let footercontent = tablefooter.mAggregations.content;
                for (let i = 0; i < footercontent.length; i++) {
                    if (footercontent[i].getMetadata().getName() == 'sap.m.Button') {
                        if (Number(footercontent[i].getText()) == pageNum) {
                            footercontent[i].setType('Emphasized');
                        } else {
                            footercontent[i].setType('Default');
                        }

                    }
                }
            },

            getfilterDate: function (date) {
                let temp = new Date(date)
                temp.setDate(new Date(date).getDate() + 1);
                let searchdate2 = new Date(temp).setMilliseconds(-1);
                let datefinal = [];
                //0 : gt , 1: lt
                datefinal[0] = (new Date(new Date(date).getTime() + new Date(date).getTimezoneOffset() * 60000).toISOString());
                datefinal[1] = (new Date(new Date(searchdate2).getTime() + new Date(date).getTimezoneOffset() * 60000).toISOString());
                return datefinal;
            },

            // ??
            // getfilterTickDate: function (date) {
            //     let temp = new Date(date)
            //     temp.setDate(new Date(date).getDate() + 1);
            //     let searchdate2 = new Date(temp).setMilliseconds(-1);
            //     let datefinal = [];
            //     //0 : gt , 1: lt
            //     datefinal[0] = (new Date(date).getTime() + new Date(date).getTimezoneOffset() * 60000);
            //     datefinal[1] = (new Date(searchdate2).getTime() + new Date(date).getTimezoneOffset() * 60000);
            //     return datefinal;
            // },

            uploadSetErrorHandle: function (oEvent, path) {
                let UploadSet = oEvent.getSource();
                var status = oEvent.getParameters("response").status;
                var file_seq = oEvent.getParameters("response").item.newFileSeq;
                var item = oEvent.getParameters("response").item;
                if (status == 200 || status == 204 || status == 201) {
                    console.log("upload complete")
                } else {
                    MessageBox.error("Upload Failed");
                    let deletePath = path + "',file_seq='" + file_seq + "')"
                    this.delete(deletePath).then((data) => {
                        UploadSet.removeItem(item)
                    });
                }
            },

            CreateFile: async function (item, seq, newSeq, that, root, viewRoot) {
                let newFileSeq = await this.getSeq('AT');
                item.newFileSeq = newFileSeq;

                let temp = {
                    file_seq: newFileSeq,
                    media_type: item.getMediaType(),
                    file_name: item.getFileName(),
                    file_size: item.getFileObject().size,
                };
                temp[seq] = newSeq;
                await this.post(root, temp);
                var that = that;

                $.ajax({
                    url: root,
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader("X-CSRF-Token", "Fetch"); },
                })
                    .done((result, textStatus, xhr) => {
                        let token = xhr.getResponseHeader("X-CSRF-Token");

                        // let url = root + "/" + newSeq + "/" + newFileSeq + "/file_content"
                        let url = root + "(" + seq + "='" + newSeq + "',file_seq='" + newFileSeq + "')/file_content"
                        let url2 = viewRoot + "(" + seq + "='" + newSeq + "',file_seq='" + newFileSeq + "')/file_content"
                        item.setUploadUrl(url);
                        let UploadSet = that.byId("UploadSet");
                        UploadSet.setHttpRequestMethod("PUT")
                        UploadSet.removeAllHeaderFields();
                        UploadSet.addHeaderField(new sap.ui.core.Item({ key: "x-csrf-token", text: token }));
                        UploadSet.uploadItem(item);

                        item.setThumbnailUrl(url2);
                        item.setUrl(url2);
                        item.attachOpenPressed(that.onOpenPressed);
                        item.setVisibleEdit(false);
                    })
                    .fail(function (xhr) {
                        MessageBox.error('Error while calling the Data');
                        console.log(xhr);
                    })
                return newFileSeq;
            },

            // 파일 생성 -> 모두 Dummy로 대체하면 삭제 예정 (200자 제한 필요)
            createDummy: async function (oEvent, onOpenPressed) {
                let item = oEvent.getParameter('item');
                let source = oEvent.getSource();

                let newFileSeq;
                let fileUrl = "/basicinfo/Create_seq('AT')/Set";
                await this.get(fileUrl).then((data) => {
                    newFileSeq = data.value[0].new_seq;
                });
                item.newFileSeq = newFileSeq;

                let temp = {
                    file_seq: newFileSeq,
                    media_type: item.getMediaType(),
                    file_name: item.getFileName(),
                    file_size: item.getFileObject().size,
                };
                await this.post('/content/Dummy_File', temp);

                await $.ajax({
                    url: '/content/Dummy_File',
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader("X-CSRF-Token", "Fetch"); },
                })
                    .done((result, textStatus, xhr) => {
                        let token = xhr.getResponseHeader("X-CSRF-Token");

                        let url = "/content/Dummy_File('" + newFileSeq + "')/file_content";
                        item.setUploadUrl(url);
                        source.setHttpRequestMethod('PUT');
                        source.removeAllHeaderFields();
                        source.addHeaderField(new sap.ui.core.Item({ key: "x-csrf-token", text: token }));
                        source.uploadItem(item);

                        item.setThumbnailUrl(url);
                        item.setUrl(url);
                        item.attachOpenPressed(onOpenPressed);
                        item.setVisibleEdit(false);
                    })
                    .fail(function (xhr) {
                        this.messageBox(textModel['datafailed']);
                        console.log(xhr)
                    })
            },

            // Dummy File에 파일 업로드 시 openPressed를 붙이는 함수
            createOpenPressed: async function (that, oEvent, entitySeq, model, entity) {
                oEvent.preventDefault();

                let detailModel;
                let source = oEvent.getSource();

                // 새로운 파일
                if (source.newFileSeq != undefined) {
                    let file = source.getFileObject();

                    detailModel = {
                        src: "/content/Dummy_File('" + source.newFileSeq + "')/file_content",
                        file_name: file.name,
                        file_seq: source.newFileSeq,
                        file_size: file.size,
                        media_type: file.type,
                        modDate: new Date(file.lastModified),
                    }

                    // 기존 파일
                } else {
                    let selectedFileContext = oEvent.getParameter("item").getBindingContext(model);
                    let path = selectedFileContext.getPath();
                    detailModel = that.getView().getModel(model).getProperty(path);
                    that.getView().getModel(model).setProperty(path + "/src", entity + "_View(" + entitySeq + "='" + detailModel[entitySeq] + "',file_seq='" + detailModel.file_seq + "')/file_content");
                }

                let type = detailModel.media_type;
                if (type.includes("image")) {
                    oEvent.preventDefault();
                    that.getView().setModel(new JSONModel(detailModel), "detailModel");
                    await this.openDialog(that, "jelink.gilro.collaboration.notice.view.fragment.DetailImage", "detailImageDialog");

                    that.byId("detailImage").setVisible(true);
                    that.byId("detailVideo").setVisible(false);

                } else if (type.includes("video")) {
                    oEvent.preventDefault();

                    if (that.byId("detailVideo")) {
                        that.byId("detailVideo").removeAllItems();
                    }

                    that.getView().setModel(new JSONModel(detailModel), "detailModel");

                    let htmlVideo =
                        "<video controls width='100%' height='100%'>" +
                        "<source src='" + detailModel.src.replace(/'/g, "&#39;") +
                        "' type='" + detailModel.media_type + "'>" +
                        "</video>";

                    await this.openDialog(that, "jelink.gilro.collaboration.notice.view.fragment.DetailImage", "detailImageDialog");

                    that.byId("detailImage").setVisible(false);
                    that.byId("detailVideo").setVisible(true);

                    let html = new sap.ui.core.HTML({ content: htmlVideo })
                    that.byId("detailVideo").addItem(html);

                } else {
                    oEvent.preventDefault();

                    let url = source.getUrl();
                    this.downloadImageFile(url)
                        .then((blob) => {
                            let url = window.URL.createObjectURL(blob);
                            let link = document.createElement("a");
                            link.href = url;
                            link.target = "_blank";
                            link.download = detailModel.file_name;
                            link.style.display = "none";
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(url);
                        })
                        .catch((err) => {
                            MessageBox.error(TextModel['DownloadFailed']);
                            console.error(err);
                        });
                }
            },

            // 파일 생성 시 Dummy -> Entity로 파일 옮기는 로직
            // 사용 예시 -> let UploadSet = this.byId("UploadSet").getItems();
            //             await modules.dummyToEntity(UploadSet, "notice_seq", selectedSeq, "/notice/Notice_File");
            dummyToEntity: async function (UploadSet, entitySeq, Seq, entity) { // 파일이 있는 UploadSet, 상위 entity와 연결된 key, 상위 entity value, 파일을 옮길 entity 경로(사용 시 _View 제거)
                for (let i = 0; i < UploadSet.length; i++) {
                    if (UploadSet[i].newFileSeq) {
                        let file = UploadSet[i].getFileObject();
                        let temp = {
                            [entitySeq]: Seq,
                            file_seq: UploadSet[i].newFileSeq,
                            media_type: file.type,
                            file_name: file.name,
                            file_size: file.size,
                        }
                        await this.post(entity, temp);

                        await $.ajax({
                            url: "/content/Dummy_File_View",
                            type: "GET",
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader("X-CSRF-Token", "Fetch");
                            },
                        }).done(async (result, textStatus, xhr) => {
                            let token = xhr.getResponseHeader("X-CSRF-Token");
                            await fetch("/content/Dummy_File_View('" + UploadSet[i].newFileSeq + "')/file_content").then((oResponse) => oResponse.blob()).then(async (oBlob) => {
                                let ajax = new XMLHttpRequest();
                                await ajax.open("PUT", entity + "_View(" + entitySeq + "='" + Seq + "',file_seq='" + UploadSet[i].newFileSeq + "')/file_content");
                                await ajax.setRequestHeader('X-CSRF-Token', token);
                                await ajax.send(oBlob);
                            })
                        }).fail(function (xhr) {
                            this.messageBox(TextModel['datafailed']);
                            console.log(xhr)
                        })
                    }
                }
            },

            // 파일 생성 시 Dummy -> Entity로 파일 옮기는 로직
            // 사용 예시 -> let UploadSet = this.byId("UploadSet").getItems();
            //             await modules.dummyToEntity(UploadSet, "notice_seq", selectedSeq, "/notice/Notice_File");
            dummyToEntitySchedule: async function (UploadSet, entitySeq, Seq, entity, BoardSeq) { // 파일이 있는 UploadSet, 상위 entity와 연결된 key, 상위 entity value, 파일을 옮길 entity 경로(사용 시 _View 제거)
                for (let i = 0; i < UploadSet.length; i++) {
                    if (UploadSet[i].newFileSeq) {
                        let file = UploadSet[i].getFileObject();
                        let temp = {
                            [entitySeq]: Seq,
                            file_seq: UploadSet[i].newFileSeq,
                            media_type: file.type,
                            file_name: file.name,
                            file_size: file.size,
                        }
                        await this.post(entity, temp);

                        await $.ajax({
                            url: "/content/Dummy_File_View",
                            type: "GET",
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader("X-CSRF-Token", "Fetch");
                            },
                        }).done(async (result, textStatus, xhr) => {
                            let token = xhr.getResponseHeader("X-CSRF-Token");
                            await fetch("/content/Dummy_File_View('" + UploadSet[i].newFileSeq + "')/file_content").then((oResponse) => oResponse.blob()).then(async (oBlob) => {
                                let ajax = new XMLHttpRequest();
                                await ajax.open("PUT", entity + "_View(" + entitySeq + "='" + Seq + "',file_seq='" + UploadSet[i].newFileSeq + "')/file_content");
                                await ajax.setRequestHeader('X-CSRF-Token', token);
                                await ajax.send(oBlob);
                            })
                        }).fail(function (xhr) {
                            this.messageBox(TextModel['datafailed']);
                            console.log(xhr)
                        })
                    } else {
                        let temp = {
                            [entitySeq]: Seq,
                            file_seq: UploadSet[i].mProperties.url.split("'")[3],
                            media_type: UploadSet[i].oBindingContexts.boardFileDetail.oModel.getProperty(UploadSet[i].oBindingContexts.boardFileDetail.sPath).media_type,
                            file_name: UploadSet[i].oBindingContexts.boardFileDetail.oModel.getProperty(UploadSet[i].oBindingContexts.boardFileDetail.sPath).file_name,
                            file_size: UploadSet[i].oBindingContexts.boardFileDetail.oModel.getProperty(UploadSet[i].oBindingContexts.boardFileDetail.sPath).file_size,
                        }
                        await this.post(entity, temp);

                        await $.ajax({
                            url: "/schedule/Schedule_File_View?$filter=schedule_seq eq '" + BoardSeq + "' and file_seq eq '" + UploadSet[i].mProperties.url.split("'")[3] + "'",
                            type: "GET",
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader("X-CSRF-Token", "Fetch");
                            },
                        }).done(async (result, textStatus, xhr) => {
                            let token = xhr.getResponseHeader("X-CSRF-Token");
                            await fetch("/schedule/Schedule_File_View(" + entitySeq + "='" + BoardSeq + "',file_seq='" + UploadSet[i].mProperties.url.split("'")[3] + "')/file_content").then((oResponse) => oResponse.blob()).then(async (oBlob) => {
                                let ajax = new XMLHttpRequest();
                                await ajax.open("PUT", entity + "_View(" + entitySeq + "='" + Seq + "',file_seq='" + UploadSet[i].mProperties.url.split("'")[3] + "')/file_content");
                                await ajax.setRequestHeader('X-CSRF-Token', token);
                                await ajax.send(oBlob);
                            })
                        }).fail(function (xhr) {
                            this.messageBox(TextModel['datafailed']);
                            console.log(xhr)
                        })
                    }
                }
            },

            // TextModel 생성
            createTextModel: async function (that, sLanguage) {
                if (!oTextModel) {
                    let sTextUrl = "/localization/Word_List?$filter=locale eq '" + sLanguage + "'";
                    await this.get(sTextUrl).then(async (data) => {
                        that.getView().setModel(new JSONModel(data.value), 'textModel');
                        let textModel = this.setTextModel(that, "textModel");
                        return textModel;
                    })
                } else {
                    // 텍스트모델에 데이터가 있는 경우 ajax 요청 생략 (modules.js 의 변수에 저장해서 재사용)
                    that.getView().setModel(oTextModel, "textModel");
                    return oTextModel;
                }

            },

            // TextModel
            setTextModel: function (_this, model) {
                let Text = _this.getView().getModel(model).oData;
                let temp = {};
                for (let i = 0; i < Text.length; i++) {
                    let path = Text[i].code;  // my work, Approval
                    temp[path] = Text[i].text;
                }
                let textModel = new JSONModel(temp);
                oTextModel = textModel; // modules.js 의 변수에 저장해서 재사용
                _this.getView().setModel(textModel, model);

                return temp;
            },

            // ??
            setTableFooter: function (_this, model, footer,) {
                let pageNum = 1;
                let totalItems;
                if (_this.getView().getModel(model) != undefined) {
                    totalItems = _this.getView().getModel(model).oData.length;//전체 데이터 총 갯수
                } else totalItems = 0;
                let tablefooter = _this.byId(footer); //footer 영역 

                let footerlength = Math.ceil(totalItems / 10); // 화면에 뜨는 테이블 데이터 갯수로 나누기 해서 footer 총 갯수
                this.createfooter(tablefooter, footerlength, pageNum, _this); //footer 생성 모듈
                return footerlength;
            },

            // ??
            Sort: async function (_this, root, asctext, desctext, model) {
                _this._bDescendingSort = !_this._bDescendingSort;
                if (!_this._bDescendingSort) {
                    MessageToast.show(asctext);
                    root = root.replace("desc", "asc");

                } else {
                    MessageToast.show(desctext);
                    root = root.replace("asc", "desc");

                }
                await this.get(root).then((data) => {
                    _this.getView().setModel(new JSONModel(data.value), model);
                })
                return root
            },
            // email 유효성 검사
            checkEmail: function (oEmail, sEmail) {
                let oRegExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
                if (sEmail.match(oRegExp) == null) {
                    oEmail.setValueState("Error");
                } else {
                    oEmail.setValueState("None");
                }
            },

            // Wizard 콘솔 에러 지우기 (Step 3 ~ 8)
            deleteWizardConsoleError: function (_this, sPath, sId) {
                let that = _this;
                if (!that.byId(sId)) {
                    Fragment.load({
                        id: that.getView().getId(),
                        name: sPath,
                        controller: that,
                    }).then(
                        function (oDialog) {
                            that.getView().addDependent(oDialog);
                            that._oWizard = this.byId('Wizard');
                            that._oWizard.constructor.CONSTANTS.MINIMUM_STEPS = 1;
                        }.bind(that)
                    );
                }
            },
        };
    }
);