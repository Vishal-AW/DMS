import * as React from "react";
import { Sidebar, Menu, MenuItem, SubMenu, } from 'react-pro-sidebar';
import { Icon } from 'office-ui-fabric-react';
//import styles from '../GlobalCSS/global.module.scss';
//import 'react-pro-sidebar/dist/css/styles.css'; // Import styles for react-pro-sidebar
import { Link } from 'react-router-dom';
import { ConstName } from '../Constants/Constants'
//import styles from "../HomePage.module.scss";
//import { BarChart } from "../icons/BarChart"
//import { Global } from '../icons/Global';
//import { InkBottle } from '../icons/InkBottle';
import { useState } from "react";
//export default function SideMenu(): JSX.Element {
const Imageurl = "https://apar.com/wp-content/uploads/2023/05/APAR_Media_Kit/APAROriginalIDlWithBrandLine050820.png"

interface ISideMenu {
  onclickbutton: (value: boolean) => void;
}
const SideMenu: React.FC<ISideMenu> = ({ onclickbutton }) => {
  const [collapsed, setCollapsed] = useState(false); // State to toggle collapse

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
            <img src={Imageurl} style={{ maxWidth: '100%', height: '50px', padding: '10px 0px 5px 10px;' }} />
          </a>)}

          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between', padding: '0', height: 'calc(1.5em + 1.5rem + 2px)' }}
            onClick={toggleSidebar} // Toggle on click
          >
            <Icon iconName="DoubleChevronLeftMed" style={{ fontSize: '16px', verticalAlign: 'middle', color: '#a4a7b9', cursor: 'pointer', textAlign: 'center' }} />
          </span>
        </div>

        <Menu>
          <SubMenu icon={<Icon iconName="BarChartVertical" style={{ color: '#3f4254', fontSize: '18px' }} />} label="Charts">
            <MenuItem icon={<Icon iconName="LocationDot" style={{ color: '#b5b5c3', fontSize: '11px' }} />}>Pie charts</MenuItem>
            <MenuItem icon={<Icon iconName="LocationDot" style={{ color: '#b5b5c3', fontSize: '11px' }} />}>Line charts</MenuItem>
            <MenuItem icon={<Icon iconName="LocationDot" style={{ color: '#b5b5c3', fontSize: '11px' }} />}>Bar charts</MenuItem>
          </SubMenu>

          <SubMenu icon={<Icon iconName="Globe" style={{ color: '#3f4254', fontSize: '18px' }} />} label="Maps">
            <MenuItem icon={<Icon iconName="LocationDot" style={{ color: '#b5b5c3', fontSize: '11px' }} />}>Google maps</MenuItem>
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
          </MenuItem>


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
