import { WebPartContext } from "@microsoft/sp-webpart-base";
import { SPHttpClient, SPHttpClientResponse, ISPHttpClientOptions } from '@microsoft/sp-http';
import { UpdateTileSetting } from "./MasTileService";


export class service {

    private count: 0;
    private ListGuid: any;
    private required: any;
    private defaulttViewID: any;
    props: any;


    public CreateList(context: WebPartContext, webURL: string, IListItem: [], TileLID: number) {
        debugger;
        this.count = 0;
        this.ListGuid = [];
        for (let i = 0; i < IListItem.length; i++) {
            this.httpServiceForCreateList(context, webURL, IListItem[i]["ListName"], IListItem[i]["ListType"], IListItem, TileLID);
        }
    }

    private httpServiceForCreateList(context: WebPartContext, webURL: string, listName: string, Template: string, IListItem: any, TileLID: number) {
        const url: string = webURL + "/_api/web/lists";
        const listDefinition: any = {
            "Title": listName,
            "AllowContentTypes": true,
            "BaseTemplate": Template,
            "ContentTypesEnabled": true,
        };
        const spHttpClientOptions: ISPHttpClientOptions = {
            "body": JSON.stringify(listDefinition)
        };
        context.spHttpClient.post(url, SPHttpClient.configurations.v1, spHttpClientOptions)
            .then((response: SPHttpClientResponse) => {
                response.json().then((results: any) => {
                    this.ListGuid.push(results);
                    let obj = { LibGuidName: this.ListGuid[0].Id }

                    console.log(obj);

                    UpdateTileSetting(webURL, context.spHttpClient, obj, TileLID).then(function (response) { });
                    this.count++;
                    if (this.count == IListItem.length) {
                        this.createAllColumns(context, webURL, IListItem)
                        console.log("GUID", this.ListGuid);
                    }
                });
            });
    }

    public ArchieveCreateList(context: WebPartContext, webURL: string, IListItem: []) {
        debugger;
        this.count = 0;
        this.ListGuid = [];
        for (let i = 0; i < IListItem.length; i++) {
            this.ArchievehttpServiceForCreateList(context, webURL, IListItem[i]["ListName"], IListItem[i]["ListType"], IListItem);
        }
    }

    private ArchievehttpServiceForCreateList(context: WebPartContext, webURL: string, listName: string, Template: string, IListItem: any) {
        const url: string = webURL + "/_api/web/lists";
        const listDefinition: any = {
            "Title": listName,
            "AllowContentTypes": true,
            "BaseTemplate": Template,
            "ContentTypesEnabled": true,
        };
        const spHttpClientOptions: ISPHttpClientOptions = {
            "body": JSON.stringify(listDefinition)
        };
        context.spHttpClient.post(url, SPHttpClient.configurations.v1, spHttpClientOptions)
            .then((response: SPHttpClientResponse) => {
                response.json().then((results: any) => {
                    this.ListGuid.push(results);
                    // let obj = { LibGuidName: this.ListGuid[0].Id }

                    // console.log(obj);

                    // UpdateTileSetting(webURL, context.httpClient, obj, TileLID).then(function (response) { });
                    this.count++;
                    if (this.count == IListItem.length) {
                        this.createAllColumns(context, webURL, IListItem)
                        console.log("GUID", this.ListGuid);
                    }
                });
            });
    }

    private async createAllColumns(context: WebPartContext, webURL: string, IListItem: any) {
        let listCount = 0
        for (let list = 0; list < IListItem.length; list++) {
            listCount++;
            // let columnCount = 0;
            let Count = 0;
            let ColumnsObj: any = IListItem[list]['Columns'];
            for (let col = 0; col < ColumnsObj.length; col++) {
                // columnCount++;
                let colType = ColumnsObj[col]["ColType"];

                if (colType == "6") {
                    let obj = {
                        '__metadata': { 'type': 'SP.FieldChoice' },
                        'FieldTypeKind': 6,
                        'Title': ColumnsObj[col]["ColName"],
                        'Choices': { '__metadata': { 'type': 'Collection(Edm.String)' }, 'results': ColumnsObj[col]["Choices"] }
                    }

                    let filterGUID = this.ListGuid.filter((x: any) => IListItem[list]["ListName"].includes(x.Title));
                    await this.CreateChoiceCloumn(context, webURL, filterGUID[0].Id, obj);
                    Count++;
                    if (Count == ColumnsObj.length && listCount == IListItem.length) {

                        await this.getDefaultView(context, webURL, IListItem);
                        alert("Success");
                    }
                    //})

                }
                else if (colType == "7") {
                    let filterGUID = this.ListGuid.filter((x: any) => IListItem[list]["ListName"].includes(x.Title));
                    let query = webURL + "/_api/web/lists/getByTitle('" + ColumnsObj[col].LookupList + "')/Id";
                    await this.GetListData(context, query).then(async (response) => {
                        let listGuID = response.d.Id;
                        let obj = {
                            'parameters': {
                                'FieldTypeKind': 7,
                                'Title': ColumnsObj[col]["ColName"],
                                'LookupListId': listGuID,
                                'LookupFieldName': ColumnsObj[col]["LookupField"]
                            }
                        };
                        await this.Createlookup(context, webURL, filterGUID[0].Id, obj);
                        Count++;
                        if (Count === ColumnsObj.length && listCount === IListItem.length) {

                            await this.getDefaultView(context, webURL, IListItem);
                            alert("Success");
                        }
                        //});
                    });
                }
                else {
                    await this.createColumn(context, webURL, IListItem[list]["ListName"], ColumnsObj[col]["ColName"], colType);
                    Count++;
                    if (Count == ColumnsObj.length && listCount == IListItem.length) {

                        await this.getDefaultView(context, webURL, IListItem);
                        alert("Success");
                    }
                    //});
                }
            }
        }
    }




    private async GetListData(context: WebPartContext, query: string) {
        const response = await context.spHttpClient.get(query, SPHttpClient.configurations.v1, {
            headers: {
                'Accept': 'application/json;odata=verbose',
                'odata-version': '',
            },
        });
        return await response.json();


    };

    private async Createlookup(context: WebPartContext, webURL: string, listID: string, obj: any) {
        const url = webURL + "/_api/web/lists(guid'" + listID + "')/fields/addfield";
        const spHttpClientOptions: ISPHttpClientOptions = {
            headers: {
                'Accept': 'application/json;odata=nometadata',
                'Content-type': 'application/json;odata=nometadata',
                'odata-version': ''
            },
            "body": JSON.stringify(obj)
        };
        return await context.spHttpClient.post(url, SPHttpClient.configurations.v1, spHttpClientOptions)
    }

    private async CreateChoiceCloumn(context: WebPartContext, webURL: string, listID: string, obj: any) {
        debugger;
        const url = webURL + "/_api/web/lists(guid'" + listID + "')/Fields";
        const spHttpClientOptions: ISPHttpClientOptions = {
            headers: {
                'Accept': 'application/json;odata=verbose',
                'Content-type': 'application/json;odata=verbose',
                'odata-version': ''
            },
            "body": JSON.stringify(obj)
        };
        return await context.spHttpClient.post(url, SPHttpClient.configurations.v1, spHttpClientOptions)
    }


    private async createColumn(context: WebPartContext, webURL: string, listName: string, ColumnName: string, fieldType: string) {
        const url = webURL + "/_api/web/lists/GetByTitle('" + listName + "')/Fields";
        const spHttpClientOptions: ISPHttpClientOptions = {
            headers: {
                'Accept': 'application/json;odata=nometadata',
                'Content-type': 'application/json;odata=nometadata',
                'odata-version': ''
            },
            "body": JSON.stringify({
                'FieldTypeKind': fieldType,
                'Title': ColumnName
            })
        };

        return await context.spHttpClient.post(url, SPHttpClient.configurations.v1, spHttpClientOptions);
    }

    public async getAllRequiredFields(context: WebPartContext, webURL: string, IListItem: []) {
        this.required = [];
        let reqCount = 0;
        for (let i = 0; i < IListItem.length; i++) {
            const url = webURL + "/_api/web/lists/GetByTitle('" + IListItem[i]["ListName"] + "')/fields?$filter=Required eq true";
            await context.spHttpClient.get(url, SPHttpClient.configurations.v1,
                {
                    headers: {
                        'Accept': 'application/json;odata=verbose',
                        'odata-version': ''
                    }
                }).then((response: SPHttpClientResponse) => {
                    //console.log(response.json());
                    response.json().then((d: any) => {
                        console.log(d);
                        reqCount++
                        /*for(let r=0;r<d["results"].length;r++){
                            result.push(d["results"][r])
                        }*/
                        this.required.push(d["d"]["results"][0]["__metadata"]["id"]);
                        if (reqCount == IListItem.length) {
                            console.log(this.required);
                            this.callUpdatefunction(context, this.required);
                        }
                    })
                })
        }
    }

    private async callUpdatefunction(context: WebPartContext, required: any) {
        let reqCount = 0;
        for (let r = 0; r < required.length; r++) {
            await this.updateColumn(context, required[r]).then(function (response) {
                reqCount++
                if (reqCount == required.length) {
                    alert("Updated");
                }
            });
        }
    }

    private async updateColumn(context: WebPartContext, uri: string) {
        const url = uri;//webURL+"/_api/web/lists/GetByTitle('"+listName+"')/fields?$filter=Required eq true";

        return await context.spHttpClient.post(url, SPHttpClient.configurations.v1,
            {
                headers: {
                    'Accept': 'application/json;odata=nometadata',
                    'odata-version': '3.0',
                    'IF-MATCH': '*',
                    'X-HTTP-Method': 'MERGE'
                },
                body: JSON.stringify({
                    __metadata: {
                        'type': 'SP.ListItem'
                    }, 'Required': false
                })
            })
    }


    public async getDefaultView(context: WebPartContext, webURL: string, IListItem: []) {
        console.log(IListItem);
        this.defaulttViewID = [];
        for (let list = 0; list < IListItem.length; list++) {
            // const url = webURL + "/_api/Web/Lists/getByTitle('" + IListItem[list]["ListName"] + "')/views/getByTitle('All Items')";
            const url = `${webURL}/_api/Web/Lists/getByTitle('${encodeURIComponent(IListItem[list]["ListName"])}')/views/getByTitle('${encodeURIComponent("All Documents")}')`;

            await context.spHttpClient.get(url, SPHttpClient.configurations.v1,
                {
                    headers: {
                        'Accept': 'application/json;odata=verbose',
                        'odata-version': ''
                    }
                }).then((response: SPHttpClientResponse) => {
                    response.json().then((result: any) => {
                        console.log(result)
                        this.defaulttViewID.push(result["d"]["Id"]);
                        if (this.defaulttViewID.length == IListItem.length) {
                            console.log(this.defaulttViewID);
                            this.addColumnOnView(context, webURL, IListItem, this.defaulttViewID)
                        }
                    })
                })
        }
    }

    private async addColumnOnView(context: WebPartContext, webURL: string, IListItem: [], defaultView: []) {
        let listCount = 0;
        for (let listName = 0; listName < IListItem.length; listName++) {
            listCount++;
            let columnCount = 0;
            // let Count = 0;
            let ColumnsObj: any = IListItem[listName]["Columns"];
            for (let colName = 0; colName < ColumnsObj.length; colName++) {
                // Count++;
                let obj = { 'strField': ColumnsObj[colName]["ColName"] }
                var resURL = webURL + "/_api/web/lists/getbytitle('" + IListItem[listName]["ListName"] + "')/Views/getbyId('" + defaultView[listName] + "')/ViewFields/AddViewField";
                debugger;
                await this.addDefaultViewColumn(context, resURL, obj).then((r) => {
                    columnCount++;
                    if (columnCount == ColumnsObj.length && listCount == IListItem.length) {
                        alert("Added");
                    }
                })
            }
        }
    }

    private async addDefaultViewColumn(context: WebPartContext, resURL: string, obj: any) {
        return await context.spHttpClient.post(resURL, SPHttpClient.configurations.v1,
            {
                headers: {
                    'Accept': 'application/json;odata=nometadata',
                    'Content-type': 'application/json;odata=nometadata',
                    'odata-version': '',
                },
                body: JSON.stringify(obj)
            })
    }



}


