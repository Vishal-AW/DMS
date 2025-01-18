import { CreateItem } from "../DAL/Commonfile";

export function createHistoryItem(WebUrl: string, spHttpClient: any, savedata: any) {
    return CreateItem(WebUrl, spHttpClient, "DMS_GeneralDocumentHistory", savedata);
}