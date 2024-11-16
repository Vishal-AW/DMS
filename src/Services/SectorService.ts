import {GetListItem,CreateItem,UpdateItem} from '../DAL/Commonfile';

export function GetAllSector(WebUrl:string,spHttpClient:any){
  let filter = "";
  
  return getMethod(WebUrl,spHttpClient,filter);
  }
  export function GetSectorItemByID(WebUrl:string,spHttpClient:any,ID:number){
    let filter = "ID eq "+ ID;
    
    return getMethod(WebUrl,spHttpClient,filter);
    }
  

async function getMethod(WebUrl:string,spHttpClient:any,filter:any){

    let option = {
        select :"ID,SectorName,Active",
        filter : filter,
        top: 5000,
        orderby : "Id desc"
    };

      return await GetListItem(WebUrl,spHttpClient,"DMS_Sector",option);
}


export function SaveSectorMaster(WebUrl:string,spHttpClient:any,savedata:any) {

    return  CreateItem(WebUrl,spHttpClient,"DMS_Sector",savedata);
    
  }
  
  
  export function UpdateSectorMaster(WebUrl:string,spHttpClient:any,savedata:any,LID:number) {
  
    return  UpdateItem(WebUrl,spHttpClient,"DMS_Sector",savedata,LID);
    
  }