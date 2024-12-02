
import { SPHttpClient } from '@microsoft/sp-http';
import { GetListItem, CreateItem, UpdateItem } from '../DAL/Commonfile';
import {ILabel} from "../webparts/homePage/components/Interface/ILabel"


export async function GetAllLabel(WebUrl: string, spHttpClient: SPHttpClient,Language : string) {
  let filter = "";

  let DisplayLabel : ILabel;

   let data = await getMethod(WebUrl, spHttpClient, filter).then(data=>{
 
    data = data.value;
    
     DisplayLabel = {
      Cancel: getValue("Cancel",data,Language) ,
    Submit: getValue("Submit",data,Language) ,
    Draft: getValue("Draft",data,Language) ,
    Tiles: getValue("Tiles",data,Language),
    AddTileManagement :  getValue("AddTileManagement",data,Language),
    };

   // 
    return DisplayLabel

  });
return data;
  
}



function getValue(Key:string,LabelData:any,Language:string){

  let Val : any = LabelData.filter((item :any)=> item.Key === Key);

  // let returnval :string = if(Val && Val.length > 0){ 
  //                         Val[0].DefaultText
  //                       };

   let returnval :string = (Val && Val.length > 0)? Val[0].DefaultText : "";
 
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