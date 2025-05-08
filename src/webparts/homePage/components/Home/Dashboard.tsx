import * as React from "react";
import styles from '../Home/Dashboard.module.scss';
import { useEffect, useState, } from "react";
import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http-base";
import cls from '../HomePage.module.scss';
import { FontIcon } from "office-ui-fabric-react";


export default function Dashboard({ props }: any): JSX.Element {
  const [userRole, setuserRole] = useState('');
  const [showLoader, setShowLoader] = useState({ display: "block" });

  let dinamicurl = "";

  dinamicurl = dinamicurl + " Permission/ID eq " + props.userID + " or TileAdmin/ID eq " + props.userID + " or Permission/Title eq 'Everyone except external users'";
  React.useEffect(() => {
    getTileData();
  }, []);

  function getTileData() {
    FindUserGroupMain(props.spHttpClient);
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
        setuserRole(UserRole);
      }
    });

  }

  useEffect(() => {
    Findusergroupdata();
  }, [userRole]);
  const Findusergroupdata = async () => {
    const userData: any = await FindUserGroup(props.SiteURL, props.spHttpClient, props.userID);
    console.log(userData);
  };
  const [tileData, setTileData] = useState<any>([]);
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
        if (userRole === "ProjectAdmin") {
          query = WebUrl + "/_api/web/lists/getByTitle('DMS_Mas_Tile')/items?$select=*,ID,TileName,TileImageURL,Permission/ID,Documentpath,Active,Order0,AllowApprover,LibraryName,LibGuidName,AllowApprover,IsArchiveRequired&$expand=Permission&$filter=Active eq 1&$orderby=Order0";
        }
        else {
          query = WebUrl + `/_api/web/lists/getByTitle('DMS_Mas_Tile')/items?$select=*,ID,TileName,TileImageURL,Permission/ID,Documentpath,Active,Order0,AllowApprover,LibraryName,LibGuidName,AllowApprover,IsArchiveRequired&$expand=Permission&$filter=Active eq 1 and ${dinamicurl}&$orderby=Order0`;
        }

        await GetListData(query).then(async (responseData: any) => {
          let AllTileMainData = responseData.d.results;
          //setallmenuArray(AllTileMainData);
          let TileCount = 0;
          if (AllTileMainData.length > 0) {

            AllTileMainData.map(async (index: any, value: any) => {

              let Permission = await checkUserPermissions(index.LibraryName);
              console.log(Permission);
              TileCount++;
              console.log("libraray:" + Permission.libraryName + " and hasPermission:" + Permission.hasPermission);
              if (Permission.hasPermission) {
                TotalDisplayTiles.push(index);
              }

              if (AllTileMainData.length == TileCount) {
                TotalDisplayTiles.sort((a: any, b: any) => a.Order0 - b.Order0);
                setTileData(TotalDisplayTiles);
                setShowLoader({ display: "none" });
              }
            });


          }
          else { setShowLoader({ display: "none" }); }
        });

      }
    });
  }

  async function checkUserPermissions(LibraryName: string) {
    let hasPermissionData = false;
    const url = props.SiteURL + "/_api/web/lists/GetByTitle('" + LibraryName + "')/effectiveBasePermissions";


    const data = await GetListData(url);
    console.log(data.value);

    if (data !== undefined) {
      hasPermissionData = true;
    }
    return {
      libraryName: LibraryName,
      hasPermission: hasPermissionData
    };
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

  const openLib = async (obj: any) => {


    sessionStorage.setItem("LibDetails", JSON.stringify(obj));
    if (obj.LibraryName === "ProjectMasterDocument") {

    } else if (obj.TileType === "Community") {
      if (obj.TileImageURL) {

      }
    } else {
      location.href = "#/TreeView";

    }
  };


  return (



    <div className={styles["row1-container"]}>
      {
        tileData.length > 0 ? tileData.map((el: any) => (
          <div className="col-xl-3 col-lg-6 col-md-12 mb-4" onClick={() => { openLib(el); }}>
            <a href="javascript:void(0)" className={styles["dashcard"]} >
              <div>
                <img className={styles["dashcard__image"]}
                  src={el.Documentpath ? el.Documentpath : `${props.SiteURL}/DMS_TileDocument/Default.jpg`}
                  //src={el.Documentpath}
                  alt={el.TileName}
                  loading="lazy" />
              </div>

              <div className={styles["dashcard__overlay"]}>
                <div className={styles["dashcard__header"]}>
                  {/* <svg className={styles["dashcard__arc"]} xmlns="http://www.w3.org/2000/svg"> <path d="M 40 80 c 22 0 40 -22 40 -40 v 40 Z"
                  /></svg> */}
                  {/* <img className={styles["dashcard__thumb"]} src="https://i.imgur.com/oYiTqum.jpg" alt="" /> */}
                  <div>
                    <h3 className={styles["dashcard__title"]}>{el.TileName}</h3>
                    {/* <span className={styles["dashcard__status"]}>1 hour ago</span> */}
                  </div>
                  <a href="javascript:void(0)" className={styles["card-overlay"]} target="_self"></a>
                  <p className={styles["dashcard__description"]}>
                    <FontIcon aria-label="" iconName="Forward" style={{
                      color: '#000', cursor: 'pointer', padding: '4px 8px', borderRadius: '50%', fontWeight: '800',
                      fontSize: '13px'
                    }}></FontIcon>
                  </p>
                </div>

              </div>
            </a>
          </div>
        )) : (
          <>
            <h1 style={{ textAlign: "center", width: "100%" }}>No data available</h1>
          </>
        )
      }
      <div className={cls["modal"]} style={showLoader}></div>

    </div>

    // <div className={styles["row"]}>
    //   {
    //     tileData.length > 0 ? tileData.map((el: any) => (
    //       <div className="col-xl-3 mb-4" style={{ paddingRight: "10px" }} onClick={() => { openLib(el); }}>
    //         <a href="javascript:void(0)" className={styles["dashcard"]} >
    //           <img className={styles["dashcard__image"]}
    //             src={el.Documentpath ? el.Documentpath : `${props.SiteURL}/DMS_TileDocument/Default.jpg`}
    //             //src={el.Documentpath}
    //             alt={el.TileName}
    //             loading="lazy" />

    //           <div className={styles["dashcard__overlay"]}>
    //             <div className={styles["dashcard__header"]}>
    //               <svg className={styles["dashcard__arc"]} xmlns="http://www.w3.org/2000/svg"> <path d="M 40 80 c 22 0 40 -22 40 -40 v 40 Z"
    //               /></svg>
    //               {/* <img className={styles["dashcard__thumb"]} src="https://i.imgur.com/oYiTqum.jpg" alt="" /> */}
    //               <div>
    //                 <h3 className={styles["dashcard__title"]}>{el.TileName}</h3>
    //                 {/* <span className={styles["dashcard__status"]}>1 hour ago</span> */}
    //               </div>
    //               <a href="javascript:void(0)" className={styles["card-overlay"]} target="_self"></a>
    //             </div>
    //             <p className={styles["dashcard__description"]}></p>
    //           </div>
    //         </a>
    //       </div>
    //     )) : (
    //       <>
    //         <h1 style={{ textAlign: "center", width: "100%" }}>No data available</h1>
    //       </>
    //     )
    //   }
    //   <div className={cls["modal"]} style={showLoader}></div>
    // </div>


  );

}