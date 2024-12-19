import * as React from 'react';
import { getAllFolder } from "./../../../../Services/GeneralDocument";
import { useEffect, useState } from "react";
import styles from "./TreeView.module.scss";
import { Icon, IStackItemStyles, IStackStyles, IStackTokens, Stack } from "@fluentui/react";
import ReactTableComponent from '../ResuableComponents/ReusableDataTable';
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
export default function TestTreeView({ props }: any) {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [folderPath, setFolderPath] = useState("");
    const [rightFolders, setRightFolders] = useState<Folder[]>([]);
    const [childFolders, setChildFolders] = useState<Record<string, Folder[]>>({});
    const [files, setFiles] = useState([]);
    const libName = "Finance";

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

    const [expandedNodes, setExpandedNodes] = useState<string[]>([]);

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
        return nodes.map((node: any) => (
            node.Name !== "Forms" && (
                <li key={node.Id}>
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
                    </div>
                    {expandedNodes.includes(node.Name) && childFolders[`${parentPath}/${node.Name}`] && (
                        <ul className="nested-list">
                            {renderTree(childFolders[`${parentPath}/${node.Name}`], `${parentPath}/${node.Name}`)}
                        </ul>
                    )}
                </li>
            )
        ));
    };
    const renderTree1 = (nodes: Folder[]) => {
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
    return (
        <div>
            <Stack horizontal styles={stackStyles} tokens={stackTokens}>
                <Stack.Item grow={2} styles={stackItemStyles}>
                    <ul className={styles["tree-view"]}>{renderTree(folders, libName)}</ul>
                </Stack.Item>
                <Stack.Item grow={3} styles={stackItemStyles}>
                    <div>Dashboard/{folderPath}</div>
                    <div className={styles.grid}>
                        <div className={styles.row}>
                            {renderTree1(rightFolders)}
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
        </div>
    );
}
