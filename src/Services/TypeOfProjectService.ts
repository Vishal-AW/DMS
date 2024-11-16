import {GetListItem,CreateItem,UpdateItem} from '../DAL/Commonfile';
import { SPHttpClient } from '@microsoft/sp-http';

export function GetAllProject(WebUrl:string,spHttpClient:SPHttpClient){
  let filter = "";
  
  return getMethod(WebUrl,spHttpClient,filter);
  }
  export function GetProjectItemByID(WebUrl:string,spHttpClient:any,ID:number){
    let filter = "ID eq "+ ID;
    
    return getMethod(WebUrl,spHttpClient,filter);
    }
  

async function getMethod(WebUrl:string,spHttpClient:any,filter:any){

    let option = {
        select :"ID,ProjectType,Active",
        filter : filter,
        top: 5000,
        orderby : "Id desc"
    };

      return await GetListItem(WebUrl,spHttpClient,"DMS_Mas_TypeofProject",option);
}


export function SaveProjectMaster(WebUrl:string,spHttpClient:any,savedata:any) {

    return  CreateItem(WebUrl,spHttpClient,"DMS_Mas_TypeofProject",savedata);
    
  }
  
  
  export function UpdateProjectMaster(WebUrl:string,spHttpClient:any,savedata:any,LID:number) {
  
    return  UpdateItem(WebUrl,spHttpClient,"DMS_Mas_TypeofProject",savedata,LID);
    
  }