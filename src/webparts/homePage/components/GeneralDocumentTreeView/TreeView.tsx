import * as React from 'react';
import { getAllFolder, getListData, updateLibrary } from "../../../../Services/GeneralDocument";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./TreeView.module.scss";
import { CommandBarButton, DefaultButton, DialogType, Icon, IStackItemStyles, IStackStyles, IStackTokens, Panel, PanelType, PrimaryButton, Stack } from "@fluentui/react";
import ReactTableComponent from '../ResuableComponents/ReusableDataTable';
import { ContextualMenu, ContextualMenuItemType } from '@fluentui/react/lib/ContextualMenu';
// import { SPComponentLoader } from "@microsoft/sp-loader";
import IFrameDialog from "./IFrameDialog";
import AdvancePermission from "./AdvancePermission";
import ProjectEntryForm from "./ProjectEntryForm";
import { TextField } from "office-ui-fabric-react";
import { FolderStructure } from "../../../../Services/FolderStructure";
import PopupBox from "../ResuableComponents/PopupBox";
import UploadFiles from "./UploadFile";
import { useNavigate } from "react-router-dom";
// import ApprovalFlow from "./ApprovalFlow";


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
    const linkRef = useRef<Record<string, HTMLDivElement | null>>({});
    // const [showContextualMenu, setShowContextualMenu] = useState(false);
    const navigate = useNavigate();
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
    if (tileObject === null)
        navigate("/Dashboard");

    const libDetails: any = JSON.parse(tileObject as string);
    const libName = libDetails.LibraryName;
    const portalUrl = new URL(props.SiteURL).origin;
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isOpenFolderPanel, setIsOpenFolderPanel] = useState(false);
    const [isOpenUploadPanel, setIsOpenUploadPanel] = useState(false);
    const [itemId, setItemId] = useState<number>(0);
    const [isCreateProjectPopupOpen, setIsCreateProjectPopupOpen] = useState(false);
    const [folderName, setFolderName] = useState("");
    const [folderNameErr, setFolderNameErr] = useState("");
    const [folderObject, setFolderObject] = useState<any>({});
    const [isPopupBoxVisible, setIsPopupBoxVisible] = useState<boolean>(false);

    useEffect(() => {
        fetchFolders(libName, "");
        getAdmin();
    }, []);

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
                    setFiles(data.Files);
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
    let count = 0;
    const columns = [
        { Header: 'Sr. No.', accessor: "Id", Cell: (props: any) => <span>{count + 1}</span> },
        { Header: 'Name', accessor: 'Name' },
        { Header: 'Uploaded On', accessor: 'TimeCreated' },
        { Header: 'Reference No', accessor: 'UIVersionLabel' },
        { Header: 'Version', accessor: 'UIVersionLabel' },
        { Header: 'Status', accessor: 'UIVersionLabel' },
        { Header: 'OCR Status', accessor: 'UIVersionLabel' },
    ];

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
                                    items={bindMenu(node)}
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

    const bindMenu = (node: any) => {
        return [
            {
                key: 'advancePermission',
                text: 'Advance Permission',
                onClick: () => { setItemId(node.ListItemAllFields.Id); setIsPanelOpen(true); },
            },
            {
                key: 'divider_1',
                itemType: ContextualMenuItemType.Divider,
            },
            {
                key: 'share',
                text: 'Share',
                onClick: () => {
                    setShareURL(`${props.SiteURL}/_layouts/15/sharedialog.aspx?listId=${libDetails.LibGuidName}&listItemId=${node.ListItemAllFields.Id}&clientId=sharePoint&policyTip=0&folderColor=undefined&ma=0&fullScreenMode=true&itemName=${node.Name}&origin=${portalUrl}`);
                    setIFrameDialogOpened(true);
                }
            },
            {
                key: "view",
                text: "View",
                onClick: () => console.log('Rename clicked', node),
            },
            {
                key: 'edit',
                text: 'Edit',
                onClick: () => console.log('Edit clicked', node),
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
    const projectCreation = useCallback(() => { setIsCreateProjectPopupOpen(true); }, []);
    const dissmissProjectCreationPanel = useCallback((value: boolean) => { setIsCreateProjectPopupOpen(value); }, []);
    const dismissFolderPanel = () => { setIsOpenFolderPanel(false); };
    const dismissUploadPanel = useCallback(() => { setIsOpenUploadPanel(false); setFolderName(""); }, []);

    const createFolder = (): void => {
        setFolderNameErr("");
        if (folderName === "") {
            setFolderNameErr("Folder Name is required");
            return;
        }
        console.log(folderObject);
        const users = [folderObject?.ListItemAllFields.ProjectmanagerId, folderObject?.ListItemAllFields.PublisherId, ...admin];
        FolderStructure(props.context, `${folderPath}/${folderName}`, users, libName).then((response) => {
            console.log(response);
            let obj: any = {
                ...folderObject?.ListItemAllFields
            };

            updateLibrary(props.SiteURL, props.spHttpClient, obj, response, libName).then((response) => {
                setIsPopupBoxVisible(true);
                toggleNode(folderName, `${folderPath}/${folderName}`, folderObject);
            });
        });
    };

    const hidePopup = useCallback(() => { setIsPopupBoxVisible(false); dismissFolderPanel(); }, [isPopupBoxVisible]);
    const bindTable = () => {

        if (tables === "Approver") {
            // return <ApprovalFlow context={props.context} libraryName={libName} userEmail={props.UserEmailID} />;
            return <>NK</>;
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
    return (
        <div>
            <div className={styles.grid}>
                <div className={styles.row}>
                    <div className={styles.col12}>
                        <PrimaryButton text="New Request" onClick={projectCreation} style={{ float: "right" }} />
                    </div>
                </div>
            </div>
            <Stack horizontal styles={stackStyles} tokens={stackTokens}>
                <Stack.Item grow={2} styles={stackItemStyles}>
                    <CommandBarButton iconProps={{ iconName: "DocumentApproval" }} text="Approval" onClick={() => setTables("Approver")} />
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
                                        <DefaultButton text="Upload" onClick={() => setIsOpenUploadPanel(true)} styles={{ root: { marginRight: 8 } }} />
                                        {files.length === 0 ? <PrimaryButton text="New Folder" onClick={() => { setIsOpenFolderPanel(true); setFolderName(""); }} /> : <></>}
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
            <ProjectEntryForm isOpen={isCreateProjectPopupOpen} dismissPanel={dissmissProjectCreationPanel} context={props.context} LibraryDetails={libDetails} admin={admin} />
            <UploadFiles context={props.context} isOpenUploadPanel={isOpenUploadPanel} folderName={folderName} folderPath={folderPath} dismissUploadPanel={dismissUploadPanel} libName={libName} files={files} folderObject={folderObject?.ListItemAllFields} />
            <Panel
                headerText="Add New Folder"
                isOpen={isOpenFolderPanel}
                onDismiss={dismissFolderPanel}
                closeButtonAriaLabel="Close"
                type={PanelType.medium}
                onRenderFooterContent={() => (<>
                    <PrimaryButton onClick={createFolder} styles={{ root: { marginRight: 8 } }} className={styles["sub-btn"]}>Submit</PrimaryButton>
                    <DefaultButton onClick={dismissFolderPanel} className={styles["can-btn"]}>Cancel</DefaultButton>
                </>)}
                isFooterAtBottom={true}
            >
                <div className={styles.grid}>
                    <div className={styles.row}>
                        <div className={styles.col12}>
                            <label>Path: <b>{folderPath}</b></label>
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.col12}>
                            <TextField label="Folder Name" required value={folderName} onChange={(el: React.ChangeEvent<HTMLInputElement>) => setFolderName(el.target.value)} errorMessage={folderNameErr} />
                        </div>
                    </div>
                </div>
            </Panel>
            <PopupBox isPopupBoxVisible={isPopupBoxVisible} hidePopup={hidePopup} />
        </div>
    );
}