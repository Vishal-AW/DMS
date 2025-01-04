import * as React from 'react';
import { getAllFolder } from "../../../../Services/GeneralDocument";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./TreeView.module.scss";
import { DialogType, Icon, IStackItemStyles, IStackStyles, IStackTokens, PrimaryButton, Stack } from "@fluentui/react";
import ReactTableComponent from '../ResuableComponents/ReusableDataTable';
import { ContextualMenu, ContextualMenuItemType } from '@fluentui/react/lib/ContextualMenu';
// import { SPComponentLoader } from "@microsoft/sp-loader";
import IFrameDialog from "./IFrameDialog";
import AdvancePermission from "./AdvancePermission";
import ProjectEntryForm from "./ProjectEntryForm";


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
    const libDetails: any = JSON.parse(tileObject as string);
    const libName = libDetails.LibraryName;
    const portalUrl = new URL(props.SiteURL).origin;
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [itemId, setItemId] = useState<number>(0);
    const [isCreateProjectPopupOpen, setIsCreateProjectPopupOpen] = useState(false);


    useEffect(() => {
        fetchFolders(libName, "");
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

    const [expandedNodes, setExpandedNodes] = useState<string[]>([libName]);

    const toggleNode = (nodeName: string, folderPath: string) => {

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
                            onClick={() => toggleNode(node.Name, `${parentPath}/${node.Name}`)}
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
                            onClick={() => toggleNode(node.Name, `${node.folderPath}`)}
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

    return (
        <div>
            <Stack horizontal styles={stackStyles} tokens={stackTokens}>
                <Stack.Item grow={2} styles={stackItemStyles}>
                    <ul className={styles["tree-view"]}>
                        <li>
                            <div className={styles["tree-node"]}>
                                <span
                                    onClick={() => toggleNode(libName, libName)}
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
                            <div className={styles.col6}>Dashboard/{folderPath}</div>
                            <div className={styles.col6}>
                                <PrimaryButton text="New Project" onClick={projectCreation} />
                            </div>
                        </div>
                    </div>
                    <div className={styles.grid}>
                        <div className={styles.row}>
                            {renderRightFolder(rightFolders)}
                        </div>
                    </div>

                    {rightFolders.length === 0 ? <ReactTableComponent
                        TableClassName="ReactTables"
                        Tablecolumns={columns}
                        Tabledata={files}
                        PagedefaultSize={10}
                        TableRows={1}
                        TableshowPagination={files.length > 10}
                    // TableshowFilter={true}
                    /> : <></>}

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
            <ProjectEntryForm isOpen={isCreateProjectPopupOpen} dismissPanel={dissmissProjectCreationPanel} context={props.context} LibraryDetails={libDetails} folderPath={folderPath} />
        </div>
    );
}