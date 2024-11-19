import * as React from "react";
import styles from '../GlobalCSS/global.module.scss';

export default function Header():JSX.Element{

return(

    <div className={styles.header}>
        <div>
            This is header
            <a></a>
            <span className={styles.sh}>SharePoint</span>
            <div className={styles.topnavright}>
              <a>
			    <i></i>
			  </a>
              <a >
				<i ></i>
			  </a>
	          <a href="#" className={styles.system}>System Account</a>
	          <a href="#"></a>
            </div>
        </div>
    </div>
)

}