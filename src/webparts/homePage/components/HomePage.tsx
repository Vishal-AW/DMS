import * as React from 'react';
//import styles from './HomePage.module.scss';
import type { IHomePageProps } from './IHomePageProps';
import styles from '../components/GlobalCSS/global.module.scss';
import { HashRouter, Routes, Route } from 'react-router-dom';
//import { escape } from '@microsoft/sp-lodash-subset';
import SideMenu from '../components/Route/SideMenu';
import Master from '../components/Master/Master';
import Header from '../components/ResuableComponents/Header';
import Footer from '../components/ResuableComponents/Footer';
import Datatable from '../components/ResuableComponents/Header';
import Dashboard from '../components/Home/Dashboard';
import TreeView from '../components/v1_tree/TreeView';

import '../components/Hidedesign.css';
import { useState } from 'react';


export default function HomePage(props: IHomePageProps): JSX.Element {
  //export default class HomePage extends React.Component<IHomePageProps> {
  //public render(): React.ReactElement<IHomePageProps> {
  const [collapsed, setCollapsed] = useState(false); // State to toggle collapse

  // Function to toggle sidebar collapse
  const toggleSidebar = (value: boolean) => {
    setCollapsed(value);
  };

  return (
    <>
      <HashRouter>
        <div className={styles.header}>
          <Header></Header>

        </div>
        <section>
          <div className={styles.nav}>
            <SideMenu onclickbutton={toggleSidebar}></SideMenu>
          </div>
          <div className={styles.article}
            style={{
              flex: 1, // Take the remaining space
              background: "#f4f4f4", // Content background color
              padding: "20px", // Content padding
              transition: "margin-left", // Smooth content adjustment
              marginLeft: collapsed ? "80px" : "250px", // Adjust based on sidebar width
              width: collapsed ? "calc(100% - 80px)" : "calc(100% - 250px)"
            }}
          >

            <Routes>
              <Route path='/Dashboard' element={<Dashboard></Dashboard>}></Route>
              <Route path='/Master' element={<Master props={props}></Master>}></Route>
              <Route path='/TreeView' element={<TreeView></TreeView>}></Route>
              <Route path='/Datatable' element={<Datatable></Datatable>}></Route>
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
