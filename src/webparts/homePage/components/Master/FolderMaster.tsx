import { DefaultButton, FontIcon, IStackItemStyles, IStackStyles, IStackTokens, Panel, PanelType, Stack, TextField, Toggle } from "office-ui-fabric-react";
import * as React from "react";
import styles from "./Master.module.scss";
import { useEffect, useState } from "react";
import { ILabel } from "../Interface/ILabel";
import { getParent, SaveFolderMaster, UpdateFolderMaster, getTemplateDataByID, getChildDataByID } from "../../../../Services/FolderMasterService";
import { getTemplateActive } from "../../../../Services/TemplateService";
import ReactTableComponent from '../ResuableComponents/ReusableDataTable';
import Select from "react-select";
import cls from '../HomePage.module.scss';
import PopupBox from "../ResuableComponents/PopupBox";
import { Link } from "react-router-dom";


export default function FolderMaster({ props }: any): JSX.Element {

    const [DisplayLabel, setDisplayLabel] = useState<ILabel>();
    const [MainTableSetdata, setData] = useState<any[]>([]);
    const [isFolderPanelOpen, setisFolderPanelOpen] = useState(false);
    const [isFolderEditMode, setisFolderEditMode] = useState(false);
    const [showLoader, setShowLoader] = useState({ display: "none" });
    const [isPopupVisible, setisPopupVisible] = useState(false);
    const [FolderCurrentEditID, setFolderCurrentEditID] = useState<number>(0);


    const [FolderName, SetFolderName] = useState("");
    const [isChildFolderStatus, setisChildFolderStatus] = React.useState<boolean>(false);
    const [TemplateData, setTemplateData] = React.useState<any>(null);
    const [TemplatedropdownID, setTemplatedropdownID] = React.useState<any>(null);
    // const [TemplatedropdownText, setTemplatedropdownText] = useState("");

    const [FolderData, setFolderData] = React.useState<any>(null);
    const [ParentropdownID, setParentropdownID] = React.useState<any>(null);
    const [isActiveFolderStatus, setisActiveFolderStatus] = React.useState<boolean>(true);

    const [FolderNameErr, setFolderNameErr] = useState("");
    const [TemplatedropdownErr, setTemplatedropdownErr] = useState("");
    const [ParentropdownErr, setParentropdownErr] = useState("");
    const [alertMsg, setAlertMsg] = useState("");







    useEffect(() => {
        let DisplayLabel: ILabel = JSON.parse(localStorage.getItem('DisplayLabel') || '{}');
        setDisplayLabel(DisplayLabel);
        fetchData();
        TemplateMasterData();
        // console.log(TemplatedropdownText);

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
        let FetchFolderData: any = await getParent(props.SiteURL, props.spHttpClient);

        let FolderMasterData = FetchFolderData.value;

        setData(FolderMasterData);

        console.log(FolderMasterData);
    };

    const TemplateTablecolumns = [

        {
            Header: DisplayLabel?.SrNo,
            accessor: "row._index",
            Cell: ({ row }: { row: any; }) => row._index + 1,
            filterable: false,
        },
        {
            Header: DisplayLabel?.FolderName, accessor: "FolderName",
            filterMethod: (filter: any, row: any) => row[filter.id]?.toLowerCase().includes(filter.value?.toLowerCase() || "")

        },
        {
            Header: DisplayLabel?.ParentFolder, accessor: "ParentFolderId.FolderName",
            filterMethod: (filter: any, row: any) => row[filter.id]?.toLowerCase().includes(filter.value?.toLowerCase() || "")
        },
        { Header: DisplayLabel?.TemplateName, accessor: "TemplateName.Name" },
        {
            Header: DisplayLabel?.Active,
            accessor: "Active",
            Cell: ({ row }: { row: any; }) => (row.Active === true ? "Yes" : "No"),
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
            Header: DisplayLabel?.Action,
            accessor: "Action",
            Cell: ({ row }: { row: any; }) => (
                <FontIcon aria-label="Edit" onClick={() => openEditFolderPanel(row._original.Id)} iconName="EditSolid12" style={{ color: '#009ef7', cursor: 'pointer' }}></FontIcon>
            ),
            filterable: false,
        },

    ];

    const openEditFolderPanel = async (rowData: any) => {

        setisFolderPanelOpen(true);
        setisFolderEditMode(true);

        let GetFolderData = await getChildDataByID(props.SiteURL, props.spHttpClient, rowData);
        const EditFolderData = GetFolderData.value;

        const CurrentItemId: number = EditFolderData[0].ID;

        setFolderCurrentEditID(CurrentItemId);

        await SetFolderName(EditFolderData[0].FolderName);
        await setisChildFolderStatus(EditFolderData[0].IsParentFolder);
        await setisActiveFolderStatus(EditFolderData[0].Active);

        //  await setTemplatedropdownID({ value: EditFolderData[0].ID, label: EditFolderData[0].TemplateName });

        const ApplyTo = TemplateData.filter((item: any) => item.value === EditFolderData[0].TemplateNameId);
        const optionsValues = ApplyTo.map((item: any) => ({
            label: item,
            value: item,
        }));
        setTemplatedropdownID(optionsValues[0].value);


        if (EditFolderData[0].IsParentFolder === true) {
            const fetchParentFolderData = await getTemplateDataByID(props.SiteURL, props.spHttpClient, EditFolderData[0].TemplateNameId);

            let ParentFolderData = fetchParentFolderData.value;

            const newOptions = ParentFolderData.map((items: any) => ({
                value: items.ID,
                label: items.FolderName
            }));

            setFolderData(newOptions);

            const EditParentFolderData = newOptions.filter((item: any) => item.value === EditFolderData[0].ParentFolderId.Id);
            const ParentFolderoptionsValues = EditParentFolderData.map((item: any) => ({
                label: item,
                value: item,
            }));
            setParentropdownID(ParentFolderoptionsValues[0].value);
        }

    };

    const TemplateDropdownonChange = async (option?: any) => {
        setTemplatedropdownID(option);
        // setTemplateData(option);
        ParentFolderData(option.value);
    };


    const TemplateMasterData = async () => {

        const fetchTemplateData = await getTemplateActive(props.SiteURL, props.spHttpClient);

        let TemplateData = fetchTemplateData.value;

        const TemplateOptions = TemplateData.map((items: any) => ({
            value: items.ID,
            label: items.Name
        }));

        setTemplateData(TemplateOptions);

    };


    const ParentFolderDropdownonChange = async (option?: any) => {
        setParentropdownID(option);
        setFolderData(option);
    };

    const ParentFolderData = async (TemplatedropdownID: number) => {

        const fetchParentFolderData = await getTemplateDataByID(props.SiteURL, props.spHttpClient, TemplatedropdownID);

        let ParentFolderData = fetchParentFolderData.value;

        const newOptions = ParentFolderData.map((items: any) => ({
            value: items.ID,
            label: items.FolderName
        }));

        setFolderData(newOptions);

    };


    const hidePopup = React.useCallback(() => {
        setisPopupVisible(false);
        clearFolderField();
        closeFolderPanel();
        setShowLoader({ display: "none" });
    }, [isPopupVisible]);

    const clearFolderField = () => {
        SetFolderName('');
        setisChildFolderStatus(false);
        setTemplatedropdownID('');
        setParentropdownID('');
        clearError();
    };
    const openFolderPanel = () => {
        clearFolderField();
        setisFolderPanelOpen(true);
        setisFolderEditMode(false);

    };

    const closeFolderPanel = () => {
        clearFolderField();
        setisFolderPanelOpen(false);
    };

    const IsChildFolderToggleChange = (checked: boolean): void => {
        setisChildFolderStatus(checked);
        setParentropdownID('');
    };

    const IsActiveToggleChange = (checked: boolean): void => {
        setisActiveFolderStatus(checked);
    };

    const clearError = () => {
        setFolderNameErr("");
        setTemplatedropdownErr("");
        setParentropdownErr("");
    };

    const validation = () => {
        let isValidForm = true;

        if (FolderName === "" || FolderName === undefined || FolderName === null) {
            setFolderNameErr(DisplayLabel?.ThisFieldisRequired as string);
            isValidForm = false;
        }
        else if (!TemplatedropdownID) {
            setTemplatedropdownErr(DisplayLabel?.ThisFieldisRequired as string);
            isValidForm = false;
        }
        else if (isChildFolderStatus) {
            if (!ParentropdownID) {
                setParentropdownErr(DisplayLabel?.ThisFieldisRequired as string);
                isValidForm = false;
            }
        }
        const isDuplicate = MainTableSetdata.some(
            (Data) => Data.FolderName.toLowerCase() === FolderName.toLowerCase() && Data.TemplateNameId === TemplatedropdownID.value
        );

        if (isDuplicate && !isFolderEditMode) {
            setFolderNameErr(DisplayLabel?.FolderTemplateCombination as string);
            isValidForm = false;
        }

        if (isDuplicate && isFolderEditMode) {
            MainTableSetdata.map((Data) => {
                if (Data.FolderName.toLowerCase() === FolderName.toLowerCase() && Data.ID !== FolderCurrentEditID) {
                    setFolderNameErr(DisplayLabel?.FolderTemplateCombination as string);
                    isValidForm = false;
                }
            });
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


            const option: {
                __metadata: { type: string; };
                FolderName: string;
                ParentFolderIdId?: number;
                TemplateNameId: any;
                Active: boolean;
                IsParentFolder: boolean;
            } = {
                __metadata: { type: "SP.Data.DMS_x005f_Mas_x005f_FolderMasterListItem" },
                FolderName: FolderName.trim(),
                TemplateNameId: TemplatedropdownID.value,
                Active: isActiveFolderStatus,
                IsParentFolder: isChildFolderStatus,
            };
            if (ParentropdownID?.value) {
                option.ParentFolderIdId = ParentropdownID.value;
            }
            if (!isFolderEditMode)
                await SaveFolderMaster(props.SiteURL, props.spHttpClient, option);

            else
                await UpdateFolderMaster(props.SiteURL, props.spHttpClient, option, FolderCurrentEditID);


            setShowLoader({ display: "none" });
            setisFolderPanelOpen(false);
            setAlertMsg((isFolderEditMode ? DisplayLabel?.UpdateAlertMsg : DisplayLabel?.SubmitMsg) || "");
            setisPopupVisible(true);
            fetchData();

        } catch (error) {
            console.error("Error during save operation:", error);
            setShowLoader({ display: "none" });
        }
    };

    return (
        <div>
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb breadcrumb-style2">
                    <li className="breadcrumb-item">
                        <Link to="/" style={{ textDecoration: "none" }}>Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">Folder Master</li>
                </ol>
            </nav>
            <div className={styles.alignbutton} style={{ paddingRight: '0px' }}>
                <DefaultButton id="requestButton" className={styles['primary-btn']} text={DisplayLabel?.Add} onClick={openFolderPanel}  ></DefaultButton>
            </div>

            <Stack horizontal styles={stackStyles} tokens={stackTokens}>
                <Stack.Item grow={2} styles={stackItemStyles}>
                    <ReactTableComponent
                        TableClassName={styles.ReactTables}
                        Tablecolumns={TemplateTablecolumns}
                        Tabledata={MainTableSetdata}
                        PagedefaultSize={10}
                        TableRows={1}
                        TableshowPagination={MainTableSetdata.length > 10}
                        TableshowFilter={true}
                    />
                </Stack.Item>
            </Stack>
            <Panel
                isOpen={isFolderPanelOpen}
                onDismiss={closeFolderPanel}
                closeButtonAriaLabel="Close"
                type={PanelType.medium}
                isFooterAtBottom={true}

                onRenderFooterContent={() => (
                    <>
                        <DefaultButton onClick={SaveItemData} text={isFolderEditMode ? (DisplayLabel?.Update) : DisplayLabel?.Submit} className={styles['primary-btn']} />
                        <DefaultButton text={DisplayLabel?.Cancel} onClick={closeFolderPanel} className={styles['light-btn']} allowDisabledFocus />
                    </>
                )}

                headerText={isFolderEditMode ? DisplayLabel?.EditFolder : DisplayLabel?.AddFolder}
            >

                <div className={styles.grid}>
                    <div className={styles.row}>
                        <div className={styles.col12}>
                            <label className={styles.Headerlabel}>{DisplayLabel?.FolderName}<span style={{ color: "red" }}>*</span></label>

                            <TextField
                                value={FolderName}
                                onChange={(el: React.ChangeEvent<HTMLInputElement>) => SetFolderName(el.target.value)}
                                errorMessage={FolderNameErr}
                                placeholder={DisplayLabel?.EnterFolderName}
                            />
                        </div>
                    </div>


                    <div className={styles.row}>
                        <div className={styles.col12}>
                            <label className={styles.Headerlabel}>{DisplayLabel?.IsthisaChildFolder}</label>
                            <Toggle
                                checked={isChildFolderStatus} onChange={(_, checked) => IsChildFolderToggleChange(checked!)} />

                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.col12}>
                            <label className={styles.Headerlabel}>{DisplayLabel?.SelectTemplateName}<span style={{ color: "red" }}>*</span></label>

                            <Select
                                options={TemplateData}
                                value={TemplatedropdownID}
                                onChange={TemplateDropdownonChange}
                                isSearchable
                                placeholder={DisplayLabel?.Selectanoption}
                            //errorMessage={ListNameIDErr}
                            />
                            {TemplatedropdownErr && (
                                <p style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>
                                    {TemplatedropdownErr}
                                </p>
                            )}
                        </div>
                    </div>
                    {isChildFolderStatus && (
                        <div className={styles.row}>
                            <div className={styles.col12}>
                                <label className={styles.Headerlabel}>{DisplayLabel?.SelectParentFolder}<span style={{ color: "red" }}>*</span></label>

                                <Select
                                    options={FolderData}
                                    value={ParentropdownID}
                                    onChange={ParentFolderDropdownonChange}
                                    isSearchable
                                    placeholder={DisplayLabel?.Selectanoption}
                                //errorMessage={ListNameIDErr}
                                />
                                {ParentropdownErr && (
                                    <p style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>
                                        {ParentropdownErr}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                    <div className={styles.row}>
                        <div className={styles.col12}>
                            <label className={styles.Headerlabel}>{DisplayLabel?.ActiveStatus}</label>
                            <Toggle
                                checked={isActiveFolderStatus} onChange={(_, checked) => IsActiveToggleChange(checked!)} />

                        </div>
                    </div>
                </div>

                <div className={cls["modal"]} style={showLoader}></div>
            </Panel>
            <PopupBox isPopupBoxVisible={isPopupVisible} hidePopup={hidePopup} msg={alertMsg} />
        </div>
    );

}