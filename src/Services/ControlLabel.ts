
import { SPHttpClient } from '@microsoft/sp-http';
import { GetListItem, CreateItem, UpdateItem } from '../DAL/Commonfile';
import { ILabel } from "../webparts/homePage/components/Interface/ILabel";


export async function GetAllLabel(WebUrl: string, spHttpClient: SPHttpClient, Language: string) {
  let filter = "";

  let DisplayLabel: ILabel;

  let data = await getMethod(WebUrl, spHttpClient, filter).then(data => {

    data = data.value;

    DisplayLabel = {
      Cancel: getValue("Cancel", data, Language),
      Submit: getValue("Submit", data, Language),
      Draft: getValue("Draft", data, Language),
      TileName: getValue("TileName", data, Language),
      AddTileManagement: getValue("AddTileManagement", data, Language),
      TileDetails: getValue("TileDetails", data, Language),
      Selectorder: getValue("Selectorder", data, Language),
      TileAdmin1: getValue("TileAdmin1", data, Language),
      Order: getValue("Order", data, Language),
      AllowApprover: getValue("AllowApprover", data, Language),
      TileStatus: getValue("TileStatus", data, Language),
      AccessToTile: getValue("AccessToTile", data, Language),
      DisplayPicture: getValue("DisplayPicture", data, Language),
      Action: getValue("Action", data, Language),
      SearchFilterRequired: getValue("SearchFilterRequired", data, Language),
      IsFieldAllowinFile: getValue("IsFieldAllowinFile", data, Language),
      FieldStatus: getValue("FieldStatus", data, Language),
      IsRequired: getValue("IsRequired", data, Language),
      Field: getValue("Field", data, Language),
      SrNo: getValue("SrNo", data, Language),
      Versions: getValue("Versions", data, Language),
      Rename: getValue("Rename", data, Language),
      Download: getValue("Download", data, Language),
      Preview: getValue("Preview", data, Language),
      SelectMoreActions: getValue("SelectMoreActions", data, Language),
      Fields: getValue("Fields", data, Language),

      ArchiveSection: getValue("ArchiveSection", data, Language),
      ArchiveVersions: getValue("ArchiveVersions", data, Language),
      SelectArchiveDays: getValue("SelectArchiveDays", data, Language),
      ArchiveDocumentLibraryName: getValue("ArchiveDocumentLibraryName", data, Language),
      IsArchiveAllowed: getValue("IsArchiveAllowed", data, Language),
      ChangeSetting: getValue("ChangeSetting", data, Language),
      InitialIncrement: getValue("InitialIncrement", data, Language),
      Separator: getValue("Separator", data, Language),
      ChooseFields: getValue("ChooseFields", data, Language),
      DefaultReferenceExample: getValue("DefaultReferenceExample", data, Language),
      DynamicReferenceExample: getValue("DynamicReferenceExample", data, Language),
      IsDynamicReference: getValue("IsDynamicReference", data, Language),
      ReferenceNoDetails: getValue("ReferenceNoDetails", data, Language),
      Add: getValue("Add", data, Language),
      Update: getValue("Update", data, Language),
      EditTileManagement: getValue("EditTileManagement", data, Language),
      FieldName: getValue("FieldName", data, Language),
      ColumnType: getValue("ColumnType", data, Language),
      IsShowasFilter: getValue("IsShowasFilter", data, Language),
      IsStaticValue: getValue("IsStaticValue", data, Language),
      ListName: getValue("ListName", data, Language),
      DisplayColumn: getValue("DisplayColumn", data, Language),
      PendingWithApprover: getValue("PendingWithApprover", data, Language),

      Rejected: getValue("Rejected", data, Language),
      Selectanoption: getValue("Selectanoption", data, Language),
      MultiplelinesofText: getValue("MultiplelinesofText", data, Language),
      text: getValue("text", data, Language),
      date: getValue("date", data, Language),
      DateandTime: getValue("DateandTime", data, Language),
      Radio: getValue("Radio", data, Language),
      PersonorGroup: getValue("PersonorGroup", data, Language),
      MultipleSelect: getValue("MultipleSelect", data, Language),
      Dropdown: getValue("Dropdown", data, Language),
      MetaDataSearch: getValue("MetaDataSearch", data, Language),
      Reset: getValue("Reset", data, Language),
      SearchData: getValue("SearchData", data, Language),
      Active: getValue("Active", data, Language),
      LastModified: getValue("LastModified", data, Language),
      Tiles: getValue("Tiles", data, Language),
      ThisFieldisRequired: getValue("ThisFieldisRequired", data, Language),
      Archive: getValue("Archive", data, Language),
      IsActive: getValue("IsActive", data, Language),
      Atleasttwooptionrecordrequired: getValue("Atleasttwooptionrecordrequired", data, Language),
      AddNewRecords: getValue("AddNewRecords", data, Language),
      EditNewRecords: getValue("EditNewRecords", data, Language),
      AddTileManagment: getValue("AddTileManagment", data, Language),
      EditTileManagment: getValue("EditTileManagment", data, Language)

    };

    // 
    return DisplayLabel;

  });
  return data;

}



function getValue(Key: string, LabelData: any, Language: string) {

  let Val: any = LabelData.filter((item: any) => item.Key === Key);

  // let returnval :string = if(Val && Val.length > 0){ 
  //                         Val[0].DefaultText
  //                       };

  let returnval: string = (Val && Val.length > 0) ? Val[0].DefaultText : "";

  return returnval;

}


async function getMethod(WebUrl: string, spHttpClient: any, filter: any) {

  let option = {
    select: "ID,Key,DefaultText",
    // expand:"CountryName",
    filter: filter,
    top: 5000,
    orderby: "Id desc"
  };

  return await GetListItem(WebUrl, spHttpClient, "ControlLabel", option);
}


export function SaveDocumentTypeMaster(WebUrl: string, spHttpClient: any, savedata: any) {

  return CreateItem(WebUrl, spHttpClient, "ControlLabel", savedata);

}


export function UpdateDocumentTypeMaster(WebUrl: string, spHttpClient: any, savedata: any, LID: number) {

  return UpdateItem(WebUrl, spHttpClient, "ControlLabel", savedata, LID);

}