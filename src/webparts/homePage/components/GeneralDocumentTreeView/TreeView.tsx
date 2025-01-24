import * as React from 'react';
import { getAllFolder, getListData, updateLibrary } from "../../../../Services/GeneralDocument";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./TreeView.module.scss";
import { CommandBarButton, DefaultButton, DialogType, Icon, IStackItemStyles, IStackStyles, IStackTokens, Panel, PanelType, PrimaryButton, Stack } from "@fluentui/react";
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
import { ILabel } from "../Interface/ILabel";


interface Folder {
    [key: string]: string | number | {} | null | undefined;
}
const stackStyles: IStackStyles = { root: { height: '100vh' } };
const stackItemStyles: IStackItemStyles = {
    root: {
        padding: 10,
        border: '1px solid #ddd',
        overflow: 'auto',
        background: '#fff',
        boxShadow: '0 10px 30px 0 rgba(82, 63, 105, .05)',
    },
};
const stackTokens: IStackTokens = { childrenGap: 10 };
export default function TreeView({ props }: any) {

    const DisplayLabel: ILabel = JSON.parse(localStorage.getItem('DisplayLabel') || '{}');
    const linkRef = useRef<Record<string, HTMLDivElement | null>>({});
    const [showContextualMenu, setShowContextualMenu] = React.useState<{ [key: string]: boolean; }>({});
    const [nodeId, setNodeId] = useState(0);

    const [folders, setFolders] = useState<Folder[]>([]);
    const [folderPath, setFolderPath] = useState("");
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

    if (tileObject === null)
        location.href = "#/Dashboard";

    const libDetails: any = JSON.parse(tileObject as string);
    const libName = libDetails.LibraryName;
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
    const [extention, setExtention] = useState("");
    const [fileName, setFileName] = useState("");

    useEffect(() => {
        fetchFolders(libName, "");
        getAdmin();
    }, [isCreateProjectPopupOpen]);

    const fetchFolders = async (folderPath: string, nodeName: string) => {
        try {
            setFolderPath(folderPath);
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
                    if (data.Files.length > 0) {
                        setFiles(data.Files.filter((el: any) => el.ListItemAllFields.Active));
                    }
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
        const data = await getListData(`${props.SiteURL}/_api/web/lists/getbytitle('DMS_GroupName')/items`, props.context);
        setAdmin(data.value.map((el: any) => (el.GroupNameId)));
    };

    const [expandedNodes, setExpandedNodes] = useState<string[]>([libName]);

    const toggleNode = (nodeName: string, folderPath: string, obj: Folder) => {
        setTables("");
        setFolderName(nodeName);
        setFolderPath(folderPath);
        setFolderObject(obj);
        if (expandedNodes.includes(nodeName)) {
            setExpandedNodes(expandedNodes.filter((name) => name !== nodeName));
        } else {
            setExpandedNodes([...expandedNodes, nodeName]);
            fetchFolders(folderPath, nodeName);
        }
    };

    const columns = [
        { Header: DisplayLabel.SrNo, accessor: "Id", Cell: ({ row }: { row: any; }) => { return <span>{row._index + 1}</span>; } },
        { Header: DisplayLabel.FileName, accessor: 'ListItemAllFields.ActualName' },
        { Header: DisplayLabel.ReferenceNo, accessor: 'ListItemAllFields.ReferenceNo' },
        { Header: DisplayLabel.Versions, accessor: 'ListItemAllFields.Level' },
        { Header: DisplayLabel.Status, accessor: 'ListItemAllFields.DisplayStatus' },
        // { Header: 'OCR Status', accessor: 'ListItemAllFields.OCRStatus' },
        {
            Header: DisplayLabel.Action, accessor: "Id", Cell: ({ row }: { row: any; }) => {
                const menuProps = useConst<IContextualMenuProps>(() => createMenuProps(row));
                return <DefaultButton text={DisplayLabel.Action} menuProps={menuProps} />;
            }

        }
    ];
    const createMenuProps = (item: any): IContextualMenuProps => ({
        shouldFocusOnMount: true,
        items: [
            {
                key: 'deleteDocument',
                text: DisplayLabel.Delete,
                onClick: () => {
                    setMessage(DisplayLabel.DeleteConfirmMsg);
                    setItemId(item._original.ListItemAllFields.Id);
                    setHideDialog(true);
                },
            },
            {
                key: 'versions',
                text: DisplayLabel.Versions,
                onClick: () => {
                    const url = `${props.SiteURL}/_layouts/15/Versions.aspx?list=${libName}&FileName=${item._original.ServerRelativeUrl}&IsDlg=${item._original.ListItemAllFields.Id}`;
                    setPanelForm(<iframe id="frame" src={url} style={{ width: "100%", height: "80vh" }}></iframe>);
                    setPanelTitle(DisplayLabel.Versions);
                    setIsOpenCommonPanel(true);
                }
            },
            {
                key: 'rename',
                text: DisplayLabel.Rename,
                onClick: () => {
                    setPanelTitle(DisplayLabel.Rename);
                    const fileDetails = item._original.ListItemAllFields.ActualName.split(".");
                    setExtention(fileDetails[1]);
                    setFileName(fileDetails[0]);
                    setPanelForm(<>
                        <div className={styles.col10}>
                            <TextField value={fileName} required errorMessage={fileNameErr} onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setFileName(event.target.value); }} />
                        </div>
                        <div className={styles.col2}><TextField readOnly value={extention} /></div>
                    </>);
                    setActionButton(<PrimaryButton text={DisplayLabel.Rename} style={{ marginRight: "10px" }} onClick={() => renameTheFile(item._original.ListItemAllFields.Id)} />);
                    setIsOpenCommonPanel(true);
                }
            },
            {
                key: 'download',
                text: DisplayLabel.Download,
                onClick: () => { location.href = `${props.SiteURL}/_layouts/15/download.aspx?SourceUrl=${item._original.ServerRelativeUrl}`; }
            },
            {
                key: "preview",
                text: DisplayLabel.Preview,
                onClick: () => {
                    setPanelSize(PanelType.smallFluid);
                    setPanelTitle(DisplayLabel.Preview);
                    const previewData = getPreviewUrl(item._original.ServerRelativeUrl);
                    setPanelForm(previewData);
                    setIsOpenCommonPanel(true);
                }
            },
            // {
            //     key: "viewDoc",
            //     text: "View",
            //     onClick: () => {
            //         setProjectUpdateData(item._original.ListItemAllFields); setIsCreateProjectPopupOpen(true); setFormType("ViewForm");
            //     }
            // }
        ],
    });
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
                ActualName: `${fileName}.${extention}`
            };
            updateLibrary(props.SiteURL, props.spHttpClient, obj, id, libName).then((response) => {
                setIsPopupBoxVisible(true);
                fetchFolders(folderPath, folderName);
            });
        }
    };

    const closeDialog = useCallback(() => setHideDialog(false), []);
    const handleConfirm = useCallback(
        async (value: boolean) => {
            if (value) {
                setHideDialog(false);
                deleteDoc();
            }
        },
        [itemId]
    );

    const deleteDoc = async () => {
        const obj = {
            Active: false,
            DeleteFlag: "Deleted",
        };
        await updateLibrary(props.SiteURL, props.spHttpClient, obj, itemId, libName);
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
                                style={{ marginRight: "5px", color: "#0162e8" }}
                            />
                            <span className={styles["node-name"]}>{node.Name}</span>
                        </span>
                        <div ref={(el) => (linkRef.current[node.ListItemAllFields.Id] = el)} onClick={(e) => onShowContextualMenu(e, node.ListItemAllFields.Id)}>
                            <Icon
                                iconName={"More"}
                                className={styles["folder-icon"]}
                                style={{ marginLeft: "5px", color: "#0162e8", cursor: "pointer" }}
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
                <div key={node.Id} className={styles.col2}>
                    <div>
                        <span
                            onClick={() => toggleNode(node.Name, `${node.folderPath}`, node)}
                            style={{ cursor: "pointer" }}
                        >
                            <Icon
                                iconName="FabricFolderFill"
                                className={styles["folder-icon"]}
                                style={{ marginRight: "5px", color: "#0162e8", fontSize: "50px" }}
                            />
                            <br />
                            <span className={styles["node-name"]}>{node.Name}</span>
                        </span>
                    </div>
                </div>
            )
        ));
    };

    const bindMenu = (node: any, afolderPath: string) => {
        return [
            {
                key: 'advancePermission',
                text: DisplayLabel.AdvancePermission,
                onClick: () => { setItemId(node.ListItemAllFields.Id); setIsPanelOpen(true); },
            },
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
        ];
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

    const dismissUploadPanel = useCallback(() => { setIsOpenUploadPanel(false); setFolderName(""); }, []);

    const dismissCommanPanel = () => { setIsOpenCommonPanel(false); setActionButton(null); setPanelForm(null); setPanelSize(PanelType.medium); };

    const createFolder = (): void => {
        setFolderNameErr("");
        if (folderName === "") {
            setFolderNameErr(DisplayLabel.ThisFieldisRequired);
            return;
        }
        setShowLoader({ display: "block" });
        const users = [folderObject?.ListItemAllFields.ProjectmanagerId, folderObject?.ListItemAllFields.PublisherId, ...admin];
        FolderStructure(props.context, `${folderPath}/${folderName}`, users, libName).then((response) => {
            let obj: any = {
                ...folderObject?.ListItemAllFields
            };

            updateLibrary(props.SiteURL, props.spHttpClient, obj, response, libName).then((response) => {
                setIsPopupBoxVisible(true);
                toggleNode(folderName, `${folderPath}`, folderObject);
                fetchFolders(folderPath, `${folderName}`);
            });
        });
    };

    const getRecycleData = () => {
        setTables("Recycle");

    };
    const hidePopup = useCallback(() => { setIsPopupBoxVisible(false); dismissFolderPanel(); setShowLoader({ display: "none" }); }, [isPopupBoxVisible]);

    const bindTable = () => {

        if (tables === "Approver") {
            return <ApprovalFlow context={props.context} libraryName={libName} userEmail={props.UserEmailID} action="Approver" />;
        }
        else if (tables === "Recycle") {
            return <ApprovalFlow context={props.context} libraryName={libName} userEmail={props.UserEmailID} action="Recycle" />;
        } else {

            return rightFolders.length === 0 ? <ReactTableComponent
                TableClassName="ReactTables"
                Tablecolumns={columns}
                Tabledata={files}
                PagedefaultSize={10}
                TableRows={1}
                TableshowPagination={files.length > 10}
            /> : <div className={styles.grid}>
                <div className={styles.row}>
                    {renderRightFolder(rightFolders)}
                </div>
            </div>;
        }

    };
    const advancedSearch = () => {
        sessionStorage.setItem("LibName", libName);
        location.href = "#/SearchFilter";
    };
    return (
        <div>
            <div className={styles.grid}>
                <div className={styles.row}>
                    <div className={styles.col12}>
                        <PrimaryButton text={DisplayLabel.NewRequest} onClick={projectCreation} style={{ float: "right" }} />
                    </div>
                </div>
            </div>
            <Stack horizontal styles={stackStyles} tokens={stackTokens}>
                <Stack.Item grow={2} styles={stackItemStyles}>
                    <div className={styles.grid}>
                        <div className={styles.row}>
                            <div className={styles.col12}><CommandBarButton iconProps={{ iconName: "EmptyRecycleBin" }} text={DisplayLabel.RecycleBin} onClick={getRecycleData} /></div>
                            <div className={styles.col12}><CommandBarButton iconProps={{ iconName: "DocumentApproval" }} text={DisplayLabel.Approval} onClick={() => setTables("Approver")} /></div>
                            <div className={styles.col12}><CommandBarButton iconProps={{ iconName: "Search" }} text={DisplayLabel.AdvancedSearch} onClick={advancedSearch} /></div>
                        </div>
                    </div>
                    <ul className={styles["tree-view"]}>
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
                                        style={{ marginRight: "5px", color: "#0162e8" }}
                                    />
                                    <span className={styles["node-name"]}>{libDetails.TileName}</span>
                                </span>
                            </div>
                            <ul className="nested-list">
                                {expandedNodes.includes(libName) && renderTree(folders, libName)}
                            </ul>
                        </li>
                    </ul>
                </Stack.Item>
                <Stack.Item grow={3} styles={stackItemStyles}>
                    <div className={styles.grid}>
                        <div className={styles.row}>
                            <div className={styles.col12}>Dashboard/{folderPath}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.col12}>
                                {folderPath === libName ? <></> :
                                    <div style={{ float: "right" }}>
                                        <DefaultButton text={DisplayLabel.Upload} onClick={() => setIsOpenUploadPanel(true)} styles={{ root: { marginRight: 8 } }} />
                                        {files.length === 0 ? <PrimaryButton text={DisplayLabel.NewFolder} onClick={() => { setIsOpenFolderPanel(true); setFolderName(""); }} /> : <></>}
                                    </div>
                                }
                            </div>
                        </div>
                    </div>

                    {bindTable()}

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
            />;
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
                    <PrimaryButton onClick={createFolder} styles={{ root: { marginRight: 8 } }} className={styles["sub-btn"]}>{DisplayLabel.Submit}</PrimaryButton>
                    <DefaultButton onClick={dismissFolderPanel} className={styles["can-btn"]}>{DisplayLabel.Cancel}</DefaultButton>
                </>)}
                isFooterAtBottom={true}
            >
                <div className={styles.grid}>
                    <div className={styles.row}>
                        <div className={styles.col12}>
                            <label>{DisplayLabel.Path}: <b>{folderPath}</b></label>
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.col12}>
                            <TextField label={DisplayLabel.FolderName} required value={folderName} onChange={(el: React.ChangeEvent<HTMLInputElement>) => setFolderName(el.target.value)} errorMessage={folderNameErr} />
                        </div>
                    </div>
                </div>
            </Panel>
            <PopupBox isPopupBoxVisible={isPopupBoxVisible} hidePopup={hidePopup} />
            <div className={cls["modal"]} style={showLoader}></div>
            <Panel
                headerText={panelTitle}
                isOpen={isOpenCommonPanel}
                onDismiss={dismissCommanPanel}
                closeButtonAriaLabel="Close"
                type={panelSize}
                onRenderFooterContent={() => <>{actionButton}<DefaultButton onClick={dismissCommanPanel} className={styles["can-btn"]}>Cancel</DefaultButton></>}
                isFooterAtBottom={true}
            >
                <div style={{ marginTop: "10px" }}>
                    <div className={styles.grid}>
                        <div className={styles.row}>
                            {panelForm}
                        </div>
                    </div>
                </div>
            </Panel>
            <ConfirmationDialog hideDialog={hideDialog} closeDialog={closeDialog} handleConfirm={handleConfirm} msg={message} />
        </div>
    );
}