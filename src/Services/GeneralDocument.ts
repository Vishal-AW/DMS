
import { ISPHttpClientOptions, SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { GetListItem, UpdateItem } from "../DAL/Commonfile";


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

export function getApprovalData(context: WebPartContext, libeName: string, useremail: string) {
    const filter = "CurrentApprover eq '" + useremail + "' and Active eq 1";
    return getMethod(context.pageContext.web.absoluteUrl, context.spHttpClient, filter, libeName);
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


export function generateAutoRefNumber(refCount: any, data: any, CreatedDate: any, libDetails: any) {
    let refNo = "";
    let incrementCount = 0;
    const currentFY: any = getFinancialYear(new Date());
    if (libDetails.IsDynamicReference) {
        const refFormulaValue = libDetails.ReferenceFormula.split(libDetails.Separator);
        refFormulaValue.map(function (el: any, i: number) {
            const pattern = /\{(.*?)\}/g;
            const matches = el.match(pattern);
            if (matches == null)
                refNo += `${el}${libDetails.Separator}`;
            else {
                matches.map(function (element: any, ind: number) {
                    const elementId = element.replace(/[^a-z0-9\s-_]/gi, '');
                    if (refFormulaValue.length - 1 == i && matches.length - 1 == ind) {
                        incrementCount = initialIncrement(elementId, refCount, CreatedDate);
                        refNo += padLeft(incrementCount.toString(), 5, "0");
                    } else {
                        if (elementId == "YY_YY")
                            refNo += `${currentFY.startYear}${libDetails.Separator}${currentFY.endYear}`;
                        else if (elementId == "YYYY")
                            refNo += `${new Date().getFullYear()}`;
                        else if (elementId == "MM")
                            refNo += `${new Date().toLocaleString('default', { month: '2-digit' })}`;
                        else
                            refNo += `${data[elementId]}`;
                    }
                });
                refFormulaValue.length - 1 != i ? (refNo += libDetails.Separator) : "";
            }
        });
    } else {
        incrementCount = refCount > 0 ? (refCount + 1) : 1;
        const year = new Date().getFullYear();
        refNo = year + '-' + padLeft(incrementCount.toString(), 5, "0");
    }
    const obj = { "refNo": refNo, "count": incrementCount };
    return obj;
}

function initialIncrement(val: any, incrementCount: any, CreatedDate: any) {
    const lastMonth = new Date(CreatedDate).toLocaleString('default', { month: '2-digit' });
    const lastYear = new Date(CreatedDate).getFullYear();
    const month = new Date().toLocaleString('default', { month: '2-digit' });
    const year = new Date().getFullYear();
    const FY: any = getFinancialYear(new Date());
    const lastFY: any = getFinancialYear(new Date(CreatedDate));
    switch (val) {
        case "Continue":
            return incrementCount > 0 ? (incrementCount + 1) : 1;
            break;
        case "Monthly":
            return lastMonth == month ? (incrementCount + 1) : 1;
            break;
        case "Yearly":
            return lastYear == year ? (incrementCount + 1) : 1;
            break;
        case "FinancialYear":
            lastFY.endYear == FY.endYear ? (incrementCount + 1) : 1;
            break;
    }
}

function getFinancialYear(date: any) {
    const today = date;
    const fn: any = {};
    const year = today.toLocaleString('default', { year: '2-digit' });
    if ((today.getMonth() + 1) <= 3) {
        fn.startYear = (Number(year) - 1).toString();
        fn.endYear = year;
    } else {
        fn.startYear = year;
        fn.endYear = (Number(year) + 1).toString();
    }
    return fn;
}

function padLeft(value: string, length: number, char: string = "0"): string {
    return char.repeat(Math.max(0, length - value.length)) + value;
}
