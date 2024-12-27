import { GetListItem, CreateItem, UpdateItem } from '../DAL/Commonfile';

export function getConfig(WebUrl: string, spHttpClient: any) {
  let filter = "";

  return getMethod(WebUrl, spHttpClient, filter);
}
export function getConfigActive(WebUrl: string, spHttpClient: any) {
  let filter = "IsActive eq 1";

  return getMethod(WebUrl, spHttpClient, filter);
}

export function getAllListFromSite(WebUrl: string, spHttpClient: any) {
  let filter = "(Hidden eq false) and (BaseType ne 1) and Title ne 'ConfigEntryMaster'";

  return getMethod(WebUrl, spHttpClient, filter);
}

async function getMethod(WebUrl: string, spHttpClient: any, filter: any) {

  let option = {
    select: "Id,Title,ColumnType,InternalListName,IsActive,IsStaticValue,StaticDataObject,DisplayValue,InternalTitleName,IsShowAsFilter,Abbreviation",
    //expand : "",
    filter: filter,
    orderby: 'Title',
    top: 5000
  };

  return await GetListItem(WebUrl, spHttpClient, "ConfigEntryMaster", option);
}


export function SaveCountryMaster(WebUrl: string, spHttpClient: any, savedata: any) {

  return CreateItem(WebUrl, spHttpClient, "ConfigEntryMaster", savedata);

}


export function UpdateCountryMaster(WebUrl: string, spHttpClient: any, savedata: any, LID: number) {

  return UpdateItem(WebUrl, spHttpClient, "ConfigEntryMaster", savedata, LID);

}