import {GetListItem,CreateItem,UpdateItem} from '../DAL/Commonfile';

export function GetAllDocumentType(WebUrl:string,spHttpClient:any){
  let filter = "";
  
  return getMethod(WebUrl,spHttpClient,filter);
  }
  export function GetDocumentTypeItemByID(WebUrl:string,spHttpClient:any,ID:number){
    let filter = "ID eq "+ ID;
    
    return getMethod(WebUrl,spHttpClient,filter);
    }
  

async function getMethod(WebUrl:string,spHttpClient:any,filter:any){

    let option = {
        select :"ID,DocumentTypeName,Active",
       // expand:"CountryName",
        filter : filter,
        top: 5000,
        orderby : "Id desc"
    };

      return await GetListItem(WebUrl,spHttpClient,"DMS_Mas_DocumentType",option);
}


export function SaveDocumentTypeMaster(WebUrl:string,spHttpClient:any,savedata:any) {

    return  CreateItem(WebUrl,spHttpClient,"DMS_Mas_DocumentType",savedata);
    
  }
  
  
  export function UpdateDocumentTypeMaster(WebUrl:string,spHttpClient:any,savedata:any,LID:number) {
  
    return  UpdateItem(WebUrl,spHttpClient,"DMS_Mas_DocumentType",savedata,LID);
    
  }