import { DefaultButton, FontIcon, IStackItemStyles, IStackStyles, IStackTokens, Panel, PanelType, Stack, TextField, Toggle } from "office-ui-fabric-react";
import * as React from "react";
import { useEffect, useState } from "react";
import { ILabel } from "../Interface/ILabel";
import styles from "./Master.module.scss";
import ReactTableComponent from '../ResuableComponents/ReusableDataTable';
import { getTemplate, getTemplateDataByID, SaveTemplateMaster, UpdateTemplateMaster } from "../../../../Services/TemplateService";
import PopupBox from "../ResuableComponents/PopupBox";
import cls from '../HomePage.module.scss';
import { Link } from "react-router-dom";


export default function TemplateMaster({ props }: any): JSX.Element {

    const [DisplayLabel, setDisplayLabel] = useState<ILabel>();
    const [isTemplatePanelOpen, setisTemplatePanelOpen] = useState(false);
    const [isTemplateEditMode, setisTemplateEditMode] = useState(false);

    const [Template, SetTemplate] = useState("");
    const [isActiveTemplateStatus, setisActiveTemplateStatus] = React.useState<boolean>(true);
    const [TemplateErr, setTemplateErr] = useState("");
    const [showLoader, setShowLoader] = useState({ display: "none" });
    const [MainTableSetdata, setData] = useState<any[]>([]);
    const [TemplateCurrentEditID, setTemplateCurrentEditID] = useState<number>(0);
    const [isPopupVisible, setisPopupVisible] = useState(false);
    const [alertMsg, setAlertMsg] = useState("");

    useEffect(() => {
        let DisplayLabel: ILabel = JSON.parse(localStorage.getItem('DisplayLabel') || '{}');
        setDisplayLabel(DisplayLabel);
        fetchData();

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
        let FetchTemplateData: any = await getTemplate(props.SiteURL, props.spHttpClient);

        let TemplateMasterData = FetchTemplateData.value;

        setData(TemplateMasterData);

        console.log(TemplateMasterData);
    };

    const TemplateTablecolumns = [
        {
            Header: DisplayLabel?.SrNo,
            accessor: "row._index",
            Cell: ({ row }: { row: any; }) => row._index + 1,
            filterable: false,
            width: 65
        },
        {
            Header: DisplayLabel?.TemplateName, accessor: "Name",
            width: '25%',
            filterMethod: (filter: any, row: any) => row[filter.id]?.toLowerCase().includes(filter.value?.toLowerCase() || "")
        },
        {
            Header: DisplayLabel?.ActiveStatus,
            accessor: "Active",
            width: '25%',
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
            Header: <div style={{ textAlign: 'center' }}>{DisplayLabel?.Action}</div>,
            accessor: "Action",
            Cell: ({ row }: { row: any; }) => (
                <FontIcon aria-label="Edit" className="action-icon" onClick={() => openEditTemplatePanel(row._original.Id)} iconName="EditSolid12" style={{ color: '#009ef7', cursor: 'pointer', backgroundColor: '#f5f8fa', padding: '6px 9px', borderRadius: '4px', textAlign: 'center' }}></FontIcon>
            ),
            filterable: false,
            width: '10%',
            className: 'text-center',

        },
    ];

    const openEditTemplatePanel = async (rowData: any) => {
        clearTemplatedField();
        setisTemplatePanelOpen(true);
        setisTemplateEditMode(true);


        let GetTemplateData = await getTemplateDataByID(props.SiteURL, props.spHttpClient, rowData);
        const EditTemplateData = GetTemplateData.value;

        const CurrentItemId: number = EditTemplateData[0].ID;
        // console.log(CurrentEditID);

        setTemplateCurrentEditID(CurrentItemId);
        await SetTemplate(EditTemplateData[0].Name);
        await setisActiveTemplateStatus(EditTemplateData[0].Active);
    };

    const hidePopup = React.useCallback(() => {
        setisPopupVisible(false);
        closeTemplatePanel();
        setShowLoader({ display: "none" });
    }, [isPopupVisible]);

    const openTemplatePanel = () => {
        setisTemplatePanelOpen(true);
        setisTemplateEditMode(false);
    };

    const clearTemplatedField = () => {
        setTemplateCurrentEditID(0);
        SetTemplate("");
        clearError();
    };

    const clearError = () => {

        setTemplateErr("");
    };

    const closeTemplatePanel = () => {
        clearTemplatedField();
        setisTemplatePanelOpen(false);
    };

    const IsActiveToggleChange = (checked: boolean): void => {
        setisActiveTemplateStatus(checked);
    };




    const validation = () => {
        let isValidForm = true;
        const isDuplicate = MainTableSetdata.some(
            (Data) => Data.Name.toLowerCase() === Template.toLowerCase().trim()
        );
        if (Template.trim() === "" || Template === undefined || Template === null) {
            setTemplateErr(DisplayLabel?.ThisFieldisRequired as string);
            isValidForm = false;
        }
        if (/[*|\":<>[\]{}`\\()'!%;@#&$]/.test(Template)) {
            setTemplateErr(DisplayLabel?.SpecialCharacterNotAllowed as string);
            isValidForm = false;
        }
        if (isDuplicate && !isTemplateEditMode) {
            setTemplateErr(DisplayLabel?.TemplateNameIsAlreadyExist as string);
            isValidForm = false;
        }

        if (isDuplicate && isTemplateEditMode) {
            MainTableSetdata.map((Data) => {
                if (Data.Name.toLowerCase() === Template.toLowerCase().trim() && Data.ID !== TemplateCurrentEditID) {
                    setTemplateErr(DisplayLabel?.TemplateNameIsAlreadyExist as string);
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

            let option = {
                __metadata: { type: "SP.Data.DMS_x005f_TemplateListItem" },
                Name: Template.trim(),
                Active: isActiveTemplateStatus

            };
            if (!isTemplateEditMode)
                await SaveTemplateMaster(props.SiteURL, props.spHttpClient, option);
            else
                await UpdateTemplateMaster(props.SiteURL, props.spHttpClient, option, TemplateCurrentEditID);


            setShowLoader({ display: "none" });
            setisTemplatePanelOpen(false);
            setAlertMsg((isTemplateEditMode ? DisplayLabel?.UpdateAlertMsg : DisplayLabel?.SubmitMsg) || "");
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
                    <li className="breadcrumb-item active">Template Master</li>
                </ol>
            </nav>
            <div className={styles.alignbutton} style={{ paddingRight: '0px' }}>
                <DefaultButton id="requestButton" className={styles['primary-btn']} text={DisplayLabel?.Add} onClick={openTemplatePanel}  ></DefaultButton>
            </div> */}

            <nav aria-label="breadcrumb" className="toolbarcontainer">
                <div>
                    <ol className="breadcrumb breadcrumb-style2">
                        <li className="breadcrumb-item text-dark">
                            <Link to="/" style={{ textDecoration: "none" }}>Dashboard</Link>
                        </li>
                        <li className="breadcrumb-item active text-primary">Template Master</li>
                    </ol>
                </div>
                <div className={styles.alignbutton} style={{ paddingRight: '0px' }}>
                    <DefaultButton id="requestButton" className={styles['primary-btn']} text={DisplayLabel?.Add} onClick={openTemplatePanel}  ></DefaultButton>
                </div>
            </nav>

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
                isOpen={isTemplatePanelOpen}
                onDismiss={closeTemplatePanel}
                closeButtonAriaLabel="Close"
                type={PanelType.medium}
                isFooterAtBottom={true}

                onRenderFooterContent={() => (
                    <>
                        <DefaultButton onClick={SaveItemData} text={isTemplateEditMode ? (DisplayLabel?.Update) : DisplayLabel?.Submit} className={styles['primary-btn']} style={{ marginRight: "10px" }} />
                        <DefaultButton text={DisplayLabel?.Cancel} onClick={closeTemplatePanel} className={styles['light-btn']} allowDisabledFocus />
                    </>
                )}

                headerText={isTemplateEditMode ? DisplayLabel?.EditRecord : DisplayLabel?.AddNewRecord}
            >
                <div className={styles.grid}>
                    <div className={styles.row}>
                        <div className={styles.col12}>
                            <label className={styles.Headerlabel}>{DisplayLabel?.TemplateName}<span style={{ color: "red" }}>*</span></label>

                            <TextField
                                value={Template}
                                onChange={(el: React.ChangeEvent<HTMLInputElement>) => SetTemplate(el.target.value)}
                                errorMessage={TemplateErr}
                                placeholder={DisplayLabel?.EnterTemplateName}
                            />
                        </div>
                    </div>


                    <div className={styles.row}>
                        <div className={styles.col12}>
                            <label className={styles.Headerlabel}>{DisplayLabel?.ActiveStatus}</label>
                            <Toggle
                                checked={isActiveTemplateStatus} onChange={(_, checked) => IsActiveToggleChange(checked!)} />

                        </div>
                    </div>
                </div>

                <div className={cls["modal"]} style={showLoader}></div>


            </Panel>
            <PopupBox isPopupBoxVisible={isPopupVisible} hidePopup={hidePopup} msg={alertMsg} />
        </div>
    );
}