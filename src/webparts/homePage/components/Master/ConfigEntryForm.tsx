import { DefaultButton, FontIcon, IStackItemStyles, IStackStyles, IStackTokens, Panel, PanelType, Stack, TextField, Toggle } from "office-ui-fabric-react";
import { ILabel } from '../Interface/ILabel';
import * as React from "react";
import styles from "./Master.module.scss";
import { useEffect, useRef, useState } from "react";
import { SPHttpClient } from "@microsoft/sp-http-base";
import cls from '../HomePage.module.scss';
import PopupBox from "../ResuableComponents/PopupBox";
import { getConfidDataByID, getConfig, SaveconfigMaster, UpdateconfigMaster } from "../../../../Services/ConfigService";
import ReactTableComponent from '../ResuableComponents/ReusableDataTable';
import Select from "react-select";
import { Link } from "react-router-dom";



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
    // const [isColumnTypeDisabled, setisColumnTypeDisabled] = useState(false);

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
    const [alertMsg, setAlertMsg] = useState("");
    // const [SiteListData, setSiteListData] = useState([]);
    //const [ColumnTypeText, setColumnTypeText] = useState('');
    const [selectedListOption, setSelectedListOption] = React.useState<any>(null);
    const inputRefs = useRef<{ [key: string]: HTMLInputElement | null; }>({});





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
            filterable: false,
            width: 65
        },
        {
            Header: DisplayLabel?.FieldName, accessor: "Title",
            filterMethod: (filter: any, row: any) => row[filter.id]?.toLowerCase().includes(filter.value.toLowerCase()),
            width: '25%'
        },

        {
            Header: DisplayLabel?.ColumnType, accessor: "ColumnType",
            filterMethod: (filter: any, row: any) => row[filter.id]?.toLowerCase().includes(filter.value.toLowerCase()),
            width: '20%'
        },
        {
            Header: DisplayLabel?.ListName,
            accessor: "InternalListName",
            filterMethod: (filter: any, row: any) => row[filter.id]?.toLowerCase().includes(filter.value?.toLowerCase() || ""),
            width: '20%'
        },
        {
            Header: DisplayLabel?.IsStaticValue,
            accessor: "IsStaticValue",
            width: '20%',
            Cell: ({ value }: { value: boolean; }) => (value ? "Yes" : "No"),
            Filter: ({ filter, onChange }: { filter: any; onChange: (value: any) => void; }) => (
                <select
                    value={filter ? filter.value : ""}
                    onChange={(e) => onChange(e.target.value || undefined)}
                    style={{ width: "100%", padding: "4px", borderRadius: "4px" }}
                >
                    <option value="">All</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                </select>
            ),
            filterMethod: (filter: any, row: any) => {
                if (!filter.value) return true;
                return String(row[filter.id]) === filter.value;
            }
        },
        {
            Header: () => <div style={{ textAlign: 'center' }}>{DisplayLabel?.Action}</div>,
            Cell: ({ row }: { row: any; }) => (
                <FontIcon aria-label="Edit" className="action-icon" onClick={() => openEditPanel(row._original.Id)} iconName="EditSolid12" style={{ color: '#009ef7', cursor: 'pointer', backgroundColor: '#f5f8fa', padding: '6px 9px', borderRadius: '4px', textAlign: 'center' }}></FontIcon>
            ),
            filterable: false,
            width: '10%',
            className: 'text-center',
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
        } else if (EditConfigData[0].ColumnType === "Multiple lines of Text") {
            setToggleVisible(false);
            setToggleVisible1(false);
            setDropdownVisible(false);
            setSecondaryDropdownVisible(false);
            setTableVisible(false);
            setIsToggleDisabled(false);
        }
        else if (EditConfigData[0].ColumnType === "Dropdown") {
            setToggleVisible(true);
            setToggleVisible1(true);
            setDropdownVisible(true);
            setSecondaryDropdownVisible(true);
            setTableVisible(false);
            setIsToggleDisabled(false);
        }
        else if (EditConfigData[0].ColumnType === "Multiple Select") {
            setToggleVisible(true);
            setToggleVisible1(true);
            setDropdownVisible(true);
            setSecondaryDropdownVisible(true);
            setTableVisible(false);
            setIsToggleDisabled(false);
        }
        else if (EditConfigData[0].ColumnType === "Radio") {
            setToggleVisible(true);
            setToggleVisible1(true);
            setDropdownVisible(false);
            setSecondaryDropdownVisible(false);
            setTableVisible(true);
            setIsStaticValues(true);
            setIsToggleDisabled(true);

        }
        else if (EditConfigData[0].ColumnType === "Date and Time") {
            setToggleVisible(true);
            setToggleVisible1(false);
            setDropdownVisible(false);
            setSecondaryDropdownVisible(false);
            setTableVisible(false);
            setIsToggleDisabled(false);
        }
        else if (EditConfigData[0].ColumnType === "Person or Group") {
            setToggleVisible(true);
            setToggleVisible1(false);
            setDropdownVisible(false);
            setSecondaryDropdownVisible(false);
            setTableVisible(false);
            setIsToggleDisabled(false);
        }
        else {
            setToggleVisible(false);
            setToggleVisible1(false);
            setDropdownVisible(false);

            setSecondaryDropdownVisible(false);
            setTableVisible(false);
            setIsToggleDisabled(false);
        }

        await setIsShowasFilter(EditConfigData[0].IsShowAsFilter);

        await setIsStaticValues(EditConfigData[0].IsStaticValue);

        if (EditConfigData[0].IsStaticValue === true) {
            setDropdownVisible(false);
            setSecondaryDropdownVisible(false);
            setTableVisible(true);
        }

    };

    const [newOptionError, setNewOptionErr] = useState("");
    const addOption = () => {
        setNewOptionErr("");
        let isValid = true;
        if (newOption.trim() === '') {
            setNewOptionErr(DisplayLabel?.ThisFieldisRequired || "");
            isValid = false;
            return;
        }
        const isDuplicate = options.some(
            (Data) => Data.toLowerCase() === newOption.toLowerCase().trim()
        );
        if (isDuplicate) {
            setNewOptionErr(DisplayLabel?.ValueAlreadyExist || "");
            isValid = false;
            return;
        }

        if (isValid) {
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
            } else if (option.value === "Multiple lines of Text") {
                setToggleVisible(false);
                setToggleVisible1(false);
                setDropdownVisible(false);
                setSecondaryDropdownVisible(false);
                setTableVisible(false);
                setIsToggleDisabled(false);
            }
            else if (option.value === "Dropdown") {
                setToggleVisible(true);
                setToggleVisible1(true);
                setDropdownVisible(true);
                setSecondaryDropdownVisible(true);
                setTableVisible(false);
                setIsToggleDisabled(false);
            }
            else if (option.value === "Multiple Select") {
                setToggleVisible(true);
                setToggleVisible1(true);
                setDropdownVisible(true);
                setSecondaryDropdownVisible(true);
                setTableVisible(false);
                setIsToggleDisabled(false);
            }
            else if (option.value === "Radio") {
                setToggleVisible(true);
                setToggleVisible1(true);
                setDropdownVisible(false);
                setSecondaryDropdownVisible(false);
                setTableVisible(true);
                setIsStaticValues(true);
                setIsToggleDisabled(true);

            }
            else if (option.value === "Date and Time") {
                setToggleVisible(true);
                setToggleVisible1(false);
                setDropdownVisible(false);
                setSecondaryDropdownVisible(false);
                setTableVisible(false);
                setIsToggleDisabled(false);
            }
            else if (option.value === "Person or Group") {
                setToggleVisible(true);
                setToggleVisible1(false);
                setDropdownVisible(false);
                setSecondaryDropdownVisible(false);
                setTableVisible(false);
                setIsToggleDisabled(false);
            }
            else {
                setToggleVisible(false);
                setToggleVisible1(false);
                setDropdownVisible(false);
                setSecondaryDropdownVisible(false);
                setTableVisible(false);
                setIsToggleDisabled(false);
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
        clearError();

        setToggleVisible(false);
        setToggleVisible1(false);
        setDropdownVisible(false);
        setSecondaryDropdownVisible(false);
        setTableVisible(false);
        setIsToggleDisabled(false);

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
            inputRefs.current["FieldName"]?.focus();
            isValidForm = false;
            return;
        }
        const isDuplicate = MainTableSetdata.some(
            (Data) => Data.Title.toLowerCase() === FieldName.toLowerCase().trim()
        );
        if (/[*|\":<>[\]{}`\\()'!%;@#&$]/.test(FieldName)) {
            setFieldNameErr(DisplayLabel?.SpecialCharacterNotAllowed as string);
            isValidForm = false;
            return;
        }
        if (isDuplicate && !isEditMode) {
            setFieldNameErr(DisplayLabel?.ColumnNameIsAlreadyExist as string);
            isValidForm = false;
            return;
        }

        if (isDuplicate && isEditMode) {
            MainTableSetdata.map((Data) => {
                if (Data.Title.toLowerCase() === FieldName.toLowerCase().trim() && Data.ID !== CurrentEditID) {
                    setFieldNameErr(DisplayLabel?.ColumnNameIsAlreadyExist as string);
                    isValidForm = false;
                    return;
                }
            });
        }

        if (ColumnTypeID?.value === "" || ColumnTypeID?.value === undefined || ColumnTypeID === null) {
            setColumnTypeIDErr(DisplayLabel?.ThisFieldisRequired as string);
            inputRefs.current["ColumnType"]?.focus();
            isValidForm = false;
            return;
        }

        if (IsStaticValue === true) {
            if (options.length === 0) {
                alert(DisplayLabel?.Atleasttwooptionrecordrequired);
                isValidForm = false;
                return;
            }
        }
        if (IsStaticValue === false && ColumnTypeID.value === "Dropdown") {
            if (ListNameID === "" || ListNameID === undefined || ListNameID === null) {
                setListNameIDErr(DisplayLabel?.ThisFieldisRequired as string);
                inputRefs.current["ListName"]?.focus();
                isValidForm = false;
                return;
            }
            if (DisplayColumnID === "" || DisplayColumnID === undefined || DisplayColumnID === null) {
                setDisplayColumnIDErr(DisplayLabel?.ThisFieldisRequired as string);
                inputRefs.current["DisplayColumn"]?.focus();
                isValidForm = false;
                return;
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
                ddlColumn = DisplayColumnID?.value || "";
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
            setAlertMsg((isEditMode ? DisplayLabel?.UpdateAlertMsg : DisplayLabel?.SubmitMsg) || "");
            setisPopupVisible(true);
            fetchData();

        } catch (error) {
            console.error("Error during save operation:", error);
            setShowLoader({ display: "none" });
        }
    };




    return (
        <div>
            {/* <nav aria-label="breadcrumb">
                <ol className="breadcrumb breadcrumb-style2">
                    <li className="breadcrumb-item">
                        <Link to="/" style={{ textDecoration: "none" }}>Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">Configuration Master</li>
                </ol>

                <div className={styles.alignbutton} style={{ paddingRight: '0px' }}>
                    <DefaultButton id="requestButton" className={styles['primary-btn']} text={DisplayLabel?.Add} onClick={openAddPanel}  ></DefaultButton>
                </div>
            </nav> */}

            <nav aria-label="breadcrumb" className="toolbarcontainer">
                <div>
                    <ol className="breadcrumb breadcrumb-style2">
                        <li className="breadcrumb-item text-dark">
                            <Link to="/" style={{ textDecoration: "none" }}>Dashboard</Link>
                        </li>
                        <li className="breadcrumb-item active text-primary">Configuration Master</li>
                    </ol>
                </div>
                <div className="d-flex align-items-center py-1">
                    <DefaultButton id="requestButton" className={styles['primary-btn']} text={DisplayLabel?.Add} onClick={openAddPanel}  ></DefaultButton>
                </div>
            </nav>

            <Stack horizontal styles={stackStyles} tokens={stackTokens}>
                <Stack.Item grow={2} styles={stackItemStyles}>
                    <ReactTableComponent
                        TableClassName={styles.ReactTables}
                        Tablecolumns={Tablecolumns}
                        Tabledata={MainTableSetdata}
                        PagedefaultSize={10}
                        TableRows={1}
                        TableshowPagination={MainTableSetdata.length > 10}
                        TableshowFilter={true}
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
                        <DefaultButton onClick={SaveItemData} text={isEditMode ? (DisplayLabel?.Update) : DisplayLabel?.Submit} className={styles['primary-btn']} styles={{ root: { marginRight: 8 } }} />
                        <DefaultButton text={DisplayLabel?.Cancel} onClick={closePanel} className={styles['light-btn']} allowDisabledFocus />
                    </>
                )}

                headerText={isEditMode ? DisplayLabel?.EditNewRecords : DisplayLabel?.AddNewRecords}
            >  <div className="container">
                    <div className="row">
                        <div className="column6">
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
                                    componentRef={(input: any) => (inputRefs.current["FieldName"] = input)}
                                />
                            </div>
                        </div>
                        <div className="column6">
                            <div className="form-group">
                                <label className={styles.Headerlabel}>{DisplayLabel?.ColumnType}<span style={{ color: "red" }}>*</span></label>
                                <Select
                                    options={dropdownOptions}
                                    value={ColumnTypeID}
                                    onChange={handleColumnTypeonChange}
                                    isSearchable
                                    placeholder={DisplayLabel?.Selectanoption}
                                    ref={(input: any) => (inputRefs.current["ColumnType"] = input)}
                                />
                                {ColumnTypeIDErr && <p style={{ color: "rgb(164, 38, 44)" }}>{ColumnTypeIDErr}</p>}
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        {isToggleVisible && (
                            <div className="column6">
                                <div className="form-group">
                                    <label className={styles.Headerlabel}>{DisplayLabel?.IsShowasFilter}</label>

                                    <Toggle checked={IsShowasFilter} onChange={(_, checked) => handleIsShowasFilterToggleChange(checked!)} />

                                </div>
                            </div>
                        )}
                        {isToggleVisible1 && (
                            <div className="column6">
                                <div className="form-group">
                                    <label className={styles.Headerlabel}>{DisplayLabel?.IsStaticValue}</label>
                                    <Toggle checked={IsStaticValue} onChange={(_, checked) => handleIsStaticValueToggleChange(checked!)} disabled={isToggleDisabled} />

                                </div>
                            </div>
                        )}
                    </div>


                    <div className="row">
                        {isDropdownVisible && (
                            <div className="column6">
                                <div className="form-group">
                                    <label className={styles.Headerlabel}>{DisplayLabel?.ListName}<span style={{ color: "red" }}>*</span></label>
                                    <Select
                                        options={ListData}
                                        value={selectedListOption}
                                        onChange={handleListNameonChange}
                                        isSearchable
                                        placeholder={DisplayLabel?.Selectanoption}
                                        errorMessage={ListNameIDErr}
                                        ref={(input: any) => (inputRefs.current["ListName"] = input)}
                                    />
                                    {ListNameIDErr && <p style={{ color: "rgb(164, 38, 44)" }}>{ListNameIDErr}</p>}
                                </div>
                            </div>)}
                        {isSecondaryDropdownVisible && (
                            <div className="column6">
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
                                        ref={(input: any) => (inputRefs.current["DisplayColumn"] = input)}
                                    />
                                    {DisplayColumnIDErr && <p style={{ color: "rgb(164, 38, 44)" }}>{DisplayColumnIDErr}</p>}
                                </div>
                            </div>)}
                    </div>
                    <div className="row">
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
                                                    errorMessage={newOptionError}
                                                />
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center', width: '20%' }}>
                                            {/* <IconButton
                                                iconProps={{ iconName: 'Add' }}
                                                title="Add Option"
                                                ariaLabel="Add Option"
                                                onClick={addOption}
                                                styles={{ root: { marginTop: '8px', backgroundColor: '#009ef7 ', borderRadius: '50px !important', padding: '0px !important' }, icon: { color: '#fff' } }}
                                            /> */}
                                            <FontIcon aria-label="Add" onClick={() => addOption()} iconName="Add" style={{ color: '#fff', cursor: 'pointer', backgroundColor: '#009ef7', padding: '4px 8px', borderRadius: '50%' }}></FontIcon>

                                        </td>
                                    </tr>

                                </tbody>
                                <tbody>
                                    {options.map((option, index) => (
                                        <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                                            <td style={{ padding: '8px' }}>{index + 1}</td>
                                            <td style={{ padding: '8px' }}>{option}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                {/* <IconButton
                                                    iconProps={{ iconName: 'Delete' }}
                                                    title="Remove Option"
                                                    ariaLabel="Remove Option"
                                                    onClick={() => removeOption(index)}
                                                    styles={{ icon: { color: '#e81123' } }}
                                                /> */}
                                                <FontIcon aria-label="Delete" onClick={() => removeOption(index)} iconName="Delete" style={{ color: '#f1416c', cursor: 'pointer', backgroundColor: '#f5f8fa', padding: '6px 9px', borderRadius: '4px' }}></FontIcon>

                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
                <div className={cls["modal"]} style={showLoader}></div>


            </Panel>
            <PopupBox isPopupBoxVisible={isPopupVisible} hidePopup={hidePopup} msg={alertMsg} />

        </div>

    );
}




