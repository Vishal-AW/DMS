import * as React from "react";
import { Accordion, Form } from "react-bootstrap";
import styles from "../Master/Master.module.scss";
import { useCallback, useEffect, useState } from "react";
import { ILabel } from '../Interface/ILabel';
import { ChoiceGroup, DefaultButton, TextField } from "office-ui-fabric-react";
import { IPeoplePickerContext, PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { getUserIdFromLoginName } from "../../../../DAL/Commonfile";
import { getListData, getDocument } from "../../../../Services/GeneralDocument";
import { getConfigActive } from "../../../../Services/ConfigService";
import { getDataByLibraryName } from "../../../../Services/MasTileService";
//import { useNavigate } from "react-router-dom";
import Select from 'react-select';
import moment from "moment";
export default function SearchFilter({ props }: any): JSX.Element {

    const libraryName: any = sessionStorage.getItem("LibName");
    // const controlDataStatic: string = `[{"field":20,"IsRequired":true,"IsActiveControl":true,"IsFieldAllowInFile":false,"isShowAsFilter":true,"Flag":"New","editingIndex":-1,"Id":20,"Title":"Brand Name","ColumnType":"Dropdown","InternalListName":"DMS_Mas_Brand","IsActive":true,"IsStaticValue":false,"StaticDataObject":null,"DisplayValue":"BrandName","InternalTitleName":"BrandName","IsShowAsFilter":true,"Abbreviation":"Abbreviation","ID":20},{"field":10,"IsRequired":true,"IsActiveControl":true,"IsFieldAllowInFile":false,"isShowAsFilter":false,"Flag":"New","editingIndex":-1,"Id":10,"Title":"Arbitration","ColumnType":"Single line of Text","InternalListName":null,"IsActive":true,"IsStaticValue":false,"StaticDataObject":null,"DisplayValue":null,"InternalTitleName":"Arbitration","IsShowAsFilter":false,"Abbreviation":"Abbreviation","ID":10}]`;



    // const control = JSON.parse(controlDataStatic);
    const [ContentSearchinput, setContentSearchinput] = useState("");
    const [DisplayLabel, setDisplayLabel] = useState<ILabel>();
    const [dynamicControl, setDynamicControl] = useState<any[]>([]);
    const [dynamicValues, setDynamicValues] = useState<{ [key: string]: any; }>({});
    const [configDataval, setConfigData] = useState<any[]>([]);
    const [options, setOptions] = useState<any>({});
    const [searchData, setSearchData] = useState<any>([]);
    const [DynamicDataTable, setDynamicDataTable] = React.useState<boolean>(false);
    const [ContentSearch, setContentSearch] = useState("");

    useEffect(() => {
        let DisplayLabel: ILabel = JSON.parse(localStorage.getItem('DisplayLabel') || '{}');
        setDisplayLabel(DisplayLabel);
        getLibDetails();
        fetchLibraryDetails();
    }, []);

    const getLibDetails = async () => {
        const libraryData = await getDataByLibraryName(props.SiteURL, props.spHttpClient, libraryName);
        bindDropdown(JSON.parse(libraryData.value[0].DynamicControl));
        setDynamicControl(JSON.parse(libraryData.value[0].DynamicControl));
    };

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



    const fetchLibraryDetails = async () => {
        const dataConfig = await getConfigActive(props.SiteURL, props.spHttpClient);
        setConfigData(dataConfig.value);
    };

    const renderDynamicControls = useCallback(() => {
        return dynamicControl.map((item: any, index: number) => {
            if (!item.IsShowAsFilter) return null;

            const filterObj = configDataval.find((ele) => ele.Id === item.Id);

            if (!filterObj) return null;

            switch (item.ColumnType) {
                case "Dropdown":
                case "Multiple Select":
                    return (
                        <div className={styles.col6} key={index}>
                            {/* <Dropdown
                                placeholder="Select an option"
                                label={item.Title}
                                options={options[item.InternalTitleName] || []}
                                required={item.IsRequired}
                                multiSelect={item.ColumnType === "Multiple Select"}
                                onChange={(ev, option) => handleInputChange(item.InternalTitleName, option?.key)}
                                selectedKey={dynamicValues[item.InternalTitleName] || ""}
                            //errorMessage={dynamicValuesErr[item.InternalTitleName]}
                            /> */}
                            <label>{item.Title}</label>
                            <Select
                                options={options[item.InternalTitleName] || []}
                                value={(options[item.InternalTitleName] || []).find((option: any) => option.value === dynamicValues[item.InternalTitleName])}
                                onChange={(option: any) => handleInputChange(item.InternalTitleName, option?.value)}
                                isSearchable
                                placeholder={DisplayLabel?.Selectanoption}
                            />
                        </div>
                    );

                case "Person or Group":
                    return (
                        <div className={styles.col6} key={index}>
                            <PeoplePicker
                                titleText={item.Title}
                                context={peoplePickerContext}
                                personSelectionLimit={1}
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
                        <div className={styles.col6} key={index}>
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
                        <div className={styles.col6} key={index}>
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
                        value: ele,
                        label: ele,
                    }));
                } else {
                    const data = await getListData(
                        `${props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${item.InternalListName}')/items?$top=5000&$filter=Active eq 1&$orderby=${item.DisplayValue} asc`,
                        props.context
                    );
                    dropdownOptions = data.value.map((ele: any) => ({
                        value: ele[item.DisplayValue],
                        label: ele[item.DisplayValue],
                    }));
                }
                setOptions((prev: any) => ({ ...prev, [item.InternalTitleName]: dropdownOptions }));
            }
        });
    };


    const ContentSearchData = async () => {
        if (ContentSearchinput === "" || ContentSearchinput === undefined || ContentSearchinput === null) {
            setContentSearch('Field is required');
        }
        else {
            let query = ContentSearchinput == undefined ? "*" : ContentSearchinput;
            let GetLibraryName = libraryName;
            const routePath = `${props.SiteURL}/SitePages/Search.aspx?env=Embedded&query='${query}'&Library='${GetLibraryName}'`;
            window.open(routePath, "_blank");
        }
    };

    const SearchData = async () => {

        setDynamicDataTable(true);
        let filter = "InternalStatus eq 'Published' and Active eq 1";
        const keys = Object.keys(dynamicValues).map((item: any) => (` and ${item} eq '${encodeURIComponent(dynamicValues[item])}'`));
        let NewFilter = filter + keys.join("");

        await getDocument(props.SiteURL, props.spHttpClient, NewFilter, libraryName).then(function (response: any) {
            let DataArr = response.value;
            setSearchData(DataArr);
        });
    };

    const Reset = () => {
        setDynamicValues({});
        setSearchData([]);
        setDynamicDataTable(false);
    };


    return (
        <div>
            <Accordion alwaysOpen >
                <Accordion.Item eventKey="0">
                    <Accordion.Header className={styles.Accodordianherder}>Content Search(Click here to search)</Accordion.Header>
                    <Accordion.Body>
                        <Form>
                            <div className={`ms-Grid ${styles.inlineFormContainer}`}>
                                <div className="col-md-5">
                                    <div className="form-group">
                                        <TextField
                                            placeholder={DisplayLabel?.SearchData}
                                            errorMessage={ContentSearch}
                                            value={ContentSearchinput}
                                            onChange={(el: React.ChangeEvent<HTMLInputElement>) => setContentSearchinput(el.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-2">
                                    <div className="form-group">
                                        <DefaultButton onClick={ContentSearchData} text={DisplayLabel?.SearchData} className={styles['primary-btn']} />
                                    </div>
                                </div>
                            </div>

                        </Form>
                    </Accordion.Body>
                </Accordion.Item><br /><br />

                <Accordion.Item eventKey="1">
                    <Accordion.Header className={styles.Accodordianherder}>Meta Data Search(Click here to search with Filters)</Accordion.Header>
                    <Accordion.Body>
                        <Form>
                            <div className={styles.row}>{renderDynamicControls()}</div>
                            <div className={styles.container} >
                                <div className={styles.containerOne} >
                                    <DefaultButton onClick={SearchData} styles={{ root: { marginRight: 8 } }} text={DisplayLabel?.SearchData} className={styles['primary-btn']} />
                                    <DefaultButton onClick={Reset} text={DisplayLabel?.Reset} className={styles['light-btn']} />
                                </div>
                            </div>
                        </Form>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>

            {DynamicDataTable && (
                <div style={{ overflowX: 'auto', padding: '20px' }}>
                    <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse', border: '1px solid black' }}>
                        {/* Table Header */}
                        <thead>
                            <tr>
                                <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{DisplayLabel?.SrNo || "SR.NO"}</th>
                                <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>File Name</th>
                                <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Folder Path</th>
                                {dynamicControl?.map((field: any, index: number) => ((field.IsShowAsFilter) ? <th key={index}>{field.Title}</th> : null))}

                            </tr>
                        </thead>
                        <tbody>
                            {searchData?.map((el: any, index: number) => {
                                if (
                                    el.File?.ServerRelativeUrl !== undefined &&
                                    el.DisplayStatus !== "Pending With Approver" &&
                                    el.DisplayStatus !== "Rejected"
                                ) {
                                    return (
                                        <tr key={index}>
                                            <td style={{ padding: '10px' }}>{index + 1}</td>
                                            <td style={{ padding: '10px', color: '#007bff', cursor: 'pointer' }}>
                                                {el.ActualName ? (
                                                    <a
                                                        href={el.File.ServerRelativeUrl}
                                                        target="_blank"
                                                        style={{ textDecoration: 'none', color: '#007bff' }}
                                                    >
                                                        {el.ActualName}
                                                    </a>
                                                ) : (
                                                    'N/A'
                                                )}
                                            </td>
                                            <td style={{ padding: '10px' }}>{el.FolderDocumentPath}</td>
                                            {dynamicControl?.map((field: any, index: number) => ((field.IsShowAsFilter) ? <td style={{ padding: '10px' }} key={index}>
                                                {field.ColumnType === "Date and Time" ? moment(el[field.InternalTitleName]).format("DD/MM/YYYY") :
                                                    field.ColumnType === "Person or Group" ? el[field.InternalTitleName].map((item: any) => item.Title).join(", ") :
                                                        el[field.InternalTitleName]}

                                            </td> : null))}
                                        </tr>
                                    );
                                }
                                return null;
                            })}
                        </tbody>
                    </table>
                </div>)}


        </div>


    );

}