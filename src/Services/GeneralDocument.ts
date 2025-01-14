
import { ISPHttpClientOptions, SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { GetListItem, UpdateItem } from "../DAL/Commonfile";


export function getAllData(WebUrl: string, spHttpClient: any, option: any) {
    let filter = "";

    return getDocument(WebUrl, spHttpClient, filter, option);
}

export async function getAllFolder(WebUrl: string, context: WebPartContext, FolderName: string) {
    const url = WebUrl + "/_api/Web/GetFolderByServerRelativeUrl('" + FolderName + "')?$select=*&$orderby=Id desc&$expand=Files/CheckedOutByUser,Folders,Files,Files/ModifiedBy,Folders/ListItemAllFields,Files/ListItemAllFields,ListItemAllFields,Files/Status,FileLeafRef,FileRef,FileDirRef";


    return await context.spHttpClient.get(url,
        SPHttpClient.configurations.v1,
        {
            headers: {
                'Accept': 'application/json;odata=nometadata',
                'odata-version': ''
            }
        }).then(async (response: SPHttpClientResponse) => {
            return response.json();
        }).catch((err: any) => {
            console.log(err);
        });

}



export async function getPermission(url: string, context: WebPartContext) {

    return await context.spHttpClient.get(url,
        SPHttpClient.configurations.v1,
        {
            headers: {
                'Accept': 'application/json;odata=nometadata',
                'odata-version': ''
            }
        }).then(async (response: SPHttpClientResponse) => {
            return response.json();
        }).catch((err: any) => {
            console.log(err);
        });

}

export async function commonPostMethod(url: string, context: WebPartContext) {
    return await context.spHttpClient.post(url, SPHttpClient.configurations.v1, {
        headers: {
            'Accept': 'application/json;odata=nometadata',
            'odata-version': '3.0',
            'X-HTTP-Method': 'POST'
        }
    }).then((response: SPHttpClientResponse) => {
        if (response.ok) {
            return response;
        }
    });
}

export async function getListData(url: string, context: WebPartContext) {

    return await context.spHttpClient.get(url,
        SPHttpClient.configurations.v1,
        {
            headers: {
                'Accept': 'application/json;odata=nometadata',
                'odata-version': ''
            }
        }).then(async (response: SPHttpClientResponse) => {
            return response.json();
        }).catch((err: any) => {
            console.log(err);
        });
}

export function updateLibrary(WebUrl: string, spHttpClient: SPHttpClient, metaData: any, Id: number, listName: string) {
    return UpdateItem(WebUrl, spHttpClient, listName, metaData, Id);
}

export async function getApprovalData(context: WebPartContext, libeName: string, useremail: string) {
    const filter = "CurrentApprover eq '" + useremail + "' and Active eq 1";
    await getMethod(context.pageContext.web.absoluteUrl, context.spHttpClient, filter, libeName);
}

async function getMethod(WebUrl: string, spHttpClient: any, filter: any, libeName: string) {

    let option = {
        select: "*,Projectmanager/Id,Projectmanager/Title,Publisher/Id,Publisher/Title,Status/Id,Status/StatusName,Author/EMail,Author/Title",
        expand: "File,Projectmanager,Publisher,Status,Author",
        filter: filter,
        orderby: 'ID desc',
        top: 5000
    };

    return await GetListItem(WebUrl, spHttpClient, libeName, option);
}

export async function UploadFile(WebUrl: string, spHttpClient: any, file: string, DisplayName: string | File, DocumentLib: string, jsonBody: { __metadata: { type: string; }; Name: string; TileLID: any; DocumentType: string; Documentpath: string; } | null, FolderPath: string): Promise<any> {

    // let fileupload = FolderPath +"/"+FolderName;
    return new Promise((resolve) => {
        const spOpts: ISPHttpClientOptions = {
            body: file
        };
        var redirectionURL = WebUrl + "/_api/Web/GetFolderByServerRelativeUrl('" + FolderPath + "')/Files/Add(url='" + DisplayName + "', overwrite=true)?$expand=ListItemAllFields";
        const responsedata = spHttpClient.post(redirectionURL, SPHttpClient.configurations.v1, spOpts).then((response: SPHttpClientResponse) => {
            response.json().then(async (responseJSON: any) => {
                // console.log(responseJSON.ListItemAllFields.ID);
                var serverRelURL = await responseJSON.ServerRelativeUrl;
                if (jsonBody != null) {
                    await UpdateItem(WebUrl, spHttpClient, DocumentLib, jsonBody, responseJSON.ListItemAllFields.ID);

                }
                resolve(responseJSON);
                console.log(responsedata);
                console.log(serverRelURL);
            });
        });
    });

}


export async function getDocument(WebUrl: string, spHttpClient: any, filter: any, libName: string) {

    var selectcols = "*,ID,File,DefineRole,ProjectmanagerAllow,Projectmanager/Id,Projectmanager/Title,ProjectmanagerEmail,PublisherAllow,Publisher/Id,";
    selectcols += "Publisher/Title,PublisherEmail,CurrentApprover,InternalStatus,ProjectMasterLID,";
    selectcols += "LatestRemark,AllowApprover,Created,Author/EMail,Author/Title,FileLeafRef,FileRef,FileDirRef,Active,ProjectmanagerId,PublisherId,File,ServerRedirectedEmbedUrl,DisplayStatus,Level,OCRStatus,";
    selectcols += "Company,Template";
    var option = {
        select: selectcols,
        expand: "File,Projectmanager,Publisher,Author",
        filter: filter,
        orderby: 'ID desc',
        top: 5000
    };


    return await GetListItem(WebUrl, spHttpClient, libName, option);
}