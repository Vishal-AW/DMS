import * as React from "react";
import styles from "../HomePage.module.scss";
//import styles from '../GlobalCSS/global.module.scss';


export default function Footer(): JSX.Element {

    return (

        <div>
            <a href="https://www.ascenwork.com" target="_blank" rel="noopener noreferrer">
                <span className={styles.footera}>© AscenWork Technologies | All rights reserved | Made with <span className={styles.heart}>❤️</span> in India</span>
            </a>
        </div>
    )

}