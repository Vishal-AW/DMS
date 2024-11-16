import {GetListItem,CreateItem,UpdateItem} from '../DAL/Commonfile';

export function GetAllCountry(WebUrl:string,spHttpClient:any){
  let filter = "";
  
  return getMethod(WebUrl,spHttpClient,filter);
  }
  export function GetCountryItemByID(WebUrl:string,spHttpClient:any,ID:number){
    let filter = "ID eq "+ ID;
    
    return getMethod(WebUrl,spHttpClient,filter);
    }
  

async function getMethod(WebUrl:string,spHttpClient:any,filter:any){

    let option = {
        select :"ID,CountryName,Active,Geography/Id,Geography/Geography",
        expand:"Geography",
        filter : filter,
        top: 5000,
        orderby : "Id desc"
    };

      return await GetListItem(WebUrl,spHttpClient,"DMS_Country",option);
}


export function SaveCountryMaster(WebUrl:string,spHttpClient:any,savedata:any) {

    return  CreateItem(WebUrl,spHttpClient,"DMS_Country",savedata);
    
  }
  
  
  export function UpdateCountryMaster(WebUrl:string,spHttpClient:any,savedata:any,LID:number) {
  
    return  UpdateItem(WebUrl,spHttpClient,"DMS_Country",savedata,LID);
    
  }