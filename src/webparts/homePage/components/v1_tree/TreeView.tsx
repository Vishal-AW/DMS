import * as React from 'react';
import { useState } from 'react';
import { Icon } from '@fluentui/react/lib/Icon';
import { Stack } from '@fluentui/react/lib/Stack';
import { IStackTokens } from '@fluentui/react';



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
                <span onClick={() => toggleNode(node.id)} style={{cursor: 'pointer'}}>
                    {node.children && (
                        
                        <Icon
                            iconName={expandedNodes.indexOf(node.id) > -1 ? 'FolderOpen' : 'Folder'}
                            style={{  marginRight: '5px' }}
                            
                        />
                    )}
                    {node.name}</span>
                </div>
                {node.children && expandedNodes.indexOf(node.id) > -1 && renderTree(node.children)}
            </div>
        ));
    };

    return (
        <Stack tokens={stackTokens} style={{marginLeft:'300px'}}>
            <h3>Tree View</h3>
            {renderTree(treeData)}
        </Stack>
    );
}


