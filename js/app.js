Ext.onReady(function () {

    Ext.ux.data.Dispatcher.run();

    var actionStore = Ext.create('Ext.data.JsonStore', {
        fields: ['action', 'name'],
        proxy: {
            type: 'ajax',
            url: 'services/getActions.php',
            reader: {
                type: 'json'
            }
        }
    });

    var getKeysFromJson = function(obj) {
        var keys = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return keys;
    }

    var domainStore, createDomainStore = function(json) {
        var keys = getKeysFromJson(json[0]);
        return Ext.create('Ext.data.Store', {
            fields: keys,
            data: json
        })
    };

    var createColumns = function(json) {
        var keys = getKeysFromJson(json[0]);
        return keys.map(function(field) {
            return {text: Ext.String.capitalize(field), width: 200, dataIndex: field};
        });
    };

    // create the grid
    var grid = Ext.create('Ext.grid.Panel', {
        renderTo: Ext.getBody(),
        columns: [],
        viewConfig: {
            emptyText: 'Click a button to show a dataset',
            deferEmptyText: false
        },
        dockedItems: {
            xtype: 'toolbar',
            dock: 'top',
            itemId: 'toptoolbar',
            items: [
                {
                    xtype: 'combo',
                    itemId: 'actionSelector',
                    store: actionStore,
                    displayField: 'name',
                    valueField: 'action'
                },
                {
                    xtype: 'button',
                    text: 'Bulk invoke Action',
                    handler: function () {
                        var combo = grid.getDockedComponent('toptoolbar').getComponent('actionSelector');
                        domainStore.each(function (record) {
                            var params = {
                                action: combo.getValue()
                            };
                            Ext.apply(params, record.data);
                            Ext.ux.queue.Manager.addItem('ajax', {
                                method: 'GET',
                                url: 'services/actionInvoker.php',
                                params: params,
                                beforeStart: function () {
                                    record.set('status', 'LOADING');
                                },
                                success: function (response) {
                                    var json = Ext.JSON.decode(response.responseText);
                                    if (json.success) {
                                        record.set('status', json.result);
                                    } else {
                                        record.set('status', json.errors[0]);
                                    }
                                },
                                failure: function (response) {
                                    record.set('status', 'ERROR_CALLING_ACTION');
                                }
                            });
                        });
                    }
                },
                {
                    xtype: 'form',
                    items: [
                        {
                            xtype: 'filefield',
                            itemId: 'fileupload',
                            name: 'userfile',
                            buttonOnly: true,
                            buttonText: 'Upload CSV...',
                            listeners: {
                                'change': function(fb, v){
                                    var form = this.up('form').getForm();
                                    if(form.isValid()){
                                        form.submit({
                                            url: 'services/fileUpload.php',
                                            waitMsg: 'Uploading your CSV...',
                                            success: function() {
                                                Ext.Ajax.request({
                                                    url: 'services/getData.php',
                                                    success: function(response) {
                                                        var json = Ext.JSON.decode(response.responseText);
                                                        domainStore = createDomainStore(json);
                                                        grid.reconfigure(domainStore, createColumns(json));
                                                    }
                                                });
                                            }
                                        });
                                    }
                                }
                            }
                        }
                    ]
                }
            ]
        }
    });


});
