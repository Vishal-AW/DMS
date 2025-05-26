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
import Footer from '../components/ResuableComponents/Footer';
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


export default function HomePage(props: IHomePageProps): JSX.Element {
  //export default class HomePage extends React.Component<IHomePageProps> {
  //public render(): React.ReactElement<IHomePageProps> {
  const [collapsed, setCollapsed] = useState(false); // State to toggle collapse

  useEffect(() => {
    document.body.style.visibility = "visible";
    document.documentElement.style.setProperty("--loader-url", `url(${props.SiteURL}/SiteAssets/Loader.gif)`);
    getAllData();
  }, []);


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
          <Footer></Footer>
        </div>
      </HashRouter>

    </>
  );
  //}
}
