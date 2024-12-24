import * as React from "react";
//import styles from '../GlobalCSS/global.module.scss';

import styles from '../Home/Dashboard.module.scss';
import { useState } from "react";
import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http-base";

export default function Dashboard({ props }: any): JSX.Element {

  //const [allmenuArray, setallmenuArray] = useState([]);
  //const [TileDetailsdata, setTileDetailsdata] = useState([]);
  const [userRole, setuserRole] = useState('');



  let dinamicurl = "";

  dinamicurl = dinamicurl + " Permission/ID eq " + props.userID + " or TileAdmin/ID eq " + props.userID + " or Permission/Title eq 'Everyone except external users'";
  React.useEffect(() => {
    getTileData();
  }, [])
  function getTileData() {
    FindUserGroupMain(props.spHttpClient).then(function (response) {
      Findusergroupdata();
    });
  }
  async function FindUserGroupMain(spHttpClient: any) {


    let SiteUrl = props.SiteURL;
    let username = props.userDisplayName;
    let ProjectAdminGrp = "ProjectAdmin";
    let ProjectMemberGrp = "Project Member";
    let UserRole = "ProjectMemeber";


    let URL = SiteUrl + "/_api/web/siteusers?$select=*,LoginName&$filter=Title eq '" + username + "'&$expand=groups";

    return await spHttpClient.get(URL,
      SPHttpClient.configurations.v1, {
      headers: {
        'Accept': 'application/json;odata=nometadata',
        'odata-version': ''
      }
    }).then(async (response: SPHttpClientResponse) => {

      if (response.ok) {
        const data = await response.json();
        const UserGroupData = data?.value?.[0]?.Groups || [];
        //console.log(GroupData);

        const checkUserGroupAdmin = UserGroupData.filter((item: any) => item.Title == ProjectAdminGrp);
        const checkUserGroupMember = UserGroupData.filter((item: any) => item.Title == ProjectMemberGrp);

        if (checkUserGroupAdmin.length > 0 && checkUserGroupMember.length > 0) {
          UserRole = "ProjectAdmin";
        }
        else if (checkUserGroupAdmin.length > 0) {
          UserRole = "ProjectAdmin";
        }
        else if (checkUserGroupMember.length > 0) {
          UserRole = "ProjectMember";
        }
        setuserRole(UserRole)
      }
    });

    setuserRole(UserRole)
  }

  const Findusergroupdata = async () => {

    const userData: any = await FindUserGroup(props.SiteURL, props.spHttpClient, props.userID);

    console.log(userData);

  }
  const [tileData, setTileData] = useState<any>([])
  async function FindUserGroup(WebUrl: string, spHttpClient: any, loginName: number): Promise<any> {

    let TotalDisplayTiles: any[] = [];
    let URL = `${WebUrl}/_api/Web/GetUserById(${loginName})?$expand=Groups`;

    return await spHttpClient.get(URL,
      SPHttpClient.configurations.v1, {
      headers: {
        'Accept': 'application/json;odata=nometadata',
        'odata-version': ''
      }
    }).then(async (response: SPHttpClientResponse) => {
      if (response.ok) {
        const data = await response.json();
        const GroupData = data.Groups;
        let query = "";

        for (let i = 0; i < GroupData.length; i++) {
          if (i == GroupData.length - 1) {
            dinamicurl = dinamicurl + " or Permission/ID eq " + GroupData[i].Id + " ";
          } else {
            dinamicurl = dinamicurl + " or  Permission/ID eq " + GroupData[i].Id + " ";
          }
        }
        if (userRole == "ProjectAdmin") {
          query = WebUrl + "/_api/web/lists/getByTitle('DMS_Mas_Tile')/items?$select=ID,TileName,TileImageURL,Permission/ID,Documentpath,Active,Order0,AllowApprover,LibraryName,LibGuidName,AllowApprover,IsArchiveRequired&$expand=Permission&$filter=Active eq 1&$orderby=Order0";
        }
        else {
          query = WebUrl + "/_api/web/lists/getByTitle('DMS_Mas_Tile')/items?$select=ID,TileName,TileImageURL,Permission/ID,Documentpath,Active,Order0,AllowApprover,LibraryName,LibGuidName,AllowApprover,IsArchiveRequired&$expand=Permission&$filter=Active eq 1&$orderby=Order0";
        }

        await GetListData(query).then(async (responseData: any) => {
          let AllTileMainData = responseData.d.results;
          //setallmenuArray(AllTileMainData);
          let TileCount = 0;
          if (AllTileMainData.length > 0) {

            AllTileMainData.map(async (index: any, value: any) => {

              let Permission = await checkUserPermissions(index.LibraryName)
              console.log(Permission);
              TileCount++;
              console.log("libraray:" + Permission.libraryName + " and hasPermission:" + Permission.hasPermission);
              if (Permission.hasPermission) {
                TotalDisplayTiles.push(index);
              }

              if (AllTileMainData.length == TileCount) {
                TotalDisplayTiles.sort((a: any, b: any) => a.Order0 - b.Order0);
                setTileData(TotalDisplayTiles)
                //createTileFinal(TotalDisplayTiles);
              }


              // });

            });


          }
        });

      }
    });
  }

  // function createTileFinal(item: any) {

  //   const TileDetail = setTileDetailsdata(item);
  //   console.log(TileDetail);

  //   if (!Array.isArray(item)) {
  //     return '<h1 style="text-align:center;width: 100%;">No data available</h1>';
  //   }

  //   const TileItem = item.map((el: any) => {
  //     let htmldata = "";

  //     const attrobj = encodeURIComponent(JSON.stringify(el));

  //     if (el !== null) {
  //       if (!el.Documentpath) {
  //         el.Documentpath = props.siteurl + "/DMS_TileDocument/Default.jpg";
  //       }

  //       htmldata += `<div class="col-xl-3 openLibrary me-8 mb-8" data-obj="${attrobj}">`;
  //       htmldata += `<div class="elementor-column elementor-col-33 elementor-top-column elementor-element elementor-element-3a866be" data-id="3a866be" data-element_type="column">`;
  //       htmldata += `d<div class="elementor-widget-wrap elementor-element-populated">`;
  //       htmldata += `<div class="elementor-element elementor-element-c07abbc elementor-widget elementor-widget-cleversoft_core_banner" data-id="c07abbc" data-element_type="widget" data-widget_type="cleversoft_core_banner.default">`;
  //       htmldata += `<div class="elementor-widget-container">`;
  //       htmldata += `<div class="qodef-shortcode qodef-m  qodef-banner qodef-layout--info-on-image">`;
  //       htmldata += `<div class="qodef-m-image">`;
  //       htmldata += `<img width="1100" height="759" src="${el.Documentpath}" class="attachment-full size-full" alt="d" loading="lazy" srcset="" sizes="(max-width: 1100px) 100vw, 1100px">`;
  //       htmldata += `</div>`;
  //       htmldata += `<div class="qodef-m-content">`;
  //       htmldata += `<div class="qodef-m-content-inner">`;
  //       htmldata += `<h5 class="qodef-m-title">${el.TileName}</h5>`;
  //       htmldata += `<a itemprop="url" class="qodef-m-arrow" target="_self">`;
  //       htmldata += `<span class="fa fa-arrow-right"></span>`;
  //       htmldata += `<span class="qodef-icon-elegant-icons arrow_right"></span>`;
  //       htmldata += `</a>`;
  //       htmldata += `</div>`;
  //       htmldata += `</div>`;
  //       htmldata += `</div>`;
  //       htmldata += `</div>`;
  //       htmldata += `</div>`;
  //       htmldata += `</div>`;
  //       htmldata += `</div>`;
  //       htmldata += `</div>`;
  //     } else {
  //       htmldata = '<h1 style="text-align:center;width: 100%;">No data available</h1>';
  //     }

  //     return htmldata;
  //     console.log(TileDetailsdata);
  //   });

  //   return TileItem;

  // }



  // async function checkUserPermissions(LibraryName: string): Promise<{ libraryName: string; hasPermission: boolean }> {
  //   try {
  //     const url = `${props.SiteURL}/_api/web/lists/GetByTitle('${LibraryName}')/effectiveBasePermissions`;
  //     const data = await GetListData(url);

  //     console.log(`Effective Permissions for Library: ${LibraryName}`, data);

  //     const hasPermission = !!data.value;

  //     return { libraryName: LibraryName, hasPermission };
  //   } catch (error) {
  //     console.error(`Error checking permissions for library ${LibraryName}:`, error);
  //     return { libraryName: LibraryName, hasPermission: false };
  //   }
  // }



  async function checkUserPermissions(LibraryName: string) {
    let hasPermissionData = false;
    const url = props.SiteURL + "/_api/web/lists/GetByTitle('" + LibraryName + "')/effectiveBasePermissions";


    const data = await GetListData(url)
    console.log(data.value);

    if (data !== undefined) {
      hasPermissionData = true
    }
    return {
      libraryName: LibraryName,
      hasPermission: hasPermissionData
    }
  }

  async function GetListData(query: string) {
    const response = await props.context.spHttpClient.get(query, SPHttpClient.configurations.v1, {
      headers: {
        'Accept': 'application/json;odata=verbose',
        'odata-version': '',
      },
    });
    return await response.json();


  };

  const openLib = (obj: any) => {

  }

  return (
    <div className={styles["row1-container"]}>

      {
        tileData.length > 0 ? tileData.map((el: any) => (

          <div className="col-xl-3 col-lg-6 col-md-12 mb-4" onClick={() => { openLib(el) }}>
            <div className={styles["card-container"]}>
              <div className={styles["card-content"]}>
                <div className={styles["card-image"]}>
                  <img src={el.Documentpath ? el.Documentpath : `${props.SiteURL}/DMS_TileDocument/Default.jpg`} alt={el.TileName} loading="lazy" />
                </div>
                <div className={styles["card-details"]}>
                  <h5 className={styles["card-title"]}>{el.TileName}</h5>
                  <a href="javascript:void(0)" className={styles["card-link"]} target="_self">
                    <span className={styles["fa-arrow-right"]}></span>
                  </a>
                </div>
                <a href="javascript:void(0)" className={styles["card-overlay"]} target="_self"></a>
              </div>
            </div>
          </div>
        )) : <>
          <h1 style={{ textAlign: "center", width: "100%;" }}>No data available</h1>
        </>
      }
    </div>
  )

}