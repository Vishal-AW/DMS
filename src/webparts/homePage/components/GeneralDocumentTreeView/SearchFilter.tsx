import * as React from "react";
import { Accordion, Form } from "react-bootstrap";
import styles from "../Master/Master.module.scss";
import { useEffect, useState } from "react";
import { ILabel } from '../Interface/ILabel';
import { DefaultButton } from "office-ui-fabric-react";

export default function SearchFilter({ props }: any): JSX.Element {

    const [DisplayLabel, setDisplayLabel] = useState<ILabel>();
    const [tileObjectJson, setTileObjectJson] = useState<string | null>(null);

    const [tileObject, setTileObject] = useState<Record<string, any> | null>(null);
    const [libraryName, setLibraryName] = useState<string>('');
    const [controlData, setControlData] = useState<Record<string, any> | null>(null);
    const [filterObj, setFilterObj] = useState<Record<string, any> | null>(null);

    useEffect(() => {
        let DisplayLabel: ILabel = JSON.parse(localStorage.getItem('DisplayLabel') || '{}');
        setDisplayLabel(DisplayLabel);

        const tileObjectFromStorage = sessionStorage.getItem('TileObject');
        const controlDataFromStorage = sessionStorage.getItem('controlData');
        const filterObjFromStorage = sessionStorage.getItem('filterObj');


        // Parse and update state
        setTileObjectJson(tileObjectFromStorage);
        if (tileObjectFromStorage) {
            const parsedTileObject = JSON.parse(tileObjectFromStorage);
            setTileObject(parsedTileObject);
            setLibraryName(parsedTileObject.LibraryName);
        }

        if (controlDataFromStorage) {
            setControlData(JSON.parse(controlDataFromStorage));
        }

        if (filterObjFromStorage) {
            setFilterObj(JSON.parse(filterObjFromStorage));
        }

        console.log('TileObjectJson:', tileObjectJson);
        console.log('TileObject:', tileObject);
        console.log('libraryName:', libraryName);
        console.log('controlData:', controlData);
        console.log('filterObj:', filterObj);


    }, []);



    const SearchData = () => {

        // let filter = "";
        // filter += "InternalStatus eq 'Published' and Active eq 1";
        // let level = true;
        // console.log(level);


    };
    const Reset = () => {

    };


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



                                    </div>
                                </div>
                            </div>


                        </Form>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>

            <div className={styles.container} >
                <div className={styles.containerOne} >



                    <DefaultButton onClick={SearchData} text={DisplayLabel?.Submit} className={styles['sub-btn']} />

                    <DefaultButton onClick={Reset} text={DisplayLabel?.Update} className={styles['sub-btn']} />

                </div>

            </div>
        </div>

    );

}