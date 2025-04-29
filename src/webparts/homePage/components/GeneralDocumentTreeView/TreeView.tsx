import * as React from 'react';
import { checkPermissions, commonPostMethod, getAllFolder, getApprovalData, getArchiveData, getListData, updateLibrary } from "../../../../Services/GeneralDocument";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./TreeView.module.scss";
import { CommandBarButton, DefaultButton, DialogType, Icon, IStackItemStyles, IStackStyles, IStackTokens, Panel, PanelType, PrimaryButton, Stack, DirectionalHint } from "@fluentui/react";
import ReactTableComponent from '../ResuableComponents/ReusableDataTable';
import { ContextualMenu, ContextualMenuItemType, IContextualMenuProps } from '@fluentui/react/lib/ContextualMenu';
// import { SPComponentLoader } from "@microsoft/sp-loader";
import IFrameDialog from "./IFrameDialog";
import AdvancePermission from "./AdvancePermission";
import ProjectEntryForm from "./ProjectEntryForm";
import { TextField } from "office-ui-fabric-react";
import { FolderStructure } from "../../../../Services/FolderStructure";
import PopupBox, { ConfirmationDialog } from "../ResuableComponents/PopupBox";
import UploadFiles from "./UploadFile";
// import { useNavigate } from "react-router-dom";
import ApprovalFlow from "./ApprovalFlow";
import cls from '../HomePage.module.scss';
import { useConst } from '@fluentui/react-hooks';
// import { ILabel } from "../Interface/ILabel";
import { isMember } from "../../../../DAL/Commonfile";
import { TooltipHost } from '@fluentui/react';
import { Link } from "react-router-dom";
import { getHistoryByID } from "../../../../Services/GeneralDocHistoryService";
import { getConfigActive } from "../../../../Services/ConfigService";
import { getDataByLibraryName } from "../../../../Services/MasTileService";
import moment from "moment";


interface Folder {
    [key: string]: string | number | {} | null | undefined;
}
const stackStyles: IStackStyles = { root: { height: '100vh' } };
const stackItemStyles: IStackItemStyles = {
    root: {
        padding: 10,
        border: "1px solid #ddd",
        overflowY: "auto",
        // background: "#fff",
        //boxShadow: "0 10px 30px 0 rgba(82, 63, 105, .05)",
    },
};
const stackTokens: IStackTokens = { childrenGap: 10 };
export default function TreeView({ props }: any) {

    const DisplayLabel: any = JSON.parse(localStorage.getItem('DisplayLabel') || '{}');
    const linkRef = useRef<Record<string, HTMLDivElement | null>>({});
    const [showContextualMenu, setShowContextualMenu] = React.useState<{ [key: string]: boolean; }>({});
    const [nodeId, setNodeId] = useState(0);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [rightFolders, setRightFolders] = useState<Folder[]>([]);
    const [childFolders, setChildFolders] = useState<Record<string, Folder[]>>({});
    const [files, setFiles] = useState([]);
    const [iFrameDialogOpened, setIFrameDialogOpened] = useState(false);
    const [shareURL, setShareURL] = useState("");
    const tileObject: string | null = sessionStorage.getItem("LibDetails");
    const [admin, setAdmin] = useState([]);
    const [tables, setTables] = useState("");
    const [showLoader, setShowLoader] = useState({ display: "none" });
    const [formType, setFormType] = useState("EntryForm");
    const [panelTitle, setPanelTitle] = useState("");
    const [message, setMessage] = useState<string>("");
    const [actionButton, setActionButton] = useState<React.ReactNode>(null);
    const [panelForm, setPanelForm] = useState<React.ReactNode>(null);
    const [fileNameErr, setFileNameErr] = useState("");
    const [panelSize, setPanelSize] = useState(PanelType.medium);
    const [hideDialog, setHideDialog] = useState<boolean>(false);
    const [hideDialogCheckOut, setHideDialogCheckOut] = useState<boolean>(false);
    const [ServerRelativeUrl, setServerRelativeUrl] = useState("");
    const [comment, setComment] = useState("");
    const [alertMsg, setAlertMsg] = useState("");

    // const [itemIds, setItemIds] = useState<number | null>(null);
    // const [isHovering, setIsHovering] = useState(false);
    // const hoverRef = React.useRef<Record<string, HTMLDivElement | null>>({});


    if (tileObject === null) {
        location.href = "#/";
        location.reload();
    }

    const libDetails: any = JSON.parse(tileObject as string);
    const libName = libDetails.LibraryName;
    const libtitlename = libDetails.TileName;
    //const archivelibName = libDetails.ArchiveLibraryName;
    const portalUrl = new URL(props.SiteURL).origin;
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isOpenFolderPanel, setIsOpenFolderPanel] = useState(false);
    const [isOpenUploadPanel, setIsOpenUploadPanel] = useState(false);
    const [isOpenCommonPanel, setIsOpenCommonPanel] = useState(false);
    const [itemId, setItemId] = useState<number>(0);
    const [isCreateProjectPopupOpen, setIsCreateProjectPopupOpen] = useState(false);
    const [folderName, setFolderName] = useState("");
    const [folderNameErr, setFolderNameErr] = useState("");
    const [folderObject, setFolderObject] = useState<any>({});
    const [isPopupBoxVisible, setIsPopupBoxVisible] = useState<boolean>(false);
    const [projectUpdateData, setProjectUpdateData] = useState<any>({});
    const [actionFolderPath, setActionFolderPath] = useState("");
    const [extension, setExtension] = useState("");
    const [fileName, setFileName] = useState("");
    const [folderPath, setFolderPath] = useState(libtitlename);
    const [isValidUser, setIsValidUser] = useState<boolean>(false);
    const [hasPermission, setHasPermission] = useState<boolean>(false);
    const [breadcrumb, setBreadcrumb] = useState<any>([{ name: libtitlename, path: libtitlename }]);
    const [deletedData, setDeletedData] = useState<any>([]);
    const [archiveData, setArchiveData] = useState<any>([]);
    const [approvalData, setApprovalData] = useState<any>([]);

    useEffect(() => {
        fetchFolders(libName, "");
        getAdmin();
        getDeletedData();
        getPendingApprovalData();
        getArchiveFile();
    }, [isCreateProjectPopupOpen]);

    useEffect(() => {
        fetchFolders(folderPath, folderName);
    }, [isOpenUploadPanel]);

    const fetchFolders = async (folderPath: string, nodeName: string) => {
        try {
            setFolderPath(folderPath);
            const bread = folderPath.split("/").map((el, index) => ({ name: el, displayname: (index == 0 ? libtitlename : el), path: folderPath.split("/").slice(0, index + 1).join("/") }));
            setBreadcrumb(bread);
            const data: any = await getAllFolder(props.SiteURL, props.context, folderPath);
            if (data && data.Folders) {
                const updatedFolders = data.Folders.map((folder: any) => {
                    const updatedFolder = { ...folder };
                    updatedFolder.folderPath = `${folderPath}/${folder.Name}`;

                    return updatedFolder;
                });
                setRightFolders(updatedFolders);
                if (folderPath === libName) {
                    setFolders(data.Folders);
                } else {
                    setChildFolders((prev) => ({
                        ...prev,
                        [folderPath]: data.Folders,
                    }));
                    setFiles(data.Files.filter((el: any) => (el.ListItemAllFields.Active && (el.ListItemAllFields.InternalStatus === "Published" || el.ListItemAllFields.AuthorId === props.userID))) || []);
                }
                data.Folders.length === 0 ? setExpandedNodes(expandedNodes.filter((name) => name !== nodeName)) : "";
            } else {
                console.error("Unexpected response format", data);
            }
        } catch (error) {
            console.error("Error fetching folders:", error);
        }
    };
    const getAdmin = async () => {
        const data = await getListData(`${props.SiteURL}/_api/web/lists/getbytitle('DMS_GroupName')/items?`, props.context);
        setAdmin(data.value.map((el: any) => (el.GroupNameId)));
        const isMembers = await isMember(props.context, "ProjectAdmin");
        setIsValidUser(isMembers.value.length > 0);
    };

    const [expandedNodes, setExpandedNodes] = useState<string[]>([libName]);

    const toggleNode = (nodeName: string, folderPath: string, obj: Folder) => {
        setTables("");
        setFolderName(nodeName);
        setFolderPath(folderPath);
        setFolderObject(obj);
        hasRequiredPermissions(folderPath);
        if (expandedNodes.includes(nodeName))
            setExpandedNodes(expandedNodes.filter((name) => name !== nodeName));
        else
            setExpandedNodes([...expandedNodes, nodeName]);

        fetchFolders(folderPath, nodeName);
    };


    // const getStatusColor = (status: any) => {
    //     switch (status) {
    //         case "Pending With Publisher":
    //             return { backgroundColor: "green", color: "white" };
    //         case "Inactive":
    //             return { backgroundColor: "red", color: "white" };
    //         case "Pending":
    //             return { backgroundColor: "red", color: "white" };
    //         default:
    //             return { backgroundColor: "red", color: "white" };
    //     }
    // };

    const getStatusStyles = (status: any) => {
        switch (status) {
            case "Pending With Approver":
                return { backgroundColor: "#f1faff", color: "#009ef7" };
            case "Published":
                return { backgroundColor: "#e8fff3", color: "#50cd89" };
            case "Pending With Publisher":
                return { backgroundColor: "#fff8dd", color: "#ffc700" };
            case "Rejected":
                return { backgroundColor: "#fff5f8", color: "#ed1c24" };
        }
    };


    const columns = [
        {
            Header: DisplayLabel.SrNo, accessor: "Id",
            Cell: ({ row }: { row: any; }) => { return <span>{row._index + 1}</span>; },
            width: 65
        },
        {
            Header: DisplayLabel.FileName,
            accessor: "ListItemAllFields.ActualName",
            width: 278,
            Cell: ({ row }: { row: any; }) => {
                const item = row._original?.ListItemAllFields;
                const checkedOutUser = row._original?.CheckedOutByUser;
                const isCheckedOut = row._original?.CheckOutType === 0;
                const isCheckedOutByCurrentUser = checkedOutUser?.Id === props.userID;

                return (
                    <div style={{ display: "flex", alignItems: "center" }} >
                        <a style={{ color: "#009ef7" }} href="javascript:void('0')" onClick={() => {
                            if (row._original.LinkingUrl === "")
                                window.open(row._original.ServerRelativeUrl, "_blank");
                            else
                                window.open(row._original.LinkingUrl, "_blank");
                        }}>{item?.ActualName}</a>
                        {" "}
                        {isCheckedOut && (
                            <TooltipHost
                                content={`${checkedOutUser?.Title} ${DisplayLabel.CheckedOutThisItem}`}
                                directionalHint={DirectionalHint.rightCenter} // Positioning
                                styles={{
                                    root: { display: 'inline-block', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
                                }}
                            >
                                <Icon
                                    iconName={isCheckedOutByCurrentUser ? "CheckedOutByYou12" : "CheckedOutByOther12"}
                                    style={{ marginLeft: "5px", marginTop: '5px', color: isCheckedOutByCurrentUser ? "#a4262c" : "#605e5c", cursor: "pointer" }}
                                />
                            </TooltipHost>
                        )}
                    </div>


                );
            }
        },
        { Header: DisplayLabel.ReferenceNo, accessor: 'ListItemAllFields.ReferenceNo', width: 120, },
        { Header: DisplayLabel.Versions, accessor: 'ListItemAllFields.Level', width: 80, },
        {
            Header: DisplayLabel.Status, accessor: 'ListItemAllFields.DisplayStatus',
            // Cell: ({ row }: { row: any }) => (
            //     <span
            //         style={{
            //             backgroundColor: getStatusColor(row._original.ListItemAllFields.DisplayStatus),
            //             color: "white",
            //             padding: "5px 10px",
            //             borderRadius: "5px",
            //         }}
            //     >
            //         {row._original.ListItemAllFields.DisplayStatus}
            //     </span>
            // ),
            width: 175,
            Cell: ({ row }: { row: any; }) => {
                const styles = getStatusStyles(row._original.ListItemAllFields.DisplayStatus);
                return (
                    <span
                        style={{
                            ...styles,
                            padding: "5px 10px",
                            borderRadius: "5px",
                            display: "inline-block",
                        }}
                    >
                        {row._original.ListItemAllFields.DisplayStatus}
                    </span>
                );
            },

        },
        // { Header: 'OCR Status', accessor: 'ListItemAllFields.OCRStatus' },
        {
            Header: <div style={{ textAlign: 'center' }}>{DisplayLabel?.Action}</div>,
            accessor: "Id",
            Cell: ({ row }: { row: any; }) => {
                const menuProps = useConst<IContextualMenuProps>(() => createMenuProps(row));
                return <DefaultButton text={DisplayLabel.Action} className={styles['info-btn']} menuProps={menuProps} style={{ textAlign: 'center' }} />;
            },
            width: 150,
            className: 'text-center',
        }
    ];
    const createMenuProps = (item: any): IContextualMenuProps => {
        const button = libDetails.ShowMoreActions ? libDetails.ShowMoreActions.split(";") : [];
        const menuItems: any = [
            {
                key: 'docDetails',
                text: DisplayLabel.History,
                onClick: () => commonFunction("History", item)
            },
            {
                key: 'view',
                text: DisplayLabel.View,
                onClick: () => commonFunction("View", item)
            }
        ];
        if ((libDetails.TileAdminId === props.userID || item._original.ListItemAllFields.AuthorId === props.userID) && !libDetails.IsArchiveRequired) {
            menuItems.push({
                key: 'deleteDocument',
                text: DisplayLabel.Delete,
                onClick: () => commonFunction("Delete", item),
            });
        }
        button.map((el: string) => {
            menuItems.push({
                key: el,
                text: DisplayLabel[el],
                onClick: () => commonFunction(el, item),
            });
        });
        if (item._original.CheckOutType === 2) {
            menuItems.push({
                key: 'checkOut',
                text: DisplayLabel.Checkout,
                onClick: () => commonFunction("Checkout", item),
            });
        }
        if (item._original.CheckOutType === 0) {
            menuItems.push({
                key: 'CheckIn',
                text: DisplayLabel.CheckIn,
                onClick: () => commonFunction("CheckIn", item),
            }, {
                key: 'DiscardCheckOut',
                text: DisplayLabel.DiscardCheckOut,
                onClick: () => commonFunction("DiscardCheckOut", item),
            });
        }
        if (isValidUser || libDetails.TileAdminId === props.userID) {
            menuItems.push({
                key: 'advancePermission',
                text: DisplayLabel.AdvancePermission,
                onClick: () => { setItemId(item._original.ListItemAllFields.Id); setIsPanelOpen(true); },
            });
        }

        return {
            shouldFocusOnMount: true,
            items: menuItems
        };
    };
    const commonFunction = async (action: string, item: any) => {
        if (action === "Delete") {
            setMessage(DisplayLabel.DeleteConfirmMsg);
            setItemId(item._original.ListItemAllFields.Id);
            setHideDialog(true);
        }
        else if (action === "Versions") {
            setActionButton(null);
            const url = `${props.SiteURL}/_layouts/15/Versions.aspx?list=${libName}&FileName=${item._original.ServerRelativeUrl}&IsDlg=${item._original.ListItemAllFields.Id}`;
            setPanelForm(<iframe id="frame" src={url} style={{ width: "100%", height: "80vh" }}></iframe>);
            setPanelTitle(DisplayLabel.Versions);
            setIsOpenCommonPanel(true);
        }
        else if (action === "Rename") {
            setFileNameErr("");
            setItemId(item._original.ListItemAllFields.Id);
            setPanelTitle(DisplayLabel.Rename);
            const fileDetails = item._original.ListItemAllFields.ActualName.split(".");
            setExtension(fileDetails[1]);
            setFileName(fileDetails[0]);
            setIsOpenCommonPanel(true);
        }
        else if (action === "Download") { location.href = `${props.SiteURL}/_layouts/15/download.aspx?SourceUrl=${item._original.ServerRelativeUrl}`; }
        else if (action === "Preview") {
            setActionButton(null);
            setPanelSize(PanelType.smallFluid);
            setPanelTitle(DisplayLabel.Preview);
            const previewData = getPreviewUrl(item._original.ServerRelativeUrl);
            setPanelForm(previewData);
            setIsOpenCommonPanel(true);
        }
        else if (action === "Checkout") {
            await commonPostMethod(`${props.SiteURL}/_api/web/GetFileByServerRelativeUrl('${item._original.ServerRelativeUrl}')/checkout`, props.context);
            setAlertMsg(DisplayLabel.CheckoutSuccess);
            setIsPopupBoxVisible(true);
            fetchFolders(folderPath, folderName);
        }
        else if (action === "CheckIn") {
            setActionButton(<PrimaryButton text={DisplayLabel.CheckIn} style={{ marginRight: "10px" }} onClick={async () => {
                await commonPostMethod(`${props.SiteURL}/_api/web/GetFileByServerRelativeUrl('${item._original.ServerRelativeUrl}')/checkin(comment='${comment}',checkintype=0)`, props.context);
                setAlertMsg(DisplayLabel.CheckInSuccess);
                setIsPopupBoxVisible(true);
                fetchFolders(folderPath, folderName);
            }} />);
            setIsOpenCommonPanel(true);
        }
        else if (action === "DiscardCheckOut") {
            setMessage(DisplayLabel.CheckoutConfirm);
            setServerRelativeUrl(item._original.ServerRelativeUrl);
            setHideDialogCheckOut(true);
        }
        else if (action === "History") {
            setActionButton(null);
            const HistoryData = await getHistoryByID(props.SiteURL, props.spHttpClient, item._original.ListItemAllFields.Id, libName);
            const bindData = HistoryData?.value.length > 0 ? HistoryData.value.map((el: any, index: number) => <tr><td>{index + 1}</td><td>{el.Author.Title}</td><td>{el.Action}</td><td>{el.InternalComment}</td></tr>) : <tr><td>No Data</td></tr>;
            setPanelForm(<table className="addoption" style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>{DisplayLabel?.SrNo}</th>
                        <th>{DisplayLabel?.Action}</th>
                        <th>{DisplayLabel?.ActionBy}</th>
                        <th>{DisplayLabel?.Comments}</th>
                    </tr>
                </thead>
                <tbody>{bindData}</tbody>
            </table>);
            setPanelTitle(DisplayLabel.History);
            setIsOpenCommonPanel(true);
        }
        else if (action === "View") {
            setActionButton(null);
            const dataConfig = await getConfigActive(props.context.pageContext.web.absoluteUrl, props.context.spHttpClient);
            const libraryData = await getDataByLibraryName(props.context.pageContext.web.absoluteUrl, props.context.spHttpClient, libName);
            let jsonData = JSON.parse(libraryData.value[0].DynamicControl);
            jsonData = jsonData.filter((ele: any) => ele.IsActiveControl);
            //setPanelSize(PanelType.large);
            const htm = <>
                <div className="grid">
                    <div className="row">
                        <div className="col-md-12">
                            <label>{DisplayLabel.Path}: <b>{folderPath}</b></label>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <label className={styles.Headerlabel}>{DisplayLabel.TileName}</label>
                            <TextField
                                value={libDetails.TileName}
                                //disabled={true}
                                readOnly
                            />
                        </div>
                        <div className="col-md-6">
                            <label className={styles.Headerlabel}>{DisplayLabel.FolderName}</label>
                            <TextField
                                value={folderName}
                                // disabled={true}
                                readOnly
                            />
                        </div>
                        {item._original.ListItemAllFields.IsSuffixRequired ? <>
                            <div className="col-md-6">
                                <label className={styles.Headerlabel}>{DisplayLabel.DocumentSuffix}</label>
                                <TextField
                                    value={item._original.ListItemAllFields.DocumentSuffix}
                                    //disabled={true}
                                    readOnly
                                />
                            </div>


                            {item._original.ListItemAllFields.DocumentSuffix === "Other" && (
                                <div className="col-md-6">
                                    <label className={styles.Headerlabel}>{DisplayLabel.OtherSuffixName}</label>
                                    <TextField
                                        value={item._original.ListItemAllFields.OtherSuffix}
                                        //disabled={true}
                                        readOnly
                                    />
                                </div>
                            )}</> : <></>
                        }
                        {
                            jsonData.map((el: any, index: number) => {
                                const filterObj = dataConfig?.value.find((ele: any) => ele.Id === el.Id);
                                if (!filterObj) return null;
                                return <div className="col-md-6">
                                    <label className={styles.Headerlabel}>{el.Title}</label>
                                    {filterObj.ColumnType === "Date and Time" ? <TextField
                                        value={item._original.ListItemAllFields.hasOwnProperty(el.InternalTitleName) ? moment(item._original.ListItemAllFields[el.InternalTitleName]).format("DD/MM/YYYY") : ""}
                                        disabled={true}
                                    /> : <TextField
                                        value={item._original.ListItemAllFields.hasOwnProperty(el.InternalTitleName) ? (el.ColumnType === "Person or Group" ? item._original.ListItemAllFields[el.InternalTitleName].Title : item._original.ListItemAllFields[el.InternalTitleName]) : ""}
                                        //disabled={true}
                                        readOnly
                                    />}
                                </div>;

                            })
                        }
                    </div>
                </div>
            </>;
            setPanelForm(htm);
            setPanelTitle(DisplayLabel.View);
            setIsOpenCommonPanel(true);

        }
    };
    useEffect(() => {
        setPanelForm(<>
            <div className="col-md-10">
                <TextField value={fileName} required errorMessage={fileNameErr} onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setFileName(event.target.value);
                }} />
            </div>
            <div className="col-md-2"><TextField readOnly value={extension} /></div>
        </>);
        setActionButton(<PrimaryButton text={DisplayLabel.Rename} style={{ marginRight: "10px" }} onClick={() => renameTheFile(itemId)} />);
    }, [fileName, extension, fileNameErr]);


    useEffect(() => {
        setPanelForm(<>
            <div className="col-md-10">
                <TextField value={comment} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setComment(event.target.value)} />
            </div>
        </>);

    }, [comment]);

    const getPreviewUrl = (filePath: string) => {
        const extension = filePath?.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'doc':
            case 'docx':
            case 'ppt':
            case 'pptx':
            case 'xls':
            case 'xlsx':
            case 'pdf':
                return <iframe src={`${props.SiteURL}/_layouts/15/WopiFrame.aspx?sourcedoc=${filePath}&action=interactivepreview`} style={{ width: "100%", height: "80vh" }}></iframe>;
            case 'txt':
                return <iframe src={`${filePath}`} style={{ width: "100%", height: "80vh" }}></iframe>;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'bmp':
                return <img src={`${filePath}`} alt={DisplayLabel.Preview} />;
        }
    };
    const renameTheFile = (id: number) => {
        if (fileName === "") {
            setFileNameErr(DisplayLabel.ThisFieldisRequired);
        }
        else {
            setShowLoader({ display: "block" });
            const obj = {
                ActualName: `${fileName}.${extension}`
            };
            updateLibrary(props.SiteURL, props.spHttpClient, obj, id, libName).then((response) => {
                dismissFolderPanel();
                setShowLoader({ display: "none" });
                setAlertMsg(DisplayLabel.SubmitMsg);
                setIsPopupBoxVisible(true);
                fetchFolders(folderPath, folderName);
            });
        }
    };

    const closeDialog = useCallback(() => setHideDialog(false), []);
    const closeDialogCheckOut = useCallback(() => setHideDialogCheckOut(false), []);
    const handleConfirm = useCallback(
        async (value: boolean) => {
            if (value) {
                setHideDialog(false);
                deleteDoc();
            }
        },
        [itemId]
    );
    const handleConfirmCheckOut = useCallback(async (value: boolean) => {
        if (value) {
            await commonPostMethod(`${props.SiteURL}/_api/web/GetFileByServerRelativeUrl('${ServerRelativeUrl}')/undocheckout()`, props.context);
            setAlertMsg(DisplayLabel.DiscardedCheckOut);
            setIsPopupBoxVisible(true);
            fetchFolders(folderPath, folderName);
        }
    }, [ServerRelativeUrl]);


    const deleteDoc = async () => {
        const obj = {
            Active: false,
            DeleteFlag: "Deleted",
        };
        await updateLibrary(props.SiteURL, props.spHttpClient, obj, itemId, libName);
        setAlertMsg(DisplayLabel.DeletedMsg);
        setIsPopupBoxVisible(true);
        fetchFolders(folderPath, folderName);
    };


    const renderTree = (nodes: Folder[], parentPath: string = "") => {
        return nodes.map((node: any) => {

            return node.Name !== "Forms" && (
                <li key={node.ListItemAllFields.Id}>
                    <div className={styles["tree-node"]}>
                        <span
                            onClick={() => toggleNode(node.Name, `${parentPath}/${node.Name}`, node)}
                            style={{ cursor: "pointer" }}
                        >
                            <Icon
                                iconName={
                                    expandedNodes.includes(node.Name)
                                        ? "FabricOpenFolderHorizontal"
                                        : "FabricFolderFill"
                                }
                                className={styles["folder-icon"]}
                                style={{ marginRight: "5px", color: "#009ef7" }}
                            />
                            <span className={styles["node-name"]}>{node.Name}</span>
                        </span>
                        <div ref={(el) => (linkRef.current[node.ListItemAllFields.Id] = el)} onClick={(e) => onShowContextualMenu(e, node.ListItemAllFields.Id)}>
                            <Icon
                                iconName={"More"}
                                className={styles["folder-icon"]}
                                style={{ marginLeft: "5px", color: "#009ef7", cursor: "pointer" }}
                            />
                            {showContextualMenu[node.ListItemAllFields.Id] && nodeId === node.ListItemAllFields.Id ? (
                                <ContextualMenu
                                    items={bindMenu(node, `${parentPath}/${node.Name}`)}
                                    hidden={!showContextualMenu[node.ListItemAllFields.Id]}
                                    target={linkRef.current[node.ListItemAllFields.Id]}
                                    onItemClick={() => onHideContextualMenu(node.ListItemAllFields.Id)}
                                    onDismiss={() => onHideContextualMenu(node.ListItemAllFields.Id)}
                                />
                            ) : <></>
                            }
                        </div>

                    </div>
                    {expandedNodes.includes(node.Name) && childFolders[`${parentPath}/${node.Name}`] && (
                        <ul className="nested-list">
                            {renderTree(childFolders[`${parentPath}/${node.Name}`], `${parentPath}/${node.Name}`)}
                        </ul>
                    )}
                </li>
            );
        });
    };

    const renderRightFolder = (nodes: Folder[]) => {
        return nodes.map((node: any) => (
            node.Name !== "Forms" && (
                <div key={node.Id} className="col-md-2">
                    <div
                        onClick={() => toggleNode(node.Name, `${node.folderPath}`, node)}
                        style={{ cursor: "pointer" }}
                        className={styles["folderTile"]}
                    >
                        <Icon
                            iconName="FabricFolderFill"
                            className={styles["folder-icon"]}
                            style={{ marginRight: "5px", color: "#009ef7", fontSize: "50px", height: "50px" }}
                        />
                        <span className={styles["folderLabel"]}>{node.Name}</span>
                    </div>
                </div>
            )
        ));
    };

    const bindMenu = (node: any, afolderPath: string) => {



        const menuItems: any = [];
        if (isValidUser || libDetails.TileAdminId === props.userID) {
            menuItems.push({
                key: 'advancePermission',
                text: DisplayLabel.AdvancePermission,
                onClick: () => { setItemId(node.ListItemAllFields.Id); setIsPanelOpen(true); },
            });
        }
        menuItems.push(
            {
                key: 'divider_1',
                itemType: ContextualMenuItemType.Divider,
            },
            {
                key: 'share',
                text: DisplayLabel.Share,
                onClick: () => {
                    setShareURL(`${props.SiteURL}/_layouts/15/sharedialog.aspx?listId=${libDetails.LibGuidName}&listItemId=${node.ListItemAllFields.Id}&clientId=sharePoint&policyTip=0&folderColor=undefined&ma=0&fullScreenMode=true&itemName=${node.Name}&origin=${portalUrl}`);
                    setIFrameDialogOpened(true);
                }
            },
            {
                key: "view",
                text: DisplayLabel.View,
                onClick: () => { setActionFolderPath(afolderPath); setProjectUpdateData(node); setIsCreateProjectPopupOpen(true); setFormType("ViewForm"); },
            },
            {
                key: 'edit',
                text: DisplayLabel.Edit,
                onClick: () => { setActionFolderPath(afolderPath); setProjectUpdateData(node); setIsCreateProjectPopupOpen(true); setFormType("EditForm"); },
            },
        );
        return menuItems;
    };
    const onShowContextualMenu = useCallback((ev: React.MouseEvent<HTMLElement>, nodeId: string) => {
        ev.preventDefault(); // don't navigate
        setNodeId(Number(nodeId));
        setShowContextualMenu((prev) => ({ ...prev, [nodeId]: true }));
    }, []);

    const onHideContextualMenu = useCallback((nodeId: string) => { setShowContextualMenu((prev) => ({ ...prev, [nodeId]: false })); setNodeId(0); }, []);


    const onDismiss: any = useCallback(() => { setIsPanelOpen(false); }, []);
    //const ApprovalFlow = useCallback(() => { setApprovalPanel(false); }, []);
    const projectCreation = useCallback(() => { setIsCreateProjectPopupOpen(true); setFormType("EntryForm"); setProjectUpdateData({}); }, []);

    const dissmissProjectCreationPanel = useCallback((value: boolean) => { setIsCreateProjectPopupOpen(value); }, []);

    const dismissFolderPanel = () => { setIsOpenFolderPanel(false); };

    const dismissUploadPanel = useCallback(() => { setIsOpenUploadPanel(false); }, []);

    const dismissCommanPanel = () => { setIsOpenCommonPanel(false); setActionButton(null); setPanelForm(null); setPanelSize(PanelType.medium); };

    const createFolder = (): void => {
        setFolderNameErr("");
        if (folderName === "") {
            setFolderNameErr(DisplayLabel.ThisFieldisRequired);
            return;
        }
        const isDuplicate = childFolders[folderPath].filter((el: any) => el.Name === folderName);
        if (isDuplicate.length > 0) {
            setFolderNameErr(DisplayLabel.FolderAlreadyExist);
            return;
        }
        setShowLoader({ display: "block" });
        const users = [folderObject?.ListItemAllFields.ProjectmanagerId, folderObject?.ListItemAllFields.PublisherId, ...admin];
        FolderStructure(props.context, `${folderPath}/${folderName}`, users, libName).then((response) => {
            const folderData = JSON.parse(JSON.stringify(folderObject?.ListItemAllFields, (key, value) => (value === null || (Array.isArray(value) && value.length === 0)) ? undefined : value));
            let obj: any = {
                ...folderData
            };

            updateLibrary(props.SiteURL, props.spHttpClient, obj, response, libName).then((response) => {
                dismissFolderPanel(); setShowLoader({ display: "none" });
                setAlertMsg(DisplayLabel.SubmitMsg);
                setIsPopupBoxVisible(true);
                toggleNode(folderName, `${folderPath}`, folderObject);
                fetchFolders(folderPath, `${folderName}`);
            });
        });
    };

    const getRecycleData = () => {
        setTables("Recycle");

    };

    const getArchive = () => {
        setTables("Archive");

    };

    const hidePopup = useCallback(() => { setIsPopupBoxVisible(false); }, [isPopupBoxVisible]);

    const bindTable = () => {

        if (tables === "Approver") {
            return <ApprovalFlow context={props.context} libraryName={libName} userEmail={props.UserEmailID} action="Approver" />;
        }
        else if (tables === "Recycle") {
            return <ApprovalFlow context={props.context} libraryName={libName} userEmail={props.UserEmailID} action="Recycle" />;
        }
        else if (tables === "Archive") {
            return <ApprovalFlow context={props.context} libraryName={libName} userEmail={props.UserEmailID} action="Archive" />;
        }
        else {

            return rightFolders.length === 0 ? <ReactTableComponent
                TableClassName="ReactTables"
                Tablecolumns={columns}
                Tabledata={files}
                PagedefaultSize={10}
                TableRows={1}
                TableshowPagination={files.length > 10}
            /> : <div className="grid" style={{ height: "832px", overflow: "auto" }}>
                <div className="row">
                    {renderRightFolder(rightFolders)}
                </div>
            </div>;
        }

    };
    const advancedSearch = () => {
        sessionStorage.setItem("LibName", libName);
        location.href = "#/SearchFilter";
    };
    const getDeletedData = async () => {
        const deletedData = await getListData(`${props.SiteURL}/_api/web/lists/getbytitle('${libName}')/items?$filter=DeleteFlag eq 'Deleted' and Active eq 0`, props.context);
        setDeletedData(deletedData.value);
    };
    const getArchiveFile = async () => {
        const data = await getArchiveData(props.context, libName);
        setArchiveData(data.value || []);
    };
    const getPendingApprovalData = async () => {
        const pendingApprovalData = await getApprovalData(props.context, libName, props.UserEmailID);
        setApprovalData(pendingApprovalData.value);
    };
    const hasRequiredPermissions = (uri: string) => {
        checkPermissions(props.context, uri).then((permission: boolean) => setHasPermission(permission));
    };

    return (
        <div>
            {/* <nav aria-label="breadcrumb">
                <ol className="breadcrumb breadcrumb-style2">
                    <li className="breadcrumb-item">
                        <Link to="/" style={{ textDecoration: "none" }}>Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">{libName}</li>
                </ol>
            </nav> */}

            {/* <div className={styles.grid}>
                <div className={styles.row}>
                    <div className={styles.col12}>
                        {isValidUser || libDetails.TileAdminId === props.userID ? <DefaultButton onClick={projectCreation} text={DisplayLabel?.NewRequest} className={styles['primary-btn']} style={{ float: "right", marginRight: "20px" }} /> : ""}
                    </div>
                </div>
            </div> */}

            <nav aria-label="breadcrumb" className="toolbarcontainer" style={{ marginBottom: "20px", padding: "0px 0px 0px 8px" }}>
                <div>
                    <ol className="breadcrumb breadcrumb-style2">
                        <li className="breadcrumb-item text-dark">
                            <Link to=" /" style={{ textDecoration: "none" }}>Dashboard</Link>
                        </li>
                        <li className="breadcrumb-item active">{libtitlename}</li>
                    </ol>
                </div>
                <div className="d-flex align-items-center py-1">
                    {isValidUser || libDetails.TileAdminId === props.userID ? <DefaultButton onClick={projectCreation} text={DisplayLabel?.NewRequest} className={styles['primary-btn']} style={{ float: "right", marginRight: "20px" }} /> : ""}
                </div>
            </nav>


            <Stack enableScopedSelectors horizontal styles={stackStyles} tokens={stackTokens} className="row">
                <Stack.Item grow styles={stackItemStyles} className="col-md-3">
                    <div className="card" style={{ border: "none", padding: "18px 15px" }}>
                        <div className="grid">
                            <div className="row">
                                <div className="col-md-12">
                                    {libDetails.IsArchiveRequired ? <CommandBarButton iconProps={{ iconName: "Archive", style: { color: "#f1416c" } }} text={`${DisplayLabel.Archive} (${archiveData.length || 0})`} onClick={getArchive} />
                                        : <CommandBarButton iconProps={{ iconName: "delete", style: { color: "#f1416c" } }} text={`${DisplayLabel.RecycleBin} (${deletedData.length || 0})`} onClick={getRecycleData} />
                                    }
                                </div>

                                <div className="col-md-12"><CommandBarButton iconProps={{ iconName: "DocumentApproval", style: { color: "#50cd89" } }} text={`${DisplayLabel.Approval} (${approvalData.length || 0})`} onClick={() => setTables("Approver")} /></div>

                                <div className="col-md-12"><CommandBarButton iconProps={{ iconName: "Search", style: { color: "#7239ea" } }} text={DisplayLabel.AdvancedSearch} onClick={advancedSearch} /></div>
                            </div>
                        </div>
                        <hr className="customHrdot" style={{ borderTop: 'var(--bs-border-width) dashed !important' }} />
                        <ul className={styles["tree-view"]} style={{ height: "760px", overflow: "auto" }}>
                            <li>
                                <div className={styles["tree-node"]}>
                                    <span
                                        onClick={() => toggleNode(libName, libName, {})}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <Icon
                                            iconName={
                                                expandedNodes.includes(libName)
                                                    ? "FabricOpenFolderHorizontal"
                                                    : "FabricFolderFill"
                                            }
                                            className={styles["folder-icon"]}
                                            style={{ marginRight: "5px", color: "#009ef7" }}
                                        />
                                        <span className={styles["node-name"]}>{libDetails.TileName}</span>
                                    </span>
                                </div>
                                <ul className="nested-list">
                                    {expandedNodes.includes(libName) && renderTree(folders, libName)}
                                </ul>
                            </li>
                        </ul>
                    </div>
                </Stack.Item>
                <Stack.Item grow styles={stackItemStyles} className="col-md-9">
                    <div className="card" style={{ border: "none", padding: "18px 25px" }}>
                        <div className="grid">
                            <div className="row">
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb breadcrumb-style2">
                                        {
                                            breadcrumb.map((el: any, index: number) => {
                                                return <li key={index} className="breadcrumb-item">
                                                    <a href="javascript:void(0)" onClick={() => fetchFolders(el.path, el.name)} style={{ color: "#009ef7", textDecoration: "none" }}>{el.displayname}</a>
                                                </li>;
                                            })
                                        }
                                    </ol>
                                </nav>
                            </div>
                            <div className="row">
                                <div className="col-md-12">
                                    {folderPath === libName ? <></> :
                                        <div style={{ float: "right" }}>
                                            {tables === "" ? <>
                                                {rightFolders.length === 0 && (isValidUser || libDetails.TileAdminId === props.userID || hasPermission) ? <DefaultButton text={DisplayLabel.Upload} onClick={() => setIsOpenUploadPanel(true)} className={styles['secondary-btn']} styles={{ root: { marginRight: 8 } }} /> : <></>}
                                                {files.length === 0 ? <DefaultButton className={styles['info-btn']} text={DisplayLabel.NewFolder} onClick={() => { setIsOpenFolderPanel(true); setFolderName(""); }} /> : <></>}
                                            </> : <> </>
                                            }
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                        <div style={{ height: "832px", overflow: "auto" }}>
                            {bindTable()}
                        </div>
                    </div>
                </Stack.Item>
            </Stack>

            <IFrameDialog
                url={shareURL}
                width="800px !important"
                height="600px"
                hidden={!iFrameDialogOpened}
                onDismiss={() => setIFrameDialogOpened(false)}
                iframeOnLoad={(iframe) => console.log('Iframe loaded:', iframe)}
                modalProps={{
                    isBlocking: true,

                }}
                dialogContentProps={{
                    type: DialogType.close,
                    showCloseButton: true
                }}
            />
            <AdvancePermission isOpen={isPanelOpen} context={props.context} folderId={itemId} LibraryName={libName} dismissPanel={onDismiss} />
            <ProjectEntryForm isOpen={isCreateProjectPopupOpen} dismissPanel={dissmissProjectCreationPanel} context={props.context} LibraryDetails={libDetails} admin={admin} FormType={formType} folderObject={projectUpdateData} folderPath={actionFolderPath} />
            <UploadFiles context={props.context} isOpenUploadPanel={isOpenUploadPanel} folderName={folderName} folderPath={folderPath} dismissUploadPanel={dismissUploadPanel} libName={libName} files={files} folderObject={folderObject?.ListItemAllFields} LibraryDetails={libDetails} />
            <Panel
                headerText={DisplayLabel.AddNewFolder}
                isOpen={isOpenFolderPanel}
                onDismiss={dismissFolderPanel}
                closeButtonAriaLabel="Close"
                type={PanelType.medium}
                onRenderFooterContent={() => (<>
                    <DefaultButton onClick={createFolder} className={styles["primary-btn"]} styles={{ root: { marginRight: 8 } }}>{DisplayLabel.Submit}</DefaultButton>
                    <DefaultButton onClick={dismissFolderPanel} className={styles["light-btn"]}>{DisplayLabel.Cancel}</DefaultButton>
                </>)}
                isFooterAtBottom={true}
            >
                <div className="grid">
                    <div className="row">
                        <div className="col-md-12">
                            <label>{DisplayLabel.Path}: <b>{folderPath}</b></label>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <TextField label={DisplayLabel.FolderName} required value={folderName} onChange={(el: React.ChangeEvent<HTMLInputElement>) => setFolderName(el.target.value)} errorMessage={folderNameErr} />
                        </div>
                    </div>
                </div>
            </Panel>
            <PopupBox isPopupBoxVisible={isPopupBoxVisible} hidePopup={hidePopup} msg={alertMsg} />
            <div className={cls["modal"]} style={showLoader}></div>
            <Panel
                headerText={panelTitle}
                isOpen={isOpenCommonPanel}
                onDismiss={dismissCommanPanel}
                closeButtonAriaLabel="Close"
                type={panelSize}
                onRenderFooterContent={() => <>{actionButton}<DefaultButton onClick={dismissCommanPanel} className={styles["light-btn"]}>Cancel</DefaultButton></>}
                isFooterAtBottom={true}
            >
                <div style={{ marginTop: "10px" }}>
                    <div className="grid">
                        <div className="row">
                            {panelForm}
                        </div>
                    </div>
                </div>
            </Panel>
            <ConfirmationDialog hideDialog={hideDialog} closeDialog={closeDialog} handleConfirm={handleConfirm} msg={message} />
            <ConfirmationDialog hideDialog={hideDialogCheckOut} closeDialog={closeDialogCheckOut} handleConfirm={handleConfirmCheckOut} msg={message} />
        </div>
    );
}


