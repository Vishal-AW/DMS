//import { WebPartContext } from "@microsoft/sp-webpart-base";
import { GetListItem } from "../DAL/Commonfile";




export async function getAllNav(WebUrl: string, spHttpClient: any, EmailId: any) {
    const filter = 'Active eq 1';
    return getMethod(WebUrl, spHttpClient, filter)
}



async function getMethod(WebUrl: string, spHttpClient: any, filter: any) {

    let option = {
        select: "ID,MenuName,URL,OrderNo,Next_Tab,ParentMenuIdId,ParentMenuId/Id,ParentMenuId/MenuName,External_Url,Active,IconClass",
        expand: "ParentMenuId",
        filter: filter,
        orderby: 'OrderNo',
        top: 5000
    };

    return await GetListItem(WebUrl, spHttpClient, "GEN_Navigation", option);
}



