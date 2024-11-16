import * as React from "react";
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
//import styles from '../GlobalCSS/global.module.scss';
import { Link } from 'react-router-dom';
import {ConstName} from '../Constants/Constants'

export default function SideMenu(): JSX.Element {

  return (

    <div >
      <Sidebar>
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