import * as React from 'react';
import { useState } from 'react';
import { Icon } from '@fluentui/react/lib/Icon';
import { Stack } from '@fluentui/react/lib/Stack';
import { IStackTokens } from '@fluentui/react';
import ReactTableComponent from '../ResuableComponents/ReactTableComponent';
//import { IReactTableComponentProps } from '../ResuableComponents/ReactTableComponent';



export default function TreeView(): JSX.Element {
    const stackTokens: IStackTokens = { childrenGap: 10 };

    interface ITreeNode {
        id: number;
        name: string;
        children?: ITreeNode[];
    }

    const treeData: ITreeNode[] = [
        {
            id: 1,
            name: 'Leasing Department',
            children: [
                {
                    id: 2,
                    name: 'Demo Nexus Mall',
                },
                {
                    id: 3,
                    name: 'Nexus Ahmedabad One',
                    children: [
                        { id: 4, name: 'Documents Tracker' },
                        { id: 5, name: 'Floor Plan' },
                        {
                            id: 6,
                            name: 'Kiosk Storage and Service Agreements',
                            children: [
                                { id: 7, name: 'Kiosks' },
                                { id: 8, name: 'Service' },
                                { id: 9, name: 'Storage' },
                            ],
                        },
                        {
                            id: 10,
                            name: 'Retail',
                            children: [
                                { id: 11, name: 'Bata' },
                                { id: 12, name: 'OnePlus' },
                                { id: 13, name: 'Puma' },
                                { id: 14, name: 'Red Tape' },
                            ],
                        },
                    ],
                },
            ],
        },
    ];


    const columns = [
        { Header: 'Sr. No.', accessor: 'srNo' },
        { Header: 'Name', accessor: 'name' },
        { Header: 'Uploaded On', accessor: 'uploadedOn' },
        { Header: 'Reference No', accessor: 'referenceNo' },
        { Header: 'Version', accessor: 'version' },
        { Header: 'Status', accessor: 'status' },
        { Header: 'OCR Status', accessor: 'ocrStatus' },
    ];

    const data = [
        {
            srNo: 1,
            name: 'DMS_User Manual_AW1.pdf',
            uploadedOn: '05-08-2024 18:17',
            referenceNo: '2024-00191',
            version: '1.0',
            status: 'Published',
            ocrStatus: 'Completed',
        },
    ];

    const [expandedNodes, setExpandedNodes] = useState<number[]>([]);

    const toggleNode = (id: number) => {
        const index = expandedNodes.indexOf(id);

        if (index > -1) {
            // If the node is already expanded, remove it
            const newExpandedNodes = [...expandedNodes];
            newExpandedNodes.splice(index, 1);
            setExpandedNodes(newExpandedNodes);
        } else {
            // If the node is not expanded, add it
            setExpandedNodes([...expandedNodes, id]);
        }
    };

    const renderTree = (nodes: ITreeNode[]) => {
        return nodes.map((node) => (
            <div key={node.id} style={{ marginLeft: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span onClick={() => toggleNode(node.id)} style={{ cursor: 'pointer' }}>
                        {node.children && (

                            <Icon
                                iconName={expandedNodes.indexOf(node.id) > -1 ? 'FolderOpen' : 'Folder'}
                                style={{ marginRight: '5px' }}

                            />
                        )}
                        {node.name}</span>
                </div>

                {node.children && expandedNodes.indexOf(node.id) > -1 && renderTree(node.children)}
            </div>
        )); 
    };

    return (


        <div className={`ms-Grid`}>

            <div className="col-md-3">
                <div className="form-group">
                    <Stack tokens={stackTokens} style={{ marginLeft: '200px' }}>
                        <h3>Tree View</h3>
                        {renderTree(treeData)}
                    </Stack>
                </div>
            </div>
            <div className="col-md-9">
                <div className="form-group">
                    <main className="content" style={{ marginLeft: '400px' }}>
                        <ReactTableComponent
                            tableClassName='ReactTables'
                            columns={columns}
                            data={data}
                            defaultPageSize={10}
                            minRows={1}
                            showPagination={data.length > 10}
                            showFilter={true}
                        />
                    </main>
                </div>
            </div>
        </div>





    );
}


