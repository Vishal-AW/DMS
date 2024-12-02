
import { SPHttpClient } from '@microsoft/sp-http-base';
import { GetListItem, UploadFile, DeleteItem } from '../DAL/Commonfile';


export function UploadDocument(WebUrl: any, spHttpClient: any, file: any, filename: any, savedata: any) {

    UploadFile(WebUrl, spHttpClient, file, filename, "DMS_TileDocument", savedata)

}
export async function GetAttachmentFile(WebUrl: any, spHttpClient: any, ID: string) {
    let filter = "LID eq " + ID;
    return await getMethod(WebUrl, spHttpClient, filter);
}
async function getMethod(WebUrl: string, spHttpClient: SPHttpClient, filter: string) {

    var option = {
        select: "ID,TileLID,Documentpath", //File/ServerRelativeUrl,LinkFilename,
        expand: "File",
        filter: filter,
        orderby: 'ID desc',
        top: 5000
    };

    return await GetListItem(WebUrl, spHttpClient, "DMS_TileDocument", option)
}




//export async function DeleteData(WebUrl,spHttpClient,ID) {
//let filter = "ID eq "+ID;
//return getMethod(WebUrl,spHttpClient,filter);
//}

export async function DeleteData(WebUrl: string, spHttpClient: SPHttpClient, LID: Number) {

    return await DeleteItem(WebUrl, spHttpClient, "DMS_TileDocument", LID);

}