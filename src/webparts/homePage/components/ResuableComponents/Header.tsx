
import * as React from "react";
import styles from '../GlobalCSS/global.module.scss';
import { Icon } from '@fluentui/react/lib/Icon';
import { useState } from "react";
//import { Dropdown, IDropdownStyles, IDropdownOption, DropdownMenuItemType} from '@fluentui/react/lib/Dropdown';

export default function Header(): JSX.Element {

  //interface ImageProps {imageUrl:string}
  //const Imageurl = "https://apar.com/wp-content/uploads/2023/05/APAR_Media_Kit/APAROriginalIDlWithBrandLine050820.png"
  const HomeIcon = () => <Icon iconName="Contact" />;

  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  return (

    <div className={styles.headerdiv} >
      {/*<img src={Imageurl} style={{ maxWidth: '10px', height: '35px' }} />*/}
      <a style={{ maxWidth: '10px', height: '35px' }} ></a>
      <div className={styles.topnavright}>

        <div className={styles.userProfile}>
          <div className={styles.profileIcon} onClick={toggleDropdown}>
            <span className="ms-Icon ms-Icon--Contact" aria-hidden="true"></span>
            <span className={styles.profileName} style={{ fontSize: '25px' }}><HomeIcon></HomeIcon></span>
          </div>
          {isDropdownVisible && (
            <div className={styles.dropdownMenu} >
              <div className={styles.dropdownItem}>View account</div>
              <div className={styles.dropdownItem}>My Microsoft 365 profile</div>
              <div className={styles.dropdownItem}>Sign out</div>
            </div>
          )}
        </div>


      </div>
    </div>
  )
}
