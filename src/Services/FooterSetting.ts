import {GetListItem,CreateItem,UpdateItem} from '../DAL/Commonfile';
import { SPHttpClient } from '@microsoft/sp-http';
export function GetAlldata(WebUrl:string,spHttpClient:SPHttpClient){
  let filter = "";
  
  return getMethod(WebUrl,spHttpClient,filter);
  }
 
async function getMethod(WebUrl:string,spHttpClient:SPHttpClient,filter:any){

    let option = {
        select :"ID,Key,Alignment,Desc",
        filter : filter,
        top: 5000,
        orderby : "Id desc"
    };

      return await GetListItem(WebUrl,spHttpClient,"DMS_FooterSetting",option);
}


export function SaveStateMaster(WebUrl:string,spHttpClient:any,savedata:any) {

    return  CreateItem(WebUrl,spHttpClient,"DMS_FooterSetting",savedata);
    
  }
  
  
  export function UpdateStateMaster(WebUrl:string,spHttpClient:any,savedata:any,LID:number) {
  
    return  UpdateItem(WebUrl,spHttpClient,"DMS_FooterSetting",savedata,LID);
    
  }