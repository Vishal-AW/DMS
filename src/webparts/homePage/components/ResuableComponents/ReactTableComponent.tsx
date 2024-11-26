import * as React from 'react';
import ReactTable from 'react-table-6';
import 'react-table-6/react-table.css';
export interface IReactTableComponentProps {
    columns?: any;
    data?: any;
    tableClassName?: string;
    defaultPageSize?: number;
    minRows?: number;
    showPagination?: boolean;
    showFilter?: boolean;
}


const ReactTableComponent: React.FC<IReactTableComponentProps> = ({
    tableClassName,
    columns,
    data,
    defaultPageSize,
    minRows,
    showPagination,
    showFilter,
}) => {
    
    return (
        <ReactTable
            columns={columns}
            data={data}
            defaultPageSize={defaultPageSize ? defaultPageSize : 0}
            minRows={minRows}
            showPagination={showPagination}
            className={tableClassName ? tableClassName : ''}
            filterable={showFilter}
            defaultFilterMethod={({ filter, row, column }: any) => {
                const id = filter.pivotId || filter.id;
                return (
                    row[id] !== undefined &&
                    row[id] !== null &&
                    row[id] !== '' &&
                    (row[id] as string)
                    .toLocaleLowerCase()
                    .includes(filter.value.toLocaleLowerCase())
                );
            }}
        />
    );
};

export default ReactTableComponent;