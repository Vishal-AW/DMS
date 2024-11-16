import * as React from 'react';
//import styles from './HomePage.module.scss';
import type { IHomePageProps } from './IHomePageProps';
import styles from '../components/GlobalCSS/global.module.scss';
import {HashRouter,Routes,Route} from 'react-router-dom';
//import { escape } from '@microsoft/sp-lodash-subset';
import SideMenu from '../components/Route/SideMenu';
import Master from '../components/Master/Master';
import Header from '../components/ResuableComponents/Header';
import Footer from '../components/ResuableComponents/Footer';
import Dashboard from '../components/Home/Dashboard';

export default function HomePage(props : IHomePageProps):JSX.Element{
//export default class HomePage extends React.Component<IHomePageProps> {
  //public render(): React.ReactElement<IHomePageProps> {
   

    return (
      <>
      <HashRouter>
        <div className={styles.header}>
          <Header></Header>
          
        </div>
        <section>
        <div className={styles.nav}>
            <SideMenu></SideMenu>
          </div>
          <div className={styles.article}>
            
              <Routes>
                <Route path='/Dashboard' element={<Dashboard></Dashboard>}></Route>
                <Route path='/Master' element={<Master></Master>}></Route>
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
