import { DefaultButton, FontIcon, IStackItemStyles, IStackStyles, IStackTokens, Panel, PanelType, Stack, TextField, Toggle } from "office-ui-fabric-react";
import { ILabel } from '../Interface/ILabel';
import * as React from "react";
import styles from "../Master/Master.module.scss";
import { useEffect, useState } from "react";
import cls from '../HomePage.module.scss';
import PopupBox from "../ResuableComponents/PopupBox";
import { SaveNavigationMaster, getdata, getChildMenu, getChildMenunew, getDataByID, UpdateNavigationMaster } from "../../../../Services/NavigationService";
import { getUserIdFromLoginName } from "../../../../DAL/Commonfile";
import { PeoplePicker, PrincipalType, IPeoplePickerContext } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import ReactTableComponent from '../ResuableComponents/ReusableDataTable';
import Select from "react-select";



export default function Navigation({ props }: any): JSX.Element {

    const [DisplayLabel, setDisplayLabel] = useState<ILabel>();
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [MenuName, setMenuName] = useState("");
    const [assignID, setAssignID] = useState<string[]>([]);
    const [AccessTileUserErr, setAccessTileUserErr] = useState("");
    const [parent0Data, setparent0Data] = useState([]);
    const [isActive, setisActive] = React.useState<boolean>(true);
    const [isNextActive, setisNextActive] = React.useState<boolean>(true);
    const [isExternalActive, setisExternalActive] = React.useState<boolean>(true);
    const [isParentMenu, setisParentMenu] = React.useState<boolean>(true);
    const [URLErr, setURLErr] = useState("");
    const [URL, setURL] = useState("");
    const [ParentMenuIDErr, setParentMenuIDErr] = useState("");
    const [ParentMenuID, setParentMenuID] = useState<any>(null);
    const [ParentMenuDataText, setParentMenuDataText] = useState<any>(null);
    const [dropdownOptions, setDropdownOptions] = useState<any[]>([]);

    const [OrdeIDErr, setOrdeIDErr] = useState("");
    const [OrdeID, setOrdeID] = useState<any>(null);
    const [editSettingData, setEditSettingData] = useState<any[]>([]);

    const [showLoader, setShowLoader] = useState({ display: "none" });
    const [isPopupVisible, setisPopupVisible] = useState(false);
    const [MainTableSetdata, setData] = useState<any[]>([]);
    const [CurrentEditID, setCurrentEditID] = useState<number>(0);
    const [MenuNameErr, setMenuNameErr] = useState("");
    const [assignEmail, setAssignEmail] = useState<string[]>([]);
    const [isVisible, setIsVisible] = React.useState<boolean>(false);
    const [msg, setMsg] = useState<string>("");


    useEffect(() => {
        let DisplayLabel: ILabel = JSON.parse(localStorage.getItem('DisplayLabel') || '{}');
        setDisplayLabel(DisplayLabel);
        fetchData();
    }, []);

    const onPeoplePickerChange = (items: any[]) => {
        const Users: any = items.map((item: any) => item.id);
        const Emails: any = items.map((item: any) => item.secondaryText);
        setAssignID(Users);
        setAssignEmail(Emails);
    };
    const peoplePickerContext: IPeoplePickerContext = {
        absoluteUrl: props.context.pageContext.web.absoluteUrl,
        msGraphClientFactory: props.context.msGraphClientFactory,
        spHttpClient: props.context.spHttpClient
    };
    const IsActiveToggleChange = (checked: boolean): void => {
        setisActive(checked);
    };
    const IsNexttabToggleChange = (checked: boolean): void => {
        setisNextActive(checked);
    };
    const IsExternalToggleChange = (checked: boolean): void => {
        setisExternalActive(checked);
    };

    const IsParentMenuToggleChange = (checked: boolean): void => {
        setisParentMenu(checked);
        if (checked) {
            setIsVisible(false);
        }
        else {
            setIsVisible(true);
        }
    };


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
        let FetchallData: any = await getdata(props.SiteURL, props.spHttpClient);

        let NavigationData = FetchallData.value;
        setData(NavigationData);
        const NavigationOptions = NavigationData.map((items: any) => ({
            value: items.ID,
            label: items.MenuName
        }));

        setparent0Data(NavigationOptions);
    };

    const Tablecolumns = [
        {
            Header: DisplayLabel?.SrNo,
            accessor: "row._index",
            Cell: ({ row }: { row: any; }) => row._index + 1,
        },
        { Header: DisplayLabel?.MenuName, accessor: "MenuName" },

        {
            Header: DisplayLabel?.Active,
            accessor: "Active",
            Cell: ({ row }: { row: any; }) => (row.Active === true ? "Yes" : "No")
        },
        {
            Header: DisplayLabel?.NextTab,
            accessor: "Next_Tab",
            Cell: ({ row }: { row: any; }) => (row.Next_Tab === true ? "Yes" : "No")
        },
        { Header: DisplayLabel?.ParentMenuId, accessor: "ParentMenuId.MenuName" },
        { Header: DisplayLabel?.OrderNo, accessor: "OrderNo" },
        {
            Header: DisplayLabel?.Action,
            Cell: ({ row }: { row: any; }) => (
                <FontIcon aria-label="Edit" onClick={() => openEditPanel(row._original.Id)} iconName="EditSolid12" style={{ color: '#009ef7', cursor: 'pointer', backgroundColor: '#f5f8fa', padding: '6px 9px', borderRadius: '4px' }}></FontIcon>
            ),
        },
    ];
    const openEditPanel = async (rowData: any) => {
        setIsEditMode(true);
        setIsPanelOpen(true);
        let GetEditData = await getDataByID(props.SiteURL, props.spHttpClient, rowData);
        const EditData = GetEditData.value;
        setEditSettingData(EditData);
        const CurrentItemId: number = EditData[0].ID;
        setCurrentEditID(CurrentItemId);
        await setMenuName(EditData[0].MenuName);
        await setURL(EditData[0].URL);
        await setisActive(EditData[0].Active);
        await setisExternalActive(EditData[0].External_Url);
        await setisNextActive(EditData[0].Next_Tab);
        await setisParentMenu(EditData[0].isParentMenu);
        const orderNo = Number(EditData[0].OrderNo);

        setOrdeID(orderNo);
        //const AccessData: any = EditData[0].Permission ? ([EditData[0].Permission[0].Name]) : [];
        const AccessTileData: string[] = EditData[0].Permission
            ? EditData[0].Permission.map((person: any) => {
                const email = person.Name.split('|');
                return email.includes("membership") ? email.pop() : person.Name;
            })
            : [];
        const accessEmail = EditData[0].Permission.map((person: any) => person.Name);
        setAssignID(accessEmail);
        setAssignEmail(AccessTileData);

        const fetchTemplateData = await getdata(props.SiteURL, props.spHttpClient);

        let TemplateData = fetchTemplateData.value;

        const TemplateOptions = TemplateData.map((items: any) => ({
            value: items.ID,
            label: items.MenuName
        }));

        setparent0Data(TemplateOptions);
        if (EditData[0].isParentMenu === false) {
            setIsVisible(true);
            let ONOptions: any[] = [];

            const ApplyTo = TemplateOptions.filter((item: any) => item.value === EditData[0].ParentMenuId.Id);
            const optionsValues = ApplyTo.map((item: any) => ({
                label: item,
                value: item,
            }));
            setParentMenuID(optionsValues[0].value);

            const newchild = await getChildMenunew(props.SiteURL, props.spHttpClient, optionsValues[0].value.value);
            const Bchild = newchild.value;
            ONOptions = Bchild.map((items: any) => ({
                label: items.OrderNo,
                value: items.OrderNo,

            }));
            setDropdownOptions(ONOptions);
            const OrderApply = ONOptions.filter((item: any) => item.value === EditData[0].OrderNo);
            const OreroptionsValues = OrderApply.map((item: any) => ({
                label: item,
                value: item,
            }));
            setOrdeID(OreroptionsValues[0].value);

        }
        else {
            setParentMenuID('');
            setIsVisible(false);
            let newOptions: any[] = [];
            let getmaindata: any[] = [];
            getmaindata = MainTableSetdata.filter((item: any) => item.isParentMenu === true);
            newOptions = getmaindata.map((items: any) => ({
                label: items.OrderNo,
                value: items.OrderNo,

            }));
            setDropdownOptions(newOptions);

            const ApplyTo = newOptions.filter((item: any) => item.value === EditData[0].OrderNo);
            const optionsValues = ApplyTo.map((item: any) => ({
                label: item,
                value: item,
            }));
            setOrdeID(optionsValues[0].value);
        }

    };


    const openAddPanel = async () => {
        clearField();
        // div.style.display = "block";
        //{isVisible ? "Hide" : "Show"} 
        setIsVisible(false);
        setIsEditMode(false);
        setIsPanelOpen(true);
        let newOptions: any[] = [];

        let orderNum = 1;
        let getmaindata: any[] = [];

        // const response = await getparentdata(props.SiteURL, props.spHttpClient);
        console.log(MainTableSetdata);
        getmaindata = MainTableSetdata.filter((item: any) => item.isParentMenu === true);
        orderNum = (getmaindata.length > 0) ? (getmaindata.length) + 1 : 1;
        newOptions.push({

            value: orderNum,

            label: `${orderNum}`,

        });
        setDropdownOptions(newOptions);

        // setOrderNumber(orderNum);
    };

    const closePanel = () => {
        setIsPanelOpen(false);
    };

    const handleParentMenuonChange = async (option?: any) => {
        setParentMenuID(option);
        setParentMenuDataText(option.text as string);

        let newOptions: any[] = [];

        let orderNum = null;

        const response = await getChildMenu(props.SiteURL, props.spHttpClient, parseInt(option.value));

        orderNum = (response.value.length > 0) ? (response.value.length) + 1 : 1;

        newOptions.push({

            value: orderNum,

            label: `${orderNum}`,

        });
        console.log(newOptions);
        console.log(ParentMenuDataText);
        setDropdownOptions(newOptions);
    };

    const handleOrderChange = async (option?: any) => {
        setOrdeID(option);
    };


    const hidePopup = React.useCallback(() => {
        setisPopupVisible(false);
        window.location.reload();
        clearField();
        closePanel();
        setShowLoader({ display: "none" });
    }, [isPopupVisible]);

    const clearField = () => {
        setCurrentEditID(0);
        setMenuName("");
        setURL("");
        setAccessTileUserErr("");
        setParentMenuID(null);
        clearError();
    };

    const clearError = () => {
        setMenuNameErr("");
        setParentMenuIDErr("");
        setURLErr("");
        setOrdeIDErr("");
        setAccessTileUserErr("");
    };

    const validation = () => {
        let isValidForm = true;
        if (MenuName === "" || MenuName === undefined || MenuName === null) {
            setMenuNameErr(DisplayLabel?.ThisFieldisRequired as string);
            isValidForm = false;
        }

        if (URL === "" || URL === undefined || URL === null) {
            setURLErr(DisplayLabel?.ThisFieldisRequired as string);
            isValidForm = false;
        }
        if (OrdeID === "" || OrdeID === undefined || OrdeID === null) {
            setOrdeIDErr(DisplayLabel?.ThisFieldisRequired as string);
            isValidForm = false;
        }

        if (isParentMenu === false) {
            if (ParentMenuID === "" || ParentMenuID === undefined || ParentMenuID === null) {
                setParentMenuIDErr(DisplayLabel?.ThisFieldisRequired as string);
                isValidForm = false;
            }
        }
        if (assignID.length === 0) {
            setAccessTileUserErr(DisplayLabel?.ThisFieldisRequired as string);
            isValidForm = false;
        }

        return isValidForm;
    };

    const SaveItemData = () => {
        clearError();
        let valid = validation();
        valid ? saveData() : "";
        saveData();
    };

    const saveData = async () => {

        try {

            const userIds = await Promise.all(
                assignID.map(async (person: any) => {
                    const user = await getUserIdFromLoginName(props.context, person);
                    return user.Id;
                })
            );
            let Name = MenuName;

            let option = {
                __metadata: { type: "SP.Data.GEN_x005f_NavigationListItem" },
                //'Title': $("#txtMenuName").val(),
                MenuName: Name,
                PermissionId: { results: userIds },
                ParentMenuIdId: ParentMenuID.value,
                URL: URL,
                Active: isActive,
                Next_Tab: isNextActive,
                External_Url: isExternalActive,
                OrderNo: OrdeID.value,
                isParentMenu: isParentMenu,

            };
            if (!isEditMode) {
                await SaveNavigationMaster(props.SiteURL, props.spHttpClient, option);
                setShowLoader({ display: "none" });
                setIsPanelOpen(false);
                fetchData();
                setMsg(DisplayLabel?.SubmitMsg as string);
                setisPopupVisible(true);
            }
            else {
                let NewSequencedata: any = [];
                let SliderSequence = OrdeID.value;
                let oldSequencedata: any = [];
                let flag = "";
                const newchild = await getChildMenunew(props.SiteURL, props.spHttpClient, editSettingData[0].ParentMenuId.Id);
                const oldchild = newchild.value;
                oldSequencedata = oldchild.filter((item: any) => item.OrderNo === SliderSequence);

                const Sequencedata = editSettingData.filter((item: any) => item.Id === CurrentEditID);

                if (Sequencedata.length > 0) {
                    if (Sequencedata[0].OrderNo != SliderSequence) {
                        if (Sequencedata[0].OrderNo > OrdeID.value) {
                            flag = "forward";
                        }
                        else {
                            flag = "backward";
                        }
                        NewSequencedata = await UpdateOrderNumber(oldSequencedata, oldSequencedata[0].Id, Sequencedata[0].OrderNo, SliderSequence, editSettingData, flag, CurrentEditID);
                    }
                }


                await UpdateNavigationMaster(props.SiteURL, props.spHttpClient, option, CurrentEditID);
                setShowLoader({ display: "none" });
                setIsPanelOpen(false);
                fetchData();
                setMsg(DisplayLabel?.UpdateAlertMsg as string);
                setisPopupVisible(true);
                //  window.location.reload();
                if (Sequencedata[0].Order0 != SliderSequence) {

                    if (NewSequencedata.length > 0) {

                        await UpdateMenuSequence(NewSequencedata);

                    }

                }
            }





        } catch (error) {
            console.error("Error during save operation:", error);
            setShowLoader({ display: "none" });
        }
    };

    const UpdateOrderNumber = async (olddata: any[], oldId: any,
        startIndex: number,
        changeIndex: number,
        data: any[],
        flag: string,
        ID: any
    ) => {
        let NewSequencedata: { Id: any; OrderNo: number; }[] = [];

        // Add the main item being updated
        NewSequencedata.push({ Id: ID, OrderNo: changeIndex });
        NewSequencedata.push({ Id: oldId, OrderNo: startIndex });

        if (changeIndex < startIndex) {
            for (let p = changeIndex; p < startIndex; p++) {
                const currSequencedata = data.find((item) => item.OrderNo === p);
                if (currSequencedata) {
                    NewSequencedata.push({ Id: currSequencedata.Id, OrderNo: p + 1 });
                }
            }
        } else {
            for (let p = changeIndex; p > startIndex; p--) {
                const currSequencedata = data.find((item) => item.OrderNo === p);
                if (currSequencedata) {
                    NewSequencedata.push({ Id: currSequencedata.Id, OrderNo: p - 1 });
                }
            }
        }

        return NewSequencedata;
    };

    const UpdateMenuSequence = async (NewSequencedata: any[]) => {
        for (const item of NewSequencedata) {
            let obj = { OrderNo: item.OrderNo }; // Corrected from Order0 to OrderNo
            await UpdateNavigationMaster(props.SiteURL, props.spHttpClient, obj, item.Id);
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
                        <DefaultButton onClick={SaveItemData} text={isEditMode ? (DisplayLabel?.Update) : DisplayLabel?.Submit} className={styles['primary-btn']} styles={{ root: { marginRight: 8 } }} />
                        <DefaultButton text={DisplayLabel?.Cancel} onClick={closePanel} className={styles['light-btn']} allowDisabledFocus />
                    </>
                )}

                headerText={isEditMode ? DisplayLabel?.EditNewRecords : DisplayLabel?.AddNewRecords}
            >  <div className="container">
                    <div className="row">
                        <div className="column4">
                            <div className="form-group">
                                <label className={styles.Headerlabel}>{DisplayLabel?.MenuName}<span style={{ color: "red" }}>*</span></label>
                                <TextField
                                    placeholder="Enter Menu Name"
                                    errorMessage={MenuNameErr}
                                    value={MenuName}
                                    onChange={(el: React.ChangeEvent<HTMLInputElement>) => setMenuName(el.target.value)}
                                />
                            </div>
                        </div>
                        <div className="column4">
                            <div className="form-group">
                                <label className={styles.Headerlabel}>{DisplayLabel?.AccessToTile}<span style={{ color: "red" }}>*</span></label>
                                <PeoplePicker
                                    context={peoplePickerContext}
                                    personSelectionLimit={20}
                                    showtooltip={true}
                                    required={true}
                                    errorMessage={AccessTileUserErr}
                                    onChange={onPeoplePickerChange}
                                    showHiddenInUI={false}
                                    principalTypes={[PrincipalType.User, PrincipalType.SharePointGroup, PrincipalType.SecurityGroup]}
                                    defaultSelectedUsers={isEditMode ? assignEmail : undefined}
                                />

                            </div>
                        </div>

                        <div className="column4">
                            <div className="form-group">
                                <label className={styles.Headerlabel}>{DisplayLabel?.URL}<span style={{ color: "red" }}>*</span></label>
                                <TextField
                                    placeholder="Enter URL"
                                    errorMessage={URLErr}
                                    value={URL}
                                    onChange={(el: React.ChangeEvent<HTMLInputElement>) => setURL(el.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="column4">
                            <div className={styles.row}>
                                <div className={styles.col12}>
                                    <label className={styles.Headerlabel}>{DisplayLabel?.ActiveStatus}</label>
                                    <Toggle
                                        checked={isActive} onChange={(_, checked) => IsActiveToggleChange(checked!)} />

                                </div>
                            </div>
                        </div>

                        <div className="column4">
                            <div className={styles.row}>
                                <div className={styles.col12}>
                                    <label className={styles.Headerlabel}>{DisplayLabel?.NextTab}</label>
                                    <Toggle
                                        checked={isNextActive} onChange={(_, checked) => IsNexttabToggleChange(checked!)} />

                                </div>
                            </div>
                        </div>
                        <div className="column4">
                            <div className={styles.row}>
                                <div className={styles.col12}>
                                    <label className={styles.Headerlabel}>{DisplayLabel?.ExternalUrl}</label>
                                    <Toggle
                                        checked={isExternalActive} onChange={(_, checked) => IsExternalToggleChange(checked!)} />

                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="row">
                        <div className="column4">


                            <div className="form-group">
                                <label className={styles.Headerlabel}>{DisplayLabel?.Order}<span style={{ color: "red" }}>*</span></label>
                                <Select
                                    options={dropdownOptions}
                                    value={OrdeID}
                                    onChange={handleOrderChange}
                                    isSearchable
                                    placeholder={DisplayLabel?.Selectanoption}
                                />
                                {OrdeIDErr && <p style={{ color: "rgb(164, 38, 44)" }}>{OrdeIDErr}</p>}
                            </div>
                        </div>
                        <div className="column4">
                            <div className={styles.row}>
                                <div className={styles.col12}>
                                    <label className={styles.Headerlabel}>{DisplayLabel?.isParentMenu}</label>
                                    <Toggle
                                        checked={isParentMenu} onChange={(_, checked) => IsParentMenuToggleChange(checked!)} />

                                </div>
                            </div>
                        </div>
                        {isVisible && (<div className="column4">
                            <div className="form-group">
                                <label className={styles.Headerlabel}>{DisplayLabel?.ParentMenuId}<span style={{ color: "red" }}>*</span></label>
                                <Select
                                    options={parent0Data}
                                    value={ParentMenuID}
                                    onChange={handleParentMenuonChange}
                                    isSearchable
                                    placeholder={DisplayLabel?.Selectanoption}
                                />
                                {ParentMenuIDErr && <p style={{ color: "rgb(164, 38, 44)" }}>{ParentMenuIDErr}</p>}
                            </div>
                        </div>
                        )}





                    </div>
                </div>
                <div className={cls["modal"]} style={showLoader}></div>


            </Panel>
            <PopupBox isPopupBoxVisible={isPopupVisible} hidePopup={hidePopup} msg={msg} />

        </div>

    );
}




