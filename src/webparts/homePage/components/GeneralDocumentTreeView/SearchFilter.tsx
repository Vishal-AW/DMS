import * as React from "react";
import { Accordion, Form } from "react-bootstrap";
import styles from "../Master/Master.module.scss";
import { useEffect, useState } from "react";
import { ILabel } from '../Interface/ILabel';

export default function SearchFilter({ props }: any): JSX.Element {

    const [DisplayLabel, setDisplayLabel] = useState<ILabel>();
    useEffect(() => {
        let DisplayLabel: ILabel = JSON.parse(localStorage.getItem('DisplayLabel') || '{}');
        setDisplayLabel(DisplayLabel);

    }, []);

    return (
        <div>
            <Accordion alwaysOpen >
                <Accordion.Item eventKey="0">
                    <Accordion.Header className={styles.Accodordianherder}>Meta Data Search</Accordion.Header>
                    <Accordion.Body>
                        <Form>
                            <div className={`ms-Grid ${styles.inlineFormContainer}`}>
                                <div className="col-md-3">
                                    <div className="form-group">
                                        <label className={styles.Headerlabel}>{DisplayLabel?.TileName}<span style={{ color: "red" }}>*</span></label>


                                    </div>
                                </div>
                            </div>


                        </Form>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </div>

    );

}