import { WebPartContext } from "@microsoft/sp-webpart-base";
import React, { useCallback, useEffect, useState } from 'react';
import ReactTableComponent from '../ResuableComponents/ReusableDataTable';
import { getApprovalData, updateLibrary } from "../../../../Services/GeneralDocument";
import { DefaultButton, FontIcon, Panel, PanelType, PrimaryButton, TextField } from "@fluentui/react";
import styles from "./TreeView.module.scss";
import { getStatusByInternalStatus } from "../../../../Services/StatusSerivce";
import { createHistoryItem } from "../../../../Services/GeneralDocHistoryService";
import { TileSendMail } from "../../../../Services/SendEmail";
import PopupBox from "../ResuableComponents/PopupBox";

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
    const [commentErr, setcommentErr] = useState("");
    const [fileData, setFileData] = useState<any>([]);
    const [isPopupBoxVisible, setIsPopupBoxVisible] = useState<boolean>(false);

    useEffect(() => {
        getFiles();
    }, [isPopupBoxVisible]);

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
        const fData = files.find((el: any) => el.Id === rowData);
        setFileData(fData);
    };

    const ApproveFile = async () => {
        setcommentErr("");
        if (comment === null || comment.trim() === "" || comment === undefined)
            setcommentErr("Please Enter Comment");
        else {
            try {
                let dataObj: any = {};
                let InternalStatus = "", ToUser = "";
                if (fileData.InternalStatus === "PendingWithPM" && fileData.PublisherEmail !== null) {
                    dataObj.CurrentApprover = fileData.PublisherEmail;
                    ToUser = fileData.PublisherEmail;
                    InternalStatus = "PendingWithPublisher";
                } else {
                    dataObj.CurrentApprover = "";
                    let PMEmail = fileData.ProjectmanagerEmail;
                    let AuthorEmail = fileData.Author.EMail;
                    ToUser = (PMEmail == "" ? AuthorEmail : (PMEmail + ";" + AuthorEmail));
                    InternalStatus = "Published";
                }
                dataObj.LatestRemark = comment;
                const status = await getStatusByInternalStatus(context.pageContext.web.absoluteUrl, context.spHttpClient, InternalStatus);

                dataObj.StatusId = status.value[0].ID;
                dataObj.InternalStatus = status.value[0].InternalStatus;
                dataObj.DisplayStatus = status.value[0].StatusName;
                await updateLibrary(context.pageContext.web.absoluteUrl, context.spHttpClient, dataObj, fileData.Id, libraryName);

                var dataHistory = {
                    DocumetLID: fileData.Id,
                    ActionDate: new Date(),
                    Remark: comment,
                    Status: status.value[0].StatusName,
                    InternalComment: comment,
                    LibName: libraryName,
                    Action: "Approved"
                };
                await createHistoryItem(context.pageContext.web.absoluteUrl, context.spHttpClient, dataHistory);
                var emailObj: any = {
                    To: ToUser,
                    FolderPath: fileData.FolderDocumentPath,
                    DocName: fileData.ActualName,
                    AuthorTitle: fileData.Author.Title
                };

                if (InternalStatus == "PendingWithPublisher") {
                    emailObj.Sub = "Document Pending for Approval - Reference No." + fileData.ReferenceNo;
                    emailObj.Msg = "You are requested to kindly publish document.";
                } else if (InternalStatus == "PendingWithPM") {
                    emailObj.Sub = "Document Pending for Approval - Reference No." + fileData.ReferenceNo;
                    emailObj.Msg = "You are requested to kindly approve document.";

                } else {
                    emailObj.Sub = "Document is Published";
                    emailObj.Msg = "Your Document is Published";

                }
                await TileSendMail(context, emailObj);
                setIsPopupBoxVisible(true);

            } catch (error) {
                console.log("error", error);
            }
        }
    };

    const dismissPanel = () => {
        setIsPanelOpen(false);
    };
    const hidePopup = useCallback(() => {
        setIsPopupBoxVisible(false);
        setIsPanelOpen(false);
    }, [isPopupBoxVisible]);

    const RejectFile = async () => {
        setcommentErr("");
        if (comment === null || comment.trim() === "" || comment === undefined)
            setcommentErr("Please Enter Comment");
        else {
            let InternalStatus = "";
            let dataobj: any = { CurrentApprover: "" };
            InternalStatus = "Rejected";
            dataobj.LatestRemark = comment;
            let ToUser = fileData.Author.EMail;
            if (fileData.InternalStatus !== "PendingWithPM") {
                ToUser = (fileData.ProjectmanagerEmail === "" ? ToUser : (ToUser + ";" + fileData.ProjectmanagerEmail));
            }

            const status = await getStatusByInternalStatus(context.pageContext.web.absoluteUrl, context.spHttpClient, InternalStatus);

            dataobj.StatusId = status.value[0].ID;
            dataobj.InternalStatus = status.value[0].InternalStatus;
            dataobj.DisplayStatus = status.value[0].StatusName;

            await updateLibrary(context.pageContext.web.absoluteUrl, context.spHttpClient, dataobj, fileData.Id, libraryName);

            var dataHistory = {
                DocumetLID: fileData.Id,
                ActionDate: new Date(),
                Remark: comment,
                Status: status.value[0].StatusName,
                InternalComment: comment,
                LibName: libraryName,
                Action: "Rejected"
            };

            await createHistoryItem(context.pageContext.web.absoluteUrl, context.spHttpClient, dataHistory);
            var emailObj = {
                To: ToUser,
                FolderPath: fileData.FolderDocumentPath,
                DocName: fileData.ActualName,
                AuthorTitle: fileData.Author.Title,
                Sub: "Rejected",
                Msg: "Your Document is Rejected"
            };

            await TileSendMail(context, emailObj);
            setIsPopupBoxVisible(true);
        }
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
                headerText="Approval"
                isOpen={isPanelOpen}
                onDismiss={dismissPanel}
                closeButtonAriaLabel="Close"
                type={PanelType.medium}
                onRenderFooterContent={() => (<>
                    <PrimaryButton onClick={ApproveFile} styles={buttonStyles} className={styles["sub-btn"]}>Approve</PrimaryButton>
                    <DefaultButton className={styles["can-btn"]} onClick={RejectFile}>Reject</DefaultButton>
                </>)}
                isFooterAtBottom={true}
            >
                <div className={styles.grid}>
                    <div className={styles.row}>
                        <div className={styles.col12}>
                            <TextField
                                label="Tile"
                                value={libraryName}
                                readOnly
                            />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.col12}>
                            <TextField
                                label="Folder Name"
                                value={fileData?.FolderDocumentPath
                                    ? fileData.FolderDocumentPath.split("/").pop() || ""
                                    : ""}
                                readOnly
                            />
                        </div>
                    </div>


                    <div className={styles.row}>
                        <div className={styles.col12}>
                            <TextField
                                label="Attach File"
                                value={fileData.ActualName}
                                readOnly
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
                                errorMessage={commentErr}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setcomment(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

            </Panel>
            <PopupBox isPopupBoxVisible={isPopupBoxVisible} hidePopup={hidePopup} />
        </>
    );
};
export default React.memo(ApprovalFlow);
