
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http-base';
import { WebPartContext } from "@microsoft/sp-webpart-base";


export async function getAllFolder(WebUrl: any, context: WebPartContext, FolderName: any) {
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
