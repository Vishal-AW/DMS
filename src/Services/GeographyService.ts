import {GetListItem,CreateItem,UpdateItem} from '../DAL/Commonfile';

export function GetAllGeography(WebUrl:string,spHttpClient:any){
  let filter = "";
  
  return getMethod(WebUrl,spHttpClient,filter);
  }
  export function GetGepgraphyItemByID(WebUrl:string,spHttpClient:any,ID:number){
    let filter = "ID eq "+ ID;
    
    return getMethod(WebUrl,spHttpClient,filter);
    }
  

async function getMethod(WebUrl:string,spHttpClient:any,filter:any){

    let option = {
        select :"ID,Geography,Active",
        filter : filter,
        top: 5000,
        orderby : "Id desc"
    };

      return await GetListItem(WebUrl,spHttpClient,"DMS_Geography",option);
}


export function SaveGeography(WebUrl:string,spHttpClient:any,savedata:any) {

    return  CreateItem(WebUrl,spHttpClient,"DMS_Geography",savedata);
    
  }
  
  
  export function UpdateGeography(WebUrl:string,spHttpClient:any,savedata:any,LID:number) {
  
    return  UpdateItem(WebUrl,spHttpClient,"DMS_Geography",savedata,LID);
    
  }