
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
      ReferenceNo: getValue("ReferenceNo", data, Language),
      FileName: getValue("FileName", data, Language),
      Status: getValue("Status", data, Language),
      Delete: getValue("Delete", data, Language),
      DeleteConfirmMsg: getValue("DeleteConfirmMsg", data, Language),
      ThisFieldisRequired: getValue("ThisFieldisRequired", data, Language),
      AdvancePermission: getValue("AdvancePermission", data, Language),
      Share: getValue("Share", data, Language),
      View: getValue("View", data, Language),
      Edit: getValue("Edit", data, Language),
      NewRequest: getValue("NewRequest", data, Language),
      RecycleBin: getValue("RecycleBin", data, Language),
      Approval: getValue("Approval", data, Language),
      AdvancedSearch: getValue("AdvancedSearch", data, Language),
      Upload: getValue("Upload", data, Language),
      NewFolder: getValue("NewFolder", data, Language),
      AddNewFolder: getValue("AddNewFolder", data, Language),
      FolderName: getValue("FolderName", data, Language),
      Path: getValue("Path", data, Language),
      ChooseFile: getValue("ChooseFile", data, Language),
      IsthisAnUpdateToExistingFile: getValue("IsthisAnUpdateToExistingFile", data, Language),
      EntryForm: getValue("EntryForm", data, Language),
      EditForm: getValue("EditForm", data, Language),
      ViewForm: getValue("ViewForm", data, Language),
      IsSuffixRequired: getValue("IsSuffixRequired", data, Language),
      DocumentSuffix: getValue("DocumentSuffix", data, Language),
      OtherSuffixName: getValue("OtherSuffixName", data, Language),
      IsApprovalFlowRequired: getValue("IsApprovalFlowRequired", data, Language),
      Approver: getValue("Approver", data, Language),
      Publisher: getValue("Publisher", data, Language),
      FolderAccess: getValue("FolderAccess", data, Language),
      FolderPath: getValue("FolderPath", data, Language),
      PublisherEmailSubject: getValue("PublisherEmailSubject", data, Language),
      PublisherEmailMsg: getValue("PublisherEmailMsg", data, Language),
      PMEmailSubject: getValue("PMEmailSubject", data, Language),
      PMEmailMsg: getValue("PMEmailMsg", data, Language),
      PublishedEmailSubject: getValue("PublishedEmailSubject", data, Language),
      PublishedEmailMsg: getValue("PublishedEmailMsg", data, Language),
      RejectEmailSubject: getValue("RejectEmailSubject", data, Language),
      RejectEmailMsg: getValue("RejectEmailMsg", data, Language),
      ApproveButton: getValue("ApproveButton", data, Language),
      RejectButton: getValue("RejectButton", data, Language),
      AttachFile: getValue("AttachFile", data, Language),
      Comments: getValue("Comments", data, Language),
      RestoreConfirmMsg: getValue("RestoreConfirmMsg", data, Language),
      ViewOnlyAccess: getValue("ViewOnlyAccess", data, Language),
      RestrictedViewAccess: getValue("RestrictedViewAccess", data, Language),
      ReadAccess: getValue("ReadAccess", data, Language),
      ContributeAccess: getValue("ContributeAccess", data, Language),
      EditAccess: getValue("EditAccess", data, Language),
      DesignAccess: getValue("DesignAccess", data, Language),
      FullControlAccess: getValue("FullControlAccess", data, Language),
      FullControlAccessDec: getValue("FullControlAccessDec", data, Language),
      DesignAccessDec: getValue("DesignAccessDec", data, Language),
      EditAccessDec: getValue("EditAccessDec", data, Language),
      ContributeAccessDec: getValue("ContributeAccessDec", data, Language),
      ReadAccessDec: getValue("ReadAccessDec", data, Language),
      RestrictedViewAccessDec: getValue("RestrictedViewAccessDec", data, Language),
      ViewOnlyAccessDec: getValue("ViewOnlyAccessDec", data, Language),
      StopInheritingPermission: getValue("StopInheritingPermission", data, Language),
      StopInheritingConfirmMsg: getValue("StopInheritingConfirmMsg", data, Language),
      RemoveUserPermission: getValue("RemoveUserPermission", data, Language),
      EnterName: getValue("EnterName", data, Language),
      SelectPermissionLevel: getValue("SelectPermissionLevel", data, Language),
      GrantPermissions: getValue("GrantPermissions", data, Language),
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