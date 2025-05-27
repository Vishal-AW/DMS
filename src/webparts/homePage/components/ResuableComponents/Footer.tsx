//import * as React from "react";
import React, {  useEffect, useState } from "react";
//import styles from "../HomePage.module.scss";


import { GetAlldata } from "../../../../Services/FooterSetting";
//import styles from '../GlobalCSS/global.module.scss';


export default function DynamicFooter({ props }: any): JSX.Element {
 const [Alignment, setAlignment] = useState<any>("");
 const [Description, SetDesc] = useState<any>("");
 useEffect(()=>{getCommonData()},[])
//   const getCommonData = async () => {

//        await GetAlldata(props.SiteURL
//          , props.spHttpClient).then(function (response) {
//             console.log(response);
//             if (response.value.length > 0) {
//                     setAlignment(response.value[0].Alignment);
                    
                   
                

//             }
//         });

 const getCommonData = async () => {
    let FetchallTileData: any = await GetAlldata(props.SiteURL, props.spHttpClient);
    let DynamicfooterData = FetchallTileData.value;
   setAlignment(
  DynamicfooterData[0].Alignment === "Right"
    ? "right"
    : DynamicfooterData[0].Alignment === "Center"
    ? "center"
    : "left"
);
SetDesc(
  DynamicfooterData[0].Desc 
);
  }
console.log(Alignment === "Right");
 return (
 
       <div style={{ textAlign: Alignment, marginRight: "3%" ,marginLeft: "8%" }}>

            <a href="https://www.ascenwork.com" target="_blank" rel="noopener noreferrer">
                <span >{Description}</span>
            </a>
        </div>
    )

}