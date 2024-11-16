import {GetListItem,CreateItem,UpdateItem} from '../DAL/Commonfile';
import { SPHttpClient } from '@microsoft/sp-http';

export function GetAllCity(WebUrl:string,spHttpClient:SPHttpClient){
  let filter = "";
  
  return getMethod(WebUrl,spHttpClient,filter);
  }
  export function GetCityItemByID(WebUrl:string,spHttpClient:any,ID:number){
    let filter = "ID eq "+ ID;
    
    return getMethod(WebUrl,spHttpClient,filter);
    }
  

async function getMethod(WebUrl:string,spHttpClient:any,filter:any){

    let option = {
        select :"ID,City,Active",
        filter : filter,
        top: 5000,
        orderby : "Id desc"
    };

      return await GetListItem(WebUrl,spHttpClient,"DMS_City",option);
}


export function SaveCityMaster(WebUrl:string,spHttpClient:any,savedata:any) {

    return  CreateItem(WebUrl,spHttpClient,"DMS_City",savedata);
    
  }
  
  
  export function UpdateCityMaster(WebUrl:string,spHttpClient:any,savedata:any,LID:number) {
  
    return  UpdateItem(WebUrl,spHttpClient,"DMS_City",savedata,LID);
    
  }