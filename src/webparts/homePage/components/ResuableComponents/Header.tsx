import * as React from "react";
import styles from '../GlobalCSS/global.module.scss';
import { Icon } from '@fluentui/react/lib/Icon';
import { Dropdown, IDropdownStyles, IDropdownOption, DropdownMenuItemType} from '@fluentui/react/lib/Dropdown';


export default function Header():JSX.Element{
  
const HomeIcon = () => <Icon iconName="Contact" />;
const dropdownStyles: Partial<IDropdownStyles> = {
  dropdown: { width: 100 },
};

const options: IDropdownOption[] = [
  { key: 'fruitsHeader', text: 'Fruits', itemType: DropdownMenuItemType.Header },
  { key: 'apple', text: 'Apple' },
  { key: 'banana', text: 'Banana' },
  
];

return(

    <div className={styles.header}>
        <div>
            This is header
            <a></a>
            <span className={styles.sh}>SharePoint</span>
            <div className={styles.topnavright}>
             
            <span className={styles.headerdropdown}>
              <Dropdown placeholder="Select an option"
              //label="Basic uncontrolled example"
              options={options}
              styles={dropdownStyles}
              />
            </span>
	          <a href="#" className={styles.system}> <HomeIcon></HomeIcon>
            </a>
            </div>
        </div>
    </div>
)

}