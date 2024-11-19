import * as React from "react";
import styles from "../HomePage.module.scss";
//import styles from '../GlobalCSS/global.module.scss';


export default function Footer():JSX.Element{

    return(
    
        <div>
           <a href="https://www.ascenwork.com">
        <span className={styles.footera}>© AscenWork Technologies | All rights reserved | Made with  in India</span>
        </a>
        </div>
    )
    
    }