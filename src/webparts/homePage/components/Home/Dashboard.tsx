import * as React from "react";
//import styles from '../GlobalCSS/global.module.scss';

import styles from '../Home/Dashboard.module.scss';

export default function Dashboard(): JSX.Element {


  interface CardProps {
    imageUrl: string;
    title: string;
    link: string;
  }

  const cards = [
    { imageUrl: "https://static.twproject.com/blog/wp-content/uploads/project-documents-1130x736.jpg", title: "Leasing Department", link: "/our-services/" },
    { imageUrl: "https://static.twproject.com/blog/wp-content/uploads/project-documents-1130x736.jpg", title: "Projects", link: "/our-services/" },
    { imageUrl: "https://img.freepik.com/premium-vector/accountants-collaborate-financial-strategies-using-technology-charts-their-office-environment-financial-accounting-male-accountants-make-financial-statements_538213-156156.jpg?w=996", title: "Finance", link: "/our-services/" },
    { imageUrl: "https://media.istockphoto.com/id/1421633064/vector/law-and-justice-men-discuss-legal-issues-people-work-on-laptop-near-justice-scales-judge.jpg?s=612x612&w=0&k=20&c=OltIMj4VqzTS4tPicUEujvKVZtSHKG_Li_uWCkoiWwg=", title: "Legal", link: "/our-services/" },
    { imageUrl: "https://media.istockphoto.com/id/1421633064/vector/law-and-justice-men-discuss-legal-issues-people-work-on-laptop-near-justice-scales-judge.jpg?s=612x612&w=0&k=20&c=OltIMj4VqzTS4tPicUEujvKVZtSHKG_Li_uWCkoiWwg=", title: "Quality", link: "/our-services/" },

  ];
  const Card: React.FC<CardProps> = ({ imageUrl, title, link }) => (
    <div className="col-xl-3 col-lg-6 col-md-12 mb-4">
      <div className={styles["card-container"]}>
        <div className={styles["card-content"]}>
          <div className={styles["card-image"]}>
            <img src={imageUrl} alt={title} loading="lazy" />
          </div>
          <div className={styles["card-details"]}>
            <h5 className={styles["card-title"]}>{title}</h5>
            <a href={link} className={styles["card-link"]} target="_self">
              <span className={styles["fa-arrow-right"]}></span>
            </a>
          </div>
          <a href={link} className={styles["card-overlay"]} target="_self"></a>
        </div>
      </div>
    </div>
  );
  return (
    <div className={styles["row1-container"]}>
      {cards.map((card, index) => (
        <Card
          key={index}
          imageUrl={card.imageUrl}
          title={card.title}
          link={card.link}
        />
      ))}
    </div>
  )

}