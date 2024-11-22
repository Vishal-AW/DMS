import * as React from "react";
import { Sidebar, Menu, MenuItem, SubMenu,} from 'react-pro-sidebar';
import { Icon } from 'office-ui-fabric-react';

//import styles from '../GlobalCSS/global.module.scss';
//import 'react-pro-sidebar/dist/css/styles.css'; // Import styles for react-pro-sidebar
import { Link } from 'react-router-dom';
import {ConstName} from '../Constants/Constants'
//import styles from "../HomePage.module.scss";
//import { BarChart } from "../icons/BarChart"
//import { Global } from '../icons/Global';
//import { InkBottle } from '../icons/InkBottle';
import { useState } from "react";
//export default function SideMenu(): JSX.Element {
const Imageurl="https://apar.com/wp-content/uploads/2023/05/APAR_Media_Kit/APAROriginalIDlWithBrandLine050820.png"

const SideMenu: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false); // State to toggle collapse

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };  



return (

   <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar collapsed={collapsed} style={{
          color: '#fff',         // Text color
        }}
      >
         {/* <div className={styles.asidelogo}>
						<a>
						    <span><img src={Imageurl} style={{maxWidth:'100%' ,height:'35px'}}/></span>
						</a>
					</div>*/}

        <div>
          <span style={{ marginBottom: '20px', marginTop: '20px', marginLeft: '22px' }}>
            <img src={Imageurl} style={{maxWidth:'100%' ,height:'50px'}}/>
          </span>

          <span
          style={{
            textAlign: 'center',
            marginBottom: '20px',
            color: '#00bcd4',
            cursor: 'pointer',
          }}
          onClick={toggleSidebar} // Toggle on click
        >
          <Icon iconName="GlobalNavButton" style={{ fontSize: '24px' }} />
        </span>
        </div>
        

        <Menu>
        
         <SubMenu icon={<Icon iconName="BarChartVertical" style={{ color: '#00bcd4', fontSize: '18px' }} />} label="Charts">
            <MenuItem>Pie charts</MenuItem>
            <MenuItem>Line charts</MenuItem>
            <MenuItem>Bar charts</MenuItem>
          </SubMenu>
          
          <SubMenu icon={<Icon iconName="Globe" style={{ color: '#00bcd4', fontSize: '18px' }} />} label="Maps">
            <MenuItem>Google maps</MenuItem>
            <MenuItem>Open street maps</MenuItem>
          </SubMenu>

          <SubMenu icon={<Icon iconName="Color" style={{ color: '#00bcd4', fontSize: '18px' }} />} label="Theme">
            <MenuItem>Dark</MenuItem>
            <MenuItem>Light</MenuItem>
          </SubMenu>

        <MenuItem component={<Link to="/" />} 
        icon={<Icon iconName="calendar" style={{ color: '#00bcd4', fontSize: '18px' }} />} label="calendar">
        {ConstName.Const_Route.Dashboard}  
        </MenuItem>

        <MenuItem component={<Link to="/" />}
        icon={<Icon iconName="ShoppingCart" style={{ color: '#00bcd4', fontSize: '18px' }} />} label="ShoppingCart">
        {ConstName.Const_Route.Master}        
        </MenuItem>

        <MenuItem component={<Link to="/Dashboard" />}
        icon={<Icon iconName="Diamond" style={{ color: '#00bcd4', fontSize: '18px' }} />} label="Diamond">
        {ConstName.Const_Route.Dashboard}        
        </MenuItem>

        


         {/* <MenuItem component={<Link to="/" />}> {ConstName.Const_Route.Dashboard} </MenuItem>
          <MenuItem component={<Link to="/Master" />}> {ConstName.Const_Route.Master} </MenuItem>
          <MenuItem component={<Link to="/Dashboard" />}> {ConstName.Const_Route.Dashboard} </MenuItem>
          <MenuItem component={<Link to="/e-commerce" />}> E-commerce</MenuItem>*/}
        </Menu>
      </Sidebar>
    </div>

    /*<div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar
        style={{
          background: '#1d1d1d', // Sidebar background color
          color: '#fff',         // Text color
          padding: '10px',
        }}
      >
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <h2 style={{ color: '#00bcd4', margin: '0' }}>Pro Sidebar</h2>
        </div>

        <Menu>
          {/* Charts Section *
          <SubMenu
            icon={<Icon iconName="BarChartVertical" style={{ color: '#00bcd4', fontSize: '18px' }} />}
            label="Charts"
          >
            <MenuItem>Pie charts</MenuItem>
            <MenuItem>Line charts</MenuItem>
            <MenuItem>Bar charts</MenuItem>
          </SubMenu>

          {/* Maps Section *
          <SubMenu
            icon={<Icon iconName="Globe" style={{ color: '#00bcd4', fontSize: '18px' }} />}
            label="Maps"
          >
            <MenuItem>Google maps</MenuItem>
            <MenuItem>Open street maps</MenuItem>
          </SubMenu>

          {/* Theme Section *
          <SubMenu
            icon={<Icon iconName="Color" style={{ color: '#00bcd4', fontSize: '18px' }} />}
            label="Theme"
          >
            <MenuItem>Dark Theme</MenuItem>
            <MenuItem>Light Theme</MenuItem>
          </SubMenu>

          {/* Components Section *
          <SubMenu
            icon={<Icon iconName="Components" style={{ color: '#00bcd4', fontSize: '18px' }} />}
            label="Components"
          >
            <MenuItem>Buttons</MenuItem>
            <MenuItem>Cards</MenuItem>
          </SubMenu>
        </Menu>
      </Sidebar>
    </div>*/
  )

}

export default SideMenu;

