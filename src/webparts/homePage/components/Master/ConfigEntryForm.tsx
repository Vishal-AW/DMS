import { DefaultButton, Dropdown, FontIcon, IconButton, IDropdownOption, IStackItemStyles, IStackStyles, IStackTokens, Panel, PanelType, Stack, TextField, Toggle } from "office-ui-fabric-react";
import { ILabel } from '../Interface/ILabel';
import * as React from "react";
import styles from "./Master.module.scss";
import { useEffect, useState } from "react";
import { SPHttpClient } from "@microsoft/sp-http-base";
import cls from '../HomePage.module.scss';
import PopupBox from "../ResuableComponents/PopupBox";
import { getConfidDataByID, getConfig, SaveconfigMaster, UpdateconfigMaster } from "../../../../Services/ConfigService";
import ReactTableComponent from '../ResuableComponents/ReusableDataTable';



export default function ConfigMaster({ props }: any): JSX.Element {

    const [DisplayLabel, setDisplayLabel] = useState<ILabel>();
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [FieldName, setFieldName] = useState("");
    const [ColumnTypeID, setColumnTypeID] = useState('');
    const [ListNameID, setListNameID] = useState('');
    const [DisplayColumnID, setDisplayColumnID] = useState('');
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
        { Header: "FIELD NAME", accessor: "Title" },
        { Header: "COLUMN TYPE", accessor: "ColumnType", },
        { Header: "LIST NAME", accessor: "InternalListName" },
        {
            Header: "IS ACTIVE",
            accessor: "IsActive",
            Cell: ({ row }: { row: any; }) => (row.IsActive === true ? "Yes" : "No")
        },
        {
            Header: "IS STATIC DATA",
            accessor: "IsStaticValue",
            Cell: ({ row }: { row: any; }) => (row.IsStaticValue === true ? "Yes" : "No")
        },
        {
            Header: "ACTION",
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
        console.log(CurrentItemId);
        bindDisplayColumn(EditConfigData[0].InternalListName);
        await setFieldName(EditConfigData[0].Title);
        const columntypeData = dropdownOptions.filter((item: any) => item.key === EditConfigData[0].ColumnType);
        const options = columntypeData.map((item: any) => ({
            key: item.key,
            text: item.text,
        }));
        console.log(options);

        const GetListData = ListData.filter((item: any) => item.key === EditConfigData[0].InternalListName);
        const Listoptions = GetListData.map((item: any) => ({
            key: item.key,
            text: item.text,
        }));
        console.log(Listoptions);

        setColumnTypeID(EditConfigData[0].ColumnType);
        setListNameID(EditConfigData[0].InternalListName);


        setDisplayColumnID(EditConfigData[0].DisplayValue);

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

        let options: any = [];

        ListNamedata.forEach((InternalTitleNameData: { Title: any; InternalTitleName: any; }) => {

            options.push({

                key: InternalTitleNameData.Title,

                text: InternalTitleNameData.Title

            });

        });

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


    const dropdownOptions: IDropdownOption[] = [
        { key: 'Single line of Text', text: 'Single line of Text' },
        { key: 'Multiple lines of Text', text: 'Multiple lines of Text' },
        { key: 'Dropdown', text: 'Dropdown' },
        { key: 'Multiple Select', text: 'Multiple Select' },
        { key: 'Radio', text: 'Radio' },
        { key: 'Date and Time', text: 'Date and Time' },
        { key: 'Person or Group', text: 'Person or Group' },
    ];

    const handleColumnTypeonChange = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
        setColumnTypeID(option?.key as string);

        if (option) {

            if (option.key === "Single line of Text") {
                setToggleVisible(false);
                setToggleVisible1(false);
                setDropdownVisible(false);
                setSecondaryDropdownVisible(false);
                setTableVisible(false);
                setIsToggleDisabled(false);
                setisColumnTypeDisabled(false);
            } else if (option.key === "Multiple lines of Text") {
                setToggleVisible(false);
                setToggleVisible1(false);
                setDropdownVisible(false);
                setSecondaryDropdownVisible(false);
                setTableVisible(false);
                setIsToggleDisabled(false);
                setisColumnTypeDisabled(false);
            }
            else if (option.key === "Dropdown") {
                setToggleVisible(true);
                setToggleVisible1(true);
                setDropdownVisible(true);
                setSecondaryDropdownVisible(true);
                setTableVisible(false);
                setIsToggleDisabled(false);
                setisColumnTypeDisabled(false);
            }
            else if (option.key === "Multiple Select") {
                setToggleVisible(true);
                setToggleVisible1(true);
                setDropdownVisible(true);
                setSecondaryDropdownVisible(true);
                setTableVisible(false);
                setIsToggleDisabled(false);
                setisColumnTypeDisabled(false);
            }
            else if (option.key === "Radio") {
                setToggleVisible(true);
                setToggleVisible1(true);
                setDropdownVisible(false);
                setSecondaryDropdownVisible(false);
                setTableVisible(true);
                setIsStaticValues(true);
                setIsToggleDisabled(true);
                setisColumnTypeDisabled(false);

            }
            else if (option.key === "Date and Time") {
                setToggleVisible(true);
                setToggleVisible1(false);
                setDropdownVisible(false);
                setSecondaryDropdownVisible(false);
                setTableVisible(false);
                setIsToggleDisabled(false);
                setisColumnTypeDisabled(false);
            }
            else if (option.key === "Person or Group") {
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

    const handleListNameonChange = async (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
        if (option) {
            console.log("Selected Option:", option.key, option.text);
            bindDisplayColumn(option.text);

            setListNameID(option?.key as string);

        }
    };
    const bindDisplayColumn = async (listName: string) => {
        let query = props.SiteURL + "/_api/web/lists/getbytitle('" + listName + "')/Fields?$filter=(CanBeDeleted eq true) and (TypeAsString eq 'Text' or TypeAsString eq 'Number')";
        const data = await GetListData(query);
        let DisplayColumnData = data.d.results;
        console.log(DisplayColumnData);

        let optionsData: any = [];

        DisplayColumnData.forEach((InternalTitleNameData: { Title: any; InternalTitleName: any; }) => {

            optionsData.push({

                key: InternalTitleNameData.Title,

                text: InternalTitleNameData.Title

            });

        });
        setDisplaycolumnListData(optionsData);
    };
    const handleDisplayColumnonChange = async (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
        setDisplayColumnID(option?.key as string);
    };

    const hidePopup = React.useCallback(() => {
        setisPopupVisible(false);
        clearField();
        closePanel();
        setShowLoader({ display: "none" });
    }, [isPopupVisible]);

    const clearField = () => {

        setFieldName("");
        setColumnTypeID('');
        setListNameID('');
        setDisplayColumnID('');
        setIsShowasFilter(false);
        setIsStaticValues(false);
        setOptions([]);

        clearError();

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
            setFieldNameErr('This value is required.');
            isValidForm = false;
        }
        if (isColumnTypeDisabled === false) {
            if (ColumnTypeID === "" || ColumnTypeID === undefined || ColumnTypeID === null) {
                setColumnTypeIDErr('This value is required.');
                isValidForm = false;
            }
        }
        if (IsStaticValue === true) {
            if (options.length === 0) {
                alert('at least two option record required');
            }
        }
        if (IsStaticValue === false && ColumnTypeID === "Dropdown") {
            if (ListNameID === "" || ListNameID === undefined || ListNameID === null) {
                setListNameIDErr('This value is required.');
                isValidForm = false;
            }
            if (DisplayColumnID === "" || DisplayColumnID === undefined || DisplayColumnID === null) {
                setDisplayColumnIDErr('This value is required.');
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
                ddlColumn = DisplayColumnID;
            }
            let FieldNameNew = FieldName.split(" ").join("");
            let Name = FieldName;


            let option = {
                __metadata: { type: "SP.Data.ConfigEntryMasterListItem" },
                //'Title': $("#txtFieldName").val(),
                Title: Name.trim(),
                InternalTitleName: FieldNameNew,
                IsActive: true,
                ColumnType: ColumnTypeID,
                IsStaticValue: IsStaticValue,
                StaticDataObject: options.join(';'),
                InternalListName: ddlListName,
                DisplayValue: ddlColumn,
                IsShowAsFilter: IsShowasFilter,
                Abbreviation: "Abbreviation"
            };

            let LID = await SaveconfigMaster(props.SiteURL, props.spHttpClient, option);
            console.log(LID);

            if (LID != null) {

                setShowLoader({ display: "none" });
                setisPopupVisible(true);
            }


        } catch (error) {
            console.error("Error during save operation:", error);
            setShowLoader({ display: "none" });
        }
    };

    const UpdateItemData = () => {
        clearError();
        let valid = validation();
        valid ? UpdateData() : "";
    };

    const UpdateData = async () => {
        try {
            setShowLoader({ display: "block" });

            let ddlListName = null;
            let ddlColumn = null;

            if (IsStaticValue === true) {
                ddlListName = null;
                ddlColumn = null;
            } else {
                ddlListName = ListNameID;
                ddlColumn = DisplayColumnID;
            }
            let FieldNameNew = FieldName.split(" ").join("");
            let Name = FieldName;


            let option = {
                __metadata: { type: "SP.Data.ConfigEntryMasterListItem" },
                Title: Name.trim(),
                InternalTitleName: FieldNameNew,
                IsActive: true,
                ColumnType: ColumnTypeID,
                IsStaticValue: IsStaticValue,
                StaticDataObject: options.join(';'),
                InternalListName: ddlListName,
                DisplayValue: ddlColumn,
                IsShowAsFilter: IsShowasFilter,
                Abbreviation: "Abbreviation"
            };

            await UpdateconfigMaster(props.SiteURL, props.spHttpClient, option, CurrentEditID);

            setShowLoader({ display: "none" });
            setisPopupVisible(true);



        } catch (error) {
            console.error("Error during save operation:", error);
            setShowLoader({ display: "none" });
        }
    };


    return (
        <div>
            <div className={styles.alignbutton} style={{ paddingRight: '0px' }}>
                <DefaultButton id="requestButton" className={styles.submit} text={DisplayLabel?.Add} onClick={openAddPanel}  ></DefaultButton>
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

                headerText={isEditMode ? "Edit New Records" : "Add New Records"}
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
                            <Dropdown
                                placeholder="Select an Option"
                                options={dropdownOptions}
                                onChange={handleColumnTypeonChange}
                                selectedKey={ColumnTypeID}
                                errorMessage={ColumnTypeIDErr}
                                disabled={isColumnTypeDisabled}
                            />
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

                                <Dropdown
                                    placeholder="Select an Option"
                                    options={ListData}
                                    onChange={handleListNameonChange}
                                    selectedKey={ListNameID}
                                    errorMessage={ListNameIDErr}
                                />
                            </div>
                        </div>)}
                    {isSecondaryDropdownVisible && (
                        <div className="col-md-5">
                            <div className="form-group">
                                <label className={styles.Headerlabel}>{DisplayLabel?.DisplayColumn}<span style={{ color: "red" }}>*</span></label>
                                <Dropdown
                                    placeholder="Select an Option"
                                    options={DisplaycolumnListData}
                                    onChange={handleDisplayColumnonChange}
                                    selectedKey={DisplayColumnID}
                                    errorMessage={DisplayColumnIDErr}
                                />
                            </div>
                        </div>)}
                </div>
                <br /><br />
                <div className={`ms-Grid ${styles.inlineFormContainer}`}>
                    {isTableVisible && (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', width: '10%' }}>Sr. No.</th>
                                    <th style={{ textAlign: 'left', width: '70%' }}>
                                        Option *
                                        <div style={{ marginTop: '8px' }}>
                                            <TextField
                                                placeholder="Enter Option"
                                                value={newOption}
                                                onChange={(_, value) => setNewOption(value || '')}
                                                styles={{ root: { width: '100%' } }}
                                            />
                                        </div>
                                    </th>
                                    <th style={{ textAlign: 'center', width: '20%' }}>
                                        Action
                                        <IconButton
                                            iconProps={{ iconName: 'Add' }}
                                            title="Add Option"
                                            ariaLabel="Add Option"
                                            onClick={addOption}
                                            styles={{ root: { marginTop: '8px' }, icon: { color: '#0078d4' } }}
                                        />
                                    </th>
                                </tr>
                            </thead>
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

                <div className={styles.container} >
                    <div className={styles.containerOne} >
                        <div className={cls["modal"]} style={showLoader}></div>

                        {!isEditMode ? (

                            <DefaultButton onClick={SaveItemData} text={DisplayLabel?.Submit} className={styles['sub-btn']} />
                        ) :
                            <DefaultButton onClick={UpdateItemData} text={DisplayLabel?.Update} className={styles['sub-btn']} />
                        }


                        <PopupBox isPopupBoxVisible={isPopupVisible} hidePopup={hidePopup} />


                        <DefaultButton text={DisplayLabel?.Cancel} onClick={closePanel} className={styles['can-btn']} allowDisabledFocus />

                    </div>

                </div>


            </Panel>


        </div>

    );
}