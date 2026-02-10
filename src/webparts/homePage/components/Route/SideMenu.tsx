import * as React from "react";
import { Sidebar, Menu, MenuItem, SubMenu, } from 'react-pro-sidebar';
import { Icon } from 'office-ui-fabric-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from "react";
import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http-base";



interface ISideMenu {
  onclickbutton: (value: boolean) => void;
  props: any;
}
const SideMenu: React.FC<ISideMenu> = ({ onclickbutton, props }) => {
  const [collapsed, setCollapsed] = useState(true);

  const [isHovered, setIsHovered] = useState(false); // Track hover state

  const [ImageURL, setImageURL] = useState('');



  useEffect(() => {
    setLogo(props.SiteURL, props.spHttpClient);
    Findusergroupdata();
  }, []);


  const Findusergroupdata = async () => {

    const userData: any = await FindUserGroup(props.SiteURL, props.spHttpClient, props.userID);

    console.log(userData);

  };

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

    });

  }

  async function FindUserGroup(WebUrl: string, spHttpClient: any, loginName: number): Promise<any> {
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
          if (el.IsShareByEmailGuestUser === false) {
            userArray.push(el);
          }
        });

        let externaluser = userArray;
        let NonExternalUser = externaluser.filter(Title => Title.Title === "Everyone except external users");
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
    });

  }
  const [allMenu, setAllMenu] = useState([]);
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


      } else {
        const responseText: string = await response.text();
        const errorMessage: string = `Error loading current user: ${response.status} - ${responseText}`;
        console.log(new Error(errorMessage));
      }
    });
  }



  function createMenuLevelFinal(allMenu: any) {

    const firstlevel = getFirstLevel(allMenu);
    const links = firstlevel.map((el: any) => {
      let finalMenuHtml;
      const childData = getEqualToHeaderData(el.Id, allMenu);


      if (el.External_Url) {
        finalMenuHtml = <>{childData.length > 0 ? getChildDataFinal(childData, el) : <MenuItem component={<Link to={el.URL} />} icon={<Icon iconName={el.IconClass} style={{ color: '#3f4254', fontSize: '18px' }} />}>{CheckNextTab(el.Next_Tab)}{el.MenuName}</MenuItem>}</>;

      } else {
        finalMenuHtml = <>{childData.length > 0 ? getChildDataFinal(childData, el) : <MenuItem component={<Link to={el.URL} />} icon={<Icon iconName={el.IconClass} style={{ color: '#3f4254', fontSize: '18px' }} />}>{CheckNextTab(el.Next_Tab)}{el.MenuName}</MenuItem>}</>;
      }
      // }
      return finalMenuHtml;
    });
    //console.log(links);
    return links;
  }
  function getFirstLevel(item: any) {
    return item.filter((it: any) => (it.ParentMenuIdId === null));
  }

  function getEqualToHeaderData(id: any, allMenu: any[]) {
    return allMenu.filter((it: any) => (it.ParentMenuIdId === id));
  }

  function CheckNextTab(nextTab: any) {
    if (nextTab) {
      return 'target="_blank"';
    } else {
      return '';
    }
  }

  function getChildDataFinal(data: any, parent: any) {

    let subArray = <SubMenu icon={<Icon iconName={parent.IconClass} style={{ color: '#3f4254', fontSize: '18px' }} />} label={parent.MenuName}>
      {

        data.map((el: any) => {
          let submenu;

          let childData = getEqualToHeaderData(el.Id, data);
          if (childData.length > 0) {
            submenu = <MenuItem icon={<Icon iconName={el.IconClass} style={{ color: '#b5b5c3', fontSize: '11px' }} />}>{el.MenuName}</MenuItem>;
          } else {
            if (el.External_Url) {
              submenu = <MenuItem component={<Link to={el.URL} />} icon={<Icon iconName={el.IconClass} style={{ color: '#b5b5c3', fontSize: '11px' }} />}>{el.MenuName}</MenuItem>;

            } else {
              submenu = <MenuItem component={<Link to={el.URL} />} icon={<Icon iconName={el.IconClass} style={{ color: '#b5b5c3', fontSize: '11px' }} />}>{el.MenuName}</MenuItem>;

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
    onclickbutton(collapsed);
  };

  const handleMouseEnter = () => {
    if (!collapsed) return; // Only expand if it's collapsed
    setIsHovered(true); // Hover in: Sidebar expands
  };

  const handleMouseLeave = () => {
    if (!collapsed) return; // Don't collapse if already expanded manually
    setIsHovered(false); // Hover out: Sidebar collapses
  };

  const spanStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 0,
    height: 'calc(1.5em + 1.5rem + 2px)',
    cursor: 'pointer' // Improves UX by indicating interactivity
  };



  return (

    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar collapsed={collapsed && !isHovered}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          color: '#fff',// Text color
          transition: 'width 0.3s ease-in-out',
        }}
      >

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '65px', padding: '0 25px' }}>
          {isHovered && (<a style={{ marginBottom: '20px', marginTop: '20px', marginLeft: '22px' }}>
            <img src={ImageURL} style={{ maxWidth: '100%', height: '50px', padding: '10px 0px 5px 10px;' }} />
          </a>)}

          {/* <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between', padding: '0', height: 'calc(1.5em + 1.5rem + 2px)' }}
            onClick={toggleSidebar} onTouchMove={toggleSidebar}
          > */}

          <span
            style={spanStyle}
            onClick={toggleSidebar}
            onTouchMove={toggleSidebar} // Changed from onTouchMove to prevent excessive calls
          >
            {/* Add your content here */}

            <Icon iconName="DoubleChevronLeftMed" style={{ fontSize: '16px', verticalAlign: 'middle', color: '#a4a7b9', cursor: 'pointer', textAlign: 'center' }} />
            {/* <Icon
              iconName={collapsed ? "DoubleChevronRightMed" : "DoubleChevronLeftMed"}
              style={{ fontSize: '16px', verticalAlign: 'middle', color: '#a4a7b9', textAlign: 'center' }}
            /> */}
          </span>


        </div>



        <Menu>
          {createMenuLevelFinal(allMenu)}

        </Menu>
      </Sidebar>
    </div>




  );

};


export default SideMenu;
