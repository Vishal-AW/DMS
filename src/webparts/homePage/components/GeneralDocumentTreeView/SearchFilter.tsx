import * as React from "react";
import { Accordion, Form } from "react-bootstrap";
import styles from "../Master/Master.module.scss";
import { useEffect, useState } from "react";
import { ILabel } from '../Interface/ILabel';
import { ChoiceGroup, DatePicker, DefaultButton, Dropdown, IChoiceGroupOption, IDropdownOption, TextField } from "office-ui-fabric-react";

export default function SearchFilter({ props }: any): JSX.Element {

    const [DisplayLabel, setDisplayLabel] = useState<ILabel>();
    // const [dropdownOptions, setDropdownOptions] = useState<IDropdownOption[]>([]);
    const tileObject: string | null = sessionStorage.getItem("TileObject");
    const libDetails: any = JSON.parse(tileObject as string);
    console.log(libDetails);

    const controlData: string | null = sessionStorage.getItem('controlData');
    const controlDataMain: any = JSON.parse(controlData as string);
    console.log(controlDataMain);

    const filterObj: string | null = sessionStorage.getItem('filterObj');
    const filterObjMain: any = JSON.parse(filterObj as string);
    console.log(filterObjMain);


    useEffect(() => {
        let DisplayLabel: ILabel = JSON.parse(localStorage.getItem('DisplayLabel') || '{}');
        setDisplayLabel(DisplayLabel);

    }, []);



    // const libraryName = "Test Tile Data1";
    const controlDataStatic: string = `[{"field":10,"IsRequired":true,"IsActiveControl":true,"IsFieldAllowInFile":false,"isShowAsFilter":false,"Flag":"New","editingIndex":-1,"Id":10,"Title":"Arbitration","ColumnType":"Single line of Text","InternalListName":null,"IsActive":true,"IsStaticValue":false,"StaticDataObject":null,"DisplayValue":null,"InternalTitleName":"Arbitration","IsShowAsFilter":false,"Abbreviation":"Abbreviation","ID":10},{"field":1,"IsRequired":true,"IsActiveControl":true,"IsFieldAllowInFile":false,"isShowAsFilter":true,"Flag":"New","editingIndex":-1,"Id":1,"Title":"City","ColumnType":"Dropdown","InternalListName":"DMS_City","IsActive":true,"IsStaticValue":false,"StaticDataObject":null,"DisplayValue":"City","InternalTitleName":"City","IsShowAsFilter":true,"Abbreviation":"Abbreviation","ID":1},{"field":15,"IsRequired":true,"IsActiveControl":true,"IsFieldAllowInFile":false,"isShowAsFilter":false,"Flag":"New","editingIndex":-1,"Id":15,"Title":"Confidentiality","ColumnType":"Single line of Text","InternalListName":null,"IsActive":true,"IsStaticValue":false,"StaticDataObject":null,"DisplayValue":null,"InternalTitleName":"Confidentiality","IsShowAsFilter":false,"Abbreviation":"Abbreviation","ID":15}]`;

    const control = JSON.parse(controlDataStatic);

    console.log(control);

    const renderControl = async (control: any) => {
        const isRequired = control.IsRequired;

        switch (control.ColumnType) {
            case "Dropdown": {

                // const response = await fetch(`${props.SiteURL}/_api/getOptions?listName=${control.InternalListName}&titleName=${control.InternalTitleName}`);
                // const data = await response.json();
                // const options = data.map((item: any) => ({
                //     key: item.id || item.value,
                //     text: item.name || item.label,
                // }));

                // setDropdownOptions(options);
                const dropdownOptions: IDropdownOption[] = []; // Replace with actual data
                return (
                    <Dropdown
                        label={control.Title}
                        placeholder={`Select `}
                        options={dropdownOptions}
                        required={isRequired}
                    />
                );
            }

            case "Single line of Text":
                return (
                    <TextField
                        label={control.Title}
                        placeholder={`Enter ${control.Title}`}
                        required={isRequired}
                    />
                );

            case "Multiple lines of Text":
                return (
                    <TextField
                        label={control.Title}
                        placeholder={`Enter ${control.Title}`}
                        required={isRequired}
                        multiline
                        rows={4}
                    />
                );

            case "Date and Time":
                return (
                    <DatePicker
                        label={control.Title}
                        placeholder={`Select ${control.Title}`}
                        ariaLabel={`Select ${control.Title}`}
                    //required={isRequired}
                    />
                );

            case "Radio":
                const radioOptions: IChoiceGroupOption[] = (control.StaticDataObject || "")
                    .split(";")
                    .map((option: string) => ({
                        key: option,
                        text: option,
                    }));
                return (
                    <ChoiceGroup
                        label={control.Title}
                        options={radioOptions}
                        required={isRequired}
                    />
                );

            default:
                return null;
        }
    };








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
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <div>
                                            {control.map((control: any) => (
                                                <div key={control.Id} style={{ marginBottom: "20px" }}>
                                                    {renderControl(control)}
                                                </div>
                                            ))}
                                        </div>

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