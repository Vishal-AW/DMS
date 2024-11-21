import * as React from "react";
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
//import styles from '../GlobalCSS/global.module.scss';
import { Link } from 'react-router-dom';
import {ConstName} from '../Constants/Constants'
import styles from "../HomePage.module.scss";


export default function SideMenu(): JSX.Element {
const Imageurl="https://apar.com/wp-content/uploads/2023/05/APAR_Media_Kit/APAROriginalIDlWithBrandLine050820.png"


  return (

    <div >
      <Sidebar>
          <div className={styles.asidelogo}>
						<a>
						    <span><img src={Imageurl} style={{maxWidth:'100%' ,height:'35px'}}/></span>
						</a>
					</div>
        <Menu 
          menuItemStyles={{
            button: {
              // the active class will be added automatically by react router
              // so we can use it to style the active menu item
              [`&.active`]: {
                backgroundColor: '#13395e',
                color: '#b6c8d9',
              },
            },
          }}
        >
          <SubMenu label="Charts">
            <MenuItem> Pie charts </MenuItem>
            <MenuItem> Line charts </MenuItem>
          </SubMenu>
           
          <MenuItem component={<Link to="/" />}> {ConstName.Const_Route.Dashboard} </MenuItem>
          <MenuItem component={<Link to="/Master" />}> {ConstName.Const_Route.Master} </MenuItem>
          <MenuItem component={<Link to="/Dashboard" />}> {ConstName.Const_Route.Dashboard} </MenuItem>
          <MenuItem component={<Link to="/e-commerce" />}> E-commerce</MenuItem>
        </Menu>
      </Sidebar>

      
    </div>
  )

}