import * as React from "react";
import styles from '../Master/Master.module.scss';

export default function Master():JSX.Element{

    
return(

    <div className={styles.h1}>
        Master Data File 123
    </div>
    
)
interface BannerProps {
    title: string;
    imageUrl: string;
    link: string;
  }


const Banner: React.FC<BannerProps> = ({ title, imageUrl, link }) => {


return (
<article className={styles.elementorcolumn} >
  <div className={styles.elementorcolumnwrap}>
    <div className={styles.elementorelement}>
      <div className={styles.elementorwidgetcontainer}>
        <div className={styles.qodefbanner}>
          <div className={styles.qodefmimage}>
            <img
             /* width="1100"
              height="1200"
              src={imageUrl}
              alt={title}
              loading="lazy"*/
            />
          </div>
          <div className={styles.qodefmcontent}>
            <div className={styles.qodefmcontentinner}>
              <h5 className={styles.qodefh5}>{title}</h5>
              <a href={link} className={styles.qodefmarrow}>
                <span ></span>
              </a>
            </div>
          </div>
          <a href={link} ></a>
        </div>
      </div>
    </div>
  </div>
</article>
);
};


}