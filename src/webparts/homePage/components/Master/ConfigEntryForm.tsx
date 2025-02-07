import { DefaultButton, FontIcon, IconButton, IStackItemStyles, IStackStyles, IStackTokens, Panel, PanelType, Stack, TextField, Toggle } from "office-ui-fabric-react";
import { ILabel } from '../Interface/ILabel';
import * as React from "react";
import styles from "./Master.module.scss";
import { useEffect, useState } from "react";
import { SPHttpClient } from "@microsoft/sp-http-base";
import cls from '../HomePage.module.scss';
import PopupBox from "../ResuableComponents/PopupBox";
import { getConfidDataByID, getConfig, SaveconfigMaster, UpdateconfigMaster } from "../../../../Services/ConfigService";
import ReactTableComponent from '../ResuableComponents/ReusableDataTable';
import Select from "react-select";



export default function ConfigMaster({ props }: any): JSX.Element {

    const [DisplayLabel, setDisplayLabel] = useState<ILabel>();
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [FieldName, setFieldName] = useState("");
    const [ColumnTypeID, setColumnTypeID] = useState<any>(null);
    const [ListNameID, setListNameID] = useState('');
    const [DisplayColumnID, setDisplayColumnID] = useState<any>(null);
    const [IsShowasFilter, setIsShowasFilter] = React.useState<boolean>(false);
    const [IsStaticValue, setIsStaticValues] = React.useState<boolean>(false);
    const [options, setOptions] = React.useState<string[]>([]);
    const [newOption, setNewOption] = React.useState<string>('');
    const [ListData, setListData] = useState([]);
    const [DisplaycolumnListData, setDisplaycolumnListData] = useState([]);
    const [isToggleDisabled, setIsToggleDisabled] = useState(false);
    const [isColumnTypeDisabled, setisColumnTypeDisabled] = useState(false);

    const [isToggleVisible, setToggleVisible] = React.useState<boolean>(false);
    const [isToggleVisible1, setToggleVisible1] = React.useState<boolean>(false);
    const [isDropdownVisible, setDropdownVisible] = React.useState<boolean>(false);
    const [isSecondaryDropdownVisible, setSecondaryDropdownVisible] = React.useState<boolean>(false);
    const [isTableVisible, setTableVisible] = React.useState<boolean>(false);
    const [showLoader, setShowLoader] = useState({ display: "none" });
    const [isPopupVisible, setisPopupVisible] = useState(false);
    const [MainTableSetdata, setData] = useState<any[]>([]);
    const [CurrentEditID, setCurrentEditID] = useState<number>(0);
    const [FieldNameErr, setFieldNameErr] = useState("");
    const [ColumnTypeIDErr, setColumnTypeIDErr] = useState("");
    const [ListNameIDErr, setListNameIDErr] = useState("");
    const [DisplayColumnIDErr, setDisplayColumnIDErr] = useState("");
    // const [SiteListData, setSiteListData] = useState([]);
    //const [ColumnTypeText, setColumnTypeText] = useState('');
    const [selectedListOption, setSelectedListOption] = React.useState<any>(null);





    useEffect(() => {
        let DisplayLabel: ILabel = JSON.parse(localStorage.getItem('DisplayLabel') || '{}');
        setDisplayLabel(DisplayLabel);
        getAllListFromSite();
        fetchData();
        //   getAllListSite();


    }, []);


    const stackStyles: IStackStyles = { root: { height: "100vh", marginTop: 15 } };
    const stackItemStyles: IStackItemStyles = {
        root: {
            padding: 10,
            border: "1px solid #ddd",
            overflow: "auto",
            background: "#fff",
            boxShadow: "0 10px 30px 0 rgba(82, 63, 105, .05)"
        },
    };
    const stackTokens: IStackTokens = { childrenGap: 10 };

    const fetchData = async () => {
        let FetchallConfigData: any = await getConfig(props.SiteURL, props.spHttpClient);

        let ConfigData = FetchallConfigData.value;

        setData(ConfigData);

        console.log(ConfigData);
    };

    const Tablecolumns = [
        {
            Header: DisplayLabel?.SrNo,
            accessor: "row._index",
            Cell: ({ row }: { row: any; }) => row._index + 1,
        },
        { Header: DisplayLabel?.FieldName, accessor: "Title" },
        { Header: DisplayLabel?.ColumnType, accessor: "ColumnType", },
        { Header: DisplayLabel?.ListName, accessor: "InternalListName" },
        {
            Header: DisplayLabel?.IsActive,
            accessor: "IsActive",
            Cell: ({ row }: { row: any; }) => (row.IsActive === true ? "Yes" : "No")
        },
        {
            Header: DisplayLabel?.IsStaticValue,
            accessor: "IsStaticValue",
            Cell: ({ row }: { row: any; }) => (row.IsStaticValue === true ? "Yes" : "No")
        },
        {
            Header: DisplayLabel?.Action,
            Cell: ({ row }: { row: any; }) => (
                <FontIcon aria-label="Edit" onClick={() => openEditPanel(row._original.Id)} iconName="EditSolid12" style={{ color: '#009ef7', cursor: 'pointer' }}></FontIcon>
            )
        }
    ];
    const openEditPanel = async (rowData: any) => {

        setIsEditMode(true);
        setIsPanelOpen(true);

        let GetEditData = await getConfidDataByID(props.SiteURL, props.spHttpClient, rowData);
        const EditConfigData = GetEditData.value;
        const CurrentItemId: number = EditConfigData[0].ID;
        setCurrentEditID(CurrentItemId);
        if (EditConfigData[0].ColumnType === "Dropdown" || EditConfigData[0].ColumnType === "Multiple Select")
            bindDisplayColumn(EditConfigData[0].InternalListName);

        await setFieldName(EditConfigData[0].Title);
        // const columntypeData = dropdownOptions.filter((item: any) => item.key === EditConfigData[0].ColumnType);
        // const options = columntypeData.map((item: any) => ({
        //     key: item.key,
        //     text: item.text,
        // }));
        // console.log(options);

        // const GetListData = ListData.filter((item: any) => item.key === EditConfigData[0].InternalListName);
        // const Listoptions = GetListData.map((item: any) => ({
        //     key: item.key,
        //     text: item.text,
        // }));
        // console.log(Listoptions);

        setColumnTypeID({ value: EditConfigData[0].ColumnType, label: EditConfigData[0].ColumnType });
        setListNameID(EditConfigData[0].InternalListName);
        setSelectedListOption({ value: EditConfigData[0].InternalListName, label: EditConfigData[0].InternalListName });


        setDisplayColumnID({ value: EditConfigData[0].DisplayValue, label: EditConfigData[0].DisplayValue });

        const TableData = (EditConfigData[0].StaticDataObject === null ? [] : EditConfigData[0].StaticDataObject.split(';'));
        await setOptions(TableData);


        if (EditConfigData[0].ColumnType === "Single line of Text") {
            setToggleVisible(false);
            setToggleVisible1(false);
            setDropdownVisible(false);
            setSecondaryDropdownVisible(false);
            setTableVisible(false);
            setIsToggleDisabled(false);
            setisColumnTypeDisabled(true);
        } else if (EditConfigData[0].ColumnType === "Multiple lines of Text") {
            setToggleVisible(false);
            setToggleVisible1(false);
            setDropdownVisible(false);
            setSecondaryDropdownVisible(false);
            setTableVisible(false);
            setIsToggleDisabled(false);
            setisColumnTypeDisabled(true);
        }
        else if (EditConfigData[0].ColumnType === "Dropdown") {
            setToggleVisible(true);
            setToggleVisible1(true);
            setDropdownVisible(true);
            setSecondaryDropdownVisible(true);
            setTableVisible(false);
            setIsToggleDisabled(false);
            setisColumnTypeDisabled(true);
        }
        else if (EditConfigData[0].ColumnType === "Multiple Select") {
            setToggleVisible(true);
            setToggleVisible1(true);
            setDropdownVisible(true);
            setSecondaryDropdownVisible(true);
            setTableVisible(false);
            setIsToggleDisabled(false);
            setisColumnTypeDisabled(true);
        }
        else if (EditConfigData[0].ColumnType === "Radio") {
            setToggleVisible(true);
            setToggleVisible1(true);
            setDropdownVisible(false);
            setSecondaryDropdownVisible(false);
            setTableVisible(true);
            setIsStaticValues(true);
            setIsToggleDisabled(true);
            setisColumnTypeDisabled(true);

        }
        else if (EditConfigData[0].ColumnType === "Date and Time") {
            setToggleVisible(true);
            setToggleVisible1(false);
            setDropdownVisible(false);
            setSecondaryDropdownVisible(false);
            setTableVisible(false);
            setIsToggleDisabled(false);
            setisColumnTypeDisabled(true);
        }
        else if (EditConfigData[0].ColumnType === "Person or Group") {
            setToggleVisible(true);
            setToggleVisible1(false);
            setDropdownVisible(false);
            setSecondaryDropdownVisible(false);
            setTableVisible(false);
            setIsToggleDisabled(false);
            setisColumnTypeDisabled(true);
        }
        else {
            setToggleVisible(false);
            setToggleVisible1(false);
            setDropdownVisible(false);

            setSecondaryDropdownVisible(false);
            setTableVisible(false);
            setIsToggleDisabled(false);
            setisColumnTypeDisabled(true);
        }

        await setIsShowasFilter(EditConfigData[0].IsShowAsFilter);

        await setIsStaticValues(EditConfigData[0].IsStaticValue);

        if (EditConfigData[0].IsStaticValue === true) {
            setDropdownVisible(false);
            setSecondaryDropdownVisible(false);
            setTableVisible(true);
        }

    };


    const addOption = () => {
        if (newOption.trim() !== '') {
            setOptions([...options, newOption.trim()]);
            setNewOption('');
        }
    };

    const removeOption = (index: number) => {
        setOptions(options.filter((_, i) => i !== index));
    };


    async function getAllListFromSite() {
        var url = props.SiteURL + "/_api/web/lists?$select=Title&$filter=(Hidden eq false) and (BaseType ne 1) and Title ne 'ConfigEntryMaster'";
        const data = await GetListData(url);
        var ListNamedata = data.d.results;

        let options = ListNamedata.map((item: any) => ({ value: item.Title, label: item.Title }));

        setListData(options);

    }



    async function GetListData(query: string) {
        const response = await props.context.spHttpClient.get(query, SPHttpClient.configurations.v1, {
            headers: {
                'Accept': 'application/json;odata=verbose',
                'odata-version': '',
            },
        });
        return await response.json();


    };

    const openAddPanel = () => {
        clearField();
        setIsEditMode(false);
        setIsPanelOpen(true);
    };

    const closePanel = () => {
        setIsPanelOpen(false);
    };

    const handleIsShowasFilterToggleChange = (checked: boolean): void => {
        setIsShowasFilter(checked);

    };

    const handleIsStaticValueToggleChange = (checked: boolean): void => {
        setIsStaticValues(checked);
        if (checked) {
            setDropdownVisible(false);
            setSecondaryDropdownVisible(false);
            setTableVisible(true);
        }
        else {
            setDropdownVisible(true);
            setSecondaryDropdownVisible(true);
            setTableVisible(false);
        }
    };


    const dropdownOptions = [
        { value: 'Single line of Text', label: 'Single line of Text' },
        { value: 'Multiple lines of Text', label: 'Multiple lines of Text' },
        { value: 'Dropdown', label: 'Dropdown' },
        { value: 'Multiple Select', label: 'Multiple Select' },
        { value: 'Radio', label: 'Radio' },
        { value: 'Date and Time', label: 'Date and Time' },
        { value: 'Person or Group', label: 'Person or Group' },
    ];

    const handleColumnTypeonChange = (option?: any) => {
        setColumnTypeID(option);

        if (option) {

            if (option.value === "Single line of Text") {
                setToggleVisible(false);
                setToggleVisible1(false);


                setDropdownVisible(false);
                setSecondaryDropdownVisible(false);
                setTableVisible(false);
                setIsToggleDisabled(false);
                setisColumnTypeDisabled(false);
            } else if (option.value === "Multiple lines of Text") {
                setToggleVisible(false);
                setToggleVisible1(false);
                setDropdownVisible(false);
                setSecondaryDropdownVisible(false);
                setTableVisible(false);
                setIsToggleDisabled(false);
                setisColumnTypeDisabled(false);
            }
            else if (option.value === "Dropdown") {
                setToggleVisible(true);
                setToggleVisible1(true);
                setDropdownVisible(true);
                setSecondaryDropdownVisible(true);
                setTableVisible(false);
                setIsToggleDisabled(false);
                setisColumnTypeDisabled(false);
            }
            else if (option.value === "Multiple Select") {
                setToggleVisible(true);
                setToggleVisible1(true);
                setDropdownVisible(true);
                setSecondaryDropdownVisible(true);
                setTableVisible(false);
                setIsToggleDisabled(false);
                setisColumnTypeDisabled(false);
            }
            else if (option.value === "Radio") {
                setToggleVisible(true);
                setToggleVisible1(true);
                setDropdownVisible(false);
                setSecondaryDropdownVisible(false);
                setTableVisible(true);
                setIsStaticValues(true);
                setIsToggleDisabled(true);
                setisColumnTypeDisabled(false);

            }
            else if (option.value === "Date and Time") {
                setToggleVisible(true);
                setToggleVisible1(false);
                setDropdownVisible(false);
                setSecondaryDropdownVisible(false);
                setTableVisible(false);
                setIsToggleDisabled(false);
                setisColumnTypeDisabled(false);
            }
            else if (option.value === "Person or Group") {
                setToggleVisible(true);
                setToggleVisible1(false);
                setDropdownVisible(false);
                setSecondaryDropdownVisible(false);
                setTableVisible(false);
                setIsToggleDisabled(false);
                setisColumnTypeDisabled(false);
            }
            else {
                setToggleVisible(false);
                setToggleVisible1(false);
                setDropdownVisible(false);
                setSecondaryDropdownVisible(false);
                setTableVisible(false);
                setIsToggleDisabled(false);
                setisColumnTypeDisabled(false);
            }
        }
    };

    const handleListNameonChange = async (option?: any) => {
        bindDisplayColumn(option.label);
        setListNameID(option.value);
        setSelectedListOption(option);
    };
    const bindDisplayColumn = async (listName: string) => {
        let query = props.SiteURL + "/_api/web/lists/getbytitle('" + listName + "')/Fields?$filter=(CanBeDeleted eq true) and (TypeAsString eq 'Text' or TypeAsString eq 'Number')";
        const data = await GetListData(query);
        let DisplayColumnData = data.d.results;
        console.log(DisplayColumnData);

        const optionsData: any = DisplayColumnData.map((item: any) => ({ value: item.Title, label: item.Title }));

        setDisplaycolumnListData(optionsData);
    };
    const handleDisplayColumnonChange = async (option?: any) => {
        setDisplayColumnID(option);
    };

    const hidePopup = React.useCallback(() => {
        setisPopupVisible(false);
        clearField();
        closePanel();
        setShowLoader({ display: "none" });
    }, [isPopupVisible]);

    const clearField = () => {
        setCurrentEditID(0);
        setFieldName("");
        setColumnTypeID(null);
        setListNameID('');
        setSelectedListOption(null);
        setDisplayColumnID(null);
        setIsShowasFilter(false);
        setIsStaticValues(false);
        setOptions([]);
        setisColumnTypeDisabled(false);
        clearError();

        setToggleVisible(false);
        setToggleVisible1(false);
        setDropdownVisible(false);
        setSecondaryDropdownVisible(false);
        setTableVisible(false);
        setIsToggleDisabled(false);
        setisColumnTypeDisabled(false);

    };
    const clearError = () => {
        setFieldNameErr("");
        setColumnTypeIDErr("");
        setListNameIDErr("");
        setDisplayColumnIDErr("");

    };

    const validation = () => {
        let isValidForm = true;
        if (FieldName === "" || FieldName === undefined || FieldName === null) {
            setFieldNameErr(DisplayLabel?.ThisFieldisRequired as string);
            isValidForm = false;
        }
        else if (isColumnTypeDisabled === false) {
            if (ColumnTypeID === "" || ColumnTypeID === undefined || ColumnTypeID === null) {
                setColumnTypeIDErr(DisplayLabel?.ThisFieldisRequired as string);
                isValidForm = false;
            }
        }
        else if (IsStaticValue === true) {
            if (options.length === 0) {
                alert(DisplayLabel?.Atleasttwooptionrecordrequired);
            }
        }
        else if (IsStaticValue === false && ColumnTypeID.value === "Dropdown") {
            if (ListNameID === "" || ListNameID === undefined || ListNameID === null) {
                setListNameIDErr(DisplayLabel?.ThisFieldisRequired as string);
                isValidForm = false;
            }
            if (DisplayColumnID === "" || DisplayColumnID === undefined || DisplayColumnID === null) {
                setDisplayColumnIDErr(DisplayLabel?.ThisFieldisRequired as string);
                isValidForm = false;
            }
        }

        return isValidForm;
    };

    const SaveItemData = () => {
        clearError();
        let valid = validation();
        valid ? saveData() : "";
    };

    const saveData = async () => {

        try {
            setShowLoader({ display: "block" });

            let ddlListName = null;
            let ddlColumn = null;

            if (IsStaticValue === true) {
                ddlListName = null;
                ddlColumn = null;
            } else {
                ddlListName = ListNameID;
                ddlColumn = DisplayColumnID.value;
            }
            let FieldNameNew = FieldName.split(" ").join("");
            let Name = FieldName;


            let option = {
                __metadata: { type: "SP.Data.ConfigEntryMasterListItem" },
                //'Title': $("#txtFieldName").val(),
                Title: Name.trim(),
                InternalTitleName: FieldNameNew,
                IsActive: true,
                ColumnType: ColumnTypeID.value,
                IsStaticValue: IsStaticValue,
                StaticDataObject: options.join(';'),
                InternalListName: ddlListName,
                DisplayValue: ddlColumn,
                IsShowAsFilter: IsShowasFilter,
                Abbreviation: "Abbreviation"
            };
            if (!isEditMode)
                await SaveconfigMaster(props.SiteURL, props.spHttpClient, option);

            else
                await UpdateconfigMaster(props.SiteURL, props.spHttpClient, option, CurrentEditID);


            setShowLoader({ display: "none" });
            setIsPanelOpen(false);
            setisPopupVisible(true);
            fetchData();

        } catch (error) {
            console.error("Error during save operation:", error);
            setShowLoader({ display: "none" });
        }
    };


    return (
        <div>
            <div className={styles.alignbutton} style={{ paddingRight: '0px' }}>
                <DefaultButton id="requestButton" className={styles['primary-btn']} text={DisplayLabel?.Add} onClick={openAddPanel}  ></DefaultButton>
            </div>

            <Stack horizontal styles={stackStyles} tokens={stackTokens}>
                <Stack.Item grow={2} styles={stackItemStyles}>
                    <ReactTableComponent
                        TableClassName={styles.ReactTables}
                        Tablecolumns={Tablecolumns}
                        Tabledata={MainTableSetdata}
                        PagedefaultSize={10}
                        TableRows={1}
                        TableshowPagination={MainTableSetdata.length > 10}
                    //TableshowFilter={true}
                    />
                </Stack.Item>
            </Stack>

            <Panel
                isOpen={isPanelOpen}
                onDismiss={closePanel}
                closeButtonAriaLabel="Close"
                type={PanelType.large}
                isFooterAtBottom={true}
                role="tabpanel"
                onRenderFooterContent={() => (
                    <>
                        <DefaultButton onClick={SaveItemData} text={isEditMode ? (DisplayLabel?.Update) : DisplayLabel?.Submit} className={styles['primary-btn']} />
                        <DefaultButton text={DisplayLabel?.Cancel} onClick={closePanel} className={styles['light-btn']} allowDisabledFocus />
                    </>
                )}

                headerText={isEditMode ? DisplayLabel?.EditNewRecords : DisplayLabel?.AddNewRecords}
            >
                <div className={`ms-Grid ${styles.inlineFormContainer}`}>
                    <div className="col-md-5">
                        <div className="form-group">
                            <label className={styles.Headerlabel}>{DisplayLabel?.FieldName}<span style={{ color: "red" }}>*</span></label>

                            {/* <TextField label="Title" errorMessage={TileError} value={TileName} onChange={(e: any) => { setTileName(e.target.value); }} /> */}

                            <TextField
                                placeholder="Enter Field Name"
                                // onChange={(e: any) => { setTileName(e.target.value); }}
                                //onChange={(e: any) => { setTileName(e.target.value); }}
                                errorMessage={FieldNameErr}
                                value={FieldName}
                                onChange={(el: React.ChangeEvent<HTMLInputElement>) => setFieldName(el.target.value)}



                            />
                        </div>
                    </div>
                    <div className="col-md-5">
                        <div className="form-group">
                            <label className={styles.Headerlabel}>{DisplayLabel?.ColumnType}<span style={{ color: "red" }}>*</span></label>
                            <Select
                                options={dropdownOptions}
                                value={ColumnTypeID}
                                onChange={handleColumnTypeonChange}
                                isSearchable
                                placeholder={DisplayLabel?.Selectanoption}
                            />
                            {ColumnTypeIDErr && <p style={{ color: "rgb(164, 38, 44)" }}>{ColumnTypeIDErr}</p>}
                        </div>
                    </div>
                </div>
                <br /><br />
                <div className={`ms-Grid ${styles.inlineFormContainer}`}>
                    {isToggleVisible && (
                        <div className="col-md-5">
                            <div className="form-group">
                                <label className={styles.Headerlabel}>{DisplayLabel?.IsShowasFilter}<span style={{ color: "red" }}>*</span></label>

                                <Toggle checked={IsShowasFilter} onChange={(_, checked) => handleIsShowasFilterToggleChange(checked!)} />

                            </div>
                        </div>
                    )}
                    {isToggleVisible1 && (
                        <div className="col-md-5">
                            <div className="form-group">
                                <label className={styles.Headerlabel}>{DisplayLabel?.IsStaticValue}<span style={{ color: "red" }}>*</span></label>
                                <Toggle checked={IsStaticValue} onChange={(_, checked) => handleIsStaticValueToggleChange(checked!)} disabled={isToggleDisabled} />

                            </div>
                        </div>
                    )}
                </div>


                <br /><br />
                <div className={`ms-Grid ${styles.inlineFormContainer}`}>
                    {isDropdownVisible && (
                        <div className="col-md-5">
                            <div className="form-group">
                                <label className={styles.Headerlabel}>{DisplayLabel?.ListName}<span style={{ color: "red" }}>*</span></label>
                                <Select
                                    options={ListData}
                                    value={selectedListOption}
                                    onChange={handleListNameonChange}
                                    isSearchable
                                    placeholder={DisplayLabel?.Selectanoption}
                                    errorMessage={ListNameIDErr}
                                />
                                {ListNameIDErr && <p style={{ color: "rgb(164, 38, 44)" }}>{ListNameIDErr}</p>}
                            </div>
                        </div>)}
                    {isSecondaryDropdownVisible && (
                        <div className="col-md-5">
                            <div className="form-group">
                                <label className={styles.Headerlabel}>{DisplayLabel?.DisplayColumn}<span style={{ color: "red" }}>*</span></label>
                                {/* <Dropdown
                                    placeholder={DisplayLabel?.Selectanoption}
                                    options={DisplaycolumnListData}
                                    onChange={handleDisplayColumnonChange}
                                    selectedKey={DisplayColumnID}
                                    errorMessage={DisplayColumnIDErr}
                                /> */}
                                <Select
                                    options={DisplaycolumnListData}
                                    value={DisplayColumnID}
                                    onChange={handleDisplayColumnonChange}
                                    isSearchable
                                    placeholder={DisplayLabel?.Selectanoption}
                                    errorMessage={DisplayColumnIDErr}
                                />
                                {DisplayColumnIDErr && <p style={{ color: "rgb(164, 38, 44)" }}>{DisplayColumnIDErr}</p>}
                            </div>
                        </div>)}
                </div>
                <br /><br />
                <div className={`ms-Grid ${styles.inlineFormContainer}`}>
                    {isTableVisible && (
                        <table className="addoption" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', width: '10%' }}>Sr. No.</th>
                                    <th style={{ textAlign: 'left', width: '70%' }}>
                                        Option *

                                    </th>
                                    <th style={{ textAlign: 'center', width: '20%' }}>
                                        Action

                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ textAlign: 'left', width: '10%' }}></td>
                                    <td style={{ textAlign: 'left', width: '70%' }}>
                                        <div style={{ marginTop: '8px' }}>
                                            <TextField
                                                placeholder="Enter Option"
                                                value={newOption}
                                                onChange={(_, value) => setNewOption(value || '')}
                                                styles={{ root: { width: '100%' } }}
                                            />
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center', width: '20%' }}>
                                        <IconButton
                                            iconProps={{ iconName: 'Add' }}
                                            title="Add Option"
                                            ariaLabel="Add Option"
                                            onClick={addOption}
                                            styles={{ root: { marginTop: '8px', backgroundColor: '#009ef7 ', borderRadius: '50px !important', padding: '0px !important' }, icon: { color: '#fff' } }}
                                        />
                                    </td>
                                </tr>

                            </tbody>
                            <tbody>
                                {options.map((option, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                                        <td style={{ padding: '8px' }}>{index + 1}</td>
                                        <td style={{ padding: '8px' }}>{option}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <IconButton
                                                iconProps={{ iconName: 'Delete' }}
                                                title="Remove Option"
                                                ariaLabel="Remove Option"
                                                onClick={() => removeOption(index)}
                                                styles={{ icon: { color: '#e81123' } }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                <div className={cls["modal"]} style={showLoader}></div>


            </Panel>
            <PopupBox isPopupBoxVisible={isPopupVisible} hidePopup={hidePopup} />

        </div>

    );
}




