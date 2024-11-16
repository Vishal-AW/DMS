import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

 

export  function getUSERID(WebUrl:string,spHttpClient:SPHttpClient,username:any){

    let url = WebUrl+"/_api/web/SiteUserInfoList/items?$select=Id&$filter=Title eq '"+username+"'";
     
  
       return  spHttpClient.get(url,
        SPHttpClient.configurations.v1,
        {
          headers: {
            'Accept': 'application/json;odata=nometadata',
            'odata-version': ''
          }
        }).then((response: SPHttpClientResponse) => {
          console.log("response");
          /*if(response.ok)
          {
             response.json().then((data)=>{
                 console.log(data.value);
                 var userID=data;
            alert(userID);
            });
          }*/
         
          return response.json();
        });
  }
 
export  function GetListItem(WebUrl:string,spHttpClient:SPHttpClient,ListName:string,options:any) {
  
    //let returnval =[];
    let url = WebUrl+"/_api/web/lists/getbytitle('"+ListName+"')/Items";
    url = URLBuilder(url,options);

     return  spHttpClient.get(url,
      SPHttpClient.configurations.v1,
      {
        headers: {
          'Accept': 'application/json;odata=nometadata',
          'odata-version': ''
        }
      }).then((response: SPHttpClientResponse) => {
        console.log("response");
        
        return response.json();
      });
      
}


export  function CreateItem(WebUrl:string,spHttpClient:SPHttpClient,ListName:string,jsonBody:any) {
  
    

      if (!jsonBody.__metadata) {
            jsonBody.__metadata = {
                'type': 'SP.ListItem'
            };
        }

  
      const URL = WebUrl+"/_api/web/lists/getbytitle('"+ListName+"')/Items";
      return  spHttpClient.post(URL,
        SPHttpClient.configurations.v1,{
          headers: {
            'Accept': 'application/json;odata=nometadata',
            'odata-version': '3.0'
          },
          body:JSON.stringify(jsonBody)
        }).then((response: SPHttpClientResponse) => {
            if(response.ok)
            {
                return response.json();
            }
        });
      
}

export  function UpdateItem(WebUrl:string,spHttpClient:SPHttpClient,ListName:string,jsonBody:any,ID:Number) {
  
    

    if (!jsonBody.__metadata) {
          jsonBody.__metadata = {
              'type': 'SP.ListItem'
          };
      }


    const URL = WebUrl+"/_api/web/lists/getbytitle('"+ListName+"')/Items("+ID+")";
    return  spHttpClient.post(URL,
      SPHttpClient.configurations.v1,{
        headers: {
            'Accept': 'application/json;odata=nometadata',
            'odata-version': '3.0',
            'IF-MATCH': '*',  
            'X-HTTP-Method': 'MERGE' 
        },
        body:JSON.stringify(jsonBody)
      }).then((response: SPHttpClientResponse) => {
          if(response.ok)
          {
              return response;
          }
      });
    
}

/*export  function UploadFile(WebUrl,spHttpClient,file,DisplayName,DocumentLib,jsonBody,FolderName):Promise<any>  {
  
  let fileupload = DocumentLib +"/"+FolderName;
    return new Promise((resolve) => {      
        const spOpts: ISPHttpClientOptions = {      
            body: file      
        };      
        var redirectionURL = WebUrl + "/_api/Web/GetFolderByServerRelativeUrl('"+fileupload+"')/Files/Add(url='" + DisplayName + "', overwrite=true)?$expand=ListItemAllFields"      
        const response = spHttpClient.post(redirectionURL, SPHttpClient.configurations.v1, spOpts).then((response: SPHttpClientResponse) => {        
            response.json().then(async (responseJSON: any) => {        
               // console.log(responseJSON.ListItemAllFields.ID);
              var serverRelURL = await responseJSON.ServerRelativeUrl;    
               if(jsonBody != null){
                await UpdateItem(WebUrl,spHttpClient,DocumentLib,jsonBody,responseJSON.ListItemAllFields.ID)
            
               }
               resolve(responseJSON); 
            });        
          });    
        });   
    
}*/

export async  function DeleteItem(WebUrl:string,spHttpClient:SPHttpClient,ListName:string,ID:Number) {
  
  const URL = WebUrl+"/_api/web/lists/getbytitle('"+ListName+"')/Items("+ID+")";
  return await spHttpClient.post(URL,
    SPHttpClient.configurations.v1,{
      headers: {
          'Accept': 'application/json;odata=nometadata',
          'odata-version': '3.0',
          'IF-MATCH': '*',  
          'X-HTTP-Method': 'DELETE' 
      }
    }).then((response: SPHttpClientResponse) => {
        if(response.ok)
        {
            return response;
        }
    });
  
}
function URLBuilder(url:string,options:any){
    if (options) {
        if (options.filter) {
            url += ((url.indexOf('?') > -1) ? "&" : "?") + "$filter=" + options.filter;
        }
        if (options.select) {
            url += ((url.indexOf('?') > -1) ? "&" : "?") + "$select=" + options.select;
        }
        if (options.orderby) {
            url += ((url.indexOf('?') > -1) ? "&" : "?") + "$orderby=" + options.orderby;
        }
        if (options.expand) {
            url += ((url.indexOf('?') > -1) ? "&" : "?") + "$expand=" + options.expand;
        }
        if (options.top) {
            url += ((url.indexOf('?') > -1) ? "&" : "?") + "$top=" + options.top;
        }
        if (options.skip) {
            url += ((url.indexOf('?') > -1) ? "&" : "?") + "$skip=" + options.skip;
        }
        if (options.skiptoken) {
            url += ((url.indexOf('?') > -1) ? "&" : "?") + "$skiptoken=Paged%3DTRUE%26p_ID%3D" + options.skiptoken;
        }
    }
    return url;
};




 
