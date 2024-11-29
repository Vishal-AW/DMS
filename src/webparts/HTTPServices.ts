import { WebPartContext } from "@microsoft/sp-webpart-base";
import { SPHttpClient, SPHttpClientResponse, ISPHttpClientOptions } from '@microsoft/sp-http';

export class HTTPServices {
    public async _getListItem(context: WebPartContext, webURL: string, ListName: string, option: string) {

        const URL = option === "" ? webURL + "/_api/web/lists/getbytitle('" + ListName + "')/Items" : webURL + "/_api/web/lists/getbytitle('" + ListName + "')/Items?" + option;
        return await context.spHttpClient.get(URL,
            SPHttpClient.configurations.v1,
            {
                headers: {
                    'Accept': 'application/json;odata=nometadata',
                    'odata-version': ''
                }
            }).then(async (response: SPHttpClientResponse) => {
                return response.json();
            }).catch((err: any) => {
                console.log(err);
            });
    }

    public CreateItems(context: WebPartContext, webURL: string, ListName: string, jsonBody: any) {
        const URL = webURL + "/_api/web/lists/getbytitle('" + ListName + "')/Items";
        return context.spHttpClient.post(URL,
            SPHttpClient.configurations.v1, {
            headers: {
                'Accept': 'application/json;odata=nometadata',
                'odata-version': '3.0'
            },
            body: JSON.stringify(jsonBody)
        }).then((response: SPHttpClientResponse) => {
            if (response.ok) {
                return response.json();
            }
        });
    }

    public async UpdateItem(context: WebPartContext, webURL: string, ListName: string, jsonBody: any, ID: Number) {

        const URL = webURL + "/_api/web/lists/getbytitle('" + ListName + "')/Items(" + ID + ")";
        return await context.spHttpClient.post(URL,
            SPHttpClient.configurations.v1, {
            headers: {
                'Accept': 'application/json;odata=nometadata',
                'odata-version': '3.0',
                'IF-MATCH': '*',
                'X-HTTP-Method': 'MERGE'
            },
            body: JSON.stringify(jsonBody)
        }).then((response: SPHttpClientResponse) => {
            if (response.ok) {
                return response;
            }
        });

    }

    public recursiveFunction(context: WebPartContext, url: string) {
        return context.spHttpClient.get(url, SPHttpClient.configurations.v1, {
            headers: {
                'Accept': 'application/json;odata=nometadata',
                'Content-type': 'application/json;odata=nometadata',
                'odata-version': ''
            },
        }).then((response: SPHttpClientResponse) => {
            return response.json();
        });
    }

    public async isMember(context: WebPartContext, GroupName: string) {
        let url = context.pageContext.web.absoluteUrl + "/_api/web/sitegroups/getByName('" + GroupName + "')/Users?$filter=Id eq " + context.pageContext.legacyPageContext["userId"];
        return await context.spHttpClient.get(url, SPHttpClient.configurations.v1, {
            headers: {
                'Accept': 'application/json;odata=nometadata',
                'Content-type': 'application/json;odata=nometadata',
                'odata-version': ''
            },
        }).then((response: SPHttpClientResponse) => {
            return response.json();
        });
    }

    public async getLink(context: WebPartContext) {
        let url = context.pageContext.web.absoluteUrl + "/_api/navigation/menustate?mapprovidername='GlobalNavigationSwitchableProvider'";
        return await context.spHttpClient.get(url,
            SPHttpClient.configurations.v1,
            {
                headers: {
                    'Accept': 'application/json;odata=nometadata',
                    'odata-version': ''
                }
            }).then((response: SPHttpClientResponse) => {
                return response.json();
            });
    }

    public async UploadFile(context: WebPartContext, WebUrl: string, DocumentLib: string, file: any, DisplayName: string, jsonBody: any) {
        let spOpts: ISPHttpClientOptions = {
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: file
        };
        const redirectionURL = WebUrl + "/_api/Web/GetFolderByServerRelativeUrl('" + DocumentLib + "')/Files/Add(url='" + DisplayName + "', overwrite=true)?$expand=ListItemAllFields";

        return await context.spHttpClient.post(redirectionURL, SPHttpClient.configurations.v1, spOpts).then((response: SPHttpClientResponse) => {
            response.json().then(async (responseJSON: any) => {
                if (jsonBody !== null) {
                    let metaData = await this.UpdateItem(context, WebUrl, DocumentLib, jsonBody, responseJSON.ListItemAllFields.ID);
                    return metaData;
                }
            });
        });
    }

    public async getUserInfo(context: WebPartContext, WebUrl: string) {

        const redirectionURL = WebUrl + "/_api/web/SiteUserInfoList/items?$filter=Id eq " + context.pageContext.legacyPageContext["userId"];

        return await context.spHttpClient.get(redirectionURL,
            SPHttpClient.configurations.v1,
            {
                headers: {
                    'Accept': 'application/json;odata=nometadata',
                    'odata-version': ''
                }
            }).then(async (response: SPHttpClientResponse) => {
                return response.json();
            }).catch((err: any) => {
                console.log(err);
            });
    }
    public uuidv4() {
        let tday = new Date();
        let d: any = tday.getDate();
        let m: any = tday.getMonth() + 1;
        let y = tday.getFullYear();
        let hr = tday.getHours();
        let min = tday.getMinutes();
        let sec = tday.getMilliseconds();
        if (d < 10) {
            d = '0' + d;
        }
        if (m < 10) {
            m = '0' + m;
        }

        let CreationDate = y + '-' + m + '-' + d + '-' + hr + '-' + min + '-' + sec;
        return CreationDate.toString();
    }

    public HideDesign() {

        let spSiteHeader = document.getElementById("spSiteHeader") || document.documentElement;
        spSiteHeader.style.display = "none";
        let spLeftNav = document.getElementById("spLeftNav") || document.documentElement;
        spLeftNav.style.display = "none";
        let SuiteNavWrapper = document.getElementById("SuiteNavWrapper") || document.documentElement;
        SuiteNavWrapper.style.display = "none";
        let spappBar = document.getElementById("sp-appBar") || document.documentElement;
        spappBar.style.display = "none";

        let spCommandBar = document.getElementById("spCommandBar") || document.documentElement;
        spCommandBar.style.display = "none";
        let CommentsWrapper = document.getElementById("CommentsWrapper") || document.documentElement;
        CommentsWrapper.style.display = "none";
        document.documentElement.style.display = "block";
    }
}