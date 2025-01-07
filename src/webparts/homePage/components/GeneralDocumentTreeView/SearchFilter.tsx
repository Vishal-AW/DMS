import * as React from "react";
import { Accordion, Form } from "react-bootstrap";
import styles from "../Master/Master.module.scss";
import { useCallback, useEffect, useState } from "react";
import { ILabel } from '../Interface/ILabel';
import { ChoiceGroup, DefaultButton, Dropdown, TextField } from "office-ui-fabric-react";
import { IPeoplePickerContext, PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { getUserIdFromLoginName } from "../../../../DAL/Commonfile";
import { getListData } from "../../../../Services/GeneralDocument";
import { getConfigActive } from "../../../../Services/ConfigService";
export default function SearchFilter({ props }: any): JSX.Element {
    const controlDataStatic: string = `[{"field":10,"IsRequired":true,"IsActiveControl":true,"IsFieldAllowInFile":false,"isShowAsFilter":false,"Flag":"New","editingIndex":-1,"Id":10,"Title":"Arbitration","ColumnType":"Single line of Text","InternalListName":null,"IsActive":true,"IsStaticValue":false,"StaticDataObject":null,"DisplayValue":null,"InternalTitleName":"Arbitration","IsShowAsFilter":false,"Abbreviation":"Abbreviation","ID":10},{"field":1,"IsRequired":true,"IsActiveControl":true,"IsFieldAllowInFile":false,"isShowAsFilter":true,"Flag":"New","editingIndex":-1,"Id":1,"Title":"City","ColumnType":"Dropdown","InternalListName":"DMS_City","IsActive":true,"IsStaticValue":false,"StaticDataObject":null,"DisplayValue":"City","InternalTitleName":"City","IsShowAsFilter":true,"Abbreviation":"Abbreviation","ID":1},{"field":15,"IsRequired":true,"IsActiveControl":true,"IsFieldAllowInFile":false,"isShowAsFilter":false,"Flag":"New","editingIndex":-1,"Id":15,"Title":"Confidentiality","ColumnType":"Single line of Text","InternalListName":null,"IsActive":true,"IsStaticValue":false,"StaticDataObject":null,"DisplayValue":null,"InternalTitleName":"Confidentiality","IsShowAsFilter":false,"Abbreviation":"Abbreviation","ID":15}]`;

    const control = JSON.parse(controlDataStatic);

    const [DisplayLabel, setDisplayLabel] = useState<ILabel>();
    // const [dynamicControl, setDynamicControl] = useState<any[]>([]);
    const [dynamicValues, setDynamicValues] = useState<{ [key: string]: any; }>({});
    const [configDataval, setConfigData] = useState<any[]>([]);
    const [options, setOptions] = useState<any>({});
    // const [dropdownOptions, setDropdownOptions] = useState<IDropdownOption[]>([]);
    // const tileObject: string | null = sessionStorage.getItem("TileObject");
    // const libDetails: any = JSON.parse(tileObject as string);
    // console.log(libDetails);

    // const controlData: string | null = sessionStorage.getItem('controlData');
    // const controlDataMain: any = JSON.parse(controlData as string);
    // console.log(controlDataMain);

    // const filterObj: string | null = sessionStorage.getItem('filterObj');
    // const filterObjMain: any = JSON.parse(filterObj as string);
    // console.log(filterObjMain);


    useEffect(() => {
        let DisplayLabel: ILabel = JSON.parse(localStorage.getItem('DisplayLabel') || '{}');
        setDisplayLabel(DisplayLabel);
        bindDropdown(control);
        fetchLibraryDetails();


    }, []);

    const peoplePickerContext: IPeoplePickerContext = {
        absoluteUrl: props.context.pageContext.web.absoluteUrl,
        msGraphClientFactory: props.context.msGraphClientFactory,
        spHttpClient: props.context.spHttpClient
    };

    const handleInputChange = (fieldName: string, value: any) => {
        setDynamicValues((prevValues) => ({
            ...prevValues,
            [fieldName]: value,
        }));
    };
    const removeSepcialCharacters = (newValue?: string) => newValue?.replace(/[^a-zA-Z0-9\s]/g, '') || '';
    // const libraryName = "Test Tile Data1";

    // setDynamicControl(control);

    const fetchLibraryDetails = async () => {
        const dataConfig = await getConfigActive(props.SiteURL, props.spHttpClient);
        setConfigData(dataConfig.value);
    };

    const renderDynamicControls = useCallback(() => {
        return control.map((item: any, index: number) => {
            if (!item.IsShowAsFilter) return null;

            const filterObj = configDataval.find((ele) => ele.Id === item.Id);

            if (!filterObj) return null;

            switch (item.ColumnType) {
                case "Dropdown":
                case "Multiple Select":
                    return (
                        <div className={control.length > 5 ? styles.col6 : styles.col12} key={index}>
                            <Dropdown
                                placeholder="Select an option"
                                label={item.Title}
                                options={options[item.InternalTitleName] || []}
                                required={item.IsRequired}
                                multiSelect={item.ColumnType === "Multiple Select"}
                                onChange={(ev, option) => handleInputChange(item.InternalTitleName, option?.key)}
                                selectedKey={dynamicValues[item.InternalTitleName] || ""}
                            //errorMessage={dynamicValuesErr[item.InternalTitleName]}
                            />
                        </div>
                    );

                case "Person or Group":
                    return (
                        <div className={control.length > 5 ? styles.col6 : styles.col12} key={index}>
                            <PeoplePicker
                                titleText={item.Title}
                                context={peoplePickerContext}
                                personSelectionLimit={10}
                                showtooltip={true}
                                required={item.IsRequired}
                                showHiddenInUI={false}
                                principalTypes={[PrincipalType.User]}
                                //onChange={(items) => handleInputChange(item.InternalTitleName, items)}
                                onChange={async (items) => {
                                    try {
                                        const userIds = await Promise.all(
                                            items.map(async (item: any) => {
                                                const data = await getUserIdFromLoginName(props.context, item.id);
                                                return data.Id;
                                            })
                                        );
                                        setDynamicValues((prevValues) => ({
                                            ...prevValues,
                                            [item.InternalTitleName]: userIds,
                                        }));

                                    } catch (error) {
                                        console.error("Error fetching user IDs:", error);
                                    }
                                }}
                            // errorMessage={dynamicValuesErr[item.InternalTitleName]}
                            />
                        </div>
                    );

                case "Radio":
                    const radioOptions = filterObj.StaticDataObject.split(";").map((ele: string) => ({
                        key: ele,
                        text: ele,
                    }));
                    return (
                        <div className={control.length > 5 ? styles.col6 : styles.col12} key={index}>
                            <ChoiceGroup
                                options={radioOptions}
                                onChange={(ev, option) => handleInputChange(item.InternalTitleName, option?.key)}
                                selectedKey={dynamicValues[item.InternalTitleName] || ""}
                                label={item.Title}
                                required={item.IsRequired}
                            />
                        </div>
                    );

                default:
                    return (
                        <div className={control.length > 5 ? styles.col6 : styles.col12} key={index}>
                            <TextField
                                type={item.ColumnType === "Date and Time" ? "date" : "text"}
                                label={item.Title}
                                value={dynamicValues[item.InternalTitleName] || ""}
                                onChange={(ev, value) => handleInputChange(item.InternalTitleName, removeSepcialCharacters(value))}
                                multiline={item.ColumnType === "Multiple lines of Text"}
                                required={item.IsRequired}
                            //errorMessage={dynamicValuesErr[item.InternalTitleName]}
                            />
                        </div>
                    );
            }
        });
    }, [configDataval, options, dynamicValues]);


    const bindDropdown = (dynamicControl: any) => {
        let dropdownOptions = [{ key: "", text: "Select an option" }];
        dynamicControl.map(async (item: any, index: number) => {
            if (item.ColumnType === "Dropdown" || item.ColumnType === "Multiple Select") {
                if (item.IsStaticValue) {
                    dropdownOptions = item.StaticDataObject.split(";").map((ele: string) => ({
                        key: ele,
                        text: ele,
                    }));
                } else {
                    const data = await getListData(
                        `${props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${item.InternalListName}')/items?$top=5000&$filter=Active eq 1&$orderby=${item.DisplayValue} asc`,
                        props.context
                    );
                    dropdownOptions = data.value.map((ele: any) => ({
                        key: ele[item.DisplayValue],
                        text: ele[item.DisplayValue],
                    }));
                }
                setOptions((prev: any) => ({ ...prev, [item.InternalTitleName]: dropdownOptions }));
            }
        });
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
                            <div className={styles.row}>{renderDynamicControls()}</div>

                            {/* <div className={`ms-Grid ${styles.inlineFormContainer}`}>
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
                            </div> */}
                            <div className={styles.container} >
                                <div className={styles.containerOne} >



                                    <DefaultButton onClick={SearchData} text={DisplayLabel?.Submit} className={styles['sub-btn']} />

                                    <DefaultButton onClick={Reset} text={DisplayLabel?.Cancel} className={styles['sub-btn']} />

                                </div>

                            </div>

                        </Form>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>


        </div>

    );

}