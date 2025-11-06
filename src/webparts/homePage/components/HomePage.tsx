import * as React from 'react';
//import styles from './HomePage.module.scss';
import type { IHomePageProps } from './IHomePageProps';
import styles from '../components/GlobalCSS/global.module.scss';

import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
//import { escape } from '@microsoft/sp-lodash-subset';
import SideMenu from '../components/Route/SideMenu';
import Master from '../components/Master/Master';
//import Header from '../components/ResuableComponents/Header';
//import Footer from '../components/ResuableComponents/Footer';
import Datatable from '../components/ResuableComponents/Header';
import Dashboard from '../components/Home/Dashboard';
//import ParentComponent from './GeneralDocumentTreeView/ParentTreeView';
import { GetAllLabel } from "../../../Services/ControlLabel";
import '../components/Hidedesign.css';
import TreeView from './GeneralDocumentTreeView/TreeView';
import ConfigMaster from './Master/ConfigEntryForm';
import SearchFilter from './GeneralDocumentTreeView/SearchFilter';
import SearchComponent from './GeneralDocumentTreeView/Search';
import TemplateMaster from './Master/TemplateMaster';
import FolderMaster from './Master/FolderMaster';
import Navigation from "./Master/Navigation";
import DynamicFooter from '../components/ResuableComponents/Footer';
//import { SPHttpClient } from "@microsoft/sp-http";




export default function HomePage(props: IHomePageProps): JSX.Element {
  //export default class HomePage extends React.Component<IHomePageProps> {
  //public render(): React.ReactElement<IHomePageProps> {
  const [collapsed, setCollapsed] = useState(false); // State to toggle collapse

  useEffect(() => {
    document.body.style.visibility = "visible";
    document.documentElement.style.setProperty("--loader-url", `url(${props.SiteURL}/SiteAssets/Loader.gif)`);
    getAllData();
    //checkSuperAdminAndHideGear();
  }, []);



  // const checkSuperAdminAndHideGear = async () => {
  //   const superAdminGroup = "SuperAdmin";
  //   const userId = props.context.pageContext.legacyPageContext.userId;

  //   try {
  //     const res = await props.context.spHttpClient.get(
  //       `${props.context.pageContext.web.absoluteUrl}/_api/web/sitegroups/getbyname('${superAdminGroup}')/users?$filter=Id eq ${userId}`,
  //       SPHttpClient.configurations.v1
  //     );

  //     const data = await res.json();

  //     if (!data.value || data.value.length === 0) {
  //       const style = document.createElement("style");
  //       style.innerHTML = `
  //       #O365_MainLink_Settings,
  //       div[data-automationid="SiteActionsButton"],
  //       button[title="Settings"],
  //       #O365_MainLink_Help ~ #O365_MainLink_Settings {
  //         display: none !important;
  //       }
  //     `;
  //       document.head.appendChild(style);
  //     }
  //   } catch (err) {
  //     console.error("Error hiding gear icon:", err);
  //   }
  // };


  // const checkSuperAdminAndHideGear = async () => {
  //   const superAdminGroup = "SuperAdmin";
  //   const userId = props.context.pageContext.legacyPageContext.userId;

  //   try {
  //     const res = await props.context.spHttpClient.get(
  //       `${props.context.pageContext.web.absoluteUrl}/_api/web/sitegroups/getbyname('${superAdminGroup}')/users?$filter=Id eq ${userId}`,
  //       SPHttpClient.configurations.v1
  //     );

  //     const data = await res.json();
  //     const isSuperAdmin = data.value && data.value.length > 0;

  //     if (!isSuperAdmin) {
  //       const style = document.createElement("style");
  //       style.innerHTML = `
  //       #O365_MainLink_Settings,
  //       div[data-automationid="SiteActionsButton"],
  //       button[title="Settings"],
  //       #O365_MainLink_Help ~ #O365_MainLink_Settings {
  //         display: none !important;
  //       }
  //     `;
  //       document.head.appendChild(style);
  //     }

  //     const restrictedPaths = [
  //       "/_layouts/15/viewlsts.aspx",
  //       "_layouts/15/viewlsts.aspx?view=14",
  //       "/_layouts/15/settings.aspx",
  //       "/_layouts/15/user.aspx",
  //       "/Lists/",
  //     ];

  //     const currentUrl = window.location.href.toLowerCase();
  //     const isRestricted = restrictedPaths.some(path =>
  //       currentUrl.includes(path.toLowerCase())
  //     );

  //     if (!isSuperAdmin && isRestricted) {
  //       alert("You don't have permission to access this page.");
  //       window.location.href = props.context.pageContext.web.absoluteUrl;
  //     }

  //   } catch (err) {
  //     console.error("Error checking SuperAdmin or hiding gear icon:", err);
  //   }
  // };


  const getAllData = async () => {
    let data: any = await GetAllLabel(props.SiteURL, props.spHttpClient, "DefaultText");
    localStorage.setItem('DisplayLabel', JSON.stringify(data));
    console.log(data);
  };

  // Function to toggle sidebar collapse
  const toggleSidebar = (value: boolean) => {
    setCollapsed(value);
  };

  return (
    <>
      <HashRouter>
        {/* <div className={styles.header}>
          <Header></Header>

        </div> */}


        <section>
          <div className={styles.nav}>
            <SideMenu props={props} onclickbutton={toggleSidebar}></SideMenu>
          </div>
          <div className={styles.article}
            style={{
              flex: 1, // Take the remaining space
              background: "#f4f4f4", // Content background color
              padding: "20px", // Content padding
              transition: "margin-left", // Smooth content adjustment
              marginLeft: collapsed ? "250px" : "80px", // Adjust based on sidebar width
              width: collapsed ? "calc(100% - 250px)" : "calc(100% - 80px)"
            }}
          >

            <Routes>
              <Route path='/' element={<Dashboard props={props}></Dashboard>}></Route>
              <Route path='/Master' element={<Master props={props}></Master>}></Route>
              <Route path='/TreeView' element={<TreeView props={props}></TreeView>}></Route>
              <Route path='/Datatable' element={<Datatable></Datatable>}></Route>
              <Route path='/ConfigMaster' element={<ConfigMaster props={props}></ConfigMaster>}></Route>
              <Route path='/TemplateMaster' element={<TemplateMaster props={props}></TemplateMaster>}></Route>
              <Route path='/FolderMaster' element={<FolderMaster props={props}></FolderMaster>}></Route>
              <Route path='/SearchFilter' element={<SearchFilter props={props}></SearchFilter>}></Route>
              <Route path='/SearchComponent' element={<SearchComponent context={props.context}></SearchComponent>}></Route>
              <Route path='/Navigation' element={<Navigation props={props}></Navigation>}></Route>

            </Routes>


          </div>
        </section>
        <div className={styles.footer}>


          <DynamicFooter props={props}></DynamicFooter>
        </div>
      </HashRouter>

    </>
  );
  //}
}
