import { WebPartContext } from "@microsoft/sp-webpart-base";
import React, { useEffect, useState } from 'react';
import ReactTableComponent from '../ResuableComponents/ReusableDataTable';
import { getApprovalData } from "../../../../Services/GeneralDocument";
import { Icon } from "@fluentui/react";

interface IApproval {
    context: WebPartContext;
    libraryName: string;
    userEmail: string;
}
const ApprovalFlow: React.FunctionComponent<IApproval> = ({ context, libraryName, userEmail }) => {
    const [files, setFiles] = useState([]);
    useEffect(() => {
        getFiles();
    }, []);
    const getFiles = async () => {
        const data: any = await getApprovalData(context, libraryName, userEmail);
        setFiles(data.value || []);
    };
    const columns: any = [
        { Header: 'File', accessor: "Name", Cell: (props: any) => <a href={props.ServerRelativeUrl}>{props.ActualName}</a> },
        { Header: 'Folder Path', accessor: 'FolderDocumentPath' },
        { Header: 'Submitted By', accessor: 'Created', Cell: (props: any) => props.Created },
        { Header: 'Status', accessor: 'Status.StatusName' },
        { Header: 'Action', accessor: 'Id', Cell: (props: any) => <Icon itemProp="Edit" /> }
    ];
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
        </>
    );
};
export default React.memo(ApprovalFlow);
