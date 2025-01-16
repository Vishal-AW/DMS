import { WebPartContext } from "@microsoft/sp-webpart-base";
import React, { useEffect, useState } from 'react';
import ReactTableComponent from '../ResuableComponents/ReusableDataTable';
import { getApprovalData } from "../../../../Services/GeneralDocument";
import { DefaultButton, FontIcon, Panel, PanelType, PrimaryButton, TextField } from "@fluentui/react";
import styles from "./TreeView.module.scss";

interface IApproval {
    context: WebPartContext;
    libraryName: string;
    userEmail: string;
}
const ApprovalFlow: React.FunctionComponent<IApproval> = ({ context, libraryName, userEmail }) => {
    const [files, setFiles] = useState([]);
    const buttonStyles = { root: { marginRight: 8 } };
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [comment, setcomment] = useState("");

    useEffect(() => {
        getFiles();
    }, []);

    const getFiles = async () => {
        const data: any = await getApprovalData(context, libraryName, userEmail);
        console.log(data);
        setFiles(data.value || []);
    };
    const columns: any = [
        { Header: 'File', accessor: "Name", Cell: (row: any) => <a href={row.original.File.ServerRelativeUrl}>{row.original.ActualName}</a> },
        { Header: 'Folder Path', accessor: 'FolderDocumentPath' },
        {
            Header: 'Submitted By', accessor: 'Created', Cell: ({ row }: { row: any; }) => {
                const rowData = row._original;
                const formattedDate = new Date(rowData.Created).toLocaleDateString("en-US", {
                    month: "2-digit",
                    day: "2-digit",
                    year: "numeric"
                });
                const formattedTime = new Date(rowData.Created).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true
                });
                return `${rowData.Author?.Title || "Unknown"} ${formattedDate} at ${formattedTime}`;
            }
        },


        { Header: 'Status', accessor: 'Status.StatusName' },
        {
            Header: "Action",
            accessor: 'Id',
            Cell: ({ row }: { row: any; }) => (
                <FontIcon aria-label="Edit" onClick={() => openEditPanel(row._original.Id)} iconName="EditSolid12" style={{ color: '#009ef7', cursor: 'pointer' }}></FontIcon>
            )
        }
    ];

    const openEditPanel = async (rowData: any) => {
        setIsPanelOpen(true);

    };

    const ApproveFile = () => {


    };

    const dismissPanel = () => {
        setIsPanelOpen(false);
    };
    return (
        <>
            <ReactTableComponent
                TableClassName="ReactTables"
                Tablecolumns={columns}
                Tabledata={files}
                PagedefaultSize={10}
                TableRows={1}
                TableshowPagination={files.length > 10}
            />

            <Panel
                headerText="Add New Project"
                isOpen={isPanelOpen}
                onDismiss={dismissPanel}
                closeButtonAriaLabel="Close"
                type={PanelType.medium}
                onRenderFooterContent={() => (<>
                    <PrimaryButton onClick={ApproveFile} styles={buttonStyles} className={styles["sub-btn"]}>Approve</PrimaryButton>
                    <DefaultButton className={styles["can-btn"]}>Reject</DefaultButton>
                </>)}
                isFooterAtBottom={true}
            >
                <div className={styles.grid}>
                    <div className={styles.row}>
                        <div className={styles.col12}>
                            <TextField
                                label="Tile"
                                value={"Test"}
                                disabled
                            />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.col12}>
                            <TextField
                                label="Folder Name"
                                value={"Test"}
                                required
                            // onChange={(el: React.ChangeEvent<HTMLInputElement>, newValue?: string) => {
                            //     const validName = removeSepcialCharacters(newValue);
                            //     setFolderName(validName);
                            // }}
                            // errorMessage={folderNameErr}
                            />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.col12}>
                            <TextField
                                label="Attach File"
                                value={"Test"}
                                required
                            // onChange={(el: React.ChangeEvent<HTMLInputElement>, newValue?: string) => {
                            //     const validName = removeSepcialCharacters(newValue);
                            //     setFolderName(validName);
                            // }}
                            // errorMessage={folderNameErr}
                            />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.col12}>
                            <TextField
                                label="comment"
                                value={comment}
                                multiline rows={3}
                                required
                                onChange={(el: React.ChangeEvent<HTMLInputElement>) => setcomment(el.target.value)}
                            // errorMessage={folderNameErr}
                            />
                        </div>
                    </div>
                </div>

            </Panel>
        </>
    );
};
export default React.memo(ApprovalFlow);
