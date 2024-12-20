import * as React from "react";
import { Sidebar, Menu, MenuItem, SubMenu, } from 'react-pro-sidebar';
import { Icon } from 'office-ui-fabric-react';
//import styles from '../GlobalCSS/global.module.scss';
//import 'react-pro-sidebar/dist/css/styles.css'; // Import styles for react-pro-sidebar
import { Link } from 'react-router-dom';
//import { ConstName } from '../Constants/Constants'
//import styles from "../HomePage.module.scss";
//import { BarChart } from "../icons/BarChart"
//import { Global } from '../icons/Global';
//import { InkBottle } from '../icons/InkBottle';
import { useEffect, useState } from "react";
//import { getAllNav } from "../../../../Services/NavigationService";
import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http-base";
//export default function SideMenu(): JSX.Element {
//const Imageurl = "https://apar.com/wp-content/uploads/2023/05/APAR_Media_Kit/APAROriginalIDlWithBrandLine050820.png"


interface ISideMenu {
  onclickbutton: (value: boolean) => void;
  props: any;
}
const SideMenu: React.FC<ISideMenu> = ({ onclickbutton, props }) => {
  const [collapsed, setCollapsed] = useState(false);
  // State to toggle collapse
  const [ImageURL, setImageURL] = useState('');


  useEffect(() => {
    setLogo(props.SiteURL, props.spHttpClient);
    Findusergroupdata();
  }, []);


  const Findusergroupdata = async () => {

    const userData: any = await FindUserGroup(props.SiteURL, props.spHttpClient, props.userID);

    console.log(userData);

  }

  async function setLogo(WebUrl: string, spHttpClient: any,): Promise<any> {

    let URL = `${WebUrl}/_api/web/lists/getByTitle('Logo')/items?$select=ID,LogoName,Slogan,DisplaySlogan,Active,File,Navigation&$orderby=ID desc&$expand=File&$top=5000`;

    return await spHttpClient.get(URL,
      SPHttpClient.configurations.v1, {
      headers: {
        'Accept': 'application/json;odata=nometadata',
        'odata-version': ''
      }
    }).then(async (response: SPHttpClientResponse) => {
      if (response.ok) {
        const data = await response.json();
        let SiteImage = data.value[0];
        let ImgURL = WebUrl + "/Logo/" + SiteImage.File.Name;

        setImageURL(ImgURL);

        console.log(data);
      } else {
        const errorMessage: string = `Error loading current user: ${response.status} - ${response.statusText}`;
        console.log(new Error(errorMessage));
      }

    })

  }

  async function FindUserGroup(WebUrl: string, spHttpClient: any, loginName: number): Promise<any> {
    // let URL = WebUrl + "/_api/web/siteusers?&$expand=Groups";
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
        userData(WebUrl, spHttpClient, GroupData, loginName);
      }
    });
  }

  async function userData(WebUrl: string, spHttpClient: any, groupData: any, loginName: number) {
    let dinamicurl = "Permission/Id eq " + loginName;

    let URL = WebUrl + "/_api/Web/siteusers";
    return await spHttpClient.get(URL,
      SPHttpClient.configurations.v1, {
      headers: {
        'Accept': 'application/json;odata=nometadata',
        'odata-version': ''
      }
    }).then(async (response: SPHttpClientResponse) => {

      if (response.ok) {
        let data = await response.json();
        let userArray = new Array();
        data.value.map((el: any) => {
          if (el.IsShareByEmailGuestUser == false) {
            userArray.push(el);
          }
        });

        let externaluser = userArray;
        let NonExternalUser = externaluser.filter(Title => Title.Title == "Everyone except external users");
        dinamicurl = dinamicurl + "or Permission/Id eq " + NonExternalUser[0].Id + " ";
        for (let i = 0; i < groupData.length; i++) {
          dinamicurl = dinamicurl + " or Permission/Id eq " + groupData[i].Id + " ";
        }
        _loadCurrentUserDisplayName(WebUrl, spHttpClient, dinamicurl);
      } else {
        const responseText: string = await response.text();
        const errorMessage: string = `Error loading current user: ${response.status} - ${responseText}`;
        console.log(new Error(errorMessage));
      }
    })

  }
  const [allMenu, setAllMenu] = useState([])
  async function _loadCurrentUserDisplayName(WebUrl: string, spHttpClient: any, option: string) {

    let URL = `${WebUrl}/_api/web/lists/getByTitle('GEN_Navigation')/items?$select=*,ParentMenuId/Id,ParentMenuId/MenuName,Permission/ID&$expand=ParentMenuId,Permission&$orderby=OrderNo&$filter=Active eq '1' and (${option})&$top=500`;
    return await spHttpClient.get(URL,
      SPHttpClient.configurations.v1, {
      headers: {
        'Accept': 'application/json;odata=nometadata',
        'odata-version': ''
      }
    }).then(async (response: SPHttpClientResponse) => {
      ;
      if (response.ok) {
        const userData: any = await response.json();
        setAllMenu(userData.value);
        console.log(allMenu);

        // let d: any = document.getElementById("spSiteHeader");
        // d.style.display = "none";

      } else {
        const responseText: string = await response.text();
        const errorMessage: string = `Error loading current user: ${response.status} - ${responseText}`;
        console.log(new Error(errorMessage));
      }
    })
  }

  // function createMenuLevelFinal(allMenu: any) {
  //   let rootURL = props.SiteURL;
  //   let finalMenuHtml = '';
  //   let firstlevel = getFirstLevel(allMenu);
  //   finalMenuHtml += "";
  //   for (let i = 0; i < firstlevel.length; i++) {
  //     let childData = getEqualToHeaderData(firstlevel[i].Id, allMenu);
  //     if (childData.length > 0) {
  //       if (firstlevel[i].External_Url) {
  //         if (firstlevel[i].MenuName == "Workflow") {
  //           finalMenuHtml +=
  //             <MenuItem component={<Link to="/" />} icon={<Icon iconName={firstlevel[i].IconClass} style={{ color: '#3f4254', fontSize: '18px' }} />}><SubMenu> ${getChildDataFinal(childData)}</SubMenu>${CheckNextTab(firstlevel[i].Next_Tab)}${firstlevel[i].MenuName}</MenuItem>
  //           //finalMenuHtml += `<li ><a  ${CheckNextTab(firstlevel[i].Next_Tab)}>${firstlevel[i].MenuName}<svg style="margin-left:10px" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-down-fill" viewBox="0 0 16 16"><path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/></svg></a><ul ${styles["sub-menu"]}>${getChildDataFinal(childData)}</ul></li>`;
  //         } else {
  //           <MenuItem component={<Link to="/" />} icon={<Icon iconName={firstlevel[i].IconClass} style={{ color: '#3f4254', fontSize: '18px' }} />}><SubMenu> ${getChildDataFinal(childData)}</SubMenu>${CheckNextTab(firstlevel[i].Next_Tab)}${firstlevel[i].MenuName}</MenuItem>

  //           // finalMenuHtml += `<li ><a  ${CheckNextTab(firstlevel[i].Next_Tab)}>${firstlevel[i].MenuName} <svg style="margin-left:10px" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-down-fill" viewBox="0 0 16 16"><path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/></svg></a><ul class='${styles["sub-menu"]}'>${getChildDataFinal(childData)}</ul></li>`;
  //         }
  //       } else {
  //         if (firstlevel[i].URL == null) {
  //           <MenuItem component={<Link to="/" />} icon={<Icon iconName={firstlevel[i].IconClass} style={{ color: '#3f4254', fontSize: '18px' }} />}><SubMenu> ${getChildDataFinal(childData)}</SubMenu>${CheckNextTab(firstlevel[i].Next_Tab)}${firstlevel[i].MenuName}</MenuItem>

  //           //finalMenuHtml += `<li  ><a >${firstlevel[i].MenuName}<svg style="margin-left:10px" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-down-fill" viewBox="0 0 16 16"><path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/></svg></a><ul class='${styles["sub-menu"]}'>${getChildDataFinal(childData)}</ul></li>`;
  //         } else {
  //           <MenuItem component={<Link to="/" />} icon={<Icon iconName={firstlevel[i].IconClass} style={{ color: '#3f4254', fontSize: '18px' }} />}><SubMenu> ${getChildDataFinal(childData)}</SubMenu>${CheckNextTab(firstlevel[i].Next_Tab)}${firstlevel[i].MenuName}</MenuItem>

  //           //finalMenuHtml += `<li><a ${CheckNextTab(firstlevel[i].Next_Tab)} >${firstlevel[i].MenuName}<svg style="margin-left:10px" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-down-fill" viewBox="0 0 16 16"><path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/></svg></a><ul class='${styles["sub-menu"]}'>${getChildDataFinal(childData)}</ul></li>`;
  //         }
  //       }
  //     } else {
  //       if (firstlevel[i].External_Url) {
  //         var URL = firstlevel[i].URL;
  //         if (firstlevel[i].URL == null) {

  //           //finalMenuHtml += `<li ><label>${firstlevel[i].MenuName}</label></li>`;
  //         } else {
  //           finalMenuHtml += `<li ><a href="${URL}" ${CheckNextTab(firstlevel[i].Next_Tab)}>${firstlevel[i].MenuName}</a></li>`;
  //         }
  //       } else {
  //         let urlData = rootURL + firstlevel[i].URL;
  //         finalMenuHtml += `<li><a href="${urlData}" ${CheckNextTab(firstlevel[i].Next_Tab)} >${firstlevel[i].MenuName}</a></li>`;
  //       }
  //     }
  //   }
  //   let newOptions: any = document.getElementById("newOptions");
  //   newOptions.innerHTML = finalMenuHtml;
  // }

  function createMenuLevelFinal(allMenu: any) {
    // const rootURL = props.SiteURL;
    const firstlevel = getFirstLevel(allMenu);
    const links = firstlevel.map((el: any) => {
      let finalMenuHtml;
      const childData = getEqualToHeaderData(el.Id, allMenu);

      // if (childData.length > 0) {
      if (el.External_Url) {
        if (el.MenuName == "Workflow") {
          finalMenuHtml = <><MenuItem component={<Link to="/" />} icon={<Icon iconName={el.IconClass} style={{ color: '#3f4254', fontSize: '18px' }} />}>{el.MenuName}</MenuItem>{childData.length > 0 ? getChildDataFinal(childData, el) : <></>}</>
        } else {
          finalMenuHtml = <><MenuItem component={<Link to="/" />} icon={<Icon iconName={el.IconClass} style={{ color: '#3f4254', fontSize: '18px' }} />}>{CheckNextTab(el.Next_Tab)}{el.MenuName}</MenuItem>{childData.length > 0 ? getChildDataFinal(childData, el) : <></>}</>

        }
      } else {
        if (el.URL == null) {
          finalMenuHtml = <><MenuItem component={<Link to="/" />} icon={<Icon iconName={el.IconClass} style={{ color: '#3f4254', fontSize: '18px' }} />}>{CheckNextTab(el.Next_Tab)}{el.MenuName}</MenuItem>{childData.length > 0 ? getChildDataFinal(childData, el) : <></>}</>
        } else {
          finalMenuHtml = <><MenuItem component={<Link to="https://google.com" />} icon={<Icon iconName={el.IconClass} style={{ color: '#3f4254', fontSize: '18px' }} />}>{CheckNextTab(el.Next_Tab)}{el.MenuName}</MenuItem>{childData.length > 0 ? getChildDataFinal(childData, el) : <></>}</>
        }
      }
      // }
      return finalMenuHtml;
    })
    console.log(links)
    return links;
  }
  function getFirstLevel(item: any) {
    return item.filter((it: any) => (it.ParentMenuIdId == null));
  }

  function getEqualToHeaderData(id: any, allMenu: any[]) {
    return allMenu.filter((it: any) => (it.ParentMenuIdId == id));
  }

  function CheckNextTab(nextTab: any) {
    if (nextTab) {
      return 'target="_blank"';
    } else {
      return '';
    }
  }

  function getChildDataFinal(data: any, parent: any) {
    // let rootURL = props.SiteURL;
    var subArray = <SubMenu icon={<Icon iconName="BarChartVertical" style={{ color: '#3f4254', fontSize: '18px' }} />} label={parent.MenuName}>
      {

        data.map((el: any) => {
          let submenu;
          var childData = getEqualToHeaderData(el.Id, data);
          if (childData.length > 0) {
            submenu = <MenuItem icon={<Icon iconName="LocationDot" style={{ color: '#b5b5c3', fontSize: '11px' }} />}>{el.MenuName}</MenuItem>
              ;
          } else {
            if (el.External_Url) {
              submenu = <MenuItem icon={<Icon iconName="LocationDot" style={{ color: '#b5b5c3', fontSize: '11px' }} />}>{el.MenuName}</MenuItem>

            } else {
              // var urlData = rootURL + data[i].URL;
              submenu = <MenuItem icon={<Icon iconName="LocationDot" style={{ color: '#b5b5c3', fontSize: '11px' }} />}>{el.MenuName}</MenuItem>

            }
          }
          return submenu;
        })
      }
    </SubMenu>;

    return subArray;
  }






  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    onclickbutton(!collapsed)
  };



  return (

    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar collapsed={collapsed} style={{
        color: '#fff',// Text color
      }}
      >

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '65px', padding: '0 25px' }}>
          {!collapsed && (<a style={{ marginBottom: '20px', marginTop: '20px', marginLeft: '22px' }}>
            <img src={ImageURL} style={{ maxWidth: '100%', height: '50px', padding: '10px 0px 5px 10px;' }} />
          </a>)}

          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between', padding: '0', height: 'calc(1.5em + 1.5rem + 2px)' }}
            onClick={toggleSidebar} // Toggle on click
          >
            <Icon iconName="DoubleChevronLeftMed" style={{ fontSize: '16px', verticalAlign: 'middle', color: '#a4a7b9', cursor: 'pointer', textAlign: 'center' }} />
          </span>
        </div>

        <Menu>
          {createMenuLevelFinal(allMenu)}
          {/* <SubMenu icon={<Icon iconName="BarChartVertical" style={{ color: '#3f4254', fontSize: '18px' }} />} label="Charts">
            <MenuItem icon={<Icon iconName="LocationDot" style={{ color: '#b5b5c3', fontSize: '11px' }} />}>Pie charts</MenuItem>
            <MenuItem icon={<Icon iconName="LocationDot" style={{ color: '#b5b5c3', fontSize: '11px' }} />}>Line charts</MenuItem>
            <MenuItem icon={<Icon iconName="LocationDot" style={{ color: '#b5b5c3', fontSize: '11px' }} />}>Bar charts</MenuItem>
          </SubMenu>

          <SubMenu icon={<Icon iconName="Globe" style={{ color: '#3f4254', fontSize: '18px' }} />} label="Maps">
            <MenuItem icon={<Icon iconName="LocationDot" style={{ color: '#b5b5c3', fontSize: '11px' }} />}><NavLink to={"/"}>Google maps</NavLink></MenuItem>
            <MenuItem icon={<Icon iconName="LocationDot" style={{ color: '#b5b5c3', fontSize: '11px' }} />}>Open street maps</MenuItem>
          </SubMenu>


          <SubMenu icon={<Icon iconName="Color" style={{ color: '#3f4254', fontSize: '18px' }} />} label="Theme">
            <MenuItem icon={<Icon iconName="LocationDot" style={{ color: '#b5b5c3', fontSize: '11px' }} />}>Dark</MenuItem>
            <MenuItem icon={<Icon iconName="LocationDot" style={{ color: '#b5b5c3', fontSize: '11px' }} />}>Light</MenuItem>
          </SubMenu>

          <MenuItem component={<Link to="/" />}
            icon={<Icon iconName="calendar" style={{ color: '#3f4254', fontSize: '18px' }} />}>
            {ConstName.Const_Route.Dashboard}
          </MenuItem>

          <MenuItem component={<Link to="/" />}
            icon={<Icon iconName="ShoppingCart" style={{ color: '#3f4254', fontSize: '18px' }} />}>
            {ConstName.Const_Route.Master}
          </MenuItem>

          <MenuItem component={<Link to="/Dashboard" />}
            icon={<Icon iconName="Diamond" style={{ color: '#3f4254', fontSize: '18px' }} />}>
            {ConstName.Const_Route.Dashboard}
          </MenuItem> */}


          {/* <MenuItem component={<Link to="/" />}> {ConstName.Const_Route.Dashboard} </MenuItem>
          <MenuItem component={<Link to="/Master" />}> {ConstName.Const_Route.Master} </MenuItem>
          <MenuItem component={<Link to="/Dashboard" />}> {ConstName.Const_Route.Dashboard} </MenuItem>
          <MenuItem component={<Link to="/e-commerce" />}> E-commerce</MenuItem>*/}
        </Menu>
      </Sidebar>
    </div>




  )

}


export default SideMenu;
