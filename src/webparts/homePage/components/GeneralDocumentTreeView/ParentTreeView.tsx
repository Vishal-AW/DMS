import * as React from 'react';
import TreeView from './TreeView'; // Adjust the path as needed
import ReactTableComponent from '../ResuableComponents/ReusableDataTable';
import { Stack, IStackStyles, IStackItemStyles, IStackTokens } from 'office-ui-fabric-react';

const ParentComponent: React.FC = () => {
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

    const handleNodeSelection = (nodeName: string) => {
        console.log('Selected Node:', nodeName);
    };

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

    return (
        <div>
            <Stack horizontal styles={stackStyles} tokens={stackTokens}>
                {/* Tree View Section */}
                <Stack.Item grow={2} styles={stackItemStyles}>
                    <TreeView onNodeSelect={handleNodeSelection} />
                </Stack.Item>
                <Stack.Item grow={3} styles={stackItemStyles}>
                    <ReactTableComponent
                        TableClassName="ReactTables"
                        Tablecolumns={columns}
                        Tabledata={data}
                        PagedefaultSize={10}
                        TableRows={1}
                        TableshowPagination={data.length > 10}
                        TableshowFilter={true}
                    />
                </Stack.Item>
            </Stack>
        </div>
    );
};

export default ParentComponent;
